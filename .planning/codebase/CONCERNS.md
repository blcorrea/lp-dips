# Codebase Concerns

**Analysis Date:** 2026-06-17

## Tech Debt

**Stripe Webhook Phone Number Collection:**
- Issue: Phone number collection is disabled at checkout with a TODO comment indicating it should be enabled post-launch after schema updates
- Files: `src/app/api/stripe/create-checkout-session/route.ts` (line 118)
- Impact: Order.schema lacks phone field; customers cannot be collected or contacted via SMS for fulfillment
- Fix approach: (1) Add `phone?: string` column to Order model in `prisma/schema.prisma`, (2) Update webhook handler in `src/app/api/stripe/webhook/route.ts` to persist `shipping_details.phone` to the phone field, (3) Enable `phone_number_collection: { enabled: true }` in checkout session creation

**Affiliate Query Performance — No Date Filtering:**
- Issue: `getAffiliatesWithStats()` in `src/lib/affiliates.ts` aggregates ALL commissions and orders since inception with no date-scoping option; monthly/yearly reports or high-volume deployments will degrade
- Files: `src/lib/affiliates.ts` (lines 125–200), `src/app/admin/affiliates/page.tsx`
- Impact: As order volume grows, dashboard response time increases linearly; aggregation queries with `groupBy` across full history become slow
- Fix approach: Add optional `createdAfter`, `createdBefore` parameters to `getAffiliatesWithStats()` with sensible defaults (e.g., last 12 months); update UI to offer period presets

**Commission Rate Snapshot Design — Non-Atomic Update Risk:**
- Issue: Commission snapshot is created in webhook but affiliate.commissionRate can be updated independently by admin; a race between commission creation and rate change could cause stale reads
- Files: `src/app/api/stripe/webhook/route.ts` (lines 177–236), `src/lib/affiliates.ts` (affiliate update endpoints)
- Impact: Rare but possible: admin updates affiliate rate → order arrives → commission uses stale rate from DB read
- Fix approach: Wrap commission creation in a defensive SELECT ... FOR UPDATE pattern, or redesign to always snapshot the rate at order time (currently done correctly in webhook, but admin updates to affiliate.commissionRate should be flagged as recalc triggers)

**Logging Strategy — Console.log in Production:**
- Issue: Extensive use of `console.log()` and `console.error()` throughout webhook, emails, and order processing without structured logging framework
- Files: `src/app/api/stripe/webhook/route.ts` (23 log statements), `src/lib/email.ts`, `src/app/api/admin/orders/[id]/route.ts`, `src/app/api/affiliates/join/route.ts`
- Impact: Production logs are unstructured; difficult to filter, search, or aggregate errors; no context like request ID or trace correlation
- Fix approach: Integrate a structured logger (e.g., Pino, Winston) with JSON output; wrap all log calls with request context metadata

## Known Bugs

**Admin Affiliate Redirect Loop Potential:**
- Symptoms: A logged-in admin without an affiliate session landing on `/affiliates/login` or `/affiliates/dashboard` is redirected to `/admin/affiliates` by middleware, but if the admin's affiliate_session cookie is manually set by attacker, the redirect could fail
- Files: `src/middleware.ts` (lines 59–73)
- Trigger: Admin user with spoofed affiliate_session cookie + manual navigation to `/[locale]/affiliates/dashboard`
- Workaround: Middleware checks both cookies before allowing access; the check is XORed (admin → redirect, no affiliate session + admin → redirect to admin), so the logic is sound. Low risk.

**Email Send Failure Silent in Webhook:**
- Symptoms: When `sendOrderConfirmationEmail()` throws in the webhook post-transaction, the error is caught and logged but the order status is not rolled back
- Files: `src/app/api/stripe/webhook/route.ts` (lines 441–472)
- Trigger: SMTP misconfiguration or transient network error during email send
- Workaround: Current design catches errors and logs them; confirmationEmailSentAt is only set on success, so retries can be built later. Email failure is non-critical (order is persisted), but customer may not be notified.

## Security Considerations

