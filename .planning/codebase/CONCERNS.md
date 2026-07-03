# Codebase Concerns

**Analysis Date:** 2026-07-03

## Tech Debt

**Fake/legacy cart-checkout flow is dead code that mimics a real purchase (also see Known Bugs):**
- Issue: `src/contexts/CartContext.tsx`, `src/app/[locale]/cart/page.tsx`, `src/app/[locale]/checkout/page.tsx`, and `src/components/checkout/CheckoutForm.tsx` implement a full "add to cart → checkout → success" flow that never talks to Stripe. `CheckoutForm.tsx` renders raw card number/expiry/CVV `<input>` fields pre-filled with the Stripe test card (`4242 4242 4242 4242`, `12/25`, `123`) and "processes" the order with a hardcoded `setTimeout(..., 2000)` before calling `onSubmit('card')`.
- Files: `src/components/checkout/CheckoutForm.tsx`, `src/app/[locale]/checkout/page.tsx`, `src/contexts/CartContext.tsx`, `src/app/[locale]/cart/page.tsx`, `src/components/cart/CartDrawer.tsx`, `src/components/cart/CartItem.tsx`
- Impact: This flow is reachable from production UI (`Header.tsx`, `ProductCard.tsx` both call `useCart()`/`addToCart`). A real customer who adds a product to the cart and checks out via this path sees a "success" page and has their cart cleared, but is never charged and no `Order` row is ever created (this bypasses `/api/stripe/create-checkout-session` and the webhook entirely). This is a broken purchase path sitting alongside the real one.
- Fix approach: Either wire `CartContext`/`CheckoutForm` into the real Stripe Checkout flow (`/api/stripe/create-checkout-session`) or remove the cart/checkout pages and drawer entirely and keep only the working `BuyNowButton.tsx` → Stripe Checkout path used on the product page.

**Customer-facing account pages run entirely on mock/localStorage data, disconnected from real orders:**
- Issue: `src/contexts/CustomerContext.tsx` persists a fake `Customer` object (`src/data/customers.ts` → `mockCustomer`) to `localStorage` to "simulate a session." `/orders`, `/orders/[id]`, `/profile`, and `/wishlist` all read from `src/data/orders.ts` (a static in-memory mock order list keyed by `mockCustomer.id`), not from the real `Order`/`OrderItem` Prisma models used by the Stripe webhook.
- Files: `src/contexts/CustomerContext.tsx`, `src/data/customers.ts`, `src/data/orders.ts`, `src/app/[locale]/orders/page.tsx`, `src/app/[locale]/orders/[id]/page.tsx`, `src/app/[locale]/profile/page.tsx`, `src/app/[locale]/wishlist/page.tsx`
- Impact: A real customer who completes a real Stripe purchase (via `BuyNowButton.tsx`) will never see that order under `/orders` — the pages only ever show the hardcoded mock orders. There is no real customer authentication system at all (login/logout just toggles a `localStorage` flag).
- Fix approach: Either scope these pages out of the current release (gate/hide the nav links) or build a real customer-facing order lookup backed by `Order`/`OrderItem` (e.g. email + order number lookup, matching the pattern already used in `src/lib/orders.ts` for admin).

**Static "reviews" presented as real customer testimonials:**
- Issue: `src/data/reviews.ts` is explicitly commented `// Reviews — static data. Replace placeholder content with real reviews.` yet is rendered on the homepage via `src/components/ReviewsSection.tsx` with names, handles, star ratings, and platform badges (Instagram/TikTok/Google) styled as real social proof.
- Files: `src/data/reviews.ts`, `src/components/ReviewsSection.tsx`
- Impact: Presenting fabricated testimonials as genuine customer reviews (with fake handles/platforms) is a legal/compliance risk (FTC endorsement guidelines) if shipped to production as-is.
- Fix approach: Replace with real collected reviews before launch, or clearly label the section as illustrative/remove platform badges until real reviews exist.

**Generated Prisma client checked into `src/` but excluded from types/lint scope inconsistently:**
- Issue: `src/generated/prisma/client/**` (27k+ lines) is gitignored (`src/generated/` in `.gitignore`) but lives under `src/`, so tooling that globs `src/**/*.ts` (this analysis, potentially IDE-wide search/refactor) sweeps in thousands of generated lines including legitimate-looking `any` usage.
- Files: `src/generated/prisma/client/` (entire tree), `.gitignore`
- Impact: Noise in `any`/complexity scans; risk that a future contributor edits generated files directly since they're physically inside `src/`.
- Fix approach: Consider generating to a top-level `generated/` or `node_modules/.prisma`-style location outside `src/` (Prisma 7 supports arbitrary `output` paths) to keep `src/` as "hand-written code only."

