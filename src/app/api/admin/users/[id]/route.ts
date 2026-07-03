import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

const MIN_PASSWORD_LENGTH = 8;

const publicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

type Ctx = { params: Promise<{ id: string }> };

/** Count active super-admins, used to prevent locking out the last one. */
async function activeSuperAdminCount(): Promise<number> {
  return prisma.adminUser.count({ where: { role: 'SUPER_ADMIN', active: true } });
}

// ── PATCH /api/admin/users/[id] — update name, role, active, or password ──────

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, role, active, password } = (body ?? {}) as {
    name?: unknown;
    role?: unknown;
    active?: unknown;
    password?: unknown;
  };

  const data: {
    name?: string;
    role?: 'SUPER_ADMIN' | 'OPERATOR';
    active?: boolean;
    passwordHash?: string;
  } = {};

  if (typeof name === 'string' && name.trim()) {
    data.name = name.trim();
  }

  if (role === 'SUPER_ADMIN' || role === 'OPERATOR') {
    data.role = role;
  }

  if (typeof active === 'boolean') {
    data.active = active;
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }
    data.passwordHash = await hashPassword(password);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
  }

  // Guardrails: don't let the last active super-admin be demoted or deactivated.
  const demoting     = data.role === 'OPERATOR' && target.role === 'SUPER_ADMIN';
  const deactivating = data.active === false && target.active && target.role === 'SUPER_ADMIN';
  if ((demoting || deactivating) && (await activeSuperAdminCount()) <= 1) {
    return NextResponse.json(
      { error: 'Cannot demote or deactivate the last active super-admin.' },
      { status: 409 }
    );
  }
  // Prevent self-lockout on your own super-admin powers.
  if (session.sub === id && (demoting || data.active === false)) {
    return NextResponse.json(
      { error: 'You cannot remove your own access.' },
      { status: 409 }
    );
  }

  const user = await prisma.adminUser.update({ where: { id }, data, select: publicSelect });
  return NextResponse.json({ user });
}

// ── DELETE /api/admin/users/[id] — remove an admin ────────────────────────────

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  if (session.sub === id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 409 });
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (target.role === 'SUPER_ADMIN' && target.active && (await activeSuperAdminCount()) <= 1) {
    return NextResponse.json(
      { error: 'Cannot delete the last active super-admin.' },
      { status: 409 }
    );
  }

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
