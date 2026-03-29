import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  getOrders,
  getOrdersByIds,
  resolvePeriod,
  type Order,
  type OrderItem,
  type PaymentStatus,
  type FulfillmentStatus,
} from '@/lib/orders';

// ── CSV helpers ───────────────────────────────────────────────────────────────

/**
 * Wraps a value in double quotes and escapes embedded double quotes by doubling
 * them (RFC 4180). Handles commas, quotes and newlines safely.
 */
function csvField(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

/** Converts a cents integer to a decimal string (e.g. 1999 → "19.99"). */
function cents(n: number): string {
  return (n / 100).toFixed(2);
}

// ── Column headers ────────────────────────────────────────────────────────────

const HEADERS = [
  'orderNumber',
  'createdAt',
  'customerName',
  'customerEmail',
  'shippingName',
  'shippingAddressLine1',
  'shippingAddressLine2',
  'shippingCity',
  'shippingState',
  'shippingPostalCode',
  'shippingCountry',
  'productName',
  'variantName',
  'sku',
  'quantity',
  'unitPrice',
  'subtotal',
  'total',
  'currency',
  'paymentStatus',
  'status',
  'fulfillmentStatus',
  'carrier',
  'trackingNumber',
  'trackingUrl',
  'shippedAt',
  'notes',
  'internalNotes',
];

// ── Row builder — one row per order item ──────────────────────────────────────

function buildRow(order: Order, item?: OrderItem): string {
  return [
    csvField(order.orderNumber),
    csvField(order.createdAt.toISOString()),
    csvField(order.customerName),
    csvField(order.customerEmail),
    csvField(order.shippingName),
    csvField(order.shippingAddressLine1),
    csvField(order.shippingAddressLine2),
    csvField(order.shippingCity),
    csvField(order.shippingState),
    csvField(order.shippingPostalCode),
    csvField(order.shippingCountry),
    // item-level columns (empty when order has no items)
    csvField(item?.productName),
    csvField(item?.variantName),
    csvField(item?.sku),
    item !== undefined ? csvField(item.quantity) : csvField(null),
    item !== undefined ? csvField(cents(item.unitPrice)) : csvField(null),
    item !== undefined ? csvField(cents(item.subtotal))  : csvField(null),
    // order-level financials (repeated per row)
    csvField(cents(order.total)),
    csvField(order.currency),
    csvField(order.paymentStatus),
    csvField(order.status),
    csvField(order.fulfillmentStatus),
    csvField(order.carrier),
    csvField(order.trackingNumber),
    csvField(order.trackingUrl),
    csvField(order.shippedAt ? order.shippedAt.toISOString() : null),
    csvField(order.notes),
    csvField(order.internalNotes),
  ].join(',');
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const sp = request.nextUrl.searchParams;

  // When ?ids= is provided (export selected rows), fetch only those orders
  const idsParam = sp.get('ids') ?? '';
  let orders: Order[];

  if (idsParam) {
    const ids = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 500); // safety cap
    orders = await getOrdersByIds(ids);
  } else {
    // Mirror the same filter params used by /admin/orders so the export matches the view
    const search            = sp.get('search')            ?? '';
    const paymentStatus     = sp.get('paymentStatus')     ?? '';
    const fulfillmentStatus = sp.get('fulfillmentStatus') ?? '';
    const period            = sp.get('period')            ?? '';
    const from              = sp.get('from')              ?? '';
    const to                = sp.get('to')                ?? '';

    const { createdAfter, createdBefore } = resolvePeriod(period, from, to);

    ({ orders } = await getOrders({
      limit:             10_000,
      search:            search            || undefined,
      paymentStatus:     (paymentStatus    || undefined) as PaymentStatus     | undefined,
      fulfillmentStatus: (fulfillmentStatus || undefined) as FulfillmentStatus | undefined,
      createdAfter,
      createdBefore,
    }));
  }

  const rows: string[] = [HEADERS.map(csvField).join(',')];

  for (const order of orders) {
    if (order.items.length === 0) {
      rows.push(buildRow(order));
    } else {
      for (const item of order.items) {
        rows.push(buildRow(order, item));
      }
    }
  }

  // RFC 4180 mandates CRLF line endings
  const csv      = rows.join('\r\n');
  const today    = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const filename = `orders-export-${today}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store',
    },
  });
}
