'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  isSetup: boolean;
}

const inputCls =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function LoginForm({ isSetup }: LoginFormProps) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Invalid credentials');
        return;
      }

      router.push('/admin/orders');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            {isSetup ? 'First-time setup' : 'Internal'}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Dips <span className="font-normal text-gray-400">Admin</span>
          </h1>
          {isSetup && (
            <p className="mt-2 text-sm text-gray-500">
              No admin users yet. Enter your email and the{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">ADMIN_SECRET</code>{' '}
              as password to create the first account.
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              className={inputCls}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              className={inputCls}
              placeholder={isSetup ? 'Enter ADMIN_SECRET value' : 'Enter your password'}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white
                       hover:bg-gray-700 active:bg-gray-800
                       focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in…' : isSetup ? 'Create account & sign in' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  );
}
