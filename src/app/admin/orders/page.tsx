import Link from 'next/link';
import {
  getOrders,
  getOrderStats,
  resolvePeriod,
  type PaymentStatus,
  type FulfillmentStatus,
} from '@/lib/orders';
import OrderFilters from './OrderFilters';
import OrdersTable, { type OrderRow } from './OrdersTable';

// ── Formatting helpers (only what's still used in this Server Component) ──────

function formatRevenue(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
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
  const statsScope        = typeof sp.statsScope        === 'string' ? sp.statsScope        : '';

  const { createdAfter, createdBefore } = resolvePeriod(period, from, to);

  const isFiltered        = !!(search || paymentStatus || fulfillmentStatus || period);
  const isPaidUnfulfilled = paymentStatus === 'PAID' && fulfillmentStatus === 'UNFULFILLED';
  const showFilteredStats = isFiltered && statsScope === 'filtered';

  // Consolidate active filter params (shared by getOrders + conditional getOrderStats)
  const activeFilters = {
    search:            search            || undefined,
    paymentStatus:     (paymentStatus    || undefined) as PaymentStatus     | undefined,
    fulfillmentStatus: (fulfillmentStatus || undefined) as FulfillmentStatus | undefined,
    createdAfter,
    createdBefore,
  };

  const [{ orders, total }, globalStats, filteredStats] = await Promise.all([
    getOrders({ limit: 100, ...activeFilters }),
    // Global stats always fetched — used for the quick-filter badge
    getOrderStats(),
    // Filtered stats only fetched when the toggle is in "Filtered Range" mode
    showFilteredStats ? getOrderStats(activeFilters) : Promise.resolve(null),
  ]);

  const displayStats = filteredStats ?? globalStats;

  // ── Serialize orders for the client component (Dates → ISO strings) ─────────
  const tableRows: OrderRow[] = orders.map((o) => ({
    id:               o.id,
    orderNumber:      o.orderNumber,
    createdAt:        o.createdAt.toISOString(),
    customerName:     o.customerName,
    customerEmail:    o.customerEmail,
    total:            o.total,
    currency:         o.currency,
    paymentStatus:    o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    trackingNumber:   o.trackingNumber,
  }));

  // ── URL helpers (server-side, no client needed) ─────────────────────────────
  // Build the query string from current data-filters only (no UI-only params like statsScope)
  const activeQs = new URLSearchParams();
  if (search)            activeQs.set('search', search);
  if (paymentStatus)     activeQs.set('paymentStatus', paymentStatus);
  if (fulfillmentStatus) activeQs.set('fulfillmentStatus', fulfillmentStatus);
  if (period)            activeQs.set('period', period);
  if (period === 'custom' && from) activeQs.set('from', from);
  if (period === 'custom' && to)   activeQs.set('to', to);

  const activeQsStr   = activeQs.toString();
  // Export URL: same filters as the current view
  const exportUrl     = `/api/admin/orders/export${activeQsStr ? `?${activeQsStr}` : ''}`;
  // Stats toggle URLs: preserve data-filters, change only statsScope
  const allTimeHref   = `/admin/orders${activeQsStr ? `?${activeQsStr}` : ''}`;
  const filteredQs    = new URLSearchParams(activeQsStr);
  filteredQs.set('statsScope', 'filtered');
  const filteredHref  = `/admin/orders?${filteredQs}`;

  return (
    <div className="space-y-6">

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div>
        {/* Toggle row — only visible when filters are active */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Summary: {showFilteredStats ? 'Filtered Range' : 'All Time'}
          </span>
          {isFiltered && (
            <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs font-medium">
              <Link
                href={allTimeHref}
                className={`px-3 py-1.5 transition-colors ${
                  !showFilteredStats
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Time
              </Link>
              <Link
                href={filteredHref}
                className={`border-l border-gray-200 px-3 py-1.5 transition-colors ${
                  showFilteredStats
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Filtered Range
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Orders"   value={displayStats.totalOrders} />
          <StatCard label="Paid"           value={displayStats.paidOrders}           accent="green" />
          <StatCard
            label="Unfulfilled"
            value={displayStats.unfulfilledOrders}
            accent={displayStats.unfulfilledOrders > 0 ? 'amber' : undefined}
          />
          <StatCard label="Revenue (Paid)" value={formatRevenue(displayStats.totalRevenueCents)} />
        </div>
      </div>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isFiltered
              ? `${total} of ${globalStats.totalOrders} orders`
              : `${globalStats.totalOrders} orders total`}
          </p>
        </div>
        {/* Export CSV — carries the active filters so the download matches the view */}
        <Link
          href={exportUrl}
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
        initialStatsScope={statsScope}
        unfulfilledOrders={globalStats.unfulfilledOrders}
        isQuickFilterActive={isPaidUnfulfilled}
      />

      {/* ── Table (client component — manages selection + bulk actions) ──── */}
      <OrdersTable
        orders={tableRows}
        isFiltered={isFiltered}
        total={total}
      />
    </div>
  );
}
