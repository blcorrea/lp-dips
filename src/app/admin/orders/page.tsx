import Link from 'next/link';
import { getOrders, getOrderStats, type PaymentStatus, type FulfillmentStatus } from '@/lib/orders';

// ── Formatting helpers ─────────────────────────────────────────────────────

function formatCents(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatRevenue(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year:     'numeric',
    month:    'short',
    day:      'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

// ── Status badges ──────────────────────────────────────────────────────────

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
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${BADGE_CLASSES[color]}`}>
      {value.replace(/_/g, ' ')}
    </span>
  );
}

// ── Summary card ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label:   string;
  value:   string | number;
  accent?: 'green' | 'amber';
}) {
  const valCls =
    accent === 'green' ? 'text-green-700' :
    accent === 'amber' ? 'text-amber-600' :
    'text-gray-900';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${valCls}`}>{value}</p>
    </div>
  );
}

// ── Shared field styles ────────────────────────────────────────────────────

const inputCls =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 ' +
  'focus:ring-blue-500';

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const search            = typeof sp.search            === 'string' ? sp.search.trim()    : '';
  const paymentStatus     = typeof sp.paymentStatus     === 'string' ? sp.paymentStatus    : '';
  const fulfillmentStatus = typeof sp.fulfillmentStatus === 'string' ? sp.fulfillmentStatus : '';

  const [{ orders, total }, stats] = await Promise.all([
    getOrders({
      limit:             100,
      search:            search            || undefined,
      paymentStatus:     (paymentStatus    || undefined) as PaymentStatus     | undefined,
      fulfillmentStatus: (fulfillmentStatus || undefined) as FulfillmentStatus | undefined,
    }),
    getOrderStats(),
  ]);

  const isFiltered       = !!(search || paymentStatus || fulfillmentStatus);
  const isPaidUnfulfilled = paymentStatus === 'PAID' && fulfillmentStatus === 'UNFULFILLED';

  return (
    <div className="space-y-6">

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Orders"  value={stats.totalOrders} />
        <StatCard label="Paid"          value={stats.paidOrders}         accent="green" />
        <StatCard
          label="Unfulfilled"
          value={stats.unfulfilledOrders}
          accent={stats.unfulfilledOrders > 0 ? 'amber' : undefined}
        />
        <StatCard label="Revenue (Paid)" value={formatRevenue(stats.totalRevenueCents)} />
      </div>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isFiltered
              ? `${total} of ${stats.totalOrders} orders`
              : `${stats.totalOrders} orders total`}
          </p>
        </div>
        <Link
          href="/api/admin/orders/export"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white
                     px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50
                     transition-colors"
        >
          ↓ Export CSV
        </Link>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <form method="get" action="/admin/orders" className="flex flex-wrap items-end gap-3">

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Search
            </label>
            <input
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Order #, name or email…"
              className={`${inputCls} w-64`}
            />
          </div>

          {/* Payment status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Payment
            </label>
            <select name="paymentStatus" defaultValue={paymentStatus} className={inputCls}>
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Fulfillment
            </label>
            <select name="fulfillmentStatus" defaultValue={fulfillmentStatus} className={inputCls}>
              <option value="">All Fulfillment</option>
              <option value="UNFULFILLED">Unfulfilled</option>
              <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="RETURNED">Returned</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white
                       hover:bg-gray-700 transition-colors"
          >
            Apply
          </button>

          {isFiltered && (
            <Link
              href="/admin/orders"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear
            </Link>
          )}

          {/* Quick filter */}
          <div className="ml-auto">
            <Link
              href="/admin/orders?paymentStatus=PAID&fulfillmentStatus=UNFULFILLED"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm
                          font-medium transition-colors border ${
                isPaidUnfulfilled
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              ⚡ Paid &amp; Unfulfilled
              {stats.unfulfilledOrders > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500
                                  text-white text-xs font-bold w-5 h-5 ml-0.5">
                  {stats.unfulfilledOrders}
                </span>
              )}
            </Link>
          </div>
        </form>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                {['Order #', 'Date', 'Customer', 'Total', 'Payment', 'Fulfillment', 'Tracking', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                    {isFiltered
                      ? 'No orders match the current filters.'
                      : 'No orders yet. Complete a Stripe checkout to see real orders here.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">

                    <td className="px-4 py-3 font-mono font-medium text-gray-900 whitespace-nowrap">
                      {order.orderNumber}
                    </td>

                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {order.customerName ?? <span className="text-gray-400 font-normal">—</span>}
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
                      {order.trackingNumber ?? <span className="text-gray-300 font-sans">—</span>}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {orders.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-400">
            Showing {orders.length} of {total} {isFiltered ? 'matching ' : ''}orders · ordered by most recent
          </div>
        )}
      </div>
    </div>
  );
}
