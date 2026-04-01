import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Inline the cookie name here to avoid importing from admin-auth.ts,
// which uses next/headers (not available in Edge middleware runtime).
const ADMIN_COOKIE = 'admin_token';

function isAdminAuthed(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.cookies.get(ADMIN_COOKIE)?.value === secret;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin auth protection ──────────────────────────────────────────────────
  // All /admin/* and /api/admin/* routes are handled here so they never fall
  // through to intlMiddleware (which would 404 them as non-locale routes).
  const isAdminRoute    = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isAdminLoginUrl = pathname === '/admin/login' || pathname.startsWith('/api/admin/login');

  if (isAdminRoute) {
    // /admin/login and /api/admin/login are always public
    if (!isAdminLoginUrl && !isAdminAuthed(request)) {
      // API routes → JSON 401 so fetch() callers get a proper error
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Page routes → redirect to login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.search   = '';
      return NextResponse.redirect(loginUrl);
    }
    // Authenticated (or public admin URL) — skip intl middleware entirely
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