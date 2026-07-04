# External Integrations

**Analysis Date:** 2026-07-03

## APIs & External Services

**Payments:**
- Stripe Checkout (hosted payment page) - `src/lib/stripe.ts`, `src/app/api/stripe/create-checkout-session/route.ts`
  - Server SDK: `stripe` npm package, client instantiated with `new Stripe(stripeSecretKey)` (no explicit `apiVersion` pin)
  - Client SDK: `@stripe/stripe-js`, loaded via `getStripe()` in `src/lib/stripe.ts`
  - Auth: `STRIPE_SECRET_KEY` (server), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client, falls back to a hardcoded demo test key if unset — see line 6 of `src/lib/stripe.ts`)
  - Also uses: `STRIPE_WEBHOOK_SECRET` (webhook signature verification), `STRIPE_SHIPPING_RATE_ID` (flat-rate shipping option applied at checkout)
  - Checkout session creation collects shipping address for a broad allow-list of countries (US, CA, most of Latin America, EU, GB, AU, NZ) — `src/app/api/stripe/create-checkout-session/route.ts`

**E-commerce / Product Catalog:**
- Shopify Storefront GraphQL API (read-only product data source, not used for checkout) - `src/lib/shopify-client.ts`, `src/lib/shopify-product.ts`, `src/lib/shopify-queries.ts`, `src/lib/shopify.ts`
  - Custom `shopifyFetch()` wrapper posts GraphQL queries to `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json` with header `X-Shopify-Storefront-Access-Token`
  - Auth: `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
  - Config: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_API_VERSION` (defaults to `2024-10`), `SHOPIFY_PRODUCT_HANDLE`
  - Product/variant IDs from Shopify are snapshotted into Stripe metadata and the `Order`/`OrderItem` Prisma models at purchase time (`shopifyProductId`, `shopifyVariantId`, `shopifyHandle`)

**Spreadsheet Sync (warehouse/fulfillment mirror):**
- Google Sheets API v4 via `googleapis` - `src/lib/google-sheets.ts`
  - Service-account auth: `google.auth.GoogleAuth` with `GOOGLE_SHEETS_CLIENT_EMAIL` + `GOOGLE_SHEETS_PRIVATE_KEY` (newline-escaped, normalized via `normalisePrivateKey()`), scope `https://www.googleapis.com/auth/spreadsheets`
  - Target: `GOOGLE_SHEETS_SPREADSHEET_ID`, tab name `GOOGLE_SHEETS_SHEET_NAME` (defaults to `Orders`)
  - `appendOrderToSheet()` writes one row per order line item (30-column schema, columns A–Z original + AA–AD operational fields added later); auto-migrates old 26-col header to 30-col
  - `updateOrderInSheet()` finds rows by order number and updates fulfillment/carrier/tracking columns (AA–AD)
  - Called from the Stripe webhook (`src/app/api/stripe/webhook/route.ts`) after order creation, and from admin order-update flows — always wrapped in try/catch; failures are logged and non-blocking

