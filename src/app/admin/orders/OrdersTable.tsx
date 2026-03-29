'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Serializable row type (dates as ISO strings from the server) ──────────────

export type OrderRow = {
  id:               string;
  orderNumber:      string;
  createdAt:        string;
  customerName:     string | null;
  customerEmail:    string;
  total:            number;
  currency:         string;
  paymentStatus:    string;
  fulfillmentStatus: string;
  trackingNumber:   string | null;
};

// ── Display helpers (duplicated here; page.tsx no longer renders the table) ───

function formatCents(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: currency.toUpperCase(),
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

type BadgeColor = 'green' | 'yellow' | 'blue' | 'red' | 'gray';

const PAYMENT_COLORS: Record<string, BadgeColor> = {
  PAID: 'green', PENDING: 'yellow', FAILED: 'red',
  REFUNDED: 'blue', PARTIALLY_REFUNDED: 'blue',
};

const FULFILLMENT_COLORS: Record<string, BadgeColor> = {
  UNFULFILLED: 'yellow', PARTIALLY_FULFILLED: 'blue',
  FULFILLED: 'green', RETURNED: 'red', CANCELLED: 'red',
};

const BADGE_CLASSES: Record<BadgeColor, string> = {
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue:   'bg-blue-100  text-blue-800',
  red:    'bg-red-100   text-red-800',
  gray:   'bg-gray-100  text-gray-600',
};

function Badge({ value, colorMap }: { value: string; colorMap: Record<string, BadgeColor> }) {
  const color = colorMap[value] ?? 'gray';
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                  whitespace-nowrap ${BADGE_CLASSES[color]}`}
    >
      {value.replace(/_/g, ' ')}
    </span>
  );
}

// ── Shared input style ────────────────────────────────────────────────────────

const chkCls =
  'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer';

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrdersTable({
  orders,
  isFiltered,
  total,
}: {
  orders:     OrderRow[];
  isFiltered: boolean;
  total:      number;
}) {
  const router = useRouter();

  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [carrierInput, setCarrierInput] = useState('');
  const [loading,      setLoading]      = useState<'fulfilled' | 'carrier' | null>(null);
  const [notice,       setNotice]       = useState<{ ok: boolean; msg: string } | null>(null);

  const selectAllRef = useRef<HTMLInputElement>(null);

  // Drive the indeterminate state of the "select all" checkbox
  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate =
      selectedIds.size > 0 && selectedIds.size < orders.length;
  }, [selectedIds.size, orders.length]);

  const allSelected  = orders.length > 0 && selectedIds.size === orders.length;
  const hasSelection = selectedIds.size > 0;

  function toggleAll() {
    setSelectedIds(
      allSelected || selectedIds.size > 0
        ? new Set()
        : new Set(orders.map((o) => o.id))
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

  function flash(ok: boolean, msg: string) {
    setNotice({ ok, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  async function callBulk(action: string, extra: Record<string, unknown>) {
    const res = await fetch('/api/admin/orders/bulk', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ids: [...selectedIds], action, ...extra }),
    });
    return res.json() as Promise<{ ok: boolean; updated?: number; error?: string }>;
  }

  async function handleMarkFulfilled() {
    setLoading('fulfilled');
    try {
      const data = await callBulk('set_fulfillment', { fulfillmentStatus: 'FULFILLED' });
      if (data.ok) {
        flash(true, `${data.updated ?? 0} order(s) marked Fulfilled.`);
        setSelectedIds(new Set());
        router.refresh();
      } else {
        flash(false, data.error ?? 'Update failed.');
      }
    } catch {
      flash(false, 'Network error — please try again.');
    } finally {
      setLoading(null);
    }
  }

  function handleExportSelected() {
    const ids = [...selectedIds].join(',');
    window.location.href = `/api/admin/orders/export?ids=${encodeURIComponent(ids)}`;
  }

  async function handleSetCarrier() {
    const carrier = carrierInput.trim();
    if (!carrier) return;
    setLoading('carrier');
    try {
      const data = await callBulk('set_carrier', { carrier });
      if (data.ok) {
        flash(true, `Carrier "${carrier}" set for ${data.updated ?? 0} order(s).`);
        setSelectedIds(new Set());
        setCarrierInput('');
        router.refresh();
      } else {
        flash(false, data.error ?? 'Update failed.');
      }
    } catch {
      flash(false, 'Network error — please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">

      {/* ── Bulk action bar — only visible when rows are selected ─────────── */}
      {hasSelection && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3
                        flex flex-wrap items-center gap-3">

          <span className="text-sm font-semibold text-blue-800 shrink-0">
            {selectedIds.size} selected
          </span>

          <div className="h-4 w-px bg-blue-200 shrink-0" />

          {/* Mark Fulfilled */}
          <button
            onClick={handleMarkFulfilled}
            disabled={!!loading}
            className="inline-flex items-center gap-1 rounded-lg bg-green-700 px-3 py-1.5
                       text-xs font-semibold text-white hover:bg-green-800
                       disabled:opacity-50 transition-colors"
          >
            {loading === 'fulfilled' ? '…' : '✓ Mark Fulfilled'}
          </button>

          {/* Export selected */}
          <button
            onClick={handleExportSelected}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-300
                       bg-white px-3 py-1.5 text-xs font-semibold text-blue-700
                       hover:bg-blue-50 transition-colors"
          >
            ↓ Export CSV
          </button>

          {/* Set carrier */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              list="bulk-carriers"
              value={carrierInput}
              onChange={(e) => setCarrierInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSetCarrier()}
              placeholder="Carrier…"
              className="rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-xs
                         text-gray-700 placeholder:text-gray-400 w-28
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <datalist id="bulk-carriers">
              <option value="USPS" />
              <option value="UPS" />
              <option value="FedEx" />
              <option value="DHL" />
            </datalist>
            <button
              onClick={handleSetCarrier}
              disabled={!carrierInput.trim() || !!loading}
              className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs
                         font-semibold text-blue-700 hover:bg-blue-50
                         disabled:opacity-40 transition-colors"
            >
              {loading === 'carrier' ? '…' : 'Set Carrier'}
            </button>
          </div>

          {/* Right side: notice + clear */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            {notice && (
              <span
                className={`text-xs font-medium ${
                  notice.ok ? 'text-green-700' : 'text-red-600'
                }`}
              >
                {notice.ok ? '✓' : '✗'} {notice.msg}
              </span>
            )}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium
                         transition-colors"
            >
              Clear selection
            </button>
          </div>

        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                {/* Select-all checkbox */}
                <th className="w-10 px-3 py-3">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className={chkCls}
                    aria-label="Select all orders"
                  />
                </th>
                {['Order #', 'Date', 'Customer', 'Total', 'Payment', 'Fulfillment', 'Tracking', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase
                               tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center text-sm text-gray-400"
                  >
                    {isFiltered
                      ? 'No orders match the current filters.'
                      : 'No orders yet. Complete a Stripe checkout to see real orders here.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isSelected = selectedIds.has(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(order.id)}
                          className={chkCls}
                          aria-label={`Select order ${order.orderNumber}`}
                        />
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-gray-900 whitespace-nowrap">
                        {order.orderNumber}
                      </td>

                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {order.customerName ?? (
                            <span className="text-gray-400 font-normal">—</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{order.customerEmail}</div>
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap tabular-nums">
                        {formatCents(order.total, order.currency)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge value={order.paymentStatus} colorMap={PAYMENT_COLORS} />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge value={order.fulfillmentStatus} colorMap={FULFILLMENT_COLORS} />
                      </td>

                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs font-mono">
                        {order.trackingNumber ?? (
                          <span className="text-gray-300 font-sans">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {orders.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-400">
            Showing {orders.length} of {total}{' '}
            {isFiltered ? 'matching ' : ''}orders · ordered by most recent
          </div>
        )}
      </div>

    </div>
  );
}
