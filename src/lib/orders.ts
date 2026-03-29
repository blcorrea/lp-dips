import { Prisma, OrderStatus, PaymentStatus, FulfillmentStatus } from '../generated/prisma/client/client';
import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports — consumers can import enums from here without touching @prisma/client
// ─────────────────────────────────────────────────────────────────────────────

export type { OrderStatus, PaymentStatus, FulfillmentStatus };

// ─────────────────────────────────────────────────────────────────────────────
// Derived types from generated Prisma client
// ─────────────────────────────────────────────────────────────────────────────

export type Order     = Prisma.OrderGetPayload<{ include: { items: true } }>;
export type OrderItem = Prisma.OrderItemGetPayload<Record<string, never>>;

// ─────────────────────────────────────────────────────────────────────────────
// Input types
// ─────────────────────────────────────────────────────────────────────────────

export type CreateOrderItemInput = {
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  imageUrl?: string | null;
  quantity: number;
  /** Unit price in cents */
  unitPrice: number;
  /** quantity × unitPrice in cents */
  subtotal: number;
  shopifyProductId?: string | null;
  shopifyVariantId?: string | null;
};

export type CreateOrderInput = {
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
  customerEmail: string;
  customerName?: string | null;
  /** Subtotal in cents */
  subtotal: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  /** Total in cents */
  total: number;
  currency?: string;
  /** Initial order status — defaults to PENDING_PAYMENT */
  status?: OrderStatus;
  /** Initial payment status — defaults to PENDING */
  paymentStatus?: PaymentStatus;
  shippingName?: string | null;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  shopifyProductId?: string | null;
  shopifyVariantId?: string | null;
  shopifyHandle?: string | null;
  notes?: string | null;
  items: CreateOrderItemInput[];
};

export type UpdateOrderInput = {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  stripePaymentIntentId?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: Date | null;
  estimatedDelivery?: Date | null;
  notes?: string | null;
  internalNotes?: string | null;
  /** Set to now() after a successful confirmation email send. Prevents duplicates. */
  confirmationEmailSentAt?: Date | null;
  /** Set to now() after a successful shipped email send. Prevents duplicates. */
  shippedEmailSentAt?: Date | null;
};

export type GetOrdersInput = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  fulfillmentStatus?: FulfillmentStatus;
  paymentStatus?: PaymentStatus;
  customerEmail?: string;
  /** Case-insensitive search across orderNumber, customerEmail and customerName */
  search?: string;
  /** Filter orders created on or after this date (inclusive) */
  createdAfter?: Date;
  /** Filter orders created before this date (exclusive) */
  createdBefore?: Date;
};

/** Subset of GetOrdersInput used to scope aggregate stats queries. */
export type GetOrderStatsInput = Omit<GetOrdersInput, 'page' | 'limit'>;

export type DateRange = { createdAfter?: Date; createdBefore?: Date };

/**
 * Maps a period preset (or 'custom') and optional custom date strings to a
 * UTC date range suitable for filtering orders by createdAt.
 *
 *   today       → [00:00 UTC today,          00:00 UTC tomorrow)   (ISO week Mon–Sun)
 *   yesterday   → [00:00 UTC yesterday,       00:00 UTC today)
 *   this_week   → [00:00 UTC this Monday,     00:00 UTC tomorrow)
 *   last_week   → [00:00 UTC last Monday,     00:00 UTC this Monday)
 *   this_month  → [00:00 UTC 1st this month,  00:00 UTC tomorrow)
 *   last_month  → [00:00 UTC 1st last month,  00:00 UTC 1st this month)
 *   custom      → [from 00:00 UTC,            (to + 1 day) 00:00 UTC) — full days inclusive
 */
