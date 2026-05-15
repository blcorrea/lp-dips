# External Integrations

**Analysis Date:** 2026-05-14

## APIs & External Services

**Payments:**
- Stripe - Hosted checkout sessions, payment intents, webhooks, and refund tracking
  - SDK/Client (server): `stripe` package; instantiated in `src/app/api/stripe/create-checkout-session/route.ts` and `src/app/api/stripe/webhook/route.ts`
  - SDK/Client (browser): `@stripe/stripe-js`; loaded via `src/lib/stripe.ts`
  - Auth (server secret): `STRIPE_SECRET_KEY`
  - Auth (publishable): `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Webhook secret: `STRIPE_WEBHOOK_SECRET`
  - Supported payment methods: Card, Apple Pay, Google Pay (PayPal, Klarna, Afterpay noted as unsupported stubs in `src/lib/stripe.ts`)

**Product Catalog:**
- Shopify Storefront API (GraphQL) - Product data and availability lookup only; checkout is handled by Stripe, not Shopify
  - Client: custom `shopifyFetch` wrapper in `src/lib/shopify-client.ts`
  - GraphQL queries: `src/lib/shopify-queries.ts`
  - Product helper: `src/lib/shopify-product.ts`; `src/lib/shopify.ts`
  - Auth: `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (sent as `X-Shopify-Storefront-Access-Token` header)
  - Store domain: `SHOPIFY_STORE_DOMAIN`
  - API version: `SHOPIFY_API_VERSION` (default `2024-10`)
  - Product handle: `SHOPIFY_PRODUCT_HANDLE` (default `dips-chocolate`)
  - Image CDN: `cdn.shopify.com` whitelisted in `next.config.mjs` for `next/image`

**Google Sheets (Warehouse Mirror):**
- Google Sheets API v4 - Operational order log written after each successful Stripe payment; admin updates fulfillment/tracking columns back into the sheet
  - SDK: `googleapis` package; `src/lib/google-sheets.ts`
  - Auth: Google Service Account credentials (JWT)
  - Env vars: `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SHEET_NAME` (default `Orders`)
  - Scope: `https://www.googleapis.com/auth/spreadsheets`

## Data Storage

**Databases:**
- PostgreSQL via Prisma ORM
  - Recommended providers: Neon (serverless; pooled connections) or Supabase (per `.env.example`)
  - Connection: `DATABASE_URL` environment variable
  - Client: `PrismaClient` with `PrismaPg` adapter; singleton in `src/lib/prisma.ts`
  - Generated client output: `src/generated/prisma/client/`
  - Schema: `prisma/schema.prisma`
  - Migrations: `prisma/migrations/`
  - Tables: `Order`, `OrderItem`, `Affiliate`, `Commission`, `StripeEvent` (idempotency log)

**File Storage:**
- Local filesystem only — `public/images/`, `public/videos/`, `public/fonts/`
- Shopify CDN (`cdn.shopify.com`) used for product images fetched from Storefront API

**Caching:**
- None — Shopify fetches use `cache: 'no-store'` (see `src/lib/shopify-client.ts`)

## Authentication & Identity

**Admin Auth:**
- Custom cookie-based session (no third-party auth provider)
  - Implementation: `src/lib/admin-auth.ts`
  - Cookie name: `admin_token`; TTL: 8 hours
  - Validation: cookie value must equal `ADMIN_SECRET` env var
  - Login route: `src/app/api/admin/login/`
  - Protected admin UI: `src/app/admin/`

**Customer Auth:**
- Not detected — customers are identified by email at checkout via Stripe; no account/session system

## Monitoring & Observability

**Analytics — Google Analytics 4:**
- Client-side event tracking via `gtag`; `src/lib/tracking.ts`
- Events: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
- Env var: `NEXT_PUBLIC_GA4_ID`

**Analytics — Google Ads Conversions:**
- Client-side conversion tracking via `gtag`; `src/lib/tracking.ts`
- Env vars: `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_LABEL`

**Analytics — Meta Pixel:**
- Client-side event tracking via `window.fbq`; `src/lib/tracking.ts`
- Events: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`
- Env var: `NEXT_PUBLIC_META_PIXEL_ID`

**Error Tracking:**
- None detected — errors logged to `console.error`

**Logs:**
- `console.log` / `console.error` with structured objects throughout API route handlers and lib files

## CI/CD & Deployment

**Hosting:**
- Vercel (strongly implied by Neon recommendation and Next.js 15 App Router usage)

**CI Pipeline:**
- None detected in source tree

## Email

**Transactional Email (SMTP):**
- Provider: Zoho Mail (per `.env.example`; any SMTP host supported)
  - Library: `nodemailer`; `src/lib/email.ts`
  - Template builder: `src/lib/email-templates.ts`
  - Triggers: order confirmation to customer (post-webhook), warehouse notification to internal inbox
  - Env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`
  - Warehouse recipient: `WAREHOUSE_NOTIFICATION_EMAIL`
  - Warehouse sheet link (optional): `WAREHOUSE_SHEET_URL`

## Environment Configuration

**Required env vars (all must be set for production):**
- `DATABASE_URL` — PostgreSQL connection string
- `STRIPE_SECRET_KEY` — Server-side Stripe secret
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signature verification
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Client-side Stripe key
- `NEXT_PUBLIC_SITE_URL` — Absolute base URL for Stripe redirect URLs
- `SHOPIFY_STORE_DOMAIN` — Shopify store domain
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — Shopify Storefront API access token
- `ADMIN_SECRET` — Shared secret for admin cookie auth
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP credentials
- `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY` — Google Sheets service account

**Optional env vars:**
- `SHOPIFY_API_VERSION` (default `2024-10`)
- `SHOPIFY_PRODUCT_HANDLE` (default `dips-chocolate`)
- `GOOGLE_SHEETS_SHEET_NAME` (default `Orders`)
- `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`
- `WAREHOUSE_NOTIFICATION_EMAIL`, `WAREHOUSE_SHEET_URL`
- `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_LABEL`

**Secrets location:**
- `.env` and `.env.local` at project root (gitignored); `.env.example` documents all keys

## Webhooks & Callbacks

**Incoming:**
- `POST /api/stripe/webhook` (`src/app/api/stripe/webhook/route.ts`) — receives Stripe events:
  - `checkout.session.completed` → creates Order + OrderItems + Commission (if affiliate ref present); sends confirmation email; syncs to Google Sheets; sends warehouse notification
  - `payment_intent.succeeded` → updates order `paymentStatus` to PAID
  - `payment_intent.payment_failed` → sets order status to CANCELLED
  - `charge.refunded` → sets order to REFUNDED; cancels PENDING/APPROVED commissions
  - Idempotency enforced via `StripeEvent` table (atomic DB claim on `event.id`)

**Outgoing:**
- Stripe: `POST` to Stripe API for checkout session creation (`src/app/api/stripe/create-checkout-session/route.ts`)
- Shopify: `POST` to `https://{SHOPIFY_STORE_DOMAIN}/api/{version}/graphql.json` for product queries (`src/lib/shopify-client.ts`)
- Google Sheets: Sheets API v4 `batchUpdate` and `append` (`src/lib/google-sheets.ts`)
- SMTP: outbound emails via nodemailer (`src/lib/email.ts`)

---

*Integration audit: 2026-05-14*
