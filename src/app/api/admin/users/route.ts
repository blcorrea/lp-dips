import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Fields safe to return to the client — never the password hash.
const publicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

// ── GET /api/admin/users — list all admins (SUPER_ADMIN only) ─────────────────

export async function GET() {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.adminUser.findMany({
    select: publicSelect,
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ users });
}

// ── POST /api/admin/users — create a new admin (SUPER_ADMIN only) ─────────────

export async function POST(request: NextRequest) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    email: rawEmail,
    name: rawName,
    password: rawPassword,
    role: rawRole,
  } = (body ?? {}) as {
    email?: unknown;
    name?: unknown;
    password?: unknown;
    role?: unknown;
  };

  const email    = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  const name     = typeof rawName === 'string' ? rawName.trim() : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';
  const role     = rawRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'OPERATOR';

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'An admin with that email already exists.' }, { status: 409 });
  }

  const user = await prisma.adminUser.create({
    data: { email, name, role, passwordHash: await hashPassword(password) },
    select: publicSelect,
  });

  return NextResponse.json({ user }, { status: 201 });
}
