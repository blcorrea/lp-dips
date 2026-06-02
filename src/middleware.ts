import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Inline cookie names to avoid importing from auth libs that use next/headers
// (not available in Edge middleware runtime).
const ADMIN_COOKIE     = 'admin_token';
const AFFILIATE_COOKIE = 'affiliate_session';

function isAdminAuthed(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.cookies.get(ADMIN_COOKIE)?.value === secret;
}

function isAffiliateAuthed(request: NextRequest): boolean {
  return !!request.cookies.get(AFFILIATE_COOKIE)?.value;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin auth protection ──────────────────────────────────────────────────
  const isAdminRoute    = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isAdminLoginUrl = pathname === '/admin/login' || pathname.startsWith('/api/admin/login');

  if (isAdminRoute) {
    if (!isAdminLoginUrl && !isAdminAuthed(request)) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.search   = '';
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Affiliate dashboard protection ────────────────────────────────────────
  // Matches /{locale}/affiliates/dashboard for all supported locales.
  const isAffiliateDashboard = routing.locales.some(
    (locale) =>
      pathname === `/${locale}/affiliates/dashboard` ||
      pathname.startsWith(`/${locale}/affiliates/dashboard/`)
  );

  if (isAffiliateDashboard && !isAffiliateAuthed(request)) {
    // Determine locale from path so the redirect lands on the right login page
    const locale = routing.locales.find(
      (l) => pathname === `/${l}/affiliates/dashboard` || pathname.startsWith(`/${l}/affiliates/dashboard/`)
    ) ?? 'en';
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/affiliates/login`;
    loginUrl.search   = '';
    return NextResponse.redirect(loginUrl);
  }

  // ── i18n ──────────────────────────────────────────────────────────────────
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