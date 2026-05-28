import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/admin-auth';

// ── POST /api/admin/login — email + password login ────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // ── Setup mode: no admin users exist yet ──────────────────────────────────
  const count = await prisma.adminUser.count();
  if (count === 0) {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || password !== adminSecret) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.adminUser.create({
      data: { email: email.toLowerCase().trim(), passwordHash, name: 'Admin' },
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, user.id, {
      httpOnly: true,
      sameSite: 'lax',
      path:     '/',
      maxAge:   ADMIN_COOKIE_MAX_AGE,
      secure:   process.env.NODE_ENV === 'production',
    });
    return res;
  }

  // ── Normal login ──────────────────────────────────────────────────────────
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    maxAge:   ADMIN_COOKIE_MAX_AGE,
    secure:   process.env.NODE_ENV === 'production',
  });
  return res;
}

// ── GET /api/admin/login?logout=1 — clear session cookie ─────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { origin, searchParams } = request.nextUrl;
  if (searchParams.get('logout') !== null) {
    const res = NextResponse.redirect(`${origin}/admin/login`);
    res.cookies.delete(ADMIN_COOKIE_NAME);
    return res;
  }
  return NextResponse.redirect(`${origin}/admin/orders`);
}
