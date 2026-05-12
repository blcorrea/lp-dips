import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Prisma } from '@/generated/prisma/client/client';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/orders';
import {
  sendOrderConfirmationEmail,
  type ConfirmationEmailData,
} from '@/lib/email-templates';
import { appendOrderToSheet, type SheetRowData } from '@/lib/google-sheets';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret   = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) throw new Error('Missing STRIPE_SECRET_KEY');
if (!webhookSecret)   throw new Error('Missing STRIPE_WEBHOOK_SECRET');

const stripe                = new Stripe(stripeSecretKey);
const verifiedWebhookSecret = webhookSecret;

// ─────────────────────────────────────────────────────────────────────────────
// P2002 helpers
// ─────────────────────────────────────────────────────────────────────────────

function isUniqueConstraintError(
  err: unknown
): err is Prisma.PrismaClientKnownRequestError {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  );
}

/**
 * Returns a normalised string of the fields that caused the uniqueness
 * conflict, e.g. "stripeSessionId" or "id".
 * Handles both string and string[] shapes that Prisma may return in meta.target.
 */
function p2002Target(err: Prisma.PrismaClientKnownRequestError): string {
  const raw = (err.meta as Record<string, unknown> | undefined)?.target;
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'string') return raw;
  return '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Webhook handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body      = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { ok: false, error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      verifiedWebhookSecret
    );

    // ── Pre-fetch Stripe data outside the transaction ─────────────────────────
    // Network calls cannot participate in a DB transaction.
    // Fetching here is safe: stripe.checkout.sessions.retrieve is idempotent.
    let fullSession: Stripe.Checkout.Session | null = null;
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      fullSession   = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });
    }

    // ── Atomic transaction: claim event + persist ─────────────────────────────
    // StripeEvent.create is the FIRST operation inside the tx — it acts as an
    // atomic "claim". If event.id already exists → P2002 → tx rolls back →
    // no duplicate processing. Re-throw for anything that isn't a safe duplicate.
    //
    // Email data is captured inside the tx and sent AFTER it commits —
    // network calls must not participate in a DB transaction.
    let confirmationEmailData: ConfirmationEmailData | null = null;
    // Order id captured inside the tx — needed to persist confirmationEmailSentAt.
    let capturedOrderId: string | null = null;

    try {
      await prisma.$transaction(async (tx) => {
        // Claim: throws P2002 if this event was already processed.
        await tx.stripeEvent.create({
          data: { id: event.id, type: event.type },
        });

        switch (event.type) {
          // ── Checkout completed → create Order + items ───────────────────────
          case 'checkout.session.completed': {
            const session         = event.data.object as Stripe.Checkout.Session;
            const lineItems       = fullSession!.line_items?.data ?? [];
            const shipping        = fullSession!.collected_information?.shipping_details ?? null;
            const customerDetails = fullSession!.customer_details;

            // Read metadata from the expanded session first; fall back to the
            // event payload. Both should agree, but reading from the same object
            // we use for line_items/customer_details guarantees consistency.
            const metadata = session.metadata ?? {};

            const paymentIntentId =
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id ?? null;

            // Stripe sets payment_status = 'paid' synchronously for card payments.
            // For async methods (bank transfers, etc.) it may still be 'unpaid'.
            const isPaid = fullSession!.payment_status === 'paid';

            // Generate order number before create so we can capture it for email.
            const orderNumber = generateOrderNumber();

            const createdOrder = await tx.order.create({
              data: {
                orderNumber,
                stripeSessionId:       session.id,
                stripePaymentIntentId: paymentIntentId,
                customerEmail:         customerDetails?.email ?? '',
                customerName:          customerDetails?.name ?? null,
                subtotal:
                  fullSession!.amount_subtotal ??
                  fullSession!.amount_total ??
                  0,
                shippingCost: 0,
                tax:          fullSession!.total_details?.amount_tax      ?? 0,
                discount:     fullSession!.total_details?.amount_discount ?? 0,
                total:        fullSession!.amount_total ?? 0,
                currency:     fullSession!.currency     ?? 'usd',
                status:        isPaid ? 'PAYMENT_CONFIRMED' : 'PENDING_PAYMENT',
                paymentStatus: isPaid ? 'PAID'             : 'PENDING',
                shippingName:         shipping?.name              ?? customerDetails?.name ?? null,
                shippingAddressLine1: shipping?.address?.line1    ?? null,
                shippingAddressLine2: shipping?.address?.line2    ?? null,
                shippingCity:         shipping?.address?.city     ?? null,
                shippingState:        shipping?.address?.state    ?? null,
                shippingPostalCode:   shipping?.address?.postal_code ?? null,
                shippingCountry:      shipping?.address?.country  ?? null,
                shopifyProductId: metadata.shopify_product_id ?? null,
                shopifyVariantId: metadata.shopify_variant_id ?? null,
                shopifyHandle:    metadata.shopify_handle     ?? null,
                influencerRef:    metadata.influencer_ref     ?? null,
                utmSource:        metadata.utm_source         ?? null,
                utmMedium:        metadata.utm_medium         ?? null,
                utmCampaign:      metadata.utm_campaign       ?? null,
                landingPage:      metadata.landing_page       ?? null,
                items: {
                  create: lineItems.map((item) => ({
                    productName: item.description ?? 'Unknown product',
                    quantity:    item.quantity    ?? 1,
                    unitPrice:   item.price?.unit_amount ?? 0,
                    subtotal:
                      (item.price?.unit_amount ?? 0) * (item.quantity ?? 1),
                    shopifyProductId: metadata.shopify_product_id ?? null,
                    shopifyVariantId: metadata.shopify_variant_id ?? null,
                  })),
                },
              },
            });
            capturedOrderId = createdOrder.id;

            // ── Affiliate commission (MVP) ─────────────────────────────────────
            // If this order carries a referral code matching an active Affiliate,
            // snapshot a Commission inside the same transaction so the rate at
            // order time is preserved. Missing/inactive affiliates are silently
            // skipped — they must never break checkout webhook processing.
            if (createdOrder.influencerRef) {
              const affiliate = await tx.affiliate.findFirst({
                where:  { ref: createdOrder.influencerRef, active: true },
                select: { id: true, commissionRate: true },
              });

              if (affiliate) {
                const baseAmount = Math.max(
                  0,
                  createdOrder.subtotal - createdOrder.discount
                );
                const rate   = affiliate.commissionRate;
                const amount = Math.round(baseAmount * Number(rate));

                try {
                  await tx.commission.create({
                    data: {
                      orderId:     createdOrder.id,
                      affiliateId: affiliate.id,
                      grossAmount: createdOrder.total,
                      baseAmount,
                      rate,
                      amount,
                      status:      'PENDING',
                    },
                  });

                  console.log('💰 Commission created', {
                    orderId:     createdOrder.id,
                    affiliateId: affiliate.id,
                    ref:         createdOrder.influencerRef,
                    baseAmount,
                    amount,
                  });
                } catch (err) {
                  // Defensive: if a Commission for this Order already exists,
                  // treat as duplicate and continue. Caught locally so it never
                  // poisons the outer P2002 / idempotency logic.
                  if (
                    isUniqueConstraintError(err) &&
                    p2002Target(err).includes('orderId')
                  ) {
                    console.warn(
                      '⚠️ Commission already exists for order — skipping',
                      { orderId: createdOrder.id }
                    );
                  } else {
                    throw err;
                  }
                }
              } else {
                console.log(
                  'ℹ️ Affiliate ref present but no active affiliate found',
                  {
                    orderId: createdOrder.id,
                    ref:     createdOrder.influencerRef,
                  }
                );
              }
            }

            // Capture data needed for confirmation email — sent after tx commits.
            if (isPaid && customerDetails?.email) {
              confirmationEmailData = {
                customerEmail:        customerDetails.email,
                customerName:         customerDetails.name ?? null,
                orderNumber,
                createdAt:            new Date(),
                total:                fullSession!.amount_total    ?? 0,
                subtotal:             fullSession!.amount_subtotal ?? fullSession!.amount_total ?? 0,
                tax:                  fullSession!.total_details?.amount_tax      ?? 0,
                shippingCost:         0,
                discount:             fullSession!.total_details?.amount_discount ?? 0,
                currency:             fullSession!.currency ?? 'usd',
                items: lineItems.map((item) => ({
                  productName: item.description ?? 'Unknown product',
                  variantName: null,
                  quantity:    item.quantity    ?? 1,
                  unitPrice:   item.price?.unit_amount ?? 0,
                  subtotal:    (item.price?.unit_amount ?? 0) * (item.quantity ?? 1),
                })),
                shippingName:         shipping?.name              ?? customerDetails.name ?? null,
                shippingAddressLine1: shipping?.address?.line1    ?? null,
                shippingAddressLine2: shipping?.address?.line2    ?? null,
                shippingCity:         shipping?.address?.city     ?? null,
                shippingState:        shipping?.address?.state    ?? null,
                shippingPostalCode:   shipping?.address?.postal_code ?? null,
                shippingCountry:      shipping?.address?.country  ?? null,
              };
            }

            console.log('✅ checkout.session.completed — order created', {
              eventId:       event.id,
              sessionId:     session.id,
              email:         customerDetails?.email,
              total:         fullSession!.amount_total,
              currency:      fullSession!.currency,
              paymentStatus: fullSession!.payment_status,
              items:         lineItems.length,
            });

            break;
          }

          // ── PaymentIntent confirmed → update paymentStatus + status ──────────
          case 'payment_intent.succeeded': {
            const pi    = event.data.object as Stripe.PaymentIntent;
            const order = await tx.order.findFirst({
              where:  { stripePaymentIntentId: pi.id },
              select: { id: true },
            });

            if (order) {
              await tx.order.update({
                where: { id: order.id },
                data:  { paymentStatus: 'PAID', status: 'PAYMENT_CONFIRMED' },
              });
              console.log('✅ payment_intent.succeeded — order updated', {
                eventId:         event.id,
                paymentIntentId: pi.id,
                orderId:         order.id,
              });
            } else {
              // Order may not exist yet if checkout.session.completed arrives later.
              console.log(
                'ℹ️ payment_intent.succeeded — no matching order (may arrive later)',
                { eventId: event.id, paymentIntentId: pi.id }
              );
            }

            break;
          }

          // ── PaymentIntent failed → mark order cancelled ──────────────────────
          case 'payment_intent.payment_failed': {
            const pi    = event.data.object as Stripe.PaymentIntent;
            const order = await tx.order.findFirst({
              where:  { stripePaymentIntentId: pi.id },
              select: { id: true },
            });

            if (order) {
              await tx.order.update({
                where: { id: order.id },
                data:  { paymentStatus: 'FAILED', status: 'CANCELLED' },
              });
              console.log('⚠️ payment_intent.payment_failed — order cancelled', {
                eventId:          event.id,
                paymentIntentId:  pi.id,
                orderId:          order.id,
                lastPaymentError: pi.last_payment_error?.message ?? null,
              });
            } else {
              console.log(
                'ℹ️ payment_intent.payment_failed — no matching order',
                { eventId: event.id, paymentIntentId: pi.id }
              );
            }

            break;
          }

          // ── Charge refunded → mark order refunded ────────────────────────────
          case 'charge.refunded': {
            const charge = event.data.object as Stripe.Charge;
            const piId   =
              typeof charge.payment_intent === 'string'
                ? charge.payment_intent
                : charge.payment_intent?.id ?? null;

            if (piId) {
              const order = await tx.order.findFirst({
                where:  { stripePaymentIntentId: piId },
                select: { id: true },
              });

              if (order) {
                await tx.order.update({
                  where: { id: order.id },
                  data:  { paymentStatus: 'REFUNDED', status: 'REFUNDED' },
                });
                console.log('↩️ charge.refunded — order marked refunded', {
                  eventId:        event.id,
                  chargeId:       charge.id,
                  amountRefunded: charge.amount_refunded,
                  orderId:        order.id,
                });

                // Cancel any unpaid commission tied to this order. PAID
                // commissions are intentionally left untouched — clawback
                // policy is out of scope for this MVP.
                const commission = await tx.commission.findUnique({
                  where:  { orderId: order.id },
                  select: { id: true, status: true },
                });

                if (
                  commission &&
                  (commission.status === 'PENDING' ||
                    commission.status === 'APPROVED')
                ) {
                  await tx.commission.update({
                    where: { id: commission.id },
                    data:  { status: 'CANCELLED' },
                  });
                  console.log('↩️ Commission cancelled due to refund', {
                    orderId:      order.id,
                    commissionId: commission.id,
                    prevStatus:   commission.status,
                  });
                }
              } else {
                console.log('ℹ️ charge.refunded — no matching order', {
                  eventId:         event.id,
                  chargeId:        charge.id,
                  paymentIntentId: piId,
                });
              }
            }

            break;
          }

          default:
            console.log('ℹ️ Unhandled Stripe event', {
              eventId: event.id,
              type:    event.type,
            });
        }
      }); // end $transaction
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        const target = p2002Target(err);

        if (target.includes('stripeSessionId')) {
          // Order already exists for this Stripe session — safe to treat as duplicate.
          // Can happen when checkout.session.completed is delivered more than once.
          console.warn(
            '⚠️ P2002 on stripeSessionId — order already exists for this session',
            { eventId: event.id, type: event.type, target }
          );
        } else {
          // Most likely StripeEvent.id duplicate — event already processed atomically.
          console.log('ℹ️ P2002 — Stripe event already processed', {
            eventId: event.id,
            type:    event.type,
            target,
          });
        }

        return NextResponse.json({ ok: true, duplicate: true });
      }

      // Not a uniqueness conflict — re-throw so the outer catch returns 400
      // and Stripe retries the delivery.
      throw err;
    }

    // ── Send confirmation email after the DB transaction commits ─────────────
    // CFA workaround: capture let-vars into typed consts before narrowing
    // (TypeScript doesn't track let-mutations inside async callbacks reliably).
    const emailData = confirmationEmailData as ConfirmationEmailData | null;
    const orderId   = capturedOrderId as string | null;

    if (emailData && orderId) {
      console.log('🚀 Calling sendOrderConfirmationEmail', {
        to:          emailData.customerEmail,
        orderNumber: emailData.orderNumber,
      });

      // Guard: skip if already sent (defense-in-depth — StripeEvent idempotency
      // is the primary guard, but this prevents duplicates from any edge case).
      const freshOrder = await prisma.order.findUnique({
        where:  { id: orderId },
        select: { confirmationEmailSentAt: true },
      });

      if (freshOrder?.confirmationEmailSentAt) {
        console.log('ℹ️ Skipping confirmation email; already sent', {
          orderId,
          orderNumber: emailData.orderNumber,
        });
      } else {
        // await so the serverless function doesn't terminate before SMTP finishes.
        try {
          await sendOrderConfirmationEmail(emailData);
          console.log('✅ Order confirmation email sent to', emailData.customerEmail);
          // Persist the timestamp — only written on success, never on failure.
          await prisma.order.update({
            where: { id: orderId },
            data:  { confirmationEmailSentAt: new Date() },
          });
        } catch (err) {
          console.error('❌ Failed to send order confirmation email:', err);
        }
      }
    }

    // ── Sync to Google Sheets (operational warehouse mirror) ─────────────────
    // Runs after the DB transaction and email so it never blocks the critical path.
    // A Sheets failure MUST NOT affect the Stripe webhook response.
    if (emailData) {
      const sheetData: SheetRowData = {
        orderNumber:          emailData.orderNumber,
        createdAt:            emailData.createdAt,
        customerEmail:        emailData.customerEmail,
        customerName:         emailData.customerName,
        total:                emailData.total,
        tax:                  emailData.tax,
        shippingCost:         emailData.shippingCost,
        currency:             emailData.currency,
        items:                emailData.items,
        shippingName:         emailData.shippingName,
        shippingAddressLine1: emailData.shippingAddressLine1,
        shippingAddressLine2: emailData.shippingAddressLine2,
        shippingCity:         emailData.shippingCity,
        shippingState:        emailData.shippingState,
        shippingPostalCode:   emailData.shippingPostalCode,
        shippingCountry:      emailData.shippingCountry,
      };

      try {
        await appendOrderToSheet(sheetData);
        console.log('✅ Order synced to Google Sheets', {
          orderNumber: sheetData.orderNumber,
        });
      } catch (err) {
        // Non-critical — log and continue. The order is safely in the DB.
        console.error('❌ Google Sheets sync failed (non-critical):', err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown webhook error';

    console.error('❌ Stripe webhook error:', message);

    return NextResponse.json(
      { ok: false, error: message },
      { status: 400 }
    );
  }
}
