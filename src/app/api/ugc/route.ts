import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateSessionId } from '@/lib/affiliate-auth';
import {
  clientIp,
  countRecentSubmissionsByIp,
  createPendingSubmission,
  getUgcAffiliate,
  hashIp,
} from '@/lib/ugc';
import { UGC_MAX_PER_IP_PER_DAY, parseUgcSubmissionInput } from '@/lib/ugc-input';

// ── POST /api/ugc ────────────────────────────────────────────────────────────
//
// Step 1 of the public "submit your video" flow (/{locale}/submit-video):
// stores the submitter's details and license acceptance as a PENDING_UPLOAD
// row and returns its id. The browser then uploads the video straight to
// Vercel Blob (/api/ugc/upload-token, scoped to this id) and confirms with
// POST /api/ugc/:id/complete.
//
// authorType is decided server-side: AFFILIATE only with a live affiliate
// session, never from the request body.

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = parseUgcSubmissionInput(body as Record<string, unknown>);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: 'invalid_field', field: parsed.field, message: parsed.message },
      { status: 400 }
    );
  }

  const ipHash = hashIp(clientIp(request.headers));
  if (ipHash) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((await countRecentSubmissionsByIp(ipHash, since)) >= UGC_MAX_PER_IP_PER_DAY) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
  }

  const affiliate = await getUgcAffiliate(await getAffiliateSessionId());

  try {
    const { id } = await createPendingSubmission(parsed.value, {
      affiliateId: affiliate?.id ?? null,
      ipHash,
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    console.error('❌ UGC submission create failed', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
