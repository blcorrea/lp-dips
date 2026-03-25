import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token  = searchParams.get('token');
  const logout = searchParams.get('logout');
  const secret = process.env.ADMIN_SECRET;

  // ── Logout ────────────────────────────────────────────────────────────────
  if (logout !== null) {
    const res = NextResponse.redirect(`${origin}/admin/orders`);
    res.cookies.delete(ADMIN_COOKIE_NAME);
    return res;
  }

  // ── Server misconfiguration ───────────────────────────────────────────────
  if (!secret) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  // ── Invalid token ─────────────────────────────────────────────────────────
  if (!token || token !== secret) {
    return new NextResponse(
      `<!doctype html><html lang="en"><head><title>401</title></head>
       <body style="font-family:monospace;padding:2rem;max-width:480px">
         <h2 style="color:#b91c1c">401 – Unauthorized</h2>
         <p>Pass your admin secret as a query param:</p>
         <code style="background:#f3f4f6;padding:6px 10px;border-radius:4px;display:block">
           /api/admin/login?token=YOUR_ADMIN_SECRET
         </code>
         <p style="color:#6b7280;font-size:0.85rem;margin-top:1.5rem">
           Set <code>ADMIN_SECRET</code> in your <code>.env</code> file.
         </p>
       </body></html>`,
      { status: 401, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // ── Valid — set cookie and redirect to orders list ────────────────────────
  const res = NextResponse.redirect(`${origin}/admin/orders`);
  res.cookies.set(ADMIN_COOKIE_NAME, secret, {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    maxAge:   ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
