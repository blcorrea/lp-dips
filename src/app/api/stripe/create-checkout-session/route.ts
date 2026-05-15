import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPurchasableDipsProduct } from '@/lib/shopify-product';
import { getLocalizedPricing, isSupportedLocale } from '@/lib/pricing';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

const stripe = new Stripe(stripeSecretKey);

// ── Attribution helpers ────────────────────────────────────────────────────
// `client_reference_id` allows alphanumerics, underscores, dashes; ≤200 chars.
const CLIENT_REF_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;

/** Returns a trimmed string capped to 500 chars (Stripe metadata value limit), or undefined. */
function attrString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, 500);
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const quantity = Math.max(1, Math.min(Number(body.quantity) || 1, 10));

    const normalizedLocale =
      typeof body.locale === 'string' && isSupportedLocale(body.locale)
        ? body.locale
        : 'en';
    const localizedPricing = getLocalizedPricing(normalizedLocale);

    // Optional influencer/UTM attribution forwarded from the client. When
    // absent, checkout behaves exactly as before — no metadata keys added.
    const attribution =
      body.attribution && typeof body.attribution === 'object'
        ? (body.attribution as Record<string, unknown>)
        : null;
    const influencerRef = attrString(attribution?.ref);
    const utmSource     = attrString(attribution?.utmSource);
    const utmMedium     = attrString(attribution?.utmMedium);
    const utmCampaign   = attrString(attribution?.utmCampaign);
    const landingPage   = attrString(attribution?.landingPage);
    const clientReferenceId =
      influencerRef && CLIENT_REF_PATTERN.test(influencerRef)
        ? influencerRef
        : undefined;

    const attributionMetadata: Record<string, string> = {};
    if (influencerRef) attributionMetadata.influencer_ref = influencerRef;
    if (utmSource)     attributionMetadata.utm_source     = utmSource;
    if (utmMedium)     attributionMetadata.utm_medium     = utmMedium;
    if (utmCampaign)   attributionMetadata.utm_campaign   = utmCampaign;
    if (landingPage)   attributionMetadata.landing_page   = landingPage;

    const product = await getPurchasableDipsProduct();

    if (!product) {
      return NextResponse.json(
        { ok: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    if (!product.availableForSale) {
      return NextResponse.json(
        { ok: false, error: 'Product is not available for sale.' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ...(clientReferenceId ? { client_reference_id: clientReferenceId } : {}),
      success_url: `${siteUrl}/${normalizedLocale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${normalizedLocale}/product/dips-chocolate`,
      // Collect shipping address — required for order fulfillment.
      // Adjust allowed_countries to match where you actually ship.
      shipping_address_collection: {
        allowed_countries: [
          'US', 'CA',
          'BR', 'MX', 'AR', 'CO', 'CL', 'PE', 'UY', 'EC', 'PY', 'BO',
          'GB', 'DE', 'FR', 'ES', 'PT', 'IT', 'NL', 'BE', 'CH', 'AT',
          'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'RO',
          'AU', 'NZ',
        ],
      },
      phone_number_collection: { enabled: false }, // TODO post-launch: enable after adding phone column to Order schema and persisting in webhook
      line_items: [
        {
          quantity,
          price_data: {
            currency: localizedPricing.currency.toLowerCase(),
            unit_amount: Math.round(localizedPricing.price * 100),
            product_data: {
              name: product.title,
              description: product.description,
              images: product.imageUrl ? [product.imageUrl] : [],
              metadata: {
                shopify_product_id: product.productId,
                shopify_variant_id: product.variantId,
                shopify_handle: product.handle,
              },
            },
          },
        },
      ],
      metadata: {
        shopify_product_id: product.productId,
        shopify_variant_id: product.variantId,
        shopify_handle: product.handle,
        locale: normalizedLocale,
        localized_currency: localizedPricing.currency,
        localized_unit_price: String(localizedPricing.price),
        ...attributionMetadata,
      },
    });

    return NextResponse.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Stripe error';

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}