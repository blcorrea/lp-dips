# Codebase Concerns

**Analysis Date:** 2026-05-14

## Tech Debt

**Unused customer/order mock data system still wired to production routes:**
- Issue: `src/data/orders.ts`, `src/data/customers.ts`, `src/data/products.ts`, and `src/data/inventory.ts` are POC/mock data files from an earlier prototype. They define their own `Order`, `Customer`, `Product` types (separate from the Prisma types in `src/lib/orders.ts`) and contain hardcoded fixture records. Several live pages still import directly from these files.
- Files: `src/app/[locale]/orders/page.tsx`, `src/app/[locale]/orders/[id]/page.tsx`, `src/contexts/CustomerContext.tsx`, `src/app/[locale]/wishlist/page.tsx`, `src/app/[locale]/products/page.tsx`, `src/app/[locale]/product/[slug]/page.tsx`
- Impact: The customer-facing orders page shows hardcoded mock orders, not real database orders. The wishlist and products pages use static mock data. Customers who navigate to `/orders` see fictional orders instead of their real purchase history.
- Fix approach: Replace mock data imports with real Prisma-backed API calls; delete `src/data/` once all consumers are migrated.

**Auto-login mock customer always active in CustomerContext:**
- Issue: `src/contexts/CustomerContext.tsx` (line 50) has `const autoLogin = true` which automatically logs in the hardcoded `mockCustomer` (`demo@dpis.com`, "João Silva") on every page load.
- Files: `src/contexts/CustomerContext.tsx`
- Impact: Every visitor to the site is logged in as the mock user. The profile, wishlist and orders pages reflect mock data for all users. There is no real authentication system.
- Fix approach: Remove the auto-login block; implement real customer authentication or remove the customer session system if it is not required for current product scope.

**Shopify compat layer with dead functions:**
- Issue: `src/lib/shopify.ts` exports `getShopifyBuyUrl()`, `getShopifyShopUrl()`, `getShopifyCartUrl()`, and `isShopifyConfigured()` — all of which are stub functions returning hardcoded fallback strings. They exist as a "compat layer for older components" but add confusion and dead surface area.
- Files: `src/lib/shopify.ts`
- Impact: Low functional impact today, but creates confusion about where to add new Shopify functionality.
- Fix approach: Remove stub functions; grep and confirm no active callers remain before deletion.

**Dashboard data hard-capped at 2,000 orders:**
- Issue: `getDashboardData()` in `src/lib/orders.ts` (line 463) uses `take: 2_000`. If the order count exceeds 2,000, charts and status breakdowns silently undercount.
- Files: `src/lib/orders.ts`
- Impact: As order volume grows, dashboard charts will show incomplete data without any warning.
- Fix approach: Replace in-memory aggregation with Prisma `groupBy` and `aggregate` queries so no row fetch cap is needed. The function currently fetches all rows to do client-side bucketing — move bucketing to SQL.

**Order export no meaningful cap on unfiltered requests:**
- Issue: `src/app/api/admin/orders/export/route.ts` (line 131) fetches up to `limit: 10_000` orders for CSV export when no `ids` param is provided. For large datasets this could cause memory pressure in the serverless function.
- Files: `src/app/api/admin/orders/export/route.ts`
- Impact: May cause serverless timeout or out-of-memory errors at scale.
- Fix approach: Use streaming CSV generation or paginate the export; add a row count warning in the UI before exporting.

**Duplicate `createOrder` function — webhook bypasses `src/lib/orders.ts`:**
- Issue: The webhook in `src/app/api/stripe/webhook/route.ts` constructs and calls `tx.order.create()` inline (line 124) inside the Prisma transaction instead of calling the `createOrder()` helper in `src/lib/orders.ts`. This means the two paths are not in sync — future changes to one may not propagate to the other.
- Files: `src/app/api/stripe/webhook/route.ts`, `src/lib/orders.ts`
- Impact: If `createOrder` is updated (e.g., to add a new field), the webhook path will miss it silently.
- Fix approach: Extract a `createOrderInTransaction(tx, input)` overload in `src/lib/orders.ts` that accepts a Prisma transaction client, and call it from the webhook.

## Known Bugs