export function resolvePeriod(period: string, fromStr: string, toStr: string): DateRange {
  if (!period) return {};

  const now = new Date();
  const y   = now.getUTCFullYear();
  const m   = now.getUTCMonth();
  const d   = now.getUTCDate();
  const dow = now.getUTCDay(); // 0 = Sunday

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
        // Date.UTC handles m-1 = -1 correctly (rolls back to Dec of previous year)
        createdAfter:  new Date(Date.UTC(y, m - 1, 1)),
        createdBefore: new Date(Date.UTC(y, m, 1)),
      };
    case 'custom': {
      const result: DateRange = {};
      if (fromStr) result.createdAfter = new Date(`${fromStr}T00:00:00.000Z`);
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

export type PaginatedOrders = {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a human-readable order number in the format DIPS-YYYYMMDD-XXXXXX.
 * Uniqueness is enforced by the database constraint on `orderNumber`.
 */
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random  = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `DIPS-${dateStr}-${random}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Write operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new order with its items in a single transaction.
 * Throws a Prisma P2002 error if `stripeSessionId` already exists.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return prisma.order.create({
    data: {
      orderNumber:           generateOrderNumber(),
      stripeSessionId:       input.stripeSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      customerEmail:         input.customerEmail,
      customerName:          input.customerName ?? null,
      subtotal:              input.subtotal,
      shippingCost:          input.shippingCost ?? 0,
      tax:                   input.tax ?? 0,
      discount:              input.discount ?? 0,
      total:                 input.total,
      currency:              input.currency ?? 'usd',
      status:                input.status ?? 'PENDING_PAYMENT',
      paymentStatus:         input.paymentStatus ?? 'PENDING',
      shippingName:          input.shippingName ?? null,
      shippingAddressLine1:  input.shippingAddressLine1 ?? null,
      shippingAddressLine2:  input.shippingAddressLine2 ?? null,
      shippingCity:          input.shippingCity ?? null,
      shippingState:         input.shippingState ?? null,
      shippingPostalCode:    input.shippingPostalCode ?? null,
      shippingCountry:       input.shippingCountry ?? null,
      shopifyProductId:      input.shopifyProductId ?? null,
      shopifyVariantId:      input.shopifyVariantId ?? null,
      shopifyHandle:         input.shopifyHandle ?? null,
      notes:                 input.notes ?? null,
      items: {
        create: input.items.map((item) => ({
          productName:      item.productName,
          variantName:      item.variantName ?? null,
          sku:              item.sku ?? null,
          imageUrl:         item.imageUrl ?? null,
          quantity:         item.quantity,
          unitPrice:        item.unitPrice,
          subtotal:         item.subtotal,
          shopifyProductId: item.shopifyProductId ?? null,
          shopifyVariantId: item.shopifyVariantId ?? null,
        })),
      },
    },
    include: { items: true },
  });
}

/**
 * Updates an order by its internal id.
 * Only the fields present in `data` are modified.
 */
export async function updateOrder(
  id: string,
  data: UpdateOrderInput
): Promise<Order> {
  return prisma.order.update({
    where: { id },
    data,
    include: { items: true },
  });
}

/**
 * Finds the order linked to a Stripe PaymentIntent and applies an update.
 * Returns null (without throwing) when no matching order is found — safe to
 * call from webhook handlers where the order may not exist yet.
 */
export async function updateOrderByStripePaymentIntentId(
  stripePaymentIntentId: string,
  data: UpdateOrderInput
): Promise<Order | null> {
  const found = await prisma.order.findFirst({
    where:  { stripePaymentIntentId },
    select: { id: true },
  });
  if (!found) return null;
  return updateOrder(found.id, data);
}

// ─────────────────────────────────────────────────────────────────────────────
// Read operations
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrderById(id: string): Promise<Order | null> {
  return prisma.order.findUnique({
    where:   { id },
    include: { items: true },
  });
}

/**
 * Fetches a set of orders by their internal IDs.
 * Used for bulk operations and selected-rows CSV export.
 * IDs that don't exist are silently omitted.
 */
export async function getOrdersByIds(ids: string[]): Promise<Order[]> {
  if (ids.length === 0) return [];
  return prisma.order.findMany({
    where:   { id: { in: ids } },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrderByOrderNumber(
  orderNumber: string
): Promise<Order | null> {
  return prisma.order.findUnique({
    where:   { orderNumber },
    include: { items: true },
  });
}

export async function getOrderByStripeSessionId(
  stripeSessionId: string
): Promise<Order | null> {
  return prisma.order.findUnique({
    where:   { stripeSessionId },
    include: { items: true },
  });
}

/**
 * Returns a paginated list of orders with optional filters.
 * Results are ordered by `createdAt` descending (newest first).
 */
// ─────────────────────────────────────────────────────────────────────────────
// Aggregate stats for the admin dashboard
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStats = {
  totalOrders:       number;
  paidOrders:        number;
  unfulfilledOrders: number;
  /** Sum of `total` (cents) across all PAID orders */
  totalRevenueCents: number;
};

// ── Internal where-clause builder ─────────────────────────────────────────────

/** Builds a Prisma WHERE clause from GetOrdersInput. Shared by getOrders and getOrderStats. */
function buildOrderWhere(input: GetOrdersInput): Prisma.OrderWhereInput {
  const { status, fulfillmentStatus, paymentStatus, customerEmail, search, createdAfter, createdBefore } = input;
  return {
    ...(status            && { status }),
    ...(fulfillmentStatus && { fulfillmentStatus }),
    ...(paymentStatus     && { paymentStatus }),
    ...(customerEmail     && { customerEmail }),
    ...(search && {
      OR: [
        { orderNumber:   { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerName:  { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...((createdAfter || createdBefore) && {
      createdAt: {
        ...(createdAfter  && { gte: createdAfter }),
        ...(createdBefore && { lt:  createdBefore }),
      },
    }),
  };
}

export async function getOrderStats(input: GetOrderStatsInput = {}): Promise<OrderStats> {
  const base = buildOrderWhere(input);

  /**
   * AND combinator so the extra condition is additive, not overriding.
   * e.g. if base already contains paymentStatus=FAILED, paidOrders will be 0 (correct).
   * When base is empty, skip the AND wrapper to keep queries lean.
   */
  const withBase = (extra: Prisma.OrderWhereInput): Prisma.OrderWhereInput =>
    Object.keys(base).length === 0 ? extra : { AND: [base, extra] };

  const [totalOrders, paidOrders, unfulfilledOrders, revenue] = await Promise.all([
    prisma.order.count({ where: base }),
    prisma.order.count({ where: withBase({ paymentStatus: 'PAID' }) }),
    prisma.order.count({ where: withBase({ fulfillmentStatus: 'UNFULFILLED' }) }),
    prisma.order.aggregate({
      _sum:  { total: true },
      where: withBase({ paymentStatus: 'PAID' }),
    }),
  ]);

  return {
    totalOrders,
    paidOrders,
    unfulfilledOrders,
    totalRevenueCents: revenue._sum.total ?? 0,
  };
}

export async function getOrders(
  input: GetOrdersInput = {}
): Promise<PaginatedOrders> {
  const { page = 1, limit = 20 } = input;
  const skip  = (page - 1) * limit;
  const where = buildOrderWhere(input);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include:  { items: true },
      orderBy:  { createdAt: 'desc' },
      skip,
      take:     limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