**Setup Mode Plaintext Secret Comparison:**
- Risk: First admin user creation compares plaintext password against ADMIN_SECRET env var; timing attack possible (though low impact for setup)
- Files: `src/app/api/admin/login/route.ts` (lines 22–42)
- Current mitigation: Node.js string comparison is fast enough that timing window is negligible; secure comparison not required for one-time setup
- Recommendations: (1) Add rate limiting to POST /api/admin/login, (2) Consider using bcrypt.compare() even for setup mode for consistency

**Admin Session Cookie — No CSRF Token:**
- Risk: Admin state-changing operations (PATCH /api/admin/orders/[id], etc.) only validate httpOnly cookie; no CSRF token present
- Files: `src/middleware.ts` (admin auth check), `src/app/api/admin/orders/[id]/route.ts` (PATCH), all admin API routes
- Current mitigation: httpOnly cookie + SameSite=lax prevents most CSRF; Next.js middleware validates on every request
- Recommendations: Add CSRF token validation to sensitive mutations; consider SameSite=strict for admin routes only

**Affiliate Login Token Storage — No Rate Limiting:**
- Risk: No rate limit on `/api/affiliates/verify` endpoint; attacker can brute-force 64-char hex tokens
- Files: `src/app/api/affiliates/verify/route.ts`
- Current mitigation: Token entropy is high (32 random bytes = 2^256 space), but brute-force is theoretically possible over months
- Recommendations: (1) Add rate limiting per IP (e.g., 5 attempts per minute), (2) Implement exponential backoff after N failures, (3) Log failed attempts for monitoring

**Stripe Webhook Secret Management:**
- Risk: STRIPE_WEBHOOK_SECRET stored as environment variable; if .env is leaked, webhook validation is compromised
- Files: `src/app/api/stripe/webhook/route.ts` (line 15)
- Current mitigation: .env is in .gitignore; production uses secure env var management
- Recommendations: Rotate webhook secret quarterly; monitor for unauthorized webhook delivery in Stripe dashboard; add webhook signature validation logging

**Metadata Injection in Stripe Checkout:**
- Risk: Attribution metadata (utm_source, utm_campaign, etc.) are user-provided and written to Stripe metadata; XSS/injection possible if rendered client-side
- Files: `src/app/api/stripe/create-checkout-session/route.ts` (lines 60–79)
- Current mitigation: Values are trimmed and capped at 500 chars; no HTML/script injection possible in metadata itself
- Recommendations: Audit frontend rendering of metadata in email templates and admin dashboard for XSS; sanitize all user input

## Performance Bottlenecks

**Stripe Webhook — Full Session Expansion:**
- Problem: Webhook retrieves full checkout session with expand=['line_items'] even if only session.id is needed
- Files: `src/app/api/stripe/webhook/route.ts` (lines 76–78)
- Cause: Simplifies data extraction; avoids second API call for line_items
- Improvement path: Cache line_items in Stripe metadata at checkout time; webhook can parse from event payload without expansion

**Dashboard Chart Query — 2000-Row Hard Limit:**
- Problem: `getDashboardData()` queries orders with `take: 2_000` hard limit; if order volume exceeds this, chart is incomplete
- Files: `src/lib/orders.ts` (lines 451–464)
- Cause: Safety measure to prevent unbounded queries; comment notes "sufficient for typical small-brand volumes"
- Improvement path: (1) Implement date range filtering by default (last 90 days), (2) Add pagination to chart data, (3) Move to aggregation query (groupBy day + _sum) instead of full fetch

**Google Sheets Sync — Linear Search for Order Rows:**
- Problem: `updateOrderInSheet()` fetches entire column A and iterates to find matching orderNumber; O(n) scan with network latency
- Files: `src/lib/google-sheets.ts` (lines 243–287)
- Cause: Google Sheets API has no native row lookup; linear scan is only option without secondary index
- Improvement path: (1) Maintain a separate index sheet mapping orderNumber → row number, (2) Use batchGet with multiple ranges, or (3) migrate to a real database for warehouse sync

**Affiliate Commission Calculation — Decimal → Number Conversion on Every Read:**
- Problem: `commissionRate` is Decimal in database but converted to number in every `AffiliateRow` response
- Files: `src/lib/affiliates.ts` (line 181)
- Cause: Prisma Decimal type requires explicit conversion; no SQL-level type coercion
- Improvement path: Use BigInt or store as basis points (integer) in schema to avoid conversion overhead

