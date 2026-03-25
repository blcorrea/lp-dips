import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/orders';
import EditForm, { type EditFormValues } from './EditForm';

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatCents(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDateTime(date: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year:     'numeric',
    month:    'short',
    day:      'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: 'UTC',
  }).format(new Date(date));
}

/** Converts a Date to the value expected by <input type="datetime-local"> (UTC) */
function toDatetimeLocal(date: Date | null): string {
  if (!date) return '';
  const d   = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
  );
}

// ── UI primitives ─────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
      <dt className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 break-all">
        {value ?? <span className="text-gray-300">—</span>}
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      <dl className="space-y-0">{children}</dl>
    </section>
  );
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
  blue:   'bg-blue-100 text-blue-800',
  red:    'bg-red-100 text-red-800',
  gray:   'bg-gray-100 text-gray-600',
};

function StatusBadge({ value, colorMap }: { value: string; colorMap: Record<string, BadgeColor> }) {
  const cls = BADGE_CLASSES[colorMap[value] ?? 'gray'];
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {value.replace(/_/g, ' ')}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order  = await getOrderById(id);

  if (!order) notFound();

  const initialEditValues: EditFormValues = {
    fulfillmentStatus: order.fulfillmentStatus,
    carrier:           order.carrier       ?? '',
    trackingNumber:    order.trackingNumber ?? '',
    trackingUrl:       order.trackingUrl   ?? '',
    shippedAt:         toDatetimeLocal(order.shippedAt),
    internalNotes:     order.internalNotes ?? '',
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/orders" className="hover:text-gray-700 transition-colors">
          Orders
        </Link>
        <span>›</span>
        <span className="font-mono font-medium text-gray-900">{order.orderNumber}</span>
      </div>

      {/* ── Block 1: Order summary ──────────────────────────────────────── */}
      <Section title="Order Summary">
        <Row label="Order #"     value={<span className="font-mono">{order.orderNumber}</span>} />
        <Row label="Created"     value={formatDateTime(order.createdAt)} />
        <Row label="Total"       value={formatCents(order.total, order.currency)} />
        <Row label="Subtotal"    value={formatCents(order.subtotal, order.currency)} />
        <Row label="Shipping"    value={formatCents(order.shippingCost, order.currency)} />
        <Row label="Tax"         value={formatCents(order.tax, order.currency)} />
        <Row label="Discount"    value={order.discount ? formatCents(order.discount, order.currency) : null} />
        <Row
          label="Payment"
          value={<StatusBadge value={order.paymentStatus} colorMap={PAYMENT_COLORS} />}
        />
        <Row
          label="Status"
          value={
            <span className="text-sm text-gray-700">{order.status.replace(/_/g, ' ')}</span>
          }
        />
        <Row
          label="Fulfillment"
          value={<StatusBadge value={order.fulfillmentStatus} colorMap={FULFILLMENT_COLORS} />}
        />
        <Row label="Stripe Session" value={<span className="font-mono text-xs">{order.stripeSessionId}</span>} />
        {order.stripePaymentIntentId && (
          <Row label="Payment Intent" value={<span className="font-mono text-xs">{order.stripePaymentIntentId}</span>} />
        )}
      </Section>

      {/* ── Block 2: Customer ───────────────────────────────────────────── */}
      <Section title="Customer">
        <Row label="Name"  value={order.customerName} />
        <Row label="Email" value={order.customerEmail} />
      </Section>

      {/* ── Block 3: Shipping address ───────────────────────────────────── */}
      <Section title="Shipping Address">
        <Row label="Name"       value={order.shippingName} />
        <Row label="Line 1"     value={order.shippingAddressLine1} />
        <Row label="Line 2"     value={order.shippingAddressLine2} />
        <Row label="City"       value={order.shippingCity} />
        <Row label="State"      value={order.shippingState} />
        <Row label="Postal"     value={order.shippingPostalCode} />
        <Row label="Country"    value={order.shippingCountry} />
      </Section>

      {/* ── Block 4: Items ──────────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Variant', 'SKU', 'Qty', 'Unit Price', 'Subtotal'].map((h) => (
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
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                  <td className="px-4 py-3 text-gray-600">{item.variantName ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.sku ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatCents(item.unitPrice, order.currency)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatCents(item.subtotal, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Blocks 5 + 6: Editable via client component ─────────────────── */}
      <EditForm orderId={order.id} initialValues={initialEditValues} />
    </div>
  );
}
