// ── Limited-time free-shipping promo ─────────────────────────────────────────
// Single source of truth shared by the purchase UI (ProductPurchaseBox, the
// product-detail badge) and the Stripe checkout session. While the promo is
// active, shipping is free on EVERY bundle and quantity, but the UI keeps
// showing the standard rate struck through so the customer sees the saving.
//
// To end the promo: flip FREE_SHIPPING_PROMO_ACTIVE to false. Everything falls
// back to the previous rules — the 3x bundle keeps its own permanent free
// shipping, every other option is charged STANDARD_SHIPPING_COST via the
// STRIPE_SHIPPING_RATE_ID rate.

/** Standard shipping rate shown struck through while the promo runs (USD). */
export const STANDARD_SHIPPING_COST = 6.97;

/** Whether the limited-time free-shipping promo is currently running. */
export const FREE_SHIPPING_PROMO_ACTIVE = true;
