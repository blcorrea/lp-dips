// ─────────────────────────────────────────────────────────────────────────────
// UGC submissions — constants and pure input parsing. Server-free (no prisma,
// no @vercel/blob) so the submit form can import the limits too.
// ─────────────────────────────────────────────────────────────────────────────

/** Accepted video types (mov = video/quicktime, the iPhone default). */
export const UGC_ACCEPTED_MIME = ['video/mp4', 'video/quicktime', 'video/webm'] as const;

/** Maximum video size in bytes (200 MB). */
export const UGC_MAX_BYTES = 200 * 1024 * 1024;

/**
 * Version of the content-license text the submitter accepted, stored on every
 * row. Bump it whenever the UgcSubmit.terms* copy changes.
 * DRAFT — the license text still needs João's and the client's sign-off.
 */
export const UGC_TERMS_VERSION = '2026-10-14-draft';

/** How long a created submission may wait for its video upload to finish. */
export const UGC_UPLOAD_WINDOW_MS = 2 * 60 * 60 * 1000;

/** Submissions allowed per IP per rolling 24h. */
export const UGC_MAX_PER_IP_PER_DAY = 10;

export const UGC_MIN_SCORE = 0;
export const UGC_MAX_SCORE = 100;
export const UGC_MAX_REASONS = 20;
export const UGC_MAX_REASON_CHARS = 500;

const EMAIL_REGEX     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_REGEX = /^[A-Za-z0-9._]{1,30}$/;

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; field: string; message: string };

export function isUgcVideoMime(mime: string): boolean {
  return (UGC_ACCEPTED_MIME as readonly string[]).includes(mime);
}

/** "@Ana.Doces " → "Ana.Doces"; null when empty. */
export function normalizeInstagram(raw: string): string | null {
  const handle = raw.trim().replace(/^@+/, '');
  return handle || null;
}

// ── Public submission (POST /api/ugc) ────────────────────────────────────────

export type UgcSubmissionInput = {
  name:          string;
  email:         string;
  instagram:     string | null;
  orderEmail:    string | null;
  locale:        string;
  rightsAccepted: true;
};

export function parseUgcSubmissionInput(raw: Record<string, unknown>): ParseResult<UgcSubmissionInput> {
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (name.length < 2 || name.length > 100) {
    return { ok: false, field: 'name', message: 'name must be 2-100 characters.' };
  }

  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  if (!EMAIL_REGEX.test(email) || email.length > 200) {
    return { ok: false, field: 'email', message: 'A valid email is required.' };
  }

  let instagram: string | null = null;
  if (typeof raw.instagram === 'string') {
    instagram = normalizeInstagram(raw.instagram);
    if (instagram && !INSTAGRAM_REGEX.test(instagram)) {
      return { ok: false, field: 'instagram', message: 'Invalid Instagram handle.' };
    }
  }

  let orderEmail: string | null = null;
  if (typeof raw.orderEmail === 'string' && raw.orderEmail.trim()) {
    orderEmail = raw.orderEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(orderEmail) || orderEmail.length > 200) {
      return { ok: false, field: 'orderEmail', message: 'orderEmail must be a valid email.' };
    }
  }

  const locale = raw.locale === 'es' || raw.locale === 'pt' ? raw.locale : 'en';

  if (raw.rightsAccepted !== true) {
    return { ok: false, field: 'rightsAccepted', message: 'The content license must be accepted.' };
  }

  return { ok: true, value: { name, email, instagram, orderEmail, locale, rightsAccepted: true } };
}

// ── Machine review (PATCH /api/machine/ugc/:id) ──────────────────────────────

export const UGC_VERDICTS = { repost: 'REPOST', repost_edit: 'REPOST_EDIT', reject: 'REJECT' } as const;
export type UgcVerdictInput = keyof typeof UGC_VERDICTS;

export type UgcReviewInput = {
  verdict: (typeof UGC_VERDICTS)[UgcVerdictInput];
  score:   number;
  reasons: string[];
};

export function parseUgcReviewInput(raw: Record<string, unknown>): ParseResult<UgcReviewInput> {
  const verdictKey = typeof raw.verdict === 'string' ? raw.verdict : '';
  if (!Object.hasOwn(UGC_VERDICTS, verdictKey)) {
    return { ok: false, field: 'verdict', message: 'verdict must be "repost", "repost_edit" or "reject".' };
  }

  const score = raw.score;
  if (typeof score !== 'number' || !Number.isFinite(score) || score < UGC_MIN_SCORE || score > UGC_MAX_SCORE) {
    return { ok: false, field: 'score', message: `score must be a number from ${UGC_MIN_SCORE} to ${UGC_MAX_SCORE}.` };
  }

  if (!Array.isArray(raw.reasons) || raw.reasons.length > UGC_MAX_REASONS) {
    return { ok: false, field: 'reasons', message: `reasons must be an array of up to ${UGC_MAX_REASONS} strings.` };
  }
  const reasons: string[] = [];
  for (const r of raw.reasons) {
    if (typeof r !== 'string' || !r.trim() || r.trim().length > UGC_MAX_REASON_CHARS) {
      return {
        ok: false,
        field: 'reasons',
        message: `Each reason must be a non-empty string of up to ${UGC_MAX_REASON_CHARS} characters.`,
      };
    }
    reasons.push(r.trim());
  }

  return {
    ok: true,
    value: { verdict: UGC_VERDICTS[verdictKey as UgcVerdictInput], score, reasons },
  };
}

// ── Machine list query (GET /api/machine/ugc) ────────────────────────────────

export const UGC_LIST_STATUSES = { new: 'NEW', reviewed: 'REVIEWED' } as const;

export type UgcListQuery = {
  /** null = new and reviewed (never PENDING_UPLOAD). */
  status: 'NEW' | 'REVIEWED' | null;
  limit:  number;
  cursor: string | null;
};

export function parseUgcListQuery(params: URLSearchParams): ParseResult<UgcListQuery> {
  const statusParam = params.get('status') ?? 'new';
  let status: UgcListQuery['status'];
  if (statusParam === 'all') {
    status = null;
  } else if (Object.hasOwn(UGC_LIST_STATUSES, statusParam)) {
    status = UGC_LIST_STATUSES[statusParam as keyof typeof UGC_LIST_STATUSES];
  } else {
    return { ok: false, field: 'status', message: 'status must be "new", "reviewed" or "all".' };
  }

  const limitParam = params.get('limit');
  const limit = limitParam === null ? 50 : Number(limitParam);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return { ok: false, field: 'limit', message: 'limit must be an integer from 1 to 100.' };
  }

  const cursor = params.get('cursor')?.trim() || null;
  return { ok: true, value: { status, limit, cursor } };
}
