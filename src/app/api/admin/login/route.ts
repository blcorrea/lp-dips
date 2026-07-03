import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/admin-auth';
import { createSessionToken, type SessionPayload } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    maxAge:   ADMIN_COOKIE_MAX_AGE,
    secure:   process.env.NODE_ENV === 'production',
  });
}

async function issueSession(payload: SessionPayload): Promise<NextResponse> {
  const token = await createSessionToken(payload);
  const res = NextResponse.json({ ok: true, user: payload });
  setSessionCookie(res, token);
  return res;
}

// ── POST /api/admin/login — email + password, or bootstrap with master key ────

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email: rawEmail, password: rawPassword } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  const email    = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const masterKey = process.env.ADMIN_SECRET;
  if (!masterKey) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  // ── Bootstrap: the very first login. When no admin users exist yet, the
  // master key (ADMIN_SECRET) creates the first SUPER_ADMIN using the supplied
  // email + the master key as its initial password. Once any user exists, the
  // master key stops working and normal credentials are required.
  const userCount = await prisma.adminUser.count();
  if (userCount === 0) {
    if (password !== masterKey) {
      return NextResponse.json(
        { error: 'No admin users exist yet. Sign in with your email and the ADMIN_SECRET master key to bootstrap the first account.' },
        { status: 401 }
      );
    }
    const created = await prisma.adminUser.create({
      data: {
        email,
        name:         email.split('@')[0],
        passwordHash: await hashPassword(masterKey),
        role:         'SUPER_ADMIN',
        lastLoginAt:  new Date(),
      },
    });
    return issueSession({
      sub:   created.id,
      email: created.email,
      name:  created.name,
      role:  created.role,
    });
  }

  // ── Normal path ─────────────────────────────────────────────────────────────
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data:  { lastLoginAt: new Date() },
  });

  return issueSession({
    sub:   user.id,
    email: user.email,
    name:  user.name,
    role:  user.role,
  });
}

// ── GET /api/admin/login?logout=1 — clear session cookie ──────────────────────

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;

  if (searchParams.get('logout') !== null) {
    const res = NextResponse.redirect(`${origin}/admin/login`);
    res.cookies.delete(ADMIN_COOKIE_NAME);
    return res;
  }

  return NextResponse.redirect(`${origin}/admin/orders`);
}