**Analytics / Ad Tracking (client-side, no-op if unconfigured):**
- Meta (Facebook) Pixel - `src/lib/tracking.ts`, config `NEXT_PUBLIC_META_PIXEL_ID`, events: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`
- Google Analytics 4 - config `NEXT_PUBLIC_GA4_ID`, events: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
- Google Ads conversion tracking - config `NEXT_PUBLIC_GOOGLE_ADS_ID` + `NEXT_PUBLIC_GOOGLE_ADS_LABEL`, fired alongside GA4 `purchase` event
- All tracking functions are pure no-ops on the server or when the relevant env var is missing (`typeof window === 'undefined'` guards)
- Provider component: `src/components/TrackingProvider.tsx`; view-item trigger: `src/components/TrackViewItem.tsx`

## Data Storage

**Databases:**
- PostgreSQL (provider `postgresql` in `prisma/schema.prisma`)
  - Connection: `DATABASE_URL` (read in `prisma.config.ts` and `src/lib/prisma.ts`)
  - Client: `@prisma/client` 7.5.0 with `@prisma/adapter-pg` (driver adapter over `pg`), custom generated output at `src/generated/prisma/client` (gitignored)
  - Singleton pattern: `globalThis.prisma` cached in dev to avoid connection-pool exhaustion on hot reload (`src/lib/prisma.ts`)
  - Models: `Order`, `OrderItem`, `Affiliate`, `Commission`, `AdminUser`, `StripeEvent` (idempotency log for Stripe webhook events) — `prisma/schema.prisma`
  - Migrations: `prisma/migrations/20260325000823_init`, `20260329124456_add_email_sent_at_timestamps`, `20260506232233_add_influencer_attribution`, `20260507024217_add_affiliate_commissions`, `20260702000000_add_admin_users`

**File Storage:**
- Local filesystem only for static assets (`public/`); product images served via Shopify CDN (`cdn.shopify.com`, whitelisted in `next.config.mjs`)

**Caching:**
- None detected (no Redis, no explicit cache layer). Shopify fetches use `cache: 'no-store'` (`src/lib/shopify-client.ts`).

## Authentication & Identity

**Customer-facing:**
- No customer login/identity system detected. Checkout is guest checkout via Stripe; customer context (`src/contexts/CustomerContext.tsx`) appears to be local/session state, not a backing auth provider.

**Admin Auth Provider:**
- Custom-built, not a third-party provider.
  - Credentials: email + password (scrypt hash, format `scrypt$<salt>$<hash>`) — `src/lib/password.ts` (Node `node:crypto`, no external hashing library)
  - Session: signed JWT (HS256) via `jose`, stored in `admin_token` httpOnly cookie (`ADMIN_COOKIE_NAME`, 8-hour max age) — `src/lib/session.ts`, `src/lib/admin-auth.ts`
  - Signing secret: `ADMIN_SECRET` (dual-purpose: also acts as a one-time bootstrap master password for creating the first `SUPER_ADMIN` when `AdminUser` table is empty — `src/app/api/admin/login/route.ts`)
  - Enforcement: `src/middleware.ts` intercepts all `/admin/*` and `/api/admin/*` routes (Edge runtime), verifies the JWT, and additionally gates `/admin/users*` and `/api/admin/users*` to `SUPER_ADMIN` role only
  - Roles: `SUPER_ADMIN`, `OPERATOR` (`AdminRole` enum in `prisma/schema.prisma`)
  - Bootstrap tooling: `scripts/create-admin.ts` (run via `npm run create-admin`)

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, no error-tracking SDK in `package.json`)

**Logs:**
- `console.log`/`console.error`/`console.warn` throughout server code (emoji-prefixed for readability), e.g. `src/app/api/stripe/webhook/route.ts`, `src/lib/email.ts`, `src/lib/google-sheets.ts` — no structured logging framework

## CI/CD & Deployment

**Hosting:**
- Vercel (implied by Next.js conventions, `.vercel` in `.gitignore`, Vercel-style `images.remotePatterns`); not explicitly confirmed by a `vercel.json`

**CI Pipeline:**
- None detected (no `.github/workflows/`, no CI config files found)

## Environment Configuration

**Required env vars** (from `.env.example`, names only — see `.env.example` for structure, never read actual secret values):
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SHIPPING_RATE_ID`
- Site: `NEXT_PUBLIC_SITE_URL`
- Shopify: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_API_VERSION`, `SHOPIFY_PRODUCT_HANDLE`
- Database: `DATABASE_URL`
- Admin: `ADMIN_SECRET`
- SMTP/email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`
- Tracking: `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_LABEL`
- Google Sheets: `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SHEET_NAME`
- Warehouse notifications: `WAREHOUSE_NOTIFICATION_EMAIL`, `WAREHOUSE_SHEET_URL`

**Secrets location:**
- `.env` / `.env.local` locally (both gitignored). `.env.example` is committed and tracks required variable names only (as of commit `e1e843b`, untracked from `.gitignore` deliberately so the template stays in version control).

## Webhooks & Callbacks

**Incoming:**
- Stripe webhook - `src/app/api/stripe/webhook/route.ts` (`POST /api/stripe/webhook`)
  - Verifies `stripe-signature` header against `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent()`
  - Handles: `checkout.session.completed` (creates `Order` + `OrderItem`s + optional `Commission`, sends confirmation email, syncs to Google Sheets, sends warehouse notification email), `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` (also cancels pending/approved commissions)
  - Idempotency: `StripeEvent` table used as an atomic "claim" — first write inside a Prisma `$transaction`; duplicate `event.id` triggers a P2002 constraint violation that is caught and treated as a safe no-op

**Outgoing:**
- SMTP email sends via `nodemailer` - `src/lib/email.ts`, templates in `src/lib/email-templates.ts` (order confirmation email to customer, warehouse notification email to `WAREHOUSE_NOTIFICATION_EMAIL`)
- Google Sheets API calls (append/update) - `src/lib/google-sheets.ts`, triggered from the Stripe webhook and admin order-update endpoints (`src/app/api/admin/orders/[id]/route.ts`)

---

*Integration audit: 2026-07-03*
