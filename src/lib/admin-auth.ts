import { cookies } from 'next/headers';
import { prisma } from './prisma';

export const ADMIN_COOKIE_NAME    = 'admin_token';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export type AdminUserRow = {
  id:        string;
  email:     string;
  name:      string | null;
  active:    boolean;
  createdAt: string;
};

/**
 * Returns true when the current request carries a valid admin session cookie
 * that maps to an active AdminUser in the database.
 * Safe to call from Server Components and Route Handlers.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const jar    = await cookies();
  const userId = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!userId) return false;
  const user = await prisma.adminUser.findUnique({
    where:  { id: userId },
    select: { active: true },
  });
  return !!user?.active;
}

/**
 * Returns the authenticated admin user, or null when unauthenticated.
 */
export async function getAdminUser(): Promise<{ id: string; email: string; name: string | null } | null> {
  const jar    = await cookies();
  const userId = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!userId) return null;
  return prisma.adminUser.findUnique({
    where:  { id: userId },
    select: { id: true, email: true, name: true },
  });
}
