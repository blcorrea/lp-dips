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
};

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

export async function getOrderStats(): Promise<OrderStats> {
  const [totalOrders, paidOrders, unfulfilledOrders, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: 'PAID' } }),
    prisma.order.count({ where: { fulfillmentStatus: 'UNFULFILLED' } }),
    prisma.order.aggregate({
      _sum:  { total: true },
      where: { paymentStatus: 'PAID' },
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
  const {
    page = 1,
    limit = 20,
    status,
    fulfillmentStatus,
    paymentStatus,
    customerEmail,
    search,
  } = input;

  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
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
  };

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
