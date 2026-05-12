import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { isValidCommissionStatus, transitionCommission } from '@/lib/affiliates';

// ── PATCH /api/admin/commissions/[id] ─────────────────────────────────────────
// Body: { status: 'APPROVED' | 'PAID' | 'CANCELLED' }

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

  const raw = body as Record<string, unknown>;
  if (!isValidCommissionStatus(raw.status)) {
    return NextResponse.json(
      { error: 'status must be one of: APPROVED, PAID, CANCELLED' },
      { status: 400 }
    );
  }

  const result = await transitionCommission(id, raw.status);
  if (result.ok) {
    return NextResponse.json({ ok: true });
  }
  if (result.reason === 'not_found') {
    return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
  }
  return NextResponse.json({ error: result.reason }, { status: 400 });
}
