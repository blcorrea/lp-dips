import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/admin-auth';
import { createSessionToken, type SessionPayload } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import {
  checkLoginAllowed,
  recordLoginFailure,
  recordLoginSuccess,
} from '@/lib/login-rate-limit';

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

/** First entry of x-forwarded-for (the client), or 'unknown' when absent. */
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first || 'unknown';
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

  if (!process.env.SESSION_SECRET && !process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'SESSION_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  // ── Rate limit gate — checked BEFORE any credential/bootstrap verification.
  // The error is deliberately generic: it must not reveal whether the lock is
  // keyed on the email or the IP.
  const ip = clientIp(request);
  const gate = await checkLoginAllowed(email, ip);
  if (!gate.allowed) {
    return NextResponse.json(
      { error: 'Too many failed login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(gate.retryAfterSeconds) } }
    );
  }

  // ── Bootstrap: the very first login. When no admin users exist yet AND
  // ADMIN_BOOTSTRAP_KEY is configured, that key creates the first SUPER_ADMIN
  // using the supplied email + the key as its initial password. Once any user
  // exists, the key stops working. When ADMIN_BOOTSTRAP_KEY is unset, the
  // bootstrap path is disabled entirely (normal login is unaffected).
  const userCount = await prisma.adminUser.count();
  const bootstrapKey = process.env.ADMIN_BOOTSTRAP_KEY;
  if (userCount === 0 && bootstrapKey) {
    if (password !== bootstrapKey) {
      await recordLoginFailure(email, ip);
      return NextResponse.json(
        { error: 'No admin users exist yet. Sign in with your email and the ADMIN_BOOTSTRAP_KEY master key to bootstrap the first account.' },
        { status: 401 }
      );
    }
    const created = await prisma.adminUser.create({
      data: {
        email,
        name:         email.split('@')[0],
        passwordHash: await hashPassword(bootstrapKey),
        role:         'SUPER_ADMIN',
        lastLoginAt:  new Date(),
      },
    });
    await recordLoginSuccess(email);
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
    await recordLoginFailure(email, ip);
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data:  { lastLoginAt: new Date() },
  });

  await recordLoginSuccess(email);

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
