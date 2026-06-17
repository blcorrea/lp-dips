import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  createCreative,
  listCreatives,
  ACCEPTED_IMAGE_MIME,
  ACCEPTED_VIDEO_MIME,
} from '@/lib/creatives';
import { CreativeType } from '@/generated/prisma/client/client';
import { prisma } from '@/lib/prisma';

// ── GET /api/admin/creatives ──────────────────────────────────────────────────

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const creatives = await listCreatives();
  return NextResponse.json({ ok: true, creatives });
}

// ── POST /api/admin/creatives ─────────────────────────────────────────────────
//
// Creates the DB row AFTER the client has already uploaded the asset blob to
// Vercel Blob via the two-step client-upload pattern. The client passes blob
// metadata (url, blobPath) plus the creative fields in the request body.
// This route never touches Vercel Blob directly — it only writes to the DB.
//
// mimeType is re-validated server-side (T-02-05): the client-declared type is
// never trusted to derive CreativeType. Validation uses the shared constants
// from @/lib/creatives (D-06).

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  // ── title (required) ───────────────────────────────────────────────────────
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  // ── url + blobPath (required) ──────────────────────────────────────────────
  const url      = typeof raw.url      === 'string' ? raw.url.trim()      : '';
  const blobPath = typeof raw.blobPath === 'string' ? raw.blobPath.trim() : '';
  if (!url || !blobPath) {
    return NextResponse.json({ error: 'url and blobPath are required' }, { status: 400 });
  }

  // ── mimeType — server-side re-validation (T-02-05) ────────────────────────
  const mimeType = typeof raw.mimeType === 'string' ? raw.mimeType : '';
  const allMimes = [...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME] as string[];
  if (!allMimes.includes(mimeType)) {
    return NextResponse.json({ error: 'Unsupported mimeType' }, { status: 400 });
  }

  // Derive CreativeType server-side — never trust a client-declared type field
  const type: CreativeType = (ACCEPTED_VIDEO_MIME as readonly string[]).includes(mimeType)
    ? 'VIDEO'
    : 'IMAGE';

  // ── optional fields ────────────────────────────────────────────────────────
  const description       = typeof raw.description       === 'string' ? raw.description       || null : null;
  const caption           = typeof raw.caption           === 'string' ? raw.caption           || null : null;
  const thumbnailUrl      = typeof raw.thumbnailUrl      === 'string' ? raw.thumbnailUrl      || null : null;
  const thumbnailBlobPath = typeof raw.thumbnailBlobPath === 'string' ? raw.thumbnailBlobPath || null : null;
  const fileName          = typeof raw.fileName          === 'string' ? raw.fileName          : '';
  const fileSize          = typeof raw.fileSize          === 'number' ? raw.fileSize          : 0;

  try {
    // ── sortOrder (CR-01) ──────────────────────────────────────────────────
    // Assign a distinct, increasing sortOrder so freshly uploaded creatives
    // append at the end with unique values. Without this every row keeps the
    // schema default (0) and the reorder swap in [id]/route.ts is a silent
    // no-op (swapping two equal sortOrder values changes nothing).
    const max = await prisma.affiliateCreative.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    const creative = await createCreative({
      title,
      description,
      caption,
      type,
      url,
      blobPath,
      thumbnailUrl,
      thumbnailBlobPath,
      fileName,
      fileSize,
      mimeType,
      sortOrder,
    });
    return NextResponse.json({ ok: true, creative }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
