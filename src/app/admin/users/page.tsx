import { redirect } from 'next/navigation';
import { isAdminAuthenticated, getAdminUser } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import UsersTable from './UsersTable';

export const metadata = { title: 'Admin Users — Dips' };

export default async function AdminUsersPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');

  const [me, users] = await Promise.all([
    getAdminUser(),
    prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select:  { id: true, email: true, name: true, active: true, createdAt: true },
    }),
  ]);

  const tableUsers = users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {users.filter((u) => u.active).length} active user{users.filter((u) => u.active).length !== 1 ? 's' : ''}
        </p>
      </div>
      <UsersTable initialUsers={tableUsers} currentUserId={me?.id ?? ''} />
    </div>
  );
}
