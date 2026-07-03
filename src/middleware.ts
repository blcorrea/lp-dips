import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from './lib/session';

const intlMiddleware = createMiddleware(routing);

// Inline the cookie name here to avoid importing from admin-auth.ts,
// which uses next/headers (not available in Edge middleware runtime).
const ADMIN_COOKIE = 'admin_token';

function jsonError(message: string, status: number): NextResponse {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin auth protection ──────────────────────────────────────────────────
  // All /admin/* and /api/admin/* routes are handled here so they never fall
  // through to intlMiddleware (which would 404 them as non-locale routes).
  const isAdminRoute    = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isAdminLoginUrl = pathname === '/admin/login' || pathname.startsWith('/api/admin/login');

  if (isAdminRoute) {
    if (isAdminLoginUrl) {
      // Login endpoints are always public — skip intl middleware entirely.
      return NextResponse.next();
    }

    const token   = request.cookies.get(ADMIN_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    const isApi   = pathname.startsWith('/api/');

    if (!session) {
      if (isApi) return jsonError('Unauthorized', 401);
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.search   = '';
      return NextResponse.redirect(loginUrl);
    }

    // ── Role gate: user management is SUPER_ADMIN-only ────────────────────────
    const isUserMgmt =
      pathname.startsWith('/admin/users') || pathname.startsWith('/api/admin/users');
    if (isUserMgmt && session.role !== 'SUPER_ADMIN') {
      if (isApi) return jsonError('Forbidden', 403);
      const url = request.nextUrl.clone();
      url.pathname = '/admin/orders';
      url.search   = '';
      return NextResponse.redirect(url);
    }

    // Authenticated — skip intl middleware entirely.
    return NextResponse.next();
  }

  // ── i18n (unchanged) ──────────────────────────────────────────────────────
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!pathnameHasLocale && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|es|pt)/:path*', '/admin/:path*', '/api/admin/:path*'],
};