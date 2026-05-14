<!-- refreshed: 2026-05-14 -->
# Architecture

**Analysis Date:** 2026-05-14

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Browser (Next.js Client)                            │
│                                                                          │
│  Storefront Pages              Admin Pages                               │
│  `src/app/[locale]/*`          `src/app/admin/*`                         │
│                                                                          │
│  React Context Layer:                                                    │
│  CartContext · CustomerContext · TrackingProvider                        │
│  `src/contexts/`               `src/components/TrackingProvider.tsx`    │
└─────────────┬───────────────────────────────┬───────────────────────────┘
              │ fetch()                        │ Server Components (RSC)
              ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router (Server)                        │
│                                                                          │
│  API Routes                   Server Components                          │
│  `src/app/api/`               `src/app/[locale]/`                        │
│                               `src/app/admin/`                           │
│                                                                          │
│  Service Layer  `src/lib/`                                               │
│  orders.ts · affiliates.ts · shopify.ts · email.ts · tracking.ts        │
└────────┬──────────────┬────────────────┬───────────────┬────────────────┘
         │              │                │               │
         ▼              ▼                ▼               ▼
    PostgreSQL      Shopify          Stripe          SMTP +
    (Prisma)     Storefront API    Checkout +       Google
  `src/lib/        `src/lib/        Webhooks        Sheets
  prisma.ts`      shopify*.ts`    `src/lib/       `src/lib/
                                   stripe.ts`    google-sheets.ts`
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Middleware | i18n routing, admin auth gate | `src/middleware.ts` |
| LocaleLayout | Provider tree (i18n, cart, customer, tracking) | `src/app/[locale]/layout.tsx` |
| AdminLayout | Admin nav, secondary auth check | `src/app/admin/layout.tsx` |
| CartContext | Client-side cart state, persisted to localStorage | `src/contexts/CartContext.tsx` |
| CustomerContext | Mock customer session, wishlist (demo/POC) | `src/contexts/CustomerContext.tsx` |
| TrackingProvider | Captures URL attribution params on mount | `src/components/TrackingProvider.tsx` |
| BuyNowButton | Initiates Stripe checkout, fires tracking events | `src/components/BuyNowButton.tsx` |
| create-checkout-session | Creates Stripe Checkout Session with product/attribution metadata | `src/app/api/stripe/create-checkout-session/route.ts` |
| stripe/webhook | Idempotent webhook: creates Order, triggers email + Sheets sync | `src/app/api/stripe/webhook/route.ts` |
| lib/orders | All Order CRUD, pagination, stats, dashboard data | `src/lib/orders.ts` |
| lib/affiliates | Affiliate + Commission CRUD, state machine | `src/lib/affiliates.ts` |
| lib/shopify | Product data from Shopify Storefront API | `src/lib/shopify.ts` |
| lib/pricing | Locale-to-currency mapping (en→USD, pt→BRL, es→EUR) | `src/lib/pricing.ts` |
| lib/email | Nodemailer SMTP transport | `src/lib/email.ts` |
| lib/google-sheets | Warehouse mirror spreadsheet (append + update ops) | `src/lib/google-sheets.ts` |
| lib/tracking | Meta Pixel, GA4, Google Ads events; attribution capture/read | `src/lib/tracking.ts` |
| lib/prisma | Singleton Prisma client with PrismaPostgres adapter | `src/lib/prisma.ts` |

## Pattern Overview

**Overall:** Next.js 15 App Router with a thin service layer — Server Components fetch directly from `src/lib/` services, Client Components hit API routes.

**Key Characteristics:**
- Server Components handle all data fetching for admin and storefront pages; no client-side data fetching for page content
- API routes are the sole integration surface for client components that need server actions (checkout, admin mutations)
- Middleware handles two cross-cutting concerns: i18n locale routing and admin cookie-based auth
- All monetary values stored and transmitted as integer cents (USD) — conversion happens at display boundaries
- Stripe webhook is the canonical source of truth for order creation; no order is written outside the webhook handler

## Layers

**Presentation (Pages):**
- Purpose: Route-level UI, composes components, fetches from service layer
- Location: `src/app/[locale]/` (storefront), `src/app/admin/` (admin)
- Contains: Server Components (async page.tsx), Client Components co-located where interactivity is needed
- Depends on: `src/lib/`, `src/components/`, `src/contexts/`
- Used by: Next.js router

**API Routes:**
- Purpose: Server-side mutations and integrations callable from the browser
- Location: `src/app/api/`
- Contains: `route.ts` files — Stripe checkout, Stripe webhook, admin CRUD endpoints
- Depends on: `src/lib/`
- Used by: Client Components (fetch), Stripe webhooks

**Service Layer:**
- Purpose: All business logic, database queries, and external integrations
- Location: `src/lib/`
- Contains: orders.ts, affiliates.ts, shopify*.ts, email.ts, google-sheets.ts, pricing.ts, tracking.ts, admin-auth.ts
- Depends on: `src/generated/prisma/`, external SDKs (Stripe, googleapis, nodemailer)
- Used by: Pages (Server Components), API routes

