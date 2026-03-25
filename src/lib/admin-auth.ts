import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME    = 'admin_token';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

/**
 * Returns true when the current request carries a valid admin session cookie.
 * Safe to call from Server Components and Route Handlers (Next.js 15 async cookies).
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE_NAME)?.value === secret;
}
