import type { Metadata } from 'next';
import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Admin — Dips',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdminAuthenticated();

  if (!ok) {
    return (
      <html lang="en">
        <body className="bg-gray-100 antialiased">
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-4">
              <div className="text-3xl font-bold text-gray-300">🔒</div>
              <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
              <p className="text-sm text-gray-500">
                Authenticate with your secret token to enter the admin area:
              </p>
              <code className="block bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 break-all text-left">
                /api/admin/login?token=<span className="text-blue-600">YOUR_ADMIN_SECRET</span>
              </code>
              <p className="text-xs text-gray-400">
                Set <code className="bg-gray-100 px-1 rounded">ADMIN_SECRET</code> in your{' '}
                <code className="bg-gray-100 px-1 rounded">.env</code> file first.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-6">
            <Link
              href="/admin/orders"
              className="font-bold text-sm uppercase tracking-wider text-gray-900 hover:text-gray-600 transition-colors"
            >
              Dips{' '}
              <span className="font-normal text-gray-400">Admin</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/admin/orders"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Orders
              </Link>
            </nav>
            <Link
              href="/api/admin/login?logout=1"
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Log out
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
