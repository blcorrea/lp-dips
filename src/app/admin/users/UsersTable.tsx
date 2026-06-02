'use client';

import { useState } from 'react';

type AdminUser = {
  id:        string;
  email:     string;
  name:      string | null;
  active:    boolean;
  createdAt: string;
};

interface UsersTableProps {
  initialUsers: AdminUser[];
  currentUserId: string;
}

const inputCls =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export default function UsersTable({ initialUsers, currentUserId }: UsersTableProps) {
  const [users, setUsers]     = useState<AdminUser[]>(initialUsers);
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  // ── Add user ───────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.email.trim() || !form.email.includes('@')) next.email = 'Valid email is required';
    if (!form.password || form.password.length < 8)       next.password = 'Minimum 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleAdd() {
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const res  = await fetch('/api/admin/users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: form.name.trim() || null, email: form.email.trim(), password: form.password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; user?: AdminUser };

      if (!res.ok || !data.ok) {
        setServerError(data.error ?? 'Something went wrong');
        return;
      }

      setUsers((prev) => [...prev, data.user!]);
      setForm({ name: '', email: '', password: '' });
    } catch {
      setServerError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Deactivate user ────────────────────────────────────────────────────────

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this user? They will no longer be able to log in.')) return;
    setDeactivating(id);

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: false } : u));
      }
    } finally {
      setDeactivating(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── User list ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className={u.active ? '' : 'opacity-50'}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {u.name ?? <span className="text-gray-400 italic">—</span>}
                  {u.id === currentUserId && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">You</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold
                    ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  {u.active && u.id !== currentUserId && (
                    <button
                      onClick={() => handleDeactivate(u.id)}
                      disabled={deactivating === u.id}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                    >
                      {deactivating === u.id ? 'Deactivating…' : 'Deactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add user form ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Add new admin user</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Name <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Jane Smith"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: '' })); }}
              placeholder="jane@example.com"
              className={`${inputCls} ${errors.email ? 'border-red-400' : ''}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: '' })); }}
              placeholder="Min. 8 characters"
              className={`${inputCls} ${errors.password ? 'border-red-400' : ''}`}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>
        </div>

        {serverError && (
          <p className="mt-3 text-sm text-red-600 font-medium">{serverError}</p>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={submitting}
          className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white
                     hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Creating…' : 'Create user'}
        </button>
      </div>

    </div>
  );
}