**Phone number collected at Stripe checkout but never stored:**
- Symptoms: Stripe checkout session is configured with `phone_number_collection: { enabled: true }` in `src/app/api/stripe/create-checkout-session/route.ts` (line 92), but the webhook handler in `src/app/api/stripe/webhook/route.ts` does not read `customer_details.phone` and the `Order` schema in `prisma/schema.prisma` has no phone column.
- Files: `src/app/api/stripe/create-checkout-session/route.ts`, `src/app/api/stripe/webhook/route.ts`, `prisma/schema.prisma`
- Trigger: Every completed checkout. Phone is asked of the customer but immediately discarded.
- Workaround: Currently none — the data is lost after the webhook runs.

**Google Sheets sync missing phone, CPF, and SKU columns:**
- Symptoms: The sheet row builder in `src/lib/google-sheets.ts` (lines 197–215) writes empty strings for `buyer-phone-number` (col G), `cpf` (col F), `ship-phone-number` (col X), and `sku` (col H). These columns are part of the warehouse format and are expected to be populated.
- Files: `src/lib/google-sheets.ts`
- Trigger: Every new paid order synced to Sheets via the webhook.
- Workaround: None — warehouse receives incomplete rows.

**Order number generator uses `Math.random()` — non-cryptographic collision risk:**
- Symptoms: `generateOrderNumber()` in `src/lib/orders.ts` (line 196) uses `Math.random().toString(36).toUpperCase().slice(2, 8)` — a 6-character base-36 random suffix (~2.2B combinations). At low order volumes this is fine, but the DB constraint (`@unique` on `orderNumber`) would cause a P2002 error if a collision occurred inside the webhook transaction, causing the webhook to return 400 and Stripe to retry.
- Files: `src/lib/orders.ts`
- Trigger: Two orders created within the same second with matching random suffixes.
- Workaround: P2002 is caught by the outer uniqueness handler, but the error message may be misleading and Stripe will retry unnecessarily.

## Security Considerations

**Admin cookie stores the raw secret as its value:**
- Risk: `src/app/api/admin/login/route.ts` (line 30) sets the admin session cookie value to `secret` — i.e., the raw `ADMIN_SECRET` env var. This means the session token and the password are identical. If the cookie is intercepted or leaked, an attacker has the actual admin password, not just a session token.
- Files: `src/app/api/admin/login/route.ts`, `src/lib/admin-auth.ts`
- Current mitigation: Cookie is `httpOnly: true` and `sameSite: 'lax'`. The `secure` flag is NOT set, meaning the cookie is transmitted over HTTP in non-HTTPS environments.
- Recommendations: (1) Set `secure: process.env.NODE_ENV === 'production'` on the cookie. (2) Store a signed/hashed session token instead of the raw secret. (3) Consider moving to a proper session library (e.g., `iron-session` or JWT signed with the secret).

**Admin cookie missing `secure` flag:**
- Risk: The `secure` flag is absent from the cookie set in `src/app/api/admin/login/route.ts` (line 29–35). In non-HTTPS environments (including `localhost` during testing), the cookie is transmitted in plaintext.
- Files: `src/app/api/admin/login/route.ts`
- Current mitigation: None.
- Recommendations: Add `secure: process.env.NODE_ENV === 'production'`.

**No rate limiting on admin login endpoint:**
- Risk: `POST /api/admin/login` has no rate limiting. A brute-force attack can attempt unlimited password guesses.
- Files: `src/app/api/admin/login/route.ts`
- Current mitigation: None — the middleware only checks for the cookie; it does not throttle unauthenticated requests.
- Recommendations: Add rate limiting via Vercel's Edge Middleware or a package like `@upstash/ratelimit`.

**Test/debug endpoint publicly accessible:**
- Risk: `src/app/api/test-shopify/route.ts` is a GET endpoint that returns the full Shopify product data (including internal IDs, pricing, and inventory counts). It has no authentication check. It is mounted at `/api/test-shopify`.
- Files: `src/app/api/test-shopify/route.ts`
- Current mitigation: None.
- Recommendations: Either delete this endpoint or add `isAdminAuthenticated()` guard before returning data.

**SMTP transporter calls `transporter.verify()` on every email send:**
- Risk: `src/lib/email.ts` (line 32) calls `await transporter.verify()` before every email, opening a new SMTP connection and performing a login check. In a serverless environment this adds latency (~200–500ms) to the webhook critical path and could exhaust SMTP connection limits under load.
- Files: `src/lib/email.ts`
- Current mitigation: Errors are caught and re-thrown, so failures surface.
- Recommendations: Remove `transporter.verify()` call; Nodemailer automatically opens a connection when `sendMail()` is called. Reserve `verify()` for startup checks, not per-request calls.

