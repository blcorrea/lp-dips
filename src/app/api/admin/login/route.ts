import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/admin-auth';

// ── POST /api/admin/login — validate password, set session cookie ──────────────

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { password } = (body ?? {}) as { password?: unknown };

  if (!password || password !== secret) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, secret, {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    maxAge:   ADMIN_COOKIE_MAX_AGE,
    secure:   process.env.NODE_ENV === 'production',
  });
  return res;
}

// ── GET /api/admin/login?logout=1 — clear session cookie ──────────────────────

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;

  if (searchParams.get('logout') !== null) {
    const res = NextResponse.redirect(`${origin}/admin/login`);
    res.cookies.delete(ADMIN_COOKIE_NAME);
    return res;
  }

  // Fallback: redirect to admin
  return NextResponse.redirect(`${origin}/admin/orders`);
}