**Stray design reference files committed at repo root:**
- Issue: `design-system.html` (65KB) and `design-system-tabs.html` (59KB) sit untracked at the project root alongside real app code.
- Files: `design-system.html`, `design-system-tabs.html`
- Impact: Clutter; risk of accidental deployment/exposure if a future static-file serving rule is added; not part of the Next.js app itself.
- Fix approach: Move to a `design/` or `.reference/` folder outside the deployable app root, or delete once no longer needed. Note `design_system.html` (underscore variant) is already gitignored — these hyphenated files are not.

**`phone_number_collection` intentionally disabled with an open TODO:**
- Issue: `phone_number_collection: { enabled: false }` in Stripe Checkout session creation, with an explicit TODO to enable post-launch once a `phone` column exists on `Order` and is persisted in the webhook.
- Files: `src/app/api/stripe/create-checkout-session/route.ts:100`
- Impact: No customer phone number is captured for shipping/support, which the Google Sheets warehouse export already has an empty placeholder column for (`ship-phone-number`).
- Fix approach: Add `phone` to the `Order` schema, persist it from `session.customer_details.phone` in the webhook, and enable collection.

## Known Bugs

**Legacy checkout completes without payment (functional bug, not just dead code):**
- Symptoms: Adding an item to cart and completing checkout via `/[locale]/checkout` shows a success page and empties the cart, with zero payment charged and zero order persisted.
- Files: `src/app/[locale]/checkout/page.tsx`, `src/components/checkout/CheckoutForm.tsx`
- Trigger: Any "Add to Cart" action from `Header.tsx` / `ProductCard.tsx`, followed by visiting `/cart` → `/checkout` → "Place Order."
- Workaround: None currently — the flow is fully reachable in the UI.

**Free-text `role` bypass check is fragile string comparison, not schema-validated at the API boundary:**
- Symptoms: `POST /api/admin/users` accepts any `role` value and silently coerces anything other than the literal string `'SUPER_ADMIN'` to `'OPERATOR'` rather than rejecting invalid input.
- Files: `src/app/api/admin/users/route.ts:64`
- Trigger: Sending `role: "super_admin"` (wrong case) or `role: "ADMIN"` silently creates an `OPERATOR` account instead of erroring, which could surprise an admin expecting a validation error.
- Workaround: None; low severity since it fails safe (defaults to lower privilege).

## Security Considerations

**No rate limiting / brute-force protection on admin login:**
- Risk: `POST /api/admin/login` has no attempt throttling, lockout, or CAPTCHA. An attacker can brute-force the `ADMIN_SECRET` master-key bootstrap path or a known admin email's password indefinitely.
- Files: `src/app/api/admin/login/route.ts`, `src/middleware.ts`
- Current mitigation: Passwords are hashed with scrypt + timing-safe comparison (`src/lib/password.ts`), which slows individual guesses, but nothing prevents unlimited attempts over time or from many IPs.
- Recommendations: Add IP/email-based rate limiting (e.g. Redis/Upstash token bucket, or a simple DB-backed failed-attempt counter with exponential backoff) in front of `/api/admin/login`.

**`ADMIN_SECRET` doubles as both JWT signing key and bootstrap master password:**
- Risk: `src/lib/session.ts` uses `process.env.ADMIN_SECRET` to sign/verify session JWTs, and `src/app/api/admin/login/route.ts` uses the *same* value as the one-time bootstrap password when `AdminUser` count is 0. If this secret ever leaks (e.g. via logs, error messages, or a misconfigured env in a lower environment), an attacker can both forge admin session tokens and (if no admin exists yet) create a new SUPER_ADMIN account.
- Files: `src/lib/session.ts:29-32`, `src/app/api/admin/login/route.ts:46-81`
- Current mitigation: Bootstrap path only works while `adminUser` table is empty, and email-verification is not required.
- Recommendations: Use two distinct secrets — one for JWT signing (`SESSION_SECRET`) and a separate one-time `ADMIN_BOOTSTRAP_KEY` that can be rotated/removed from the environment after the first SUPER_ADMIN is created.

**Admin session cookie is a long-lived (8h) JWT with no server-side revocation:**
- Risk: `ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8` (`src/lib/admin-auth.ts:5`) issues stateless JWTs with no session store, so a stolen cookie remains valid for up to 8 hours and there is no way to force-revoke a session (e.g. after deactivating an `AdminUser` via `active: false`, any already-issued token for that user still verifies successfully until it naturally expires, since `verifySessionToken` never re-checks the DB).
- Files: `src/lib/session.ts`, `src/lib/admin-auth.ts`, `src/middleware.ts`
- Current mitigation: Tokens are signed and tamper-evident (`jose` HS256); `active` is checked only at login time, not on every request.
- Recommendations: Either check `AdminUser.active` on each authenticated request (adds a DB round trip to every admin page/route) or maintain a short revocation list / shorter token TTL with refresh.

