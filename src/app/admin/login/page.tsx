import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import LoginForm from './LoginForm';

export const metadata = { title: 'Admin Login — Dips' };

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect('/admin/orders');
  const isSetup = (await prisma.adminUser.count()) === 0;
  return <LoginForm isSetup={isSetup} />;
}
