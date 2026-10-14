import { createHash } from 'node:crypto';
import type { Prisma, UgcStatus, UgcVerdict } from '../generated/prisma/client/client';
import { prisma } from './prisma';
import {
  UGC_TERMS_VERSION,
  UGC_UPLOAD_WINDOW_MS,
  type UgcListQuery,
  type UgcReviewInput,
  type UgcSubmissionInput,
} from './ugc-input';

// ─────────────────────────────────────────────────────────────────────────────
// UGC submissions — data access. Lifecycle:
//   PENDING_UPLOAD  row created by POST /api/ugc (form data + license accepted)
//   NEW             video uploaded and verified (POST /api/ugc/:id/complete)
//   REVIEWED        verdict stored by the machine (PATCH /api/machine/ugc/:id)
// ─────────────────────────────────────────────────────────────────────────────

const VERDICT_OUT: Record<UgcVerdict, 'repost' | 'repost_edit' | 'reject'> = {
  REPOST:      'repost',
  REPOST_EDIT: 'repost_edit',
  REJECT:      'reject',
};

const STATUS_OUT: Record<UgcStatus, 'pending_upload' | 'new' | 'reviewed'> = {
  PENDING_UPLOAD: 'pending_upload',
  NEW:            'new',
  REVIEWED:       'reviewed',
};

/** Hash of the client IP, keyed with the session secret so it can't be reversed by lookup. */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.SESSION_SECRET ?? process.env.ADMIN_SECRET ?? '';
  return createHash('sha256').update(`${ip}|${salt}`).digest('hex');
}

/** First hop of x-forwarded-for (set by Vercel), else x-real-ip. */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || null;
}

/** Active affiliate behind a session id, with the fields the form pre-fills. */
export async function getUgcAffiliate(affiliateId: string | null) {
  if (!affiliateId) return null;
  return prisma.affiliate.findFirst({
    where:  { id: affiliateId, active: true },
    select: { id: true, name: true, email: true, instagram: true, ref: true },
  });
}

export async function countRecentSubmissionsByIp(ipHash: string, since: Date): Promise<number> {
  return prisma.ugcSubmission.count({ where: { ipHash, createdAt: { gte: since } } });
}

export async function createPendingSubmission(
  input: UgcSubmissionInput,
  { affiliateId, ipHash }: { affiliateId: string | null; ipHash: string | null }
) {
  return prisma.ugcSubmission.create({
    data: {
      authorType:         affiliateId ? 'AFFILIATE' : 'CUSTOMER',
      affiliateId,
      name:               input.name,
      email:              input.email,
      instagram:          input.instagram,
      orderEmail:         input.orderEmail,
      locale:             input.locale,
      rightsTermsVersion: UGC_TERMS_VERSION,
      rightsAcceptedAt:   new Date(),
      ipHash,
    },
    select: { id: true },
  });
}

/** The submission when it can still receive its video upload, else null. */
export async function getUploadableSubmission(id: string) {
  const row = await prisma.ugcSubmission.findUnique({
    where:  { id },
    select: { id: true, status: true, createdAt: true },
  });
  if (!row || row.status !== 'PENDING_UPLOAD') return null;
  if (Date.now() - row.createdAt.getTime() > UGC_UPLOAD_WINDOW_MS) return null;
  return row;
}

/**
 * Attaches the uploaded video and moves PENDING_UPLOAD → NEW. Returns false if
 * the row was no longer pending (e.g. a duplicate completion call).
 */
export async function completeSubmissionUpload(
  id: string,
  video: { url: string; pathname: string; size: number; contentType: string; fileName: string }
): Promise<boolean> {
  const { count } = await prisma.ugcSubmission.updateMany({
    where: { id, status: 'PENDING_UPLOAD' },
    data: {
      status:     'NEW',
      videoUrl:   video.url,
      blobPath:   video.pathname,
      fileName:   video.fileName,
      fileSize:   video.size,
      mimeType:   video.contentType,
      uploadedAt: new Date(),
    },
  });
  return count === 1;
}

// ── Machine-facing reads/writes ──────────────────────────────────────────────

