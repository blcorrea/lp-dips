import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { updateOrder, type FulfillmentStatus, type UpdateOrderInput } from '@/lib/orders';
import { sendOrderShippedEmail } from '@/lib/email-templates';

// ── Runtime-checkable list of valid FulfillmentStatus values ─────────────────
// (Prisma 7 exports them as types only, so we define the array explicitly)
const VALID_FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  'UNFULFILLED',
  'PARTIALLY_FULFILLED',
  'FULFILLED',
  'RETURNED',
  'CANCELLED',
];

// ── PATCH /api/admin/orders/[id] ──────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  // ── Validate fulfillmentStatus ───────────────────────────────────────────────
  if (
    raw.fulfillmentStatus !== undefined &&
    !VALID_FULFILLMENT_STATUSES.includes(raw.fulfillmentStatus as FulfillmentStatus)
  ) {
    return NextResponse.json(
      {
        error: `Invalid fulfillmentStatus. Must be one of: ${VALID_FULFILLMENT_STATUSES.join(', ')}`,
      },
      { status: 400 }
    );
  }

  // ── Validate shippedAt ───────────────────────────────────────────────────────
  let shippedAt: Date | null | undefined;
  if (raw.shippedAt !== undefined) {
    if (raw.shippedAt === null) {
      shippedAt = null;
    } else if (typeof raw.shippedAt === 'string' && raw.shippedAt.length > 0) {
      const parsed = new Date(raw.shippedAt);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: 'shippedAt must be a valid ISO 8601 date string or null' },
          { status: 400 }
        );
      }
      shippedAt = parsed;
    } else {
      return NextResponse.json(
        { error: 'shippedAt must be a valid ISO 8601 date string or null' },
        { status: 400 }
      );
    }
  }

  // ── Build the allowed update payload ────────────────────────────────────────
  const data: UpdateOrderInput = {};
  if (raw.fulfillmentStatus !== undefined) data.fulfillmentStatus = raw.fulfillmentStatus as FulfillmentStatus;
  if (raw.carrier          !== undefined) data.carrier           = (raw.carrier          as string | null) || null;
  if (raw.trackingNumber   !== undefined) data.trackingNumber    = (raw.trackingNumber   as string | null) || null;
  if (raw.trackingUrl      !== undefined) data.trackingUrl       = (raw.trackingUrl      as string | null) || null;
  if (raw.internalNotes    !== undefined) data.internalNotes     = (raw.internalNotes    as string | null) || null;
  if (shippedAt            !== undefined) data.shippedAt         = shippedAt;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'No updatable fields provided' },
      { status: 400 }
    );
  }

  // ── Persist ──────────────────────────────────────────────────────────────────
  try {
    const order = await updateOrder(id, data);

    // Send shipping notification when fulfillment is marked as FULFILLED.
    // Fire-and-forget: email failure must not affect the API response.
    if (data.fulfillmentStatus === 'FULFILLED' && order.customerEmail) {
      sendOrderShippedEmail({
        customerEmail:  order.customerEmail,
        customerName:   order.customerName,
        orderNumber:    order.orderNumber,
        carrier:        order.carrier,
        trackingNumber: order.trackingNumber,
        trackingUrl:    order.trackingUrl,
        shippedAt:      order.shippedAt,
      }).catch((err) => {
        console.error('❌ Failed to send shipping notification email:', err);
      });
    }

    return NextResponse.json({ ok: true, order });
  } catch (err) {
    // Prisma P2025 = record to update not found
    if (
      err instanceof Error &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
