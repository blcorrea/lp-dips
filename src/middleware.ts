import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from './lib/session';

const intlMiddleware = createMiddleware(routing);

// Inline cookie names to avoid importing from auth libs that use next/headers
// (not available in Edge middleware runtime).
const ADMIN_COOKIE     = 'admin_token';
const AFFILIATE_COOKIE = 'affiliate_session';

function jsonError(message: string, status: number): NextResponse {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isAffiliateAuthed(request: NextRequest): boolean {
  return !!request.cookies.get(AFFILIATE_COOKIE)?.value;
}

/** Verified admin session from the JWT cookie, or null. */
async function adminSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
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

    const session = await adminSession(request);
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

  // ── Affiliate dashboard protection ────────────────────────────────────────
  // Matches /{locale}/affiliates/dashboard for all supported locales.
  const isAffiliateDashboard = routing.locales.some(
    (locale) =>
      pathname === `/${locale}/affiliates/dashboard` ||
      pathname.startsWith(`/${locale}/affiliates/dashboard/`)
  );

  // Matches /{locale}/affiliates/login for all supported locales.
  const isAffiliateLogin = routing.locales.some(
    (locale) => pathname === `/${locale}/affiliates/login`
  );

  // A logged-in admin who lands on the affiliate login or dashboard (without an
  // affiliate session of their own) shouldn't be asked for a separate affiliate
  // login — admins manage affiliates, they don't have a personal dashboard.
  // Send them to the admin affiliate management page instead.
  if (
    (isAffiliateDashboard || isAffiliateLogin) &&
    !isAffiliateAuthed(request) &&
    (await adminSession(request)) !== null
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/affiliates';
    url.search   = '';
    return NextResponse.redirect(url);
  }

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