**Context / Client State:**
- Purpose: React state shared across the client component tree
- Location: `src/contexts/`
- Contains: CartContext (localStorage-backed cart), CustomerContext (demo mock session)
- Depends on: `src/data/products.ts` (for CartItem shape)
- Used by: Client Components throughout the storefront

**Static Data:**
- Purpose: Hardcoded product definitions and mock data for POC features
- Location: `src/data/`
- Contains: products.ts, customers.ts, orders.ts, inventory.ts
- Depends on: nothing
- Used by: CartContext, CustomerContext, storefront pages that reference product data

**i18n:**
- Purpose: next-intl routing configuration, locale detection
- Location: `src/i18n/`
- Contains: routing.ts (locales: en/es/pt), request.ts
- Depends on: next-intl
- Used by: Middleware, LocaleLayout

## Data Flow

### Storefront Purchase (Primary Path)

1. User lands on product page with `?ref=influencer&utm_source=...` — `TrackingProvider` mounts (`src/components/TrackingProvider.tsx`) and calls `captureAttribution()` to persist to localStorage (30-day TTL, first-touch)
2. User clicks "Buy Now" in `BuyNowButton` (`src/components/BuyNowButton.tsx`):
   - Fires `trackBeginCheckout()` (Meta Pixel + GA4)
   - Saves `PendingCheckout` to sessionStorage
   - Calls `POST /api/stripe/create-checkout-session` with `{ quantity, locale, attribution }`
3. `create-checkout-session` route (`src/app/api/stripe/create-checkout-session/route.ts`):
   - Fetches product from Shopify via `getPurchasableDipsProduct()` (`src/lib/shopify-product.ts`)
   - Resolves locale-to-currency via `getLocalizedPricing()` (`src/lib/pricing.ts`)
   - Creates Stripe Checkout Session with product metadata and attribution metadata
   - Returns `{ ok: true, url }` — client redirects to Stripe-hosted checkout
4. Stripe redirects to `/{locale}/checkout/success?session_id=...`
5. Success page (`src/app/[locale]/checkout/success/page.tsx`) fires `trackPurchase()` using sessionStorage data
6. Stripe delivers `checkout.session.completed` webhook to `POST /api/stripe/webhook`:
   - Verifies Stripe signature
   - Opens `prisma.$transaction()` — first writes `StripeEvent` record (idempotency claim)
   - Creates `Order` + `OrderItem` records
   - If `influencerRef` matches an active `Affiliate`, creates `Commission` record
   - Captures email data for post-transaction dispatch
7. After transaction commits: sends order confirmation email via `sendOrderConfirmationEmail()` (`src/lib/email-templates.ts`) + syncs row to Google Sheets via `appendOrderToSheet()` (`src/lib/google-sheets.ts`) + sends warehouse notification email

### Admin Order Management

1. Admin navigates to `/admin/orders` — middleware validates `admin_token` cookie (`src/middleware.ts`)
2. `AdminOrdersPage` Server Component (`src/app/admin/orders/page.tsx`) calls `getOrders()`, `getOrderStats()`, `getDashboardData()` from `src/lib/orders.ts` in parallel
3. Client component `OrdersTable` (`src/app/admin/orders/OrdersTable.tsx`) manages row selection and bulk operations via `POST /api/admin/orders/bulk`
4. Order detail edit (`src/app/admin/orders/[id]/EditForm.tsx`) calls `PATCH /api/admin/orders/[id]/route.ts` which calls `updateOrder()` and optionally triggers fulfillment email + Google Sheets sync

### Affiliate Commission Flow

1. Admin creates affiliate via `POST /api/admin/affiliates` → `createAffiliate()` (`src/lib/affiliates.ts`)
2. Affiliate link is `https://www.dipschocolate.com/en?ref={ref}&utm_source=...` — tracked via `captureAttribution()`
3. On purchase, webhook matches `influencerRef` to `Affiliate.ref` and creates `Commission` at `commissionRate` snapshot
4. Admin transitions commission status: PENDING → APPROVED → PAID via `PATCH /api/admin/commissions/[id]` → `transitionCommission()` (`src/lib/affiliates.ts`)

**State Management:**
- Server state: Prisma/PostgreSQL (orders, affiliates, commissions, stripe events)
- Client cart state: React Context + localStorage (`CART_STORAGE_KEY = 'dpis-cart'`)
- Attribution state: localStorage with 30-day TTL (`'dips_attribution'`)
- Pending checkout context: sessionStorage (`'dips_pending_checkout'`)
- Admin session: `admin_token` cookie (compared against `ADMIN_SECRET` env var)

## Key Abstractions

**Service Functions:**
- Purpose: Thin wrappers over Prisma queries; typed inputs/outputs; Prisma types never leak to pages
- Examples: `src/lib/orders.ts`, `src/lib/affiliates.ts`
- Pattern: Functions like `getOrders(input: GetOrdersInput): Promise<PaginatedOrders>` — input shapes defined in the same file

