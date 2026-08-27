// ── Florida sales tax via Stripe Tax ─────────────────────────────────────────
// The brand must collect sales tax on orders shipped to Florida (home-state
// nexus). Checkout is Stripe-hosted, so the shipping address is only known on
// Stripe's page — the only supported way to add an address-conditional charge
// there is Stripe Tax (`automatic_tax`): Stripe recalculates the total live as
// the customer types the address and adds tax ONLY for jurisdictions where the
// account holds a registration (Florida). Every other destination pays 0 extra.
//
// The flag is env-gated because enabling `automatic_tax` on an account where
// Stripe Tax is not configured makes session creation FAIL — flipping it on is
// an ops step, not just a deploy. Before setting STRIPE_AUTOMATIC_TAX_ENABLED
// to "true" in production:
//   1. Dashboard → Settings → Tax: activate Stripe Tax and add the Florida
//      registration.
//   2. Set the default product tax code (food & beverage) and default tax
//      behavior to "exclusive" — OR set tax behavior/tax code explicitly on
//      each bundle Price (STRIPE_PRICE_1X/2X/3X). Dashboard-created Prices
//      without a tax behavior reject sessions that enable automatic_tax.
// The dynamic-pricing path (quantity checkout) already sends
// `tax_behavior: "exclusive"` from code, so the tax is ADDED on top of the
// advertised price instead of carved out of it.

/** True only when the env var is the literal string "true". */
export function isAutomaticTaxEnabled(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return env.STRIPE_AUTOMATIC_TAX_ENABLED === 'true';
}

/** Whether Stripe Tax automatic calculation is enabled for checkout sessions. */
export const AUTOMATIC_TAX_ENABLED = isAutomaticTaxEnabled();
