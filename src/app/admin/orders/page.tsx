import Link from 'next/link';
import { getOrders } from '@/lib/orders';

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatCents(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: currency.toUpperCase(),
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

// ── Status badges ─────────────────────────────────────────────────────────────

type BadgeColor = 'green' | 'yellow' | 'blue' | 'red' | 'gray';

const PAYMENT_COLORS: Record<string, BadgeColor> = {
  PAID:                'green',
  PENDING:             'yellow',
  FAILED:              'red',
  REFUNDED:            'blue',
  PARTIALLY_REFUNDED:  'blue',
};

const FULFILLMENT_COLORS: Record<string, BadgeColor> = {
  UNFULFILLED:         'yellow',
  PARTIALLY_FULFILLED: 'blue',
  FULFILLED:           'green',
  RETURNED:            'red',
  CANCELLED:           'red',
};

const BADGE_CLASSES: Record<BadgeColor, string> = {
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue:   'bg-blue-100 text-blue-800',
  red:    'bg-red-100 text-red-800',
  gray:   'bg-gray-100 text-gray-600',
};

function Badge({ value, colorMap }: { value: string; colorMap: Record<string, BadgeColor> }) {
  const color = colorMap[value] ?? 'gray';
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${BADGE_CLASSES[color]}`}
    >
      {value.replace(/_/g, ' ')}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminOrdersPage() {
  const { orders, total } = await getOrders({ limit: 50 });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} {total === 1 ? 'order' : 'orders'} total · showing last 50
          </p>
        </div>
        <Link
          href="/api/admin/orders/export"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white
                     px-4 py-2 text-sm font-medium text-gray-700 shadow-sm
                     hover:bg-gray-50 transition-colors"
        >
          ↓ Export CSV
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                {[
                  'Order #',
                  'Date',
                  'Customer',
                  'Total',
                  'Payment',
                  'Fulfillment',
                  'Tracking',
                  '',
                ].map((h) => (
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
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center text-sm text-gray-400"
                  >
                    No orders yet. Complete a Stripe checkout to see real orders here.
                  </td>
                </tr>
              )}

              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
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

                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {formatCents(order.total, order.currency)}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge value={order.paymentStatus} colorMap={PAYMENT_COLORS} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge value={order.fulfillmentStatus} colorMap={FULFILLMENT_COLORS} />
                  </td>

                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {order.trackingNumber ?? <span className="text-gray-300">—</span>}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