## Performance Bottlenecks

**SMTP connection opened per email send:**
- Problem: `src/lib/email.ts` calls `nodemailer.createTransport()` and `transporter.verify()` on every invocation. In serverless (Vercel), the transporter is not reused across invocations.
- Files: `src/lib/email.ts`
- Cause: Transporter is created inside the function body rather than at module scope. Verify adds an extra SMTP round-trip.
- Improvement path: Create the transporter at module scope (with guard for missing env vars) and remove the `verify()` call.

**Shopify product fetched on every checkout session creation:**
- Problem: `getPurchasableDipsProduct()` → `getDipsProduct()` → `shopifyFetch()` is called on every POST to `/api/stripe/create-checkout-session`. Each call makes a Shopify Storefront API request with `cache: 'no-store'`.
- Files: `src/lib/shopify-client.ts` (line 52), `src/app/api/stripe/create-checkout-session/route.ts`
- Cause: No caching strategy for product data that changes infrequently.
- Improvement path: Use Next.js `fetch` cache or `unstable_cache` with a short revalidation window (e.g., 60 seconds) for the Shopify product query.

**Google Sheets `updateOrderInSheet` fetches entire column A on every update:**
- Problem: `src/lib/google-sheets.ts` (line 249) fetches the entire order-id column from the sheet to find matching rows before updating. As the sheet grows, this scan becomes slower.
- Files: `src/lib/google-sheets.ts`
- Cause: Google Sheets has no server-side filter for cell values.
- Improvement path: For large sheets, cache a row-index map in memory (acceptable in serverless with short TTL) or switch to a database-first approach where Sheets is append-only.

## Fragile Areas

**Webhook email-sending depends on `let` variable mutation across async callback boundary:**
- Files: `src/app/api/stripe/webhook/route.ts` (lines 88–92, 437–439)
- Why fragile: `confirmationEmailData` and `capturedOrderId` are `let` variables set inside `prisma.$transaction(async (tx) => {...})`. TypeScript narrowing on mutable `let` variables across async callbacks is unreliable. The code works around this with a "CFA workaround" comment (line 436) by immediately casting to typed consts after the transaction. This pattern is confusing and fragile if the transaction callback structure changes.
- Safe modification: When adding new post-transaction side effects, always follow the same capture-then-cast pattern and add it to the same block.
- Test coverage: No test coverage.

