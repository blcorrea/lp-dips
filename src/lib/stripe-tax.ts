// ── Florida sales tax via Stripe Tax ─────────────────────────────────────────
// Orders shipped to Florida must carry sales tax (FL Stat. §212.08: groceries
// are exempt, but candy/confectionery is TAXABLE — 6% state + 0–2% county
// discretionary surtax, destination-based). The obligation applies when the
// brand has physical presence in FL or crossed the $100k/year remote-sales
// threshold, and requires registering with the Florida DOR.
//
// Checkout is Stripe-hosted, so the shipping address is only known on Stripe's
// page — the only supported way to add an address-conditional charge there is
// Stripe Tax (`automatic_tax`): Stripe recalculates the total live as the
// customer types the address and adds tax ONLY for jurisdictions where the
// account holds a registration (Florida). Every other destination pays 0 extra.
//
// The product tax code decides WHETHER Florida taxes the item, so it must
// match how the product is labeled/marketed:
//   txcd_40100001  Candy                  → taxable in FL (our default)
//   txcd_40100002  Candy (contains flour) → treated as food in SSUTA states
//   txcd_40070005  Snack Foods            → EXEMPT in FL (e.g. chocolate-coated
//                                           pretzels/granola sold as snacks)
//   txcd_40040000  Food, non-immediate    → EXEMPT in FL (generic groceries —
//                                           picking this would collect $0)
//
// The flag is env-gated because enabling `automatic_tax` on an account where
// Stripe Tax is not configured makes session creation FAIL — flipping it on is
// an ops step, not just a deploy. Before setting STRIPE_AUTOMATIC_TAX_ENABLED
// to "true" in production:
//   1. Register with the Florida Department of Revenue (sales & use tax).
//   2. Dashboard → Settings → Tax: activate Stripe Tax and add the Florida
//      registration.
//   3. Set tax code "Candy" (txcd_40100001) and tax behavior "exclusive" on
//      each bundle Price (STRIPE_PRICE_1X/2X/3X) — dashboard-created Prices
//      without a tax behavior reject sessions that enable automatic_tax. The
//      same applies to the STRIPE_SHIPPING_RATE_ID shipping rate.
// The dynamic-pricing path (quantity checkout) already sends the tax code and
// `tax_behavior: "exclusive"` from code, so the tax is ADDED on top of the
// advertised price instead of carved out of it.

/** True only when the env var is the literal string "true". */
export function isAutomaticTaxEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return env.STRIPE_AUTOMATIC_TAX_ENABLED === 'true';
}

/** Whether Stripe Tax automatic calculation is enabled for checkout sessions. */
export const AUTOMATIC_TAX_ENABLED = isAutomaticTaxEnabled();

/**
 * Stripe product tax code sent on the dynamic-pricing checkout path.
 * Defaults to "Candy" (see table above); override via STRIPE_PRODUCT_TAX_CODE
 * if the product's labeling qualifies it as a snack food instead.
 */
export const PRODUCT_TAX_CODE =
  process.env.STRIPE_PRODUCT_TAX_CODE || 'txcd_40100001';
