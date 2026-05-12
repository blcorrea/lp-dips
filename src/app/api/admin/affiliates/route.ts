import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client/client';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  createAffiliate,
  getAffiliatesWithStats,
  isValidAffiliateType,
  REF_REGEX,
} from '@/lib/affiliates';

// ── GET /api/admin/affiliates ─────────────────────────────────────────────────

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await getAffiliatesWithStats();
  return NextResponse.json(data);
}

// ── POST /api/admin/affiliates ────────────────────────────────────────────────

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

  // ── name ────────────────────────────────────────────────────────────────────
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  // ── ref ─────────────────────────────────────────────────────────────────────
  const ref = typeof raw.ref === 'string' ? raw.ref.trim().toLowerCase() : '';
  if (!ref) {
    return NextResponse.json({ error: 'ref is required' }, { status: 400 });
  }
  if (!REF_REGEX.test(ref)) {
    return NextResponse.json(
      { error: 'ref must contain only lowercase letters, numbers, hyphens or underscores' },
      { status: 400 }
    );
  }

  // ── optional fields ────────────────────────────────────────────────────────
  const email     = typeof raw.email     === 'string' && raw.email.trim().length     > 0 ? raw.email.trim()     : null;
  const instagram = typeof raw.instagram === 'string' && raw.instagram.trim().length > 0 ? raw.instagram.trim() : null;

  let type: 'INFLUENCER' | 'MEDIA_BUYER' | 'PARTNER' | 'ORGANIC' | 'OTHER' = 'INFLUENCER';
  if (raw.type !== undefined && raw.type !== null && raw.type !== '') {
    if (!isValidAffiliateType(raw.type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    type = raw.type;
  }

  let commissionRate = 0.15;
  if (raw.commissionRate !== undefined && raw.commissionRate !== null && raw.commissionRate !== '') {
    const n = typeof raw.commissionRate === 'number'
      ? raw.commissionRate
      : Number(raw.commissionRate);
    if (!Number.isFinite(n) || n < 0 || n > 1) {
      return NextResponse.json(
        { error: 'commissionRate must be a number between 0 and 1' },
        { status: 400 }
      );
    }
    commissionRate = n;
  }

  const active = raw.active === undefined ? true : Boolean(raw.active);

  try {
    const affiliate = await createAffiliate({
      name, ref, email, instagram, type, commissionRate, active,
    });
    return NextResponse.json({ ok: true, affiliate }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: `An affiliate with ref "${ref}" already exists.` },
        { status: 409 }
      );
    }
    const message = err instanceof Error ? err.message : 'Create failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