**Google Sheets service-account private key handled via env var string replace:**
- Risk: `normalisePrivateKey()` does a blind `.replace(/\\n/g, '\n')` on `GOOGLE_SHEETS_PRIVATE_KEY`; if the env var is misconfigured (e.g. missing quoting in the hosting platform's env UI), `buildClient()` will throw only at call time (inside the webhook's best-effort try/catch), silently degrading Sheets sync rather than failing loudly at boot.
- Files: `src/lib/google-sheets.ts:90-92`, `src/app/api/stripe/webhook/route.ts:498-506`
- Current mitigation: Webhook explicitly treats Sheets sync as non-critical and only logs on failure — this is intentional and reasonable for the checkout path, but means misconfiguration can go unnoticed for a long time.
- Recommendations: Add a startup/health-check script (or admin-only diagnostic endpoint) that validates Google Sheets credentials independent of live order traffic.

**No CSRF protection beyond `sameSite=lax` cookies on admin mutating routes:**
- Risk: Admin POST/PATCH/DELETE routes (`/api/admin/users`, `/api/admin/orders/bulk`, `/api/admin/account/password`, etc.) rely solely on the `admin_token` cookie's `sameSite: 'lax'` attribute for CSRF protection; there is no CSRF token.
- Files: `src/app/api/admin/login/route.ts:7-15`, all `src/app/api/admin/**/route.ts`
- Current mitigation: `sameSite: 'lax'` blocks most cross-site POST forgery for modern browsers.
- Recommendations: Acceptable for an internal admin tool at current scale; consider a CSRF token if the admin surface grows or supports third-party integrations.

## Performance Bottlenecks

**Google Sheets `updateOrderInSheet` fetches the entire order-id column on every fulfillment update:**
- Problem: `sheets.spreadsheets.values.get({ range: '${tab}!A:A' })` reads the full column A (unbounded row count) to linearly scan for matching `orderNumber` rows, on every single fulfillment status update from the admin UI.
- Files: `src/lib/google-sheets.ts:243-267`
- Cause: No indexed lookup structure in Google Sheets; full-column scan is the simplest implementation.
- Improvement path: Acceptable while order volume is low (hundreds–low thousands of rows); if volume grows significantly, consider caching a `orderNumber → row` map or switching the operational/logistics fields to be admin/DB-driven only (Sheets export becomes append-only, no update-in-place).

**Admin orders export caps at 2,000 rows with no pagination/streaming:**
- Problem: `prisma.order.findMany({ take: 2_000, ... })` in the export path loads up to 2,000 full orders (with items) into memory to build a CSV/export in one request.
- Files: `src/lib/orders.ts:454-463`
- Cause: Simple `take` cap rather than cursor-based streaming export.
- Improvement path: Fine at current scale; if order volume approaches the 2,000 cap, silently-truncated exports become a real risk — add an explicit warning in the UI when the cap is hit, or switch to streamed CSV generation.

## Fragile Areas

