import Link from 'next/link';
import { getOrders, getOrderStats, type PaymentStatus, type FulfillmentStatus } from '@/lib/orders';
import OrderFilters from './OrderFilters';

// ── Date-range helper ─────────────────────────────────────────────────────────

type DateRange = { createdAfter?: Date; createdBefore?: Date };

/**
 * Maps a period preset (or 'custom') to a UTC date range for the createdAt filter.
 *
 * All presets use UTC so results are consistent regardless of server timezone:
 *   today       → [00:00 UTC today, 00:00 UTC tomorrow)
 *   yesterday   → [00:00 UTC yesterday, 00:00 UTC today)
 *   this_week   → [00:00 UTC Monday of the current ISO week, 00:00 UTC tomorrow)
 *   last_week   → [00:00 UTC Monday of last week, 00:00 UTC this Monday)
 *   this_month  → [00:00 UTC 1st of this month, 00:00 UTC tomorrow)
 *   last_month  → [00:00 UTC 1st of last month, 00:00 UTC 1st of this month)
 *   custom      → [from 00:00 UTC, (to + 1 day) 00:00 UTC) — both inclusive as full days
 */
function resolvePeriod(period: string, fromStr: string, toStr: string): DateRange {
  if (!period) return {};

  const now = new Date();
  const y   = now.getUTCFullYear();
  const m   = now.getUTCMonth();
  const d   = now.getUTCDate();
  const dow = now.getUTCDay(); // 0 = Sunday, 1 = Monday, …

  switch (period) {
    case 'today':
      return {
        createdAfter:  new Date(Date.UTC(y, m, d)),
        createdBefore: new Date(Date.UTC(y, m, d + 1)),
      };

    case 'yesterday':
      return {
        createdAfter:  new Date(Date.UTC(y, m, d - 1)),
        createdBefore: new Date(Date.UTC(y, m, d)),
      };

    case 'this_week': {
      // ISO week starts on Monday; transform Sunday (0) → 6, Mon (1) → 0, …
      const daysFromMon = (dow + 6) % 7;
      return {
        createdAfter:  new Date(Date.UTC(y, m, d - daysFromMon)),
        createdBefore: new Date(Date.UTC(y, m, d + 1)),
      };
    }

    case 'last_week': {
      const daysFromMon  = (dow + 6) % 7;
      const thisMonStart = Date.UTC(y, m, d - daysFromMon);
      const lastMonStart = thisMonStart - 7 * 86_400_000;
      return {
        createdAfter:  new Date(lastMonStart),
        createdBefore: new Date(thisMonStart),
      };
    }

    case 'this_month':
      return {
        createdAfter:  new Date(Date.UTC(y, m, 1)),
        createdBefore: new Date(Date.UTC(y, m, d + 1)),
      };

    case 'last_month':
      return {
        // Date.UTC handles m-1 = -1 correctly (rolls back to December of previous year)
        createdAfter:  new Date(Date.UTC(y, m - 1, 1)),
        createdBefore: new Date(Date.UTC(y, m, 1)),
      };

    case 'custom': {
      const result: DateRange = {};
      if (fromStr) result.createdAfter  = new Date(`${fromStr}T00:00:00.000Z`);
      if (toStr) {
        // Advance end by 1 day so the full to-date is included
        const endDay = new Date(`${toStr}T00:00:00.000Z`);
        result.createdBefore = new Date(endDay.getTime() + 86_400_000);
      }
      return result;
    }

    default:
      return {};
  }
}

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
  const period            = typeof sp.period            === 'string' ? sp.period            : '';
  const from              = typeof sp.from              === 'string' ? sp.from              : '';
  const to                = typeof sp.to                === 'string' ? sp.to                : '';

  const { createdAfter, createdBefore } = resolvePeriod(period, from, to);

  const [{ orders, total }, stats] = await Promise.all([
    getOrders({
      limit:             100,
      search:            search            || undefined,
      paymentStatus:     (paymentStatus    || undefined) as PaymentStatus     | undefined,
      fulfillmentStatus: (fulfillmentStatus || undefined) as FulfillmentStatus | undefined,
      createdAfter,
      createdBefore,
    }),
    getOrderStats(),
  ]);

  const isFiltered        = !!(search || paymentStatus || fulfillmentStatus || period);
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
      {/*
        key forces a re-mount when URL params change so useState re-initialises
        from the new initial* props (avoids stale controlled-input state).
      */}
      <OrderFilters
        key={`${search}|${paymentStatus}|${fulfillmentStatus}|${period}|${from}|${to}`}
        initialSearch={search}
        initialPaymentStatus={paymentStatus}
        initialFulfillmentStatus={fulfillmentStatus}
        initialPeriod={period}
        initialFrom={from}
        initialTo={to}
        unfulfilledOrders={stats.unfulfilledOrders}
        isQuickFilterActive={isPaidUnfulfilled}
      />

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
