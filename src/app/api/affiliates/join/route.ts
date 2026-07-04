import { NextRequest, NextResponse, after } from 'next/server';
import { Prisma } from '@/generated/prisma/client/client';
import {
  createAffiliate,
  affiliateEmailExists,
  buildAffiliateLink,
  REF_REGEX,
} from '@/lib/affiliates';
import { sendAffiliateWelcomeEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
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

  // ── name ──────────────────────────────────────────────────────────────────
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  // ── email ─────────────────────────────────────────────────────────────────
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'valid email is required' }, { status: 400 });
  }

  // ── ref ───────────────────────────────────────────────────────────────────
  // ref is derived from instagram handle or entered manually.
  // Always lowercase, strip leading @, replace spaces/dots with hyphens.
  const rawRef = typeof raw.ref === 'string'
    ? raw.ref.trim().toLowerCase().replace(/^@/, '').replace(/[\s.]+/g, '-')
    : '';
  if (!rawRef) {
    return NextResponse.json({ error: 'ref is required' }, { status: 400 });
  }
  if (!REF_REGEX.test(rawRef)) {
    return NextResponse.json(
      { error: 'ref must contain only lowercase letters, numbers, hyphens or underscores' },
      { status: 400 }
    );
  }

  // ── instagram (optional) ──────────────────────────────────────────────────
  const instagram = typeof raw.instagram === 'string' && raw.instagram.trim().length > 0
    ? raw.instagram.trim()
    : null;

  // ── type ──────────────────────────────────────────────────────────────────
  const { isValidAffiliateType } = await import('@/lib/affiliates');
  const rawType = typeof raw.type === 'string' ? raw.type.trim() : '';
  if (!rawType || !isValidAffiliateType(rawType)) {
    return NextResponse.json({ error: 'valid type is required' }, { status: 400 });
  }

  // ── duplicate email guard ─────────────────────────────────────────────────
  // App-level pre-check for a clear message; the DB unique index closes the
  // race window between this check and the insert.
  if (await affiliateEmailExists(email)) {
    return NextResponse.json(
      { error: 'An account with this email already exists.', field: 'email' },
      { status: 409 }
    );
  }

  try {
    const affiliate = await createAffiliate({
      name,
      ref: rawRef,
      email,
      instagram,
      type:           rawType,
      commissionRate: 0.07, // fixed 7% for self-signup
      // Auto-activate so the affiliate can log in and share their link
      // immediately. Admins can review and deactivate from /admin/affiliates.
      active:         true,
    });

    // Send the welcome email after the response is flushed. `after()` keeps the
    // serverless function alive until it completes — a plain fire-and-forget
    // promise gets killed when the function freezes, so the email never sends.
    // A send failure must not fail signup, so it's wrapped in try/catch.
    const link = buildAffiliateLink({ ref: rawRef, type: rawType, instagram });
    after(async () => {
      try {
        await sendAffiliateWelcomeEmail(email, name.split(' ')[0], { ref: rawRef, link });
      } catch (err) {
        console.error('❌ Affiliate welcome email failed', { affiliateId: affiliate.id, err });
      }
    });

    return NextResponse.json({ ok: true, affiliateId: affiliate.id }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      // target lists the conflicting column(s); distinguish email vs ref.
      const target = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join(',')
        : String(err.meta?.target ?? '');
      const field = target.includes('email') ? 'email' : 'ref';
      const error = field === 'email'
        ? 'An account with this email already exists.'
        : 'An affiliate with this ref already exists. Please choose a different one.';
      return NextResponse.json({ error, field }, { status: 409 });
    }
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
