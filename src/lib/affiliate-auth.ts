import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const AFFILIATE_COOKIE_NAME    = 'affiliate_session';
export const AFFILIATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Returns the affiliate ID from the current request's session cookie, or null
 * when unauthenticated. Safe to call from Server Components and Route Handlers.
 */
export async function getAffiliateSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AFFILIATE_COOKIE_NAME)?.value ?? null;
}

/** Reads affiliate session from an Edge-runtime NextRequest (middleware). */
export function getAffiliateSessionIdFromRequest(req: NextRequest): string | null {
  return req.cookies.get(AFFILIATE_COOKIE_NAME)?.value ?? null;
}

/** Writes the session cookie onto a NextResponse. */
export function setAffiliateSession(res: NextResponse, affiliateId: string): NextResponse {
  res.cookies.set(AFFILIATE_COOKIE_NAME, affiliateId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   AFFILIATE_COOKIE_MAX_AGE,
  });
  return res;
}

/** Clears the session cookie on a NextResponse. */
export function clearAffiliateSession(res: NextResponse): NextResponse {
  res.cookies.set(AFFILIATE_COOKIE_NAME, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   0,
  });
  return res;
}
