'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CommissionRow, CommissionStatus } from '@/lib/affiliates';

// ── Display helpers ───────────────────────────────────────────────────────────

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

const STATUS_COLORS: Record<CommissionStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  APPROVED:  'bg-blue-100   text-blue-800',
  PAID:      'bg-green-100  text-green-800',
  CANCELLED: 'bg-red-100    text-red-800',
};

// ── Styles ────────────────────────────────────────────────────────────────────

const inputCls =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 ' +
  'focus:ring-blue-500';

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1';

const chkCls =
  'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer';

// ── Component ─────────────────────────────────────────────────────────────────

export default function CommissionsTable({
  rows,
  initialSearch,
  initialStatus,
  initialFrom,
  initialTo,
}: {
  rows:          CommissionRow[];
  initialSearch: string;
  initialStatus: string;
  initialFrom:   string;
  initialTo:     string;
}) {
  const router = useRouter();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [from,   setFrom]   = useState(initialFrom);
  const [to,     setTo]     = useState(initialTo);

  const isFiltered = !!(initialSearch || initialStatus || initialFrom || initialTo);

  function buildUrl(): string {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (status) p.set('status', status);
    if (from)   p.set('from', from);
    if (to)     p.set('to', to);
    const qs = p.toString();
    return '/admin/commissions' + (qs ? `?${qs}` : '');
  }

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl());
  }

  // ── Selection state ─────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate =
      selectedIds.size > 0 && selectedIds.size < rows.length;
  }, [selectedIds.size, rows.length]);

  const allSelected  = rows.length > 0 && selectedIds.size === rows.length;
  const hasSelection = selectedIds.size > 0;

  function toggleAll() {
    setSelectedIds(
      allSelected || selectedIds.size > 0
        ? new Set()
        : new Set(rows.map((r) => r.id))
    );
  }
  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Bulk action runner ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState<CommissionStatus | null>(null);
  const [notice,  setNotice]  = useState<{ ok: boolean; msg: string } | null>(null);

  function flash(ok: boolean, msg: string) {
    setNotice({ ok, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  async function bulkTransition(target: CommissionStatus) {
    if (selectedIds.size === 0) return;
    setLoading(target);
    const ids = [...selectedIds];
    let ok = 0;
    let firstError = '';
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/admin/commissions/${id}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status: target }),
        }).then(async (res) => {
          const data = (await res.json()) as { ok?: boolean; error?: string };
          if (res.ok && data.ok) ok++;
          else if (!firstError) firstError = data.error ?? `HTTP ${res.status}`;
        })
      )
    );
    results.forEach((r) => {
      if (r.status === 'rejected' && !firstError) firstError = 'Network error';
    });

    setLoading(null);
    if (ok > 0) {
      flash(true, `${ok}/${ids.length} commission(s) → ${target}` + (firstError ? `. First error: ${firstError}` : ''));
      setSelectedIds(new Set());
      router.refresh();
    } else {
      flash(false, firstError || 'Update failed.');
    }
  }

  // ── Selection-aware action availability ─────────────────────────────────────
  const selectedRows = rows.filter((r) => selectedIds.has(r.id));
  const canApprove = selectedRows.length > 0 && selectedRows.every((r) => r.status === 'PENDING');
  const canPay     = selectedRows.length > 0 && selectedRows.every((r) => r.status === 'APPROVED');
  const canCancel  = selectedRows.length > 0 && selectedRows.every((r) => r.status === 'PENDING' || r.status === 'APPROVED');

  function handleExportSelected() {
    // Selection-aware export not in scope; export uses current filters.
    const p = new URLSearchParams();
    if (initialSearch) p.set('search', initialSearch);
    if (initialStatus) p.set('status', initialStatus);
    if (initialFrom)   p.set('from', initialFrom);
    if (initialTo)     p.set('to', initialTo);
    const qs = p.toString();
    window.location.href = '/api/admin/commissions/export' + (qs ? `?${qs}` : '');
  }

  return (
    <div className="space-y-3">

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleApply} className="flex flex-wrap items-end gap-3">
          <div>
            <label className={labelCls}>Affiliate</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or ref…"
              className={`${inputCls} w-56`}
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputCls}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white
                       hover:bg-gray-700 transition-colors"
          >
            Apply
          </button>
          {isFiltered && (
            <button
              type="button"
              onClick={() => router.push('/admin/commissions')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* ── Bulk action bar ───────────────────────────────────────────────── */}
      {hasSelection && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3
                        flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-blue-800 shrink-0">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-blue-200 shrink-0" />

          <button
            onClick={() => bulkTransition('APPROVED')}
            disabled={!canApprove || !!loading}
            title={canApprove ? 'Approve selected (PENDING → APPROVED)' : 'Select only PENDING commissions'}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-3 py-1.5
                       text-xs font-semibold text-white hover:bg-blue-800
                       disabled:opacity-40 transition-colors"
          >
            {loading === 'APPROVED' ? '…' : '✓ Approve'}
          </button>
          <button
            onClick={() => bulkTransition('PAID')}
            disabled={!canPay || !!loading}
            title={canPay ? 'Mark Paid (APPROVED → PAID)' : 'Select only APPROVED commissions'}
            className="inline-flex items-center gap-1 rounded-lg bg-green-700 px-3 py-1.5
                       text-xs font-semibold text-white hover:bg-green-800
                       disabled:opacity-40 transition-colors"
          >
            {loading === 'PAID' ? '…' : '$ Mark Paid'}
          </button>
          <button
            onClick={() => bulkTransition('CANCELLED')}
            disabled={!canCancel || !!loading}
            title={canCancel ? 'Cancel selected (PENDING/APPROVED → CANCELLED)' : 'Cannot cancel PAID or already CANCELLED'}
            className="inline-flex items-center gap-1 rounded-lg border border-red-300
                       bg-white px-3 py-1.5 text-xs font-semibold text-red-700
                       hover:bg-red-50 disabled:opacity-40 transition-colors"
          >
            {loading === 'CANCELLED' ? '…' : '✕ Cancel'}
          </button>
          <button
            onClick={handleExportSelected}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-300
                       bg-white px-3 py-1.5 text-xs font-semibold text-blue-700
                       hover:bg-blue-50 transition-colors"
          >
            ↓ Export CSV
          </button>

          <div className="ml-auto flex items-center gap-3 shrink-0">
            {notice && (
              <span
                className={`text-xs font-medium ${notice.ok ? 'text-green-700' : 'text-red-600'}`}
              >
                {notice.ok ? '✓' : '✗'} {notice.msg}
              </span>
            )}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Standalone notice (when no selection) */}
      {!hasSelection && notice && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs font-medium ${
            notice.ok
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {notice.ok ? '✓' : '✗'} {notice.msg}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-10 px-3 py-3">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className={chkCls}
                    aria-label="Select all commissions"
                  />
                </th>
                {[
                  'Date', 'Affiliate', 'Order', 'Customer',
                  'Base', 'Rate', 'Amount', 'Status', 'Paid At',
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
                  <td colSpan={10} className="px-4 py-16 text-center text-sm text-gray-400">
                    {isFiltered
                      ? 'No commissions match the current filters.'
                      : 'No commissions yet. They are created automatically when an order with a ref is paid.'}
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const isSelected = selectedIds.has(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(c.id)}
                          className={chkCls}
                          aria-label={`Select commission ${c.id}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{c.affiliateName}</div>
                        <div className="font-mono text-xs text-gray-500">{c.affiliateRef}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-900 whitespace-nowrap">
                        {c.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {c.customerEmail}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700 whitespace-nowrap">
                        {formatCents(c.baseAmount)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-600 whitespace-nowrap">
                        {formatPct(c.rate)}
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium text-gray-900 whitespace-nowrap">
                        {formatCents(c.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {c.paidAt ? formatDate(c.paidAt) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {rows.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-400">
            Showing {rows.length} commission{rows.length === 1 ? '' : 's'} · ordered by most recent
          </div>
        )}
      </div>
    </div>
  );
}
