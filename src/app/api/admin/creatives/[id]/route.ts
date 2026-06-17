import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client/client';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { updateCreative, deleteCreative } from '@/lib/creatives';
import { prisma } from '@/lib/prisma';

// ── PATCH /api/admin/creatives/[id] ──────────────────────────────────────────
//
// Two branches dispatched by the presence of `direction`:
//
// Reorder branch (`{ direction: 'up' | 'down' }`):
//   Loads all creatives ordered by sortOrder asc, createdAt asc. Finds the
//   target creative's index, determines the neighbor, then swaps sortOrder
//   values atomically via prisma.$transaction. Gaps in sortOrder are harmless
//   (Pitfall 6 — no unique constraint; do NOT add one).
//
// Metadata branch (any other body):
//   Calls updateCreative() with only the fields present in the request body
//   (title, description, caption, active). Supports the active toggle (D-10)
//   and generic metadata edit (D-08). Maps P2025 → 404.

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

  // ── Reorder branch ────────────────────────────────────────────────────────
  if (raw.direction === 'up' || raw.direction === 'down') {
    // Load all creatives in display order (sortOrder asc, then createdAt asc for ties).
    // The swap operates on list position — gaps in sortOrder values are harmless.
    const all = await prisma.affiliateCreative.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, sortOrder: true },
    });

    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const neighborIdx = raw.direction === 'up' ? idx - 1 : idx + 1;
    if (neighborIdx < 0 || neighborIdx >= all.length) {
      return NextResponse.json({ error: 'Already at boundary' }, { status: 400 });
    }

    const a = all[idx];
    const b = all[neighborIdx];

    // Atomic two-row swap — sortOrder has no unique constraint so direct
    // value swap is safe without a temporary placeholder (Pattern 3).
    await prisma.$transaction([
      prisma.affiliateCreative.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
      prisma.affiliateCreative.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
    ]);

    return NextResponse.json({ ok: true });
  }

  // ── Metadata edit branch ──────────────────────────────────────────────────
  // Only include a field in the update when the key is present in raw.
  // description and caption map empty string → null (nullable fields).
  // active uses Boolean() coercion (matches affiliate PATCH convention).
  try {
    const creative = await updateCreative(id, {
      title:
        typeof raw.title === 'string' ? raw.title : undefined,
      description:
        raw.description !== undefined
          ? (typeof raw.description === 'string' ? raw.description || null : null)
          : undefined,
      caption:
        raw.caption !== undefined
          ? (typeof raw.caption === 'string' ? raw.caption || null : null)
          : undefined,
      active:
        raw.active !== undefined ? Boolean(raw.active) : undefined,
    });
    return NextResponse.json({ ok: true, creative });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Creative not found' }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE /api/admin/creatives/[id] ─────────────────────────────────────────
//
// Delegates entirely to deleteCreative() which removes blob assets BEFORE the
// DB row (blob-first strategy; T-01-01 mitigation from Phase 1). The native
// confirm() guard lives in the Plan 02 client component (D-09).

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // blobs deleted first, then DB row (creatives.ts deleteCreative)
  await deleteCreative(id);

  return NextResponse.json({ ok: true });
}
