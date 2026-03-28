/**
 * Central tracking utility — Meta Pixel · GA4 · Google Ads.
 *
 * All functions are no-ops when the corresponding env var is absent or when
 * called on the server. The site never throws without IDs.
 */

// ── Browser global declarations ────────────────────────────────────────────

declare global {
  interface Window {
    fbq?:       (action: string, event: string, params?: Record<string, unknown>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?:      (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

// ── Env vars (NEXT_PUBLIC_ are inlined at build time) ─────────────────────

const META_PIXEL_ID    = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA4_ID           = process.env.NEXT_PUBLIC_GA4_ID;
const GOOGLE_ADS_ID    = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const GOOGLE_ADS_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL;

// ── Internal helpers ───────────────────────────────────────────────────────

function meta(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.fbq || !META_PIXEL_ID) return;
  window.fbq('track', event, params);
}

function ga(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.gtag || !GA4_ID) return;
  window.gtag('event', event, params);
}

// ── Public types ───────────────────────────────────────────────────────────

export interface TrackingItem {
  id:       string;
  name:     string;
  price:    number; // major currency units (e.g. 29.90, NOT 2990 cents)
  quantity: number;
  currency: string; // ISO 4217, e.g. "USD"
}

export interface PurchaseData {
  transactionId: string;
  value:         number; // major currency units
  currency:      string;
  items:         TrackingItem[];
}

// ── Public tracking API ────────────────────────────────────────────────────

export function trackViewItem(item: TrackingItem): void {
  meta('ViewContent', {
    content_ids:  [item.id],
    content_name: item.name,
    content_type: 'product',
    value:        item.price,
    currency:     item.currency.toUpperCase(),
  });

  ga('view_item', {
    currency: item.currency.toUpperCase(),
    value:    item.price,
    items:    [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }],
  });
}

export function trackAddToCart(item: TrackingItem): void {
  meta('AddToCart', {
    content_ids:  [item.id],
    content_name: item.name,
    content_type: 'product',
    value:        item.price * item.quantity,
    currency:     item.currency.toUpperCase(),
    num_items:    item.quantity,
  });

  ga('add_to_cart', {
    currency: item.currency.toUpperCase(),
    value:    item.price * item.quantity,
    items:    [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }],
  });
}

export function trackBeginCheckout(item: TrackingItem): void {
  meta('InitiateCheckout', {
    content_ids:  [item.id],
    content_name: item.name,
    content_type: 'product',
    num_items:    item.quantity,
    value:        item.price * item.quantity,
    currency:     item.currency.toUpperCase(),
  });

  ga('begin_checkout', {
    currency: item.currency.toUpperCase(),
    value:    item.price * item.quantity,
    items:    [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }],
  });
}

export function trackPurchase(data: PurchaseData): void {
  const totalQty = data.items.reduce((s, i) => s + i.quantity, 0);

  meta('Purchase', {
    value:        data.value,
    currency:     data.currency.toUpperCase(),
    content_ids:  data.items.map((i) => i.id),
    content_name: data.items[0]?.name,
    content_type: 'product',
    num_items:    totalQty,
  });

  ga('purchase', {
    transaction_id: data.transactionId,
    value:          data.value,
    currency:       data.currency.toUpperCase(),
    items: data.items.map((i) => ({
      item_id:   i.id,
      item_name: i.name,
      price:     i.price,
      quantity:  i.quantity,
    })),
  });

  // Google Ads conversion
  if (
    GOOGLE_ADS_ID &&
    GOOGLE_ADS_LABEL &&
    typeof window !== 'undefined' &&
    window.gtag
  ) {
    window.gtag('event', 'conversion', {
      send_to:        `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LABEL}`,
      value:          data.value,
      currency:       data.currency.toUpperCase(),
      transaction_id: data.transactionId,
    });
  }
}

// ── sessionStorage helpers — checkout context handoff ─────────────────────
//
// BuyNowButton saves checkout context before redirecting to Stripe.
// The success page reads it back to fire the purchase event.
// sessionStorage persists across cross-origin redirects within the same tab.

const CHECKOUT_STORAGE_KEY = 'dips_pending_checkout';

export interface PendingCheckout {
  productId:   string;
  productName: string;
  price:       number; // unit price in major currency units
  quantity:    number;
  currency:    string;
}

export function savePendingCheckout(data: PendingCheckout): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be unavailable (private browsing, iframe restrictions)
  }
}

export function popPendingCheckout(): PendingCheckout | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    return JSON.parse(raw) as PendingCheckout;
  } catch {
    return null;
  }
}
