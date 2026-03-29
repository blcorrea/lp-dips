import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { updateOrder, type FulfillmentStatus } from '@/lib/orders';
import { sendOrderShippedEmail } from '@/lib/email-templates';

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  'UNFULFILLED',
  'PARTIALLY_FULFILLED',
  'FULFILLED',
  'RETURNED',
  'CANCELLED',
];

/** Hard cap on IDs per request to keep response times predictable. */
const MAX_IDS = 100;

// ── PATCH /api/admin/orders/bulk ──────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  // ── Validate ids ────────────────────────────────────────────────────────────
  if (!Array.isArray(raw.ids) || raw.ids.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
  }
  if (raw.ids.length > MAX_IDS) {
    return NextResponse.json(
      { error: `Cannot update more than ${MAX_IDS} orders at once` },
      { status: 400 }
    );
  }

  const ids: string[] = (raw.ids as unknown[]).filter(
    (id): id is string => typeof id === 'string' && id.trim().length > 0
  );
  if (ids.length === 0) {
    return NextResponse.json({ error: 'ids contains no valid order IDs' }, { status: 400 });
  }

  const { action } = raw;

  // ── Action: set_fulfillment ──────────────────────────────────────────────────
  if (action === 'set_fulfillment') {
    const fulfillmentStatus = raw.fulfillmentStatus;
    if (
      typeof fulfillmentStatus !== 'string' ||
      !VALID_FULFILLMENT_STATUSES.includes(fulfillmentStatus as FulfillmentStatus)
    ) {
      return NextResponse.json(
        {
          error: `Invalid fulfillmentStatus. Must be one of: ${VALID_FULFILLMENT_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const fs = fulfillmentStatus as FulfillmentStatus;
    let updated = 0;

    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const order = await updateOrder(id, { fulfillmentStatus: fs });

        // Mirror the email guard from /api/admin/orders/[id]:
        //   only send when first marking FULFILLED and email hasn't been sent yet.
        if (fs === 'FULFILLED' && order.customerEmail && !order.shippedEmailSentAt) {
          try {
            await sendOrderShippedEmail({
              customerEmail:  order.customerEmail,
              customerName:   order.customerName,
              orderNumber:    order.orderNumber,
              carrier:        order.carrier,
              trackingNumber: order.trackingNumber,
              trackingUrl:    order.trackingUrl,
              shippedAt:      order.shippedAt,
            });
            console.log('✅ Bulk: shipped email sent to', order.customerEmail);
            await updateOrder(id, { shippedEmailSentAt: new Date() });
          } catch (err) {
            console.error('❌ Bulk: failed to send shipped email for order', id, err);
          }
        } else if (fs === 'FULFILLED' && order.shippedEmailSentAt) {
          console.log('ℹ️ Bulk: skipping shipped email; already sent for order', id);
        }
      })
    );

    results.forEach((r) => {
      if (r.status === 'fulfilled') updated++;
      else console.error('Bulk set_fulfillment error:', r.reason);
    });

    return NextResponse.json({ ok: true, updated });
  }

  // ── Action: set_carrier ──────────────────────────────────────────────────────
  if (action === 'set_carrier') {
    if (typeof raw.carrier !== 'string' || raw.carrier.trim().length === 0) {
      return NextResponse.json(
        { error: 'carrier must be a non-empty string' },
        { status: 400 }
      );
    }

    const carrier = raw.carrier.trim().slice(0, 100); // sanity cap

    let updated = 0;
    const results = await Promise.allSettled(
      ids.map((id) => updateOrder(id, { carrier }))
    );
    results.forEach((r) => {
      if (r.status === 'fulfilled') updated++;
      else console.error('Bulk set_carrier error:', r.reason);
    });

    return NextResponse.json({ ok: true, updated });
  }

  // ── Unknown action ───────────────────────────────────────────────────────────
  return NextResponse.json(
    { error: `Unknown action "${String(action)}". Supported: set_fulfillment, set_carrier` },
    { status: 400 }
  );
}