**Shipped email is triggered by `fulfillmentStatus === 'FULFILLED'` on every admin save:**
- Files: `src/app/api/admin/orders/[id]/route.ts` (lines 103–128)
- Why fragile: If the admin updates any field on a FULFILLED order (e.g., internal notes), the PATCH handler re-evaluates `data.fulfillmentStatus === 'FULFILLED'`. The guard is the DB timestamp (`shippedEmailSentAt`), but since `fulfillmentStatus` is always included in the edit form payload, the check always fires. Any bug in the timestamp-write path would cause duplicate emails.
- Safe modification: Only trigger the email check if `data.fulfillmentStatus` is transitioning TO `FULFILLED` (i.e., verify the order's *previous* status before proceeding).
- Test coverage: None.

**`CustomerContext` auto-login flag (`autoLogin = true`) is a hardcoded constant:**
- Files: `src/contexts/CustomerContext.tsx` (line 50)
- Why fragile: The auto-login behavior is controlled by a hardcoded boolean that is easy to miss. Any developer not aware of the POC history may add features to the authenticated-customer paths expecting real data.
- Safe modification: Remove the auto-login block entirely; do not treat it as a feature toggle.
- Test coverage: None.

**Commission calculation uses `Prisma.Decimal` converted to JavaScript `number`:**
- Files: `src/app/api/stripe/webhook/route.ts` (line 189): `const amount = Math.round(baseAmount * Number(rate))`
- Why fragile: `rate` is a `Prisma.Decimal`. Converting to `Number` before multiplication can introduce floating-point rounding errors for rates with many decimal places. The `Math.round` partially mitigates this but doesn't fully eliminate it for non-standard rates (e.g., 0.175).
- Safe modification: Use `Decimal` arithmetic throughout the commission calculation (e.g., via the `decimal.js` library that Prisma bundles) rather than converting to float.
- Test coverage: None.

## Scaling Limits

**Single-product catalog:**
- Current capacity: The entire product layer (`src/lib/shopify-product.ts`, `src/lib/shopify.ts`) is designed around fetching one specific product by handle (`dips-chocolate`). There is no product listing API, no multi-product cart, and no catalog browsing backed by real data.
- Limit: Adding a second real product requires architectural changes to the Shopify product layer, checkout session creation, and order item modeling.
- Scaling path: Generalize `getPurchasableDipsProduct()` to accept a handle parameter; add product listing endpoint; update `create-checkout-session` to support multiple line items.

**Commissions fetched with default cap of 500 rows:**
- Current capacity: `getCommissions()` in `src/lib/affiliates.ts` (line 236) defaults to `limit: 500`.
- Limit: Commissions table beyond 500 rows silently truncates without pagination UI.
- Scaling path: Add pagination to the commissions table (same pattern as orders table).

## Dependencies at Risk

**Shopify API version pinned to `2024-10`:**
- Risk: `src/lib/shopify-client.ts` (line 18) defaults to `2024-10`. Shopify deprecates API versions quarterly. When `2024-10` is sunset, all Shopify calls will fail with a deprecation error.
- Impact: Product data will be unavailable; checkout sessions cannot be created.
- Migration plan: Set `SHOPIFY_API_VERSION` to the current supported version in `.env` and test; update quarterly.

**No testing framework installed:**
- Risk: There are zero test files in the project and no test runner (`jest`, `vitest`, etc.) in `package.json`. All code paths — including the Stripe webhook, commission calculation, and email dispatch — are untested.
- Impact: Regressions in financial calculations or order processing go undetected until they appear in production.
- Migration plan: Add `vitest` (compatible with the existing TypeScript setup); start with unit tests for `generateOrderNumber`, `resolvePeriod`, and the commission calculation in the webhook.

## Missing Critical Features

**No real customer authentication:**
- Problem: The customer-facing order history, profile, and wishlist pages are built on a fake session system backed by `localStorage` + a hardcoded mock customer. There is no sign-in, sign-up, or session management connected to real order data.
- Blocks: Customers cannot view their real order history or track real orders.

**Phone number not persisted anywhere:**
- Problem: Stripe collects the customer's phone number at checkout (`phone_number_collection: { enabled: true }`), but neither the database schema nor the webhook handler stores it.
- Blocks: Warehouse and logistics teams cannot access customer phone numbers for delivery coordination. Google Sheets has a `buyer-phone-number` column that is always empty.

**Partial refund status never set:**
- Problem: `PaymentStatus.PARTIALLY_REFUNDED` is defined in `prisma/schema.prisma` but is never written by any code path. The `charge.refunded` webhook event always sets status to `REFUNDED` regardless of whether it was a full or partial refund.
- Blocks: Accurate financial reporting for partial refunds.

## Test Coverage Gaps

**Stripe webhook handler:**
- What's not tested: The entire `POST /api/stripe/webhook` handler, including the idempotency logic, commission creation, email dispatch gating, and all four Stripe event types.
- Files: `src/app/api/stripe/webhook/route.ts`
- Risk: Financial data corruption, duplicate emails, or missed order creation can go undetected.
- Priority: High

**Commission calculation logic:**
- What's not tested: The math in the webhook (`baseAmount = subtotal - discount`, `amount = round(baseAmount * rate)`) and the `transitionCommission` state machine in `src/lib/affiliates.ts`.
- Files: `src/app/api/stripe/webhook/route.ts`, `src/lib/affiliates.ts`
- Risk: Incorrect affiliate payouts.
- Priority: High

**`resolvePeriod` date-range logic:**
- What's not tested: UTC boundary handling for `today`, `yesterday`, `this_week`, `last_week`, `this_month`, `last_month`, and `custom` cases in `src/lib/orders.ts`.
- Files: `src/lib/orders.ts`
- Risk: Admin dashboard shows wrong date ranges; exports include wrong orders.
- Priority: Medium

**Order number uniqueness under concurrent load:**
- What's not tested: Concurrent webhook delivery where two events arrive simultaneously and both attempt to create an order — verifying that the P2002 path is correctly handled.
- Files: `src/app/api/stripe/webhook/route.ts`, `src/lib/orders.ts`
- Risk: Duplicate orders or unhandled errors during Stripe retry storms.
- Priority: Medium

---

*Concerns audit: 2026-05-14*
