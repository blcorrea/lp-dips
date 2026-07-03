import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import AccountForm from './AccountForm';

export const metadata = { title: 'Account — Dips Admin' };

export default async function AdminAccountPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {session.name} · {session.email}
          {session.role === 'SUPER_ADMIN' ? ' · Super admin' : ' · Operator'}
        </p>
      </div>

      <AccountForm />
    </div>
  );
}
