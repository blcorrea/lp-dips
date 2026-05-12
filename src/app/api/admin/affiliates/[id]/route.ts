import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client/client';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  isValidAffiliateType,
  updateAffiliate,
  type UpdateAffiliateInput,
} from '@/lib/affiliates';

// ── PATCH /api/admin/affiliates/[id] ──────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const raw  = body as Record<string, unknown>;
  const data: UpdateAffiliateInput = {};

  if (raw.name !== undefined) {
    if (typeof raw.name !== 'string' || raw.name.trim().length === 0) {
      return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 });
    }
    data.name = raw.name.trim();
  }
  if (raw.email !== undefined) {
    data.email = typeof raw.email === 'string' && raw.email.trim().length > 0 ? raw.email.trim() : null;
  }
  if (raw.instagram !== undefined) {
    data.instagram = typeof raw.instagram === 'string' && raw.instagram.trim().length > 0 ? raw.instagram.trim() : null;
  }
  if (raw.type !== undefined) {
    if (!isValidAffiliateType(raw.type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    data.type = raw.type;
  }
  if (raw.commissionRate !== undefined) {
    const n = typeof raw.commissionRate === 'number' ? raw.commissionRate : Number(raw.commissionRate);
    if (!Number.isFinite(n) || n < 0 || n > 1) {
      return NextResponse.json(
        { error: 'commissionRate must be a number between 0 and 1' },
        { status: 400 }
      );
    }
    data.commissionRate = n;
  }
  if (raw.active !== undefined) {
    data.active = Boolean(raw.active);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
  }

  try {
    const affiliate = await updateAffiliate(id, data);
    return NextResponse.json({ ok: true, affiliate });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
