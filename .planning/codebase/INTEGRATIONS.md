# External Integrations

**Analysis Date:** 2026-06-17

## APIs & External Services

**Payment Processing:**
- Stripe - Payment processing for e-commerce checkout
  - SDK/Client: `stripe` (20.0.0) for server-side, `@stripe/stripe-js` (8.5.3) for client-side
  - Auth: `STRIPE_SECRET_KEY` (server environment only), `STRIPE_WEBHOOK_SECRET`
  - Public key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Usage: `src/app/api/stripe/create-checkout-session/route.ts`, `src/app/api/stripe/webhook/route.ts`
  - Supported payment methods: Card, Apple Pay, Google Pay (Klarna and Afterpay mocked for POC)

**E-Commerce Product Data:**
- Shopify Storefront API - Product data fetching via GraphQL
  - SDK/Client: Raw `fetch` to Shopify GraphQL endpoint (no SDK)
  - Auth: `SHOPIFY_STOREFRONT_ACCESS_TOKEN` header
  - Config: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_API_VERSION` (default: 2024-10), `SHOPIFY_PRODUCT_HANDLE` (default: dips-chocolate)
  - Usage: `src/lib/shopify-client.ts`, `src/lib/shopify.ts`, `src/lib/shopify-product.ts`
  - Data retrieved: Product details, variants, pricing, inventory, images

**Business Operations:**
- Google Sheets API - Order data logging and fulfillment tracking
  - SDK/Client: `googleapis` (171.4.0) with GoogleAuth
  - Auth: Service account credentials (`GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`)
  - Config: `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_SHEET_NAME` (default: Orders)
  - Usage: `src/lib/google-sheets.ts` (called from `src/app/api/stripe/webhook/route.ts` and admin order updates)
  - Operations: Append order rows on payment confirmation, update fulfillment columns (AA-AD) when order status changes

## Data Storage

**Databases:**
- PostgreSQL
  - Connection: `DATABASE_URL` environment variable
  - Client: Prisma ORM with `@prisma/adapter-pg` adapter
  - Schema: `prisma/schema.prisma` with models for orders, affiliates, commissions, stripe events, admin users

**File Storage:**
- Local filesystem only (no cloud storage configured)
- Image URLs sourced from Shopify CDN (`cdn.shopify.com`)

**Caching:**
- None explicitly configured
- Browser-level: localStorage for attribution data (30-day TTL), sessionStorage for checkout context

## Authentication & Identity

**Affiliate Auth:**
- Magic link tokens (one-time use, 15-minute TTL)
  - Model: `AffiliateLoginToken` in `src/generated/prisma/client/models/AffiliateLoginToken.ts`
  - Implementation: Token-based stateless login in `src/app/api/affiliates/login/route.ts`, `src/app/api/affiliates/verify/route.ts`
  - Storage: Tokens stored in PostgreSQL with expiration

**Admin Auth:**
- Password-based authentication (bcryptjs hashing)
  - Model: `AdminUser` in schema
  - Implementation: Email + password login in `src/app/api/admin/login/route.ts`
  - Storage: Hashed passwords in `AdminUser.passwordHash`

**Stripe Webhooks:**
- HMAC-SHA256 signature verification
  - Secret: `STRIPE_WEBHOOK_SECRET`
  - Verification: `stripe.webhooks.constructEvent()` in `src/app/api/stripe/webhook/route.ts`
  - Idempotency: `StripeEvent` model logs processed event IDs to prevent duplicate processing

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Rollbar, or similar)

**Logs:**
- Console logging (console.log, console.error) to stdout/stderr
- Examples: Email sending status (`src/lib/email.ts`), Google Sheets sync results (`src/lib/google-sheets.ts`)

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured; assumes deployment to Vercel (Next.js native) or similar Node.js platform

**CI Pipeline:**
- Not detected in codebase

## Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `STRIPE_WEBHOOK_SECRET` - Webhook HMAC signing secret
- `STRIPE_SHIPPING_RATE_ID` - Stripe shipping rate identifier
- `STRIPE_PRICE_1X`, `STRIPE_PRICE_2X`, `STRIPE_PRICE_3X` - Product price IDs in Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key (inlined at build time)
- `SHOPIFY_STORE_DOMAIN` - Shopify store domain (e.g., `mystore.myshopify.com`)
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Shopify GraphQL Storefront API token
- `GOOGLE_SHEETS_SPREADSHEET_ID` - Google Sheets spreadsheet ID
- `GOOGLE_SHEETS_CLIENT_EMAIL` - Google service account email
- `GOOGLE_SHEETS_PRIVATE_KEY` - Google service account private key (newline-escaped)
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (465 for secure, other for STARTTLS)
- `SMTP_USER` - SMTP authentication username
- `SMTP_PASS` - SMTP authentication password
- `SMTP_FROM_EMAIL` - Sender email address
- `SMTP_FROM_NAME` - Sender display name (default: Dips Chocolate)

**Optional Environment Variables:**
- `SHOPIFY_PRODUCT_HANDLE` - Product slug (default: dips-chocolate)
- `SHOPIFY_API_VERSION` - Shopify API version (default: 2024-10)
- `GOOGLE_SHEETS_SHEET_NAME` - Worksheet name (default: Orders)
- `NEXT_PUBLIC_SITE_URL` - Frontend URL for redirects (default: http://localhost:3000)
- `NEXT_PUBLIC_META_PIXEL_ID` - Meta Pixel ID for Facebook tracking
- `NEXT_PUBLIC_GA4_ID` - Google Analytics 4 measurement ID
- `NEXT_PUBLIC_GOOGLE_ADS_ID` - Google Ads conversion ID
- `NEXT_PUBLIC_GOOGLE_ADS_LABEL` - Google Ads conversion label

**Secrets Location:**
- `.env` file (local development, not committed)
- `.env.local` file (local overrides, not committed)
- Environment variables in deployment platform (Vercel, Docker, etc.)
- Never commit `.env`, `.env.local`, or files containing secrets

## Webhooks & Callbacks

**Incoming:**
- **Stripe Webhook Endpoint:** `POST /api/stripe/webhook`
  - Events listened: `checkout.session.completed`
  - Actions: Create Order record, send confirmation email, log to Google Sheets, create Commission record
  - Signature verification: HMAC-SHA256 with `STRIPE_WEBHOOK_SECRET`
  - Idempotency: Tracked via `StripeEvent` table to prevent duplicate processing
  - Code: `src/app/api/stripe/webhook/route.ts`

**Outgoing:**
- **Stripe Checkout Sessions:** Redirects to Stripe-hosted checkout via `stripe.checkout.sessions.create()`
  - Client reference for attribution stored in checkout metadata
  - Code: `src/app/api/stripe/create-checkout-session/route.ts`
- **Email Notifications:**
  - Order confirmation → Customer email
  - Warehouse notification → Admin email (when order paid)
  - Shipped notification → Customer email (triggered manually by admin)
  - Implementation: `src/lib/email.ts` using Nodemailer SMTP
- **Google Sheets Updates:**
  - Append order row on payment completion (webhook)
  - Update fulfillment columns (AA-AD) when admin updates order status
  - Implementation: `src/lib/google-sheets.ts`

## Tracking & Analytics

**Client-Side Tracking (Browser):**
- Meta Pixel (Facebook Conversions API)
  - Config: `NEXT_PUBLIC_META_PIXEL_ID`
  - Events: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
  - Implementation: `src/lib/tracking.ts`, `src/components/TrackingProvider.tsx`

- Google Analytics 4
  - Config: `NEXT_PUBLIC_GA4_ID`
  - Events: view_item, add_to_cart, begin_checkout, purchase
  - Implementation: `src/lib/tracking.ts`, `src/components/TrackingProvider.tsx`

- Google Ads Conversion Tracking
  - Config: `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_LABEL`
  - Event: conversion (fired on purchase)
  - Implementation: `src/lib/tracking.ts`

**Server-Side Tracking:**
- Attribution capture: ref code (influencer), utm_source, utm_medium, utm_campaign
  - Captured on first page visit (client-side via `captureAttribution()`)
  - Persisted in localStorage (30-day TTL)
  - Forwarded to Stripe metadata on checkout (`influencerRef`, `utmSource`, `utmMedium`, `utmCampaign`, `landingPage`)
  - Implementation: `src/lib/tracking.ts`

---

*Integration audit: 2026-06-17*