**Localized Pricing:**
- Purpose: Maps Next-intl locale to Stripe currency and unit price
- Examples: `src/lib/pricing.ts`
- Pattern: `LOCALIZED_PRICING` record keyed by `SupportedLocale`; `getLocalizedPricing(locale)` with `en` fallback

**Shopify Product Abstraction:**
- Purpose: Decouples Stripe checkout from raw Shopify GraphQL types
- Examples: `src/lib/shopify-product.ts` → `PurchasableProduct`
- Pattern: `getPurchasableDipsProduct()` calls `getDipsProduct()` and maps to a shape safe for checkout

**Stripe Idempotency:**
- Purpose: Prevents duplicate order creation when Stripe retries webhooks
- Examples: `src/app/api/stripe/webhook/route.ts`
- Pattern: `StripeEvent.create()` is the first write in the DB transaction; P2002 on `id` means already processed — returns `{ ok: true, duplicate: true }`

## Entry Points

**Storefront:**
- Location: `src/app/[locale]/page.tsx`
- Triggers: User request to `/{locale}`
- Responsibilities: Renders landing page sections

**Admin:**
- Location: `src/app/admin/orders/page.tsx`
- Triggers: Authenticated request to `/admin/orders`
- Responsibilities: Order dashboard with stats, charts, filters, CSV export

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every request matching `['/', '/(en|es|pt)/:path*', '/admin/:path*', '/api/admin/:path*']`
- Responsibilities: Admin auth gate, i18n locale redirect

**Stripe Webhook:**
- Location: `src/app/api/stripe/webhook/route.ts`
- Triggers: Stripe POST events (`checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`)
- Responsibilities: Order creation, commission creation, confirmation email, Google Sheets sync

## Architectural Constraints

- **Threading:** Single-threaded Node.js event loop; no worker threads. Prisma uses connection pool via `PrismaPostgres` adapter.
- **Global state:** `prisma` singleton attached to `globalThis` in development to prevent hot-reload pool exhaustion (`src/lib/prisma.ts`). No other module-level mutable singletons.
- **Circular imports:** None detected.
- **Monetary precision:** All amounts stored as integer cents in PostgreSQL. Stripe amounts are also cents. Conversion to display units (divide by 100) only happens in UI formatting functions.
- **Email sends are post-transaction:** Email and Google Sheets writes happen after `prisma.$transaction()` commits. A failure in either does NOT roll back the order record.
- **Admin auth is cookie-only:** No JWT, no sessions table. `admin_token` cookie value must equal `ADMIN_SECRET` env var. Checked in Edge middleware (inline) and again in `src/lib/admin-auth.ts` for Server Components/API routes.

## Anti-Patterns

### CustomerContext uses mock/auto-login data

**What happens:** `src/contexts/CustomerContext.tsx` uses `mockCustomer` from `src/data/customers.ts` and has `autoLogin = true` hardcoded. All customers are auto-logged in as a demo user.
**Why it's wrong:** Customer-facing features (orders page, profile, wishlist) show mock data, not real data. The customer session is not real.
**Do this instead:** Replace with real auth (e.g. Supabase Auth or NextAuth) or remove the customer-facing routes until real auth is implemented.

### Static product data duplicates Shopify source of truth

**What happens:** `src/data/products.ts` contains hardcoded product definitions (prices, variants, stock). `CartContext` uses these local types. The Shopify integration (`src/lib/shopify.ts`) is used only for checkout session creation.
**Why it's wrong:** Prices in `data/products.ts` may drift from Shopify. Stock levels are static. The cart uses local prices while Stripe uses `getLocalizedPricing()` — two separate price sources.
**Do this instead:** Drive cart prices from Shopify Storefront API responses or unify through `getLocalizedPricing()` as the single price source.

## Error Handling

**Strategy:** Throw on unrecoverable errors; catch at API route boundary and return structured JSON error responses. Non-critical side effects (email, Sheets) are wrapped in try/catch and log errors without affecting the HTTP response.

**Patterns:**
- Service functions throw (Prisma errors surface as-is, or as typed errors)
- API route handlers wrap logic in try/catch; return `NextResponse.json({ ok: false, error: message }, { status: N })`
- Webhook handler uses P2002 detection to distinguish idempotent duplicates from real errors
- Tracking functions are no-ops when env vars are absent — never throw

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` / `console.warn` throughout. Structured objects passed as second argument to log calls in webhook handler. No structured logging framework.
**Validation:** Manual type checks in API routes (e.g. `typeof body.quantity === 'number'`); Prisma enforces schema constraints at DB level.
**Authentication:** Admin-only. Edge middleware checks `admin_token` cookie value against `ADMIN_SECRET`. No user auth for storefront (mock only).

---

*Architecture analysis: 2026-05-14*
