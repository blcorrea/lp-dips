import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client/client';
import { createAffiliate, REF_REGEX } from '@/lib/affiliates';

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

  try {
    const affiliate = await createAffiliate({
      name,
      ref: rawRef,
      email,
      instagram,
      type:           rawType,
      commissionRate: 0.07, // fixed 7% for self-signup
      active:         false, // requires manual admin approval
    });

    return NextResponse.json({ ok: true, affiliateId: affiliate.id }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'An affiliate with this ref already exists. Please choose a different one.' },
        { status: 409 }
      );
    }
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
