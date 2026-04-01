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

  // When not authenticated, render children directly (no navbar).
  // Middleware already redirects unauthenticated users to /admin/login for all
  // protected routes, so the only page that reaches here unauthenticated is
  // /admin/login itself — which renders its own full-page UI.
  if (!ok) {
    return (
      <html lang="en">
        <body className="bg-gray-50 antialiased">{children}</body>
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