**Stripe webhook handler is a single 553-line function covering 5 event types:**
- Files: `src/app/api/stripe/webhook/route.ts`
- Why fragile: All Stripe event handling (`checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, commission creation, email dispatch, Sheets sync, warehouse notification) lives in one `POST` handler with a large `switch`. The idempotency design (StripeEvent as first tx op) is solid, but any change to one event type risks breaking unrelated logic due to shared scope (`confirmationEmailData`, `capturedOrderId` captured via `let` across the whole function).
- Safe modification: Keep all writes inside the `$transaction` block; keep all network calls (email, Sheets, warehouse notification) strictly after the transaction commits, following the existing pattern. Add new event types as new `case` blocks rather than modifying existing ones.
- Test coverage: None (no test suite exists in this repo — see Test Coverage Gaps).

**Dual "Order" concepts in the codebase (real Prisma `Order` vs. mock `data/orders.ts` `Order`):**
- Files: `prisma/schema.prisma` (`model Order`), `src/data/orders.ts` (`interface Order`), `src/lib/orders.ts` (real admin-facing queries), `src/data/orders.ts` (mock customer-facing queries)
- Why fragile: Two entirely separate type systems named `Order`/`OrderStatus`/`PaymentStatus` exist with different field casing conventions (`SCREAMING_SNAKE` enums in Prisma vs. `snake_case` string literals in `src/data/orders.ts`), increasing the chance a future contributor wires the wrong one into a new feature.
- Safe modification: When adding customer-facing order features, always use `src/lib/orders.ts` (Prisma-backed) semantics, not `src/data/orders.ts`.
- Test coverage: None.

**Admin session role changes require re-login to take effect:**
- Files: `src/lib/session.ts`, `src/middleware.ts` (role gate at `isUserMgmt` check)
- Why fragile: `SessionPayload.role` is baked into the JWT at login time. If a SUPER_ADMIN downgrades another admin to `OPERATOR` (or deactivates them) via `PATCH /api/admin/users/[id]`, that admin's existing session cookie still carries the old role/active claims until it expires (up to 8h) or they log out.
- Safe modification: Any future authorization change should re-verify against the DB for high-privilege actions rather than trusting the JWT claims alone.
- Test coverage: None.

## Scaling Limits

**No test suite at any level:**
- Current capacity: 0 automated tests (no `*.test.*`/`*.spec.*` files found in the repo, no test runner configured in `package.json`).
- Limit: Every change to checkout, webhook idempotency, commission calculation, or admin auth is verified manually only. Regression risk grows with each new feature (reviews, affiliates, admin users were all added without accompanying tests).
- Scaling path: See Test Coverage Gaps below.

## Dependencies at Risk

**Prisma 7.x (`@prisma/client` / `prisma` `^7.5.0`) is a very recent major version:**
- Risk: Pinned to `^7.5.0` with a non-standard `output` path (`src/generated/prisma/client`) and the driver-adapter pattern (`@prisma/adapter-pg`). This is a newer Prisma API surface (client generation config, adapters) with less community/Stack Overflow precedent than Prisma 5/6.
- Impact: Upgrades within `^7.x` should be low-risk (semver), but any Prisma-side breaking change to the driver-adapter API or generator output shape would require regenerating and re-verifying `src/generated/prisma/client`.
- Migration plan: Pin exact versions in CI before upgrading; re-run `prisma generate` and smoke-test the webhook + admin order queries after any Prisma version bump.

**`stripe` npm package pinned to `^20.0.0` while `@stripe/stripe-js` is `^8.5.3`:**
- Risk: Server SDK (`stripe`) and client SDK (`@stripe/stripe-js`) are versioned independently per Stripe's normal practice; no code currently imports `@stripe/stripe-js` directly (checkout is fully redirect-based via `session.url`), so this dependency may be unused.
- Impact: Low — dead dependency increases install size slightly.
- Migration plan: Confirm `@stripe/stripe-js` is unused (`grep -r "@stripe/stripe-js" src/`) and remove from `package.json` if so.

## Missing Critical Features

**No real customer authentication or order-lookup system:**
- Problem: There is no email/password or magic-link login for customers — only the mock `CustomerContext` described above. Customers who purchase via Stripe Checkout have no way to look up their real order status by logging in; `checkout/success` and `orders/[id]` pages are the only places order data could surface, and only `checkout/success` reads real data (session-based), not `/orders/[id]`.
- Blocks: Self-service order tracking, order history, and repeat-customer wishlist/profile features cannot function against real data until this is built.

**No automated tests block any form of safe refactoring:**
- Problem: Zero test coverage across unit, integration, or e2e layers.
- Blocks: Confident refactors of the webhook, commission math, or admin auth; regression prevention for future phases.

## Test Coverage Gaps

**Entire codebase — no test runner configured:**
- What's not tested: Everything. No Jest/Vitest/Playwright config, no `*.test.*`/`*.spec.*` files anywhere in `src/`, `scripts/`, or root.
- Files: N/A (absence is repo-wide)
- Risk: Stripe webhook idempotency logic, commission calculation (`Math.round(baseAmount * Number(rate))` in `src/app/api/stripe/webhook/route.ts:189`), scrypt password hashing/verification, and admin role-gating in `src/middleware.ts` are all financial/security-critical and currently rely entirely on manual QA.
- Priority: High — recommend starting with unit tests for `src/lib/orders.ts`, `src/lib/affiliates.ts` commission math, and `src/lib/password.ts`/`src/lib/session.ts`, plus an integration test that replays a sample Stripe webhook payload against a test DB to verify idempotency (duplicate `event.id` handling).

**Stripe webhook signature verification and duplicate-event handling:**
- What's not tested: The P2002-based idempotency claim (`StripeEvent.create` as first tx operation), and the distinction between "duplicate event" vs. "duplicate stripeSessionId" in the catch block.
- Files: `src/app/api/stripe/webhook/route.ts:92-433`
- Risk: A regression here could silently create duplicate orders/commissions or drop legitimate events, directly affecting revenue and fulfillment.
- Priority: High.

---

*Concerns audit: 2026-07-03*
