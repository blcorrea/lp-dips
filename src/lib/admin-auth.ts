import { cookies } from 'next/headers';
import { verifySessionToken, type SessionPayload } from './session';

export const ADMIN_COOKIE_NAME    = 'admin_token';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

/**
 * Returns the decoded admin session for the current request, or null when the
 * caller is not authenticated. Safe to call from Server Components and Route
 * Handlers (Next.js 15 async cookies).
 */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Returns true when the current request carries a valid admin session cookie.
 * Kept for backwards-compatibility with existing route guards.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

/**
 * Returns the session only when the caller is a SUPER_ADMIN, otherwise null.
 * Use to guard user-management endpoints.
 */
export async function requireSuperAdmin(): Promise<SessionPayload | null> {
  const session = await getAdminSession();
  return session?.role === 'SUPER_ADMIN' ? session : null;
}
