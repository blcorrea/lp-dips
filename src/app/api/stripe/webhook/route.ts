import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

if (!webhookSecret) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET');
}

const stripe = new Stripe(stripeSecretKey);
const verifiedWebhookSecret: string = webhookSecret;

const processedEvents = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.text();
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

    // Idempotência básica em memória
    if (processedEvents.has(event.id)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('✅ checkout.session.completed', {
          eventId: event.id,
          sessionId: session.id,
          customerEmail: session.customer_details?.email ?? null,
          amountTotal: session.amount_total,
          currency: session.currency,
          paymentStatus: session.payment_status,
          metadata: session.metadata ?? {},
        });

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log('✅ payment_intent.succeeded', {
          eventId: event.id,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata ?? {},
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log('⚠️ payment_intent.payment_failed', {
          eventId: event.id,
          paymentIntentId: paymentIntent.id,
          lastPaymentError: paymentIntent.last_payment_error?.message ?? null,
        });

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        console.log('↩️ charge.refunded', {
          eventId: event.id,
          chargeId: charge.id,
          amountRefunded: charge.amount_refunded,
          paymentIntentId:
            typeof charge.payment_intent === 'string'
              ? charge.payment_intent
              : charge.payment_intent?.id ?? null,
        });

        break;
      }

      default:
        console.log('ℹ️ Unhandled Stripe event', {
          eventId: event.id,
          type: event.type,
        });
    }

    processedEvents.add(event.id);

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