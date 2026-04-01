import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import LoginForm from './LoginForm';

export const metadata = { title: 'Admin Login — Dips' };

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect('/admin/orders');
  return <LoginForm />;
}
