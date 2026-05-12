'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AffiliateRow } from '@/lib/affiliates';

export type AffiliateTableRow = AffiliateRow & { link: string };

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatCents(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(isoStr: string) {
  return new Intl.DateTimeFormat('en-US', {
    year:     'numeric',
    month:    'short',
    day:      'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoStr));
}

function formatPct(n: number) {
  return `${(n * 100).toFixed(1).replace(/\.0$/, '')}%`;
}

// ── Shared input styles ───────────────────────────────────────────────────────

const inputCls =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 ' +
  'focus:ring-blue-500';

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1';

const AFFILIATE_TYPES = ['INFLUENCER', 'MEDIA_BUYER', 'PARTNER', 'ORGANIC', 'OTHER'] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function AffiliatesTable({ rows }: { rows: AffiliateTableRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // New affiliate form state
  const [form, setForm] = useState({
    name:           '',
    ref:            '',
    email:          '',
    instagram:      '',
    type:           'INFLUENCER' as (typeof AFFILIATE_TYPES)[number],
    commissionRate: '0.15',
  });
  const [creating, setCreating] = useState(false);

  function flash(ok: boolean, msg: string) {
    setNotice({ ok, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  async function copyLink(row: AffiliateTableRow) {
    try {
      await navigator.clipboard.writeText(row.link);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId((cur) => (cur === row.id ? null : cur)), 1500);
    } catch {
      flash(false, 'Clipboard copy failed.');
    }
  }

  async function patchAffiliate(id: string, body: Record<string, unknown>, successMsg: string) {
    setBusyId(id);
    try {
      const res  = await fetch(`/api/admin/affiliates/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        flash(true, successMsg);
        router.refresh();
      } else {
        flash(false, data.error ?? 'Update failed.');
      }
    } catch {
      flash(false, 'Network error — please try again.');
    } finally {
      setBusyId(null);
    }
  }

  function toggleActive(row: AffiliateTableRow) {
    patchAffiliate(row.id, { active: !row.active }, `${row.name} ${row.active ? 'deactivated' : 'activated'}.`);
  }

  function editRate(row: AffiliateTableRow) {
    const current = (row.commissionRate * 100).toString();
    const input   = window.prompt(`New commission rate for ${row.name} (%):`, current);
    if (input === null) return;
    const pct = Number(input.trim());
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      flash(false, 'Rate must be a number between 0 and 100.');
      return;
    }
    patchAffiliate(row.id, { commissionRate: pct / 100 }, `Rate updated to ${pct}%.`);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        name:           form.name.trim(),
        ref:            form.ref.trim().toLowerCase(),
        type:           form.type,
        commissionRate: Number(form.commissionRate),
      };
      if (form.email.trim())     body.email     = form.email.trim();
      if (form.instagram.trim()) body.instagram = form.instagram.trim();

      const res  = await fetch('/api/admin/affiliates', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        flash(true, `Affiliate "${form.name}" created.`);
        setShowCreate(false);
        setForm({ name: '', ref: '', email: '', instagram: '', type: 'INFLUENCER', commissionRate: '0.15' });
        router.refresh();
      } else {
        flash(false, data.error ?? 'Create failed.');
      }
    } catch {
      flash(false, 'Network error — please try again.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-3">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        {notice && (
          <span
            className={`text-xs font-medium ${notice.ok ? 'text-green-700' : 'text-red-600'}`}
          >
            {notice.ok ? '✓' : '✗'} {notice.msg}
          </span>
        )}
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="ml-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-gray-700 transition-colors"
        >
          {showCreate ? 'Close' : '+ New Affiliate'}
        </button>
      </div>

      {/* ── Create form (inline) ─────────────────────────────────────────── */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm
                     flex flex-wrap items-end gap-3"
        >
          <div>
            <label className={labelCls}>Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`${inputCls} w-48`}
            />
          </div>
          <div>
            <label className={labelCls}>Ref *</label>
            <input
              required
              value={form.ref}
              onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value.toLowerCase() }))}
              pattern="[a-z0-9_-]+"
              placeholder="ana"
              className={`${inputCls} w-32`}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={`${inputCls} w-56`}
            />
          </div>
          <div>
            <label className={labelCls}>Instagram</label>
            <input
              value={form.instagram}
              onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
              placeholder="@handle"
              className={`${inputCls} w-40`}
            />
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as (typeof AFFILIATE_TYPES)[number] }))}
              className={inputCls}
            >
              {AFFILIATE_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Rate (0–1)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={form.commissionRate}
              onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))}
              className={`${inputCls} w-24`}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white
                       hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                {[
                  'Name', 'Ref', 'Type', 'Rate', 'Active',
                  'Orders', 'Revenue', 'Pending', 'Approved', 'Paid',
                  'Created', '',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase
                               tracking-wider text-gray-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center text-sm text-gray-400">
                    No affiliates yet. Click <span className="font-semibold">+ New Affiliate</span> to create one.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{row.name}</div>
                      <div className="text-xs text-gray-500">
                        {row.instagram ?? row.email ?? <span className="text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">
                      {row.ref}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {row.type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-900 whitespace-nowrap">
                      {formatPct(row.commissionRate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {row.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-700">
                      {row.ordersCount}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-900 whitespace-nowrap">
                      {formatCents(row.attributedRevenueCents)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-amber-700 whitespace-nowrap">
                      {formatCents(row.pendingAmount)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-blue-700 whitespace-nowrap">
                      {formatCents(row.approvedAmount)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-green-700 whitespace-nowrap">
                      {formatCents(row.paidAmount)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyLink(row)}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs
                                     font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          title={row.link}
                        >
                          {copiedId === row.id ? '✓ Copied' : 'Copy link'}
                        </button>
                        <button
                          type="button"
                          onClick={() => editRate(row)}
                          disabled={busyId === row.id}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs
                                     font-medium text-gray-700 hover:bg-gray-50
                                     disabled:opacity-50 transition-colors"
                        >
                          Edit rate
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(row)}
                          disabled={busyId === row.id}
                          className={`rounded px-2 py-1 text-xs font-medium border transition-colors disabled:opacity-50 ${
                            row.active
                              ? 'border-red-200 bg-white text-red-700 hover:bg-red-50'
                              : 'border-green-300 bg-white text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {row.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
