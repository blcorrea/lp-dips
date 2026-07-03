'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'OPERATOR';
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const inputCls =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const btnPrimary =
  'rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export default function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers]     = useState<AdminUserRow[]>(initialUsers);
  const [busyId, setBusyId]   = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  // Create-form state
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'SUPER_ADMIN' | 'OPERATOR'>('OPERATOR');
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, name, password, role }),
      });
      const data = await res.json() as { user?: AdminUserRow; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error ?? 'Failed to create user.');
        return;
      }
      setUsers((prev) => [...prev, data.user!]);
      setEmail(''); setName(''); setPassword(''); setRole('OPERATOR');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function patchUser(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json() as { user?: AdminUserRow; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error ?? 'Update failed.');
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user! : u)));
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function resetPassword(id: string) {
    const next = window.prompt('New password (min 8 characters):');
    if (next === null) return;
    if (next.length < 8) { setError('Password must be at least 8 characters.'); return; }
    await patchUser(id, { password: next });
    window.alert('Password updated.');
  }

  async function deleteUser(id: string, label: string) {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Delete failed.');
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ── Create user ────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Add admin
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="email" required placeholder="Email" autoComplete="off"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
          <input
            type="text" required placeholder="Name" autoComplete="off"
            value={name} onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
          <input
            type="password" required placeholder="Password (min 8)" autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'SUPER_ADMIN' | 'OPERATOR')}
            className={inputCls}
          >
            <option value="OPERATOR">Operator</option>
            <option value="SUPER_ADMIN">Super admin</option>
          </select>
          <button type="submit" disabled={creating} className={btnPrimary}>
            {creating ? 'Adding…' : 'Add admin'}
          </button>
        </div>
      </form>

      {/* ── Users table ────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last login</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy   = busyId === u.id;
              return (
                <tr key={u.id} className={u.active ? '' : 'bg-gray-50 opacity-70'}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {u.name}
                      {isSelf && <span className="ml-1.5 text-xs text-gray-400">(you)</span>}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={busy || isSelf}
                      onChange={(e) => patchUser(u.id, { role: e.target.value })}
                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
                      title={isSelf ? 'You cannot change your own role' : undefined}
                    >
                      <option value="OPERATOR">Operator</option>
                      <option value="SUPER_ADMIN">Super admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.active
                          ? 'inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'
                          : 'inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500'
                      }
                    >
                      {u.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(u.lastLoginAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => resetPassword(u.id)}
                        disabled={busy}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        Reset password
                      </button>
                      {!isSelf && (
                        <button
                          onClick={() => patchUser(u.id, { active: !u.active })}
                          disabled={busy}
                          className="text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                          {u.active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                      {!isSelf && (
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          disabled={busy}
                          className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
