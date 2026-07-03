import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import UsersManager, { type AdminUserRow } from './UsersManager';

export const metadata = { title: 'Admin Users — Dips' };

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  // Defense in depth — middleware already gates this route to SUPER_ADMIN.
  if (!session || session.role !== 'SUPER_ADMIN') redirect('/admin/orders');

  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const rows: AdminUserRow[] = users.map((u) => ({
    ...u,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {rows.length} admin{rows.length === 1 ? '' : 's'} · manage who can access the dashboard
        </p>
      </div>

      <UsersManager initialUsers={rows} currentUserId={session.sub} />
    </div>
  );
}
