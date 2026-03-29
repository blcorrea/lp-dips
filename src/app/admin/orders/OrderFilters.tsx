'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ── Constants ─────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { value: '',           label: 'All Time' },
  { value: 'today',      label: 'Today' },
  { value: 'yesterday',  label: 'Yesterday' },
  { value: 'this_week',  label: 'This Week' },
  { value: 'last_week',  label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom',     label: 'Custom…' },
] as const;

// ── Styles ────────────────────────────────────────────────────────────────────

const inputCls =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 ' +
  'focus:ring-blue-500';

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1';

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  initialSearch:            string;
  initialPaymentStatus:     string;
  initialFulfillmentStatus: string;
  initialPeriod:            string;
  initialFrom:              string;
  initialTo:                string;
  initialStatsScope:        string;
  unfulfilledOrders:        number;
  isQuickFilterActive:      boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrderFilters({
  initialSearch,
  initialPaymentStatus,
  initialFulfillmentStatus,
  initialPeriod,
  initialFrom,
  initialTo,
  initialStatsScope,
  unfulfilledOrders,
  isQuickFilterActive,
}: Props) {
  const router = useRouter();

  const [search,            setSearch]            = useState(initialSearch);
  const [paymentStatus,     setPaymentStatus]     = useState(initialPaymentStatus);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(initialFulfillmentStatus);
  const [period,            setPeriod]            = useState(initialPeriod);
  const [from,              setFrom]              = useState(initialFrom);
  const [to,                setTo]                = useState(initialTo);

  const isFiltered = !!(search || paymentStatus || fulfillmentStatus || period);

  function buildUrl(overrides: Record<string, string> = {}): string {
    const params = new URLSearchParams();
    const s  = overrides.search            ?? search;
    const ps = overrides.paymentStatus     ?? paymentStatus;
    const fs = overrides.fulfillmentStatus ?? fulfillmentStatus;
    const p  = overrides.period            ?? period;
    const f  = overrides.from              ?? from;
    const t  = overrides.to               ?? to;
    // Preserve statsScope so the summary toggle isn't reset when applying filters
    const sc = overrides.statsScope        ?? initialStatsScope;

    if (s)  params.set('search', s);
    if (ps) params.set('paymentStatus', ps);
    if (fs) params.set('fulfillmentStatus', fs);
    if (p)  params.set('period', p);
    if (p === 'custom' && f) params.set('from', f);
    if (p === 'custom' && t) params.set('to', t);
    if (sc) params.set('statsScope', sc);

    const qs = params.toString();
    return '/admin/orders' + (qs ? `?${qs}` : '');
  }

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl());
  }

  function handlePeriodChange(newPeriod: string) {
    setPeriod(newPeriod);
    // Clear custom dates when switching away from custom
    if (newPeriod !== 'custom') {
      setFrom('');
      setTo('');
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <form onSubmit={handleApply} className="flex flex-wrap items-end gap-3">

        {/* Search */}
        <div>
          <label className={labelCls}>Search</label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order #, name or email…"
            className={`${inputCls} w-64`}
          />
        </div>

        {/* Payment status */}
        <div>
          <label className={labelCls}>Payment</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className={inputCls}
          >
            <option value="">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
          </select>
        </div>

        {/* Fulfillment status */}
        <div>
          <label className={labelCls}>Fulfillment</label>
          <select
            value={fulfillmentStatus}
            onChange={(e) => setFulfillmentStatus(e.target.value)}
            className={inputCls}
          >
            <option value="">All Fulfillment</option>
            <option value="UNFULFILLED">Unfulfilled</option>
            <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="RETURNED">Returned</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Period */}
        <div>
          <label className={labelCls}>Period</label>
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className={inputCls}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Custom date range — visible only when period = custom */}
        {period === 'custom' && (
          <>
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
          </>
        )}

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
            onClick={() => router.push('/admin/orders')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium
                       text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}

        {/* Quick filter — always visible */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => router.push('/admin/orders?paymentStatus=PAID&fulfillmentStatus=UNFULFILLED')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm
                        font-medium transition-colors border ${
              isQuickFilterActive
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            ⚡ Paid &amp; Unfulfilled
            {unfulfilledOrders > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-amber-500
                                text-white text-xs font-bold w-5 h-5 ml-0.5">
                {unfulfilledOrders}
              </span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