## Fragile Areas

**Webhook Idempotency Logic — Multiple Fallback Guards:**
- Files: `src/app/api/stripe/webhook/route.ts` (lines 81–432)
- Why fragile: Webhook relies on three layers of deduplication: StripeEvent.create claim, Order.stripeSessionId uniqueness, and commission check. If any layer fails or is removed, duplicates possible.
- Safe modification: (1) Never remove the StripeEvent claim check (it's the primary guard), (2) Keep P2002 error handling for all insert operations, (3) Add integration tests that replay webhook payloads
- Test coverage: Webhook idempotency is untested; no test fixtures for duplicate event replay

**Email Template Generation — Inline HTML String Concatenation:**
- Files: `src/lib/email-templates.ts` (714 lines of HTML strings)
- Why fragile: HTML is built by string concatenation; no template engine validation; easy to introduce XSS or unclosed tags
- Safe modification: (1) Never interpolate unsanitized user input directly into HTML, (2) Use htmlspecialchars or a template engine (e.g., Handlebars, ETA), (3) Test HTML output with validator before sending
- Test coverage: Email templates have no unit tests; only manual verification

**Order Number Generation — Race Condition on Collision:**
- Files: `src/lib/orders.ts` (lines 194–198)
- Why fragile: `generateOrderNumber()` uses `Math.random()` with 6-char suffix; collision probability is low but not zero (birthday paradox)
- Safe modification: (1) Increase suffix length to 8+ chars, (2) Use cryptographically secure random (crypto.getRandomValues), or (3) Rely entirely on DB unique constraint and retry on P2002
- Test coverage: No test for collision behavior; assumes DB constraint is sufficient

**Admin Authentication — Cookie-Only, No Refresh Logic:**
- Files: `src/lib/admin-auth.ts`, `src/app/api/admin/login/route.ts`
- Why fragile: 8-hour session without refresh token; if token is compromised, attacker has 8-hour window. No logout revocation (cookie deletion alone).
- Safe modification: (1) Implement refresh token rotation, (2) Add explicit session revocation table, (3) Reduce max-age to 1–2 hours, (4) Implement device tracking
- Test coverage: No tests for session expiration or logout behavior

## Scaling Limits

**Database Connection Pool — Single Prisma Instance:**
- Current capacity: Prisma default pool is 10 connections; suitable for small brand but hits limits under concurrent webhook load
- Limit: If >10 concurrent Stripe webhooks arrive, queue depth grows and response time degrades
- Scaling path: (1) Increase `connection_limit` in Prisma schema, (2) Implement webhook queue (SQS, Bull, etc.), (3) Split read/write replicas if DB is PostgreSQL

**Affiliate Email Uniqueness Check — Race Window:**
- Current capacity: Single pre-check before INSERT works for single-region deployments
- Limit: Multi-region or high-concurrency signup can cause race condition between check and insert
- Scaling path: Rely entirely on DB unique constraint; remove app-level check and return P2002 on duplicate email (already done with fallback)

**Google Sheets Sync — Rate Limits:**
- Current capacity: Google Sheets API has per-project quotas (100 queries/100 sec default)
- Limit: If order volume reaches >50/sec, Sheets sync will 429 (rate limited)
- Scaling path: (1) Batch appends into single request (currently does this), (2) Increase quota in Google Cloud Console, (3) Migrate to real data warehouse (BigQuery)

**Stripe Webhook Processing — Single Region Edge Runtime:**
- Current capacity: Next.js serverless runs in single region; edge middleware replicates globally but processing is regional
- Limit: If Stripe sends >20 webhooks/sec, regional latency + cold starts cause queueing
- Scaling path: (1) Implement webhook queue (Inngest, Bull), (2) Process in background job, (3) Geo-distribute webhook listeners

## Dependencies at Risk

**@prisma/client v7.5.0 — Breaking Schema Changes:**
- Risk: Prisma 7.x is actively developed; schema changes between minor versions can require migration
- Impact: `prisma generate` may fail; generated types become stale
- Migration plan: (1) Pin minor version and test upgrades in staging, (2) Keep schema.prisma versioned and reviewed, (3) Run `prisma generate` as part of build script (already done)

**nodemailer v8.0.4 — SMTP Dependency:**
- Risk: Nodemailer is stable but SMTP protocol is fragile; transient network errors can cause email loss
- Impact: Order confirmation emails may not send during SMTP outages
- Migration plan: Switch to AWS SES, SendGrid, or Resend (already integrated as option); remove nodemailer once email service chosen

**googleapis v171.4.0 — Deprecated Sheets API Version:**
- Risk: v4 is current; v3 is deprecated but still supported. Google can deprecate v4 with short notice.
- Impact: Google Sheets sync will fail if API is disabled
- Migration plan: Monitor Google Cloud deprecation notices; test v4 API health quarterly; maintain fallback (local order archive)

**stripe v20.0.0 — Breaking Changes Expected:**
- Risk: Stripe SDK v21+ may change webhook event structure or validation
- Impact: Webhook parsing could fail; orders may not be created
- Migration plan: Test Stripe SDK upgrades in staging before production; pin major version in package.json; subscribe to Stripe API changelog

## Missing Critical Features

**Order Refund UI — Admin Cannot Refund:**
- Problem: No admin interface to issue refunds through Stripe; refunds must be done manually in Stripe dashboard
- Blocks: Customers cannot get refunds through the app; admin experience is fragmented
- Impact: High; affects customer satisfaction and chargebacks

**Commission Dispute/Appeal Process:**
- Problem: No mechanism for affiliates to appeal approved/paid commissions or report discrepancies
- Blocks: Affiliates have no recourse if they believe commission calculation is wrong
- Impact: Medium; increases support load

**Bulk Order Export Without Google Sheets:**
- Problem: CSV export exists but is manual; no scheduled/automated exports to warehouse
- Blocks: Warehouse team must manually request exports daily
- Impact: Medium; reduces operational efficiency

**Webhook Delivery Monitoring Dashboard:**
- Problem: No visibility into failed webhook deliveries; relies on Stripe dashboard manually
- Blocks: Cannot detect/retry failed orders automatically
- Impact: Medium-High; critical orders may be silently lost

## Test Coverage Gaps

**Stripe Webhook Idempotency:**
- What's not tested: Duplicate event delivery, out-of-order events (payment_intent.succeeded arrives before checkout.session.completed)
- Files: `src/app/api/stripe/webhook/route.ts`
- Risk: Race conditions in webhook handling could cause duplicate orders or commissions
- Priority: High

**Email Template Rendering:**
- What's not tested: HTML validity, special character escaping, locale-specific formatting
- Files: `src/lib/email-templates.ts` (714 lines)
- Risk: Malformed emails sent to customers; phishing vector if templates are not validated
- Priority: High

**Affiliate Link Generation Across Locales:**
- What's not tested: URL parameter encoding, locale validation in buildAffiliateLink()
- Files: `src/lib/affiliates.ts` (lines 101–114)
- Risk: Affiliate links could be malformed for non-ASCII names or missing locales
- Priority: Medium

**Order Payment Status Transitions:**
- What's not tested: Payment state machine (PENDING → PAID, PENDING → FAILED, PAID → REFUNDED)
- Files: `src/app/api/stripe/webhook/route.ts` (webhook state machine)
- Risk: Invalid state transitions could corrupt order status
- Priority: High

**Admin Auth Session Expiration:**
- What's not tested: Session cookie expiration after 8 hours, logout behavior, re-login after expiration
- Files: `src/lib/admin-auth.ts`, `src/app/api/admin/login/route.ts`
- Risk: Admin sessions could persist indefinitely or fail to revoke
- Priority: Medium

**Commission Calculation Edge Cases:**
- What's not tested: Orders with zero subtotal, negative discounts, rounding behavior
- Files: `src/app/api/stripe/webhook/route.ts` (lines 184–189)
- Risk: Commission amounts could be negative or incorrect due to rounding errors
- Priority: Medium

---

*Concerns audit: 2026-06-17*
