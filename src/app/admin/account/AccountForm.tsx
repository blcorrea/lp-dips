'use client';

import { useState } from 'react';

const inputCls =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function AccountForm() {
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [ok, setOk]             = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (next !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/account/password', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Failed to change password.');
        return;
      }
      setOk(true);
      setCurrent(''); setNext(''); setConfirm('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Change password
      </h2>

      <input
        type="password" required placeholder="Current password" autoComplete="current-password"
        value={current} onChange={(e) => { setCurrent(e.target.value); setError(null); setOk(false); }}
        className={inputCls}
      />
      <input
        type="password" required placeholder="New password (min 8)" autoComplete="new-password"
        value={next} onChange={(e) => { setNext(e.target.value); setError(null); setOk(false); }}
        className={inputCls}
      />
      <input
        type="password" required placeholder="Confirm new password" autoComplete="new-password"
        value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(null); setOk(false); }}
        className={inputCls}
      />

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {ok    && <p className="text-sm font-medium text-green-700">Password updated.</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white
                   hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Saving…' : 'Update password'}
      </button>
    </form>
  );
}