const MACHINE_SELECT = {
  id: true,
  status: true,
  authorType: true,
  affiliateId: true,
  name: true,
  email: true,
  instagram: true,
  orderEmail: true,
  locale: true,
  rightsTermsVersion: true,
  rightsAcceptedAt: true,
  videoUrl: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
  uploadedAt: true,
  verdict: true,
  score: true,
  reasons: true,
  reviewedAt: true,
  createdAt: true,
  affiliate: { select: { ref: true } },
} satisfies Prisma.UgcSubmissionSelect;

type MachineRow = Prisma.UgcSubmissionGetPayload<{ select: typeof MACHINE_SELECT }>;

export function toMachineSubmission(r: MachineRow) {
  return {
    id:     r.id,
    status: STATUS_OUT[r.status],
    video: {
      url:      r.videoUrl,
      mimeType: r.mimeType,
      fileSize: r.fileSize,
      fileName: r.fileName,
    },
    author: {
      type:         r.authorType === 'AFFILIATE' ? 'affiliate' : 'customer',
      name:         r.name,
      email:        r.email,
      instagram:    r.instagram,
      affiliateId:  r.affiliateId,
      affiliateRef: r.affiliate?.ref ?? null,
    },
    orderEmail:         r.orderEmail,
    locale:             r.locale,
    rightsTermsVersion: r.rightsTermsVersion,
    rightsAcceptedAt:   r.rightsAcceptedAt.toISOString(),
    submittedAt:        r.uploadedAt?.toISOString() ?? null,
    review: r.verdict
      ? {
          verdict:    VERDICT_OUT[r.verdict],
          score:      r.score,
          reasons:    r.reasons,
          reviewedAt: r.reviewedAt?.toISOString() ?? null,
        }
      : null,
  };
}

/**
 * Oldest first (a queue). Keyset-paged on (uploadedAt, id) rather than Prisma's
 * cursor+skip, which would silently drop a row whenever the cursor row changes
 * status mid-pagination (e.g. the machine reviews while paging status=new).
 * Never returns PENDING_UPLOAD rows. Returns null for an unknown cursor.
 */
export async function listMachineSubmissions(query: UgcListQuery) {
  let after: { uploadedAt: Date; id: string } | null = null;
  if (query.cursor) {
    const c = await prisma.ugcSubmission.findUnique({
      where:  { id: query.cursor },
      select: { id: true, uploadedAt: true },
    });
    if (!c?.uploadedAt) return null;
    after = { uploadedAt: c.uploadedAt, id: c.id };
  }

  const rows = await prisma.ugcSubmission.findMany({
    where: {
      status: query.status ?? { in: ['NEW', 'REVIEWED'] },
      ...(after
        ? {
            OR: [
              { uploadedAt: { gt: after.uploadedAt } },
              { uploadedAt: after.uploadedAt, id: { gt: after.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ uploadedAt: 'asc' }, { id: 'asc' }],
    take:    query.limit + 1,
    select:  MACHINE_SELECT,
  });
  const page = rows.slice(0, query.limit);
  return {
    submissions: page.map(toMachineSubmission),
    nextCursor:  rows.length > query.limit ? page[page.length - 1].id : null,
  };
}

export type ReviewResult =
  | { ok: true; submission: ReturnType<typeof toMachineSubmission> }
  | { ok: false; reason: 'not_found' | 'not_uploaded' };

/** Stores (or overwrites) the machine's verdict and marks the row REVIEWED. */
export async function reviewSubmission(id: string, review: UgcReviewInput): Promise<ReviewResult> {
  const current = await prisma.ugcSubmission.findUnique({ where: { id }, select: { status: true } });
  if (!current) return { ok: false, reason: 'not_found' };
  if (current.status === 'PENDING_UPLOAD') return { ok: false, reason: 'not_uploaded' };

  const row = await prisma.ugcSubmission.update({
    where:  { id },
    data: {
      status:     'REVIEWED',
      verdict:    review.verdict,
      score:      review.score,
      reasons:    review.reasons,
      reviewedAt: new Date(),
    },
    select: MACHINE_SELECT,
  });
  return { ok: true, submission: toMachineSubmission(row) };
}
