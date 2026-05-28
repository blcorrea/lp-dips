import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// ── GET /api/admin/users — list all admin users ───────────────────────────────

export async function GET(): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
    select:  { id: true, email: true, name: true, active: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, users });
}

// ── POST /api/admin/users — create a new admin user ──────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as Record<string, unknown>;
  const email    = typeof body.email    === 'string' ? body.email.trim().toLowerCase()  : '';
  const password = typeof body.password === 'string' ? body.password                    : '';
  const name     = typeof body.name     === 'string' ? body.name.trim() || null         : null;

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.adminUser.create({
      data:   { email, passwordHash, name, active: true },
      select: { id: true, email: true, name: true, active: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    throw err;
  }
}
