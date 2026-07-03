<!-- refreshed: 2026-07-03 -->
# Architecture

**Analysis Date:** 2026-07-03

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router (single deployable)             │
├───────────────────────────────┬──────────────────────┬──────────────────┤
│  Public storefront (i18n)     │  Admin dashboard      │  API routes      │
│  `src/app/[locale]/`          │  `src/app/admin/`     │  `src/app/api/`  │
│  Server + Client Components   │  Server Components +  │  Route Handlers  │
│                                │  "use client" tables  │  (Node runtime)  │
└───────────────┬────────────────┴──────────┬────────────┴────────┬───────┘
                │                            │                     │
                ▼                            ▼                     ▼
┌───────────────────────────┐   ┌────────────────────────┐  ┌────────────────────┐
│  `src/components/*`        │   │  `src/lib/admin-auth.ts`│  │  `src/lib/*.ts`     │
│  `src/contexts/*` (client) │   │  `src/lib/session.ts`   │  │  domain services    │
│  `src/data/*` (mock)       │   │  JWT cookie (jose)      │  │  (orders, affiliates,│
└───────────────┬────────────┘   └────────────┬────────────┘  │  email, sheets, ...) │
                │                              │                └──────────┬──────────┘
                ▼                              ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  External systems: Shopify Storefront API · Stripe Checkout/Webhooks ·           │
│  PostgreSQL (Prisma) · SMTP (nodemailer) · Google Sheets API · Meta/GA4/Ads       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

`src/middleware.ts` sits in front of every request and forks the pipeline: `/admin*` and
`/api/admin*` get JWT-cookie auth + role gating, everything else goes through
`next-intl`'s locale middleware (`src/i18n/routing.ts`).

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Locale storefront | Marketing site, live product purchase, legacy cart/checkout demo, account pages | `src/app/[locale]/` |
| Admin dashboard | Order management, affiliates, commissions, admin user management | `src/app/admin/` |
| API route handlers | Stripe checkout/webhook, admin CRUD (orders, affiliates, commissions, users, auth) | `src/app/api/` |
| Domain services (`lib`) | Business logic, external API clients, formatting, auth | `src/lib/` |
| Shared UI components | Presentational + interactive React components (server + client) | `src/components/` |
| Client-side state | Cart (localStorage) and mock customer session, both client-only React Context | `src/contexts/` |
| Mock catalog data | Hardcoded product/customer/order/review fixtures for the legacy demo UI | `src/data/` |
| Prisma ORM layer | Generated typed client, custom output path (not `node_modules`) | `src/generated/prisma/client/` |
| Middleware | Locale resolution + admin route protection, runs on the Edge runtime | `src/middleware.ts` |
| i18n config | Locale list, routing helpers, message loading | `src/i18n/routing.ts`, `src/i18n/request.ts`, `messages/*.json` |

## Pattern Overview

**Overall:** Next.js App Router monolith — server-rendered marketing site + admin
dashboard + API route handlers in one deployable, backed directly by Prisma/PostgreSQL.
No separate backend service; "API layer" = Next.js Route Handlers under `src/app/api/`.

**Key Characteristics:**
- Two independent commerce implementations coexist in the same codebase (see
  "Anti-Patterns" below) — a **live** Shopify+Stripe purchase flow and a **legacy/demo**
  mock-catalog cart+checkout flow.
- Server Components fetch data directly (Prisma, Shopify GraphQL) with no separate
  API layer for internal consumption — Route Handlers exist only for client-triggered
  mutations (Stripe session creation, webhooks, admin CRUD) and for the admin JWT auth
  boundary.
- Domain logic is grouped by concern into flat modules under `src/lib/` (`orders.ts`,
  `affiliates.ts`, `google-sheets.ts`, `email.ts`, etc.) rather than a layered
  repository/service/controller structure.
- Prisma is the single source of truth for persisted business data (orders, affiliates,
  commissions, admin users, Stripe event idempotency log).
- next-intl drives all locale-aware routing (`en`, `es`, `pt`) via a `[locale]` dynamic
  segment; the admin dashboard is intentionally locale-agnostic and lives outside that
  segment (`src/app/admin/`, `src/app/api/admin/`).

## Layers

**Presentation (App Router pages/layouts):**
- Purpose: Route composition, metadata, server-side data fetching for initial render.
- Location: `src/app/[locale]/**/page.tsx`, `src/app/admin/**/page.tsx`, `*/layout.tsx`
- Contains: Async Server Components that call `src/lib/*` or Prisma directly.
- Depends on: `src/components/*`, `src/lib/*`, `@/generated/prisma/client`
- Used by: Next.js router (file-system routing)

**Components:**
- Purpose: Reusable presentational and interactive UI.
- Location: `src/components/` (feature folders: `cart/`, `checkout/`, `products/`,
  `animations/`, `ui/` for shadcn primitives)
- Contains: Server Components (default) and `"use client"` components (forms, buttons
  with local state, anything using hooks/localStorage/browser APIs).
- Depends on: `src/lib/utils.ts` (`cn`), `src/contexts/*`, `src/lib/pricing.ts`, `src/lib/tracking.ts`
- Used by: Pages/layouts

**Client state (Contexts):**
- Purpose: Client-only reactive state that must survive across pages without a server round-trip.
- Location: `src/contexts/CartContext.tsx` (localStorage-backed cart, legacy demo flow),
  `src/contexts/CustomerContext.tsx` (mock customer session)
- Depends on: `src/data/products.ts`, `src/data/customers.ts`
- Used by: `src/app/[locale]/cart`, `.../checkout`, `.../products`, `.../wishlist`, `.../profile`, `.../orders`

**Domain services (`lib`):**
- Purpose: All business logic, external API integration, and cross-cutting concerns.
- Location: `src/lib/*.ts` — one flat module per concern, no subdirectories.
- Contains: Prisma queries (`orders.ts`, `affiliates.ts`), Stripe/Shopify clients
  (`stripe.ts`, `shopify.ts`, `shopify-client.ts`, `shopify-product.ts`,
  `shopify-queries.ts`), auth (`admin-auth.ts`, `session.ts`, `password.ts`), pricing
  (`pricing.ts`), email (`email.ts`, `email-templates.ts`), integrations
  (`google-sheets.ts`), analytics (`tracking.ts`), generic helpers (`utils.ts`).
- Depends on: `src/generated/prisma/client`, external SDKs (`stripe`, `googleapis`,
  `nodemailer`, `jose`)
- Used by: API routes, Server Components, middleware (only the Edge-safe `session.ts`)

**Data access (Prisma):**
- Purpose: Typed PostgreSQL access.
- Location: `src/lib/prisma.ts` (singleton client factory with `globalThis` caching for
  dev hot-reload), `prisma/schema.prisma` (models), `src/generated/prisma/client/`
  (generated output — custom path, not the default `node_modules/@prisma/client`)
- Used by: `src/lib/orders.ts`, `src/lib/affiliates.ts`, all `src/app/api/admin/*` routes,
  `src/app/api/stripe/webhook/route.ts`, admin Server Components

**Mock/legacy data layer:**
- Purpose: In-memory fixtures backing the non-Shopify demo storefront pages.
- Location: `src/data/products.ts`, `src/data/customers.ts`, `src/data/inventory.ts`,
  `src/data/orders.ts`, `src/data/reviews.ts`
- Used by: `src/contexts/CartContext.tsx`, `src/contexts/CustomerContext.tsx`,
  `src/app/[locale]/products/`, `.../product/[slug]/`, `.../wishlist/`, `.../orders/`,
  `src/components/products/*`, `src/components/ReviewsSection.tsx`
- Note: Not connected to Prisma/PostgreSQL at all — entirely separate from the real
  `Order` model and the live purchase flow.

## Data Flow

### Primary Purchase Path (live, revenue-generating)

1. `BuySection` Server Component fetches the real product from Shopify at request time
   (`src/components/BuySection.tsx:19` → `src/lib/shopify-product.ts:17` →
   `src/lib/shopify.ts` → `src/lib/shopify-client.ts` GraphQL fetch)
2. User clicks "Buy now" → client component posts quantity/locale/attribution
   (`src/components/BuyNowButton.tsx:48` → `POST /api/stripe/create-checkout-session`)
3. Route handler re-fetches the live Shopify product, builds a Stripe Checkout Session
   with `price_data` (not a stored Stripe Price), attaches metadata (Shopify IDs,
   locale, UTM/influencer attribution), and returns the hosted checkout URL
   (`src/app/api/stripe/create-checkout-session/route.ts:65-135`)
4. Browser is redirected to Stripe-hosted checkout (`window.location.href = data.url`)
5. On completion, Stripe redirects to `/[locale]/checkout/success?session_id=...`
   (`src/app/[locale]/checkout/success/page.tsx`)
6. Independently, Stripe calls the webhook, which — inside a single Prisma transaction —
   claims the event id (idempotency), creates `Order` + `OrderItem` rows, optionally
   creates a `Commission` row if an active `Affiliate.ref` matches
   `Order.influencerRef`, then (after the tx commits) sends a confirmation email,
   appends a row to Google Sheets, and emails the warehouse — each step independently
   try/caught so failures never roll back the order or break the webhook 200 response
   (`src/app/api/stripe/webhook/route.ts:52-553`)

### Legacy/Demo Cart Path (not connected to Stripe or Prisma)

1. User browses `src/app/[locale]/products/`, `.../product/[slug]/` — data comes from
   `src/data/products.ts` (in-memory array), not Shopify.
2. `useCart()` (`src/contexts/CartContext.tsx`) persists cart items to
   `localStorage` under `dpis-cart`.
3. `src/app/[locale]/checkout/page.tsx` renders `CheckoutForm`
   (`src/components/checkout/CheckoutForm.tsx`) — submission only `console.log`s the
   payment method and clears the cart; no network call, no Stripe session, no `Order`
   row is ever created.
4. Redirects to `/[locale]/checkout/success` with no real order behind it.

### Admin Auth Flow

1. `POST /api/admin/login` — bootstraps the first `AdminUser` (SUPER_ADMIN) using
   `ADMIN_SECRET` as a one-time master key when `AdminUser` count is 0; otherwise
   verifies email + scrypt password hash (`src/lib/password.ts`)
   (`src/app/api/admin/login/route.ts:26-100`)
2. On success, signs an HS256 JWT (`src/lib/session.ts:35`) containing `sub`, `email`,
   `name`, `role` and sets it as an `httpOnly` cookie (`admin_token`, 8h max-age)
3. `src/middleware.ts` runs on every request; for `/admin*` and `/api/admin*` it
   verifies the cookie via `verifySessionToken` (Edge-safe, uses `jose` not
   `node:crypto`), redirects/401s if missing, and additionally gates
   `/admin/users` + `/api/admin/users` to `role === 'SUPER_ADMIN'`
4. `src/lib/admin-auth.ts` (`getAdminSession`, `isAdminAuthenticated`,
   `requireSuperAdmin`) provides Node-runtime cookie/session helpers for Server
   Components and Route Handlers that need the same check again (middleware match
   patterns can miss nested routes, so handlers re-check).

**State Management:**
- Server state: Prisma/PostgreSQL is authoritative for orders, affiliates,
  commissions, admin users, and Stripe event dedup.
- Client state: `CartContext` and `CustomerContext` are React Context + `useState`,
  persisted only to `localStorage`, scoped to the legacy demo flow.
- Session state: stateless — the JWT itself is the full session payload; no server-side
  session store.

## Key Abstractions

**Route Handler pattern (API layer):**
- Purpose: Thin Next.js Route Handlers (`export async function GET/POST/PATCH`) that
  validate input, call a `src/lib/*` service function, and return `NextResponse.json`.
- Examples: `src/app/api/admin/orders/[id]/route.ts`,
  `src/app/api/admin/affiliates/route.ts`, `src/app/api/admin/commissions/[id]/route.ts`
- Pattern: parse/validate body → re-check auth (`isAdminAuthenticated`/
  `requireSuperAdmin`) even though middleware already gated the route → call
  `src/lib/*` function → map errors to status codes.

**Prisma-derived domain types:**
- Purpose: Avoid re-declaring types; derive request/response shapes from
  `Prisma.<Model>GetPayload<...>` and re-export enums so consumers never import
  `@/generated/prisma/client` directly.
- Examples: `src/lib/orders.ts:15-16` (`Order`, `OrderItem`), `src/lib/affiliates.ts:10-40`
  (`AffiliateRow`, `CommissionRow` — Decimal fields explicitly converted to `number`
  at the service boundary).

**Idempotency ledger (`StripeEvent`):**
- Purpose: Guarantee webhook events are processed exactly once by using
  `tx.stripeEvent.create` as the first statement in a Prisma transaction — a P2002
  unique-constraint violation on `event.id` acts as an atomic "already processed" check.
- Examples: `prisma/schema.prisma:255-262` (model), `src/app/api/stripe/webhook/route.ts:93-97`

**Locale-aware formatting:**
- Purpose: Centralize currency/weight/price formatting so every component displays
  consistent localized values.
- Examples: `src/lib/pricing.ts` (`getLocalizedPricing`, `formatLocalizedPrice`,
  `getWeightLabel`, `isSupportedLocale`)

**Attribution capture (marketing):**
- Purpose: First-touch UTM/influencer-ref capture on landing, persisted client-side,
  forwarded through checkout metadata into the `Order` row for commission attribution.
- Examples: `src/lib/tracking.ts` (`captureAttribution`, `getAttribution`,
  `savePendingCheckout`), invoked from `src/components/TrackingProvider.tsx:17`,
  consumed in `src/app/api/stripe/create-checkout-session/route.ts:44-63`

## Entry Points

**Public storefront root:**
- Location: `src/app/[locale]/page.tsx`
- Triggers: Any request to `/`, `/en`, `/es`, `/pt`
- Responsibilities: Composes the marketing homepage (`Header`, `Hero`, `AboutSection`,
  `IngredientsSection`, `ProductSection`, `WhyDipsSection`, `BuySection` [live purchase],
  `ReviewsSection`, `FAQSection`, `Footer`)

**Locale root layout:**
- Location: `src/app/[locale]/layout.tsx`
- Triggers: Every route under `[locale]`
- Responsibilities: Validates locale, loads i18n messages, wraps the tree in
  `CustomerProvider` → `CartProvider` → `TrackingProvider`

**Admin root layout:**
- Location: `src/app/admin/layout.tsx`
- Triggers: Every route under `/admin`
- Responsibilities: Reads session (`getAdminSession`), renders bare shell if
  unauthenticated (login page), otherwise renders the admin nav (Orders, Affiliates,
  Commissions, and Users for SUPER_ADMIN only) plus account/logout links.

**Edge middleware:**
- Location: `src/middleware.ts`
- Triggers: Matches `['/', '/(en|es|pt)/:path*', '/admin/:path*', '/api/admin/:path*']`
- Responsibilities: Admin auth gate + role gate; otherwise delegates to `next-intl`
  middleware for locale detection/redirects.

**Stripe webhook:**
- Location: `src/app/api/stripe/webhook/route.ts`
- Triggers: Stripe-initiated POST on `checkout.session.completed`,
  `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Responsibilities: Sole writer of `Order`/`OrderItem`/`Commission` rows for the live flow.

**Admin bootstrap script:**
- Location: `scripts/create-admin.ts` (run via `npm run create-admin`)
- Triggers: Manual CLI invocation
- Responsibilities: Out-of-band way to create/reset an `AdminUser` outside the
  login-bootstrap flow.

## Architectural Constraints

- **Threading:** Single-threaded Node.js request handling per Next.js Route Handler
  invocation (serverless/Node runtime); no worker threads or background job queue —
  all post-webhook side effects (email, Sheets sync, warehouse notification) run
  synchronously (`await`ed) inside the same request before responding to Stripe.
- **Runtime split:** `src/lib/session.ts` must stay Edge-runtime-safe (uses `jose`,
  no `node:crypto`/`next/headers`/Prisma) because it is imported by both
  `src/middleware.ts` (Edge) and Node-runtime code (`src/lib/admin-auth.ts`). This is
  called out explicitly in a comment at `src/lib/session.ts:3-10`.
- **Global state:** `src/lib/prisma.ts:17-23` attaches the Prisma client to
  `globalThis` in non-production to survive Next.js dev hot-reload without exhausting
  the Postgres connection pool — a deliberate singleton, not accidental shared state.
- **Dual auth checks:** Admin routes are checked twice — once in `src/middleware.ts`
  and again inside each Route Handler/Server Component via `src/lib/admin-auth.ts`
  — because middleware `matcher` patterns can miss nested dynamic segments.
- **No background job system:** Email sending, Google Sheets sync, and warehouse
  notification in the Stripe webhook are all best-effort, in-request, independently
  try/caught calls — none are queued/retried outside of Stripe's own webhook retry
  mechanism (`src/app/api/stripe/webhook/route.ts:441-539`).

## Anti-Patterns

### Two parallel, disconnected commerce systems

**What happens:** The codebase contains a fully-wired live purchase flow
(Shopify product + Stripe Checkout + Prisma `Order` persistence, entry point
`src/components/BuySection.tsx` → `src/components/BuyNowButton.tsx`) and, in parallel,
a legacy/demo flow with its own mock product catalog, cart, and checkout page
(`src/data/products.ts`, `src/contexts/CartContext.tsx`,
`src/app/[locale]/cart/page.tsx`, `src/app/[locale]/checkout/page.tsx`,
`src/components/checkout/CheckoutForm.tsx`) that never calls Stripe or Prisma —
its "checkout" only `console.log`s and clears `localStorage`.
**Why it's wrong:** Anyone extending "checkout" or "cart" behavior can easily edit
the wrong flow (the one that doesn't touch real money/orders) and believe it's live.
The two systems also each define a different notion of "Product" (real Shopify
product vs. `src/data/products.ts` mock objects with `ProductVariant`).
**Do this instead:** Treat `src/app/[locale]/cart/`, `.../checkout/` (non-success),
`src/contexts/CartContext.tsx`, `src/components/checkout/CheckoutForm.tsx`, and
`src/data/products.ts` as legacy/demo-only. New purchase-flow work belongs in the
Shopify+Stripe path (`BuySection` → `ProductPurchaseBox` → `BuyNowButton` →
`/api/stripe/create-checkout-session` → webhook).

### Direct env var access with no central validation

**What happens:** Every `src/lib/*` module reads `process.env.X` directly and throws
inline (`src/lib/stripe.ts` client key has a hardcoded fallback test key;
`src/app/api/stripe/webhook/route.ts:14-18` and
`src/app/api/stripe/create-checkout-session/route.ts:6-14` throw at module load if
required secrets are missing).
**Why it's wrong:** Missing/misnamed env vars surface as runtime crashes on first
request to that route rather than at build/boot time, and there is no single place
documenting which vars are required (`STACK.md`/`INTEGRATIONS.md` had to reconstruct
this by grepping).
**Do this instead:** New integrations should still follow the existing convention
(fail fast with a clear `Error` message) but consider a startup-time check; do not
add more hardcoded fallback secrets like the demo Stripe publishable key in
`src/lib/stripe.ts:6`.

## Error Handling

**Strategy:** Route Handlers catch broadly and return `NextResponse.json({ error/ok:false }, { status })`;
Server Components mostly let errors bubble to Next.js error boundaries (no custom
`error.tsx` files were found under `src/app/`).

**Patterns:**
- Stripe webhook: outer `try/catch` returns HTTP 400 on any unexpected error (triggers
  Stripe's automatic retry), with a dedicated inner `catch` that treats Prisma `P2002`
  duplicate-key errors as a successful no-op (`{ ok: true, duplicate: true }`) instead
  of a failure (`src/app/api/stripe/webhook/route.ts:407-433`).
- Admin routes: validate input shape manually (no schema library like `zod`), return
  400 for malformed JSON/body shape, 401/403 for auth failures, propagate Prisma errors
  as 500 by default.
- Non-critical side effects (email, Google Sheets, warehouse notification) are each
  wrapped in their own `try/catch` with `console.error` — a failure in one never
  prevents the others or affects the HTTP response already being built
  (`src/app/api/stripe/webhook/route.ts:461-539`).

## Cross-Cutting Concerns

**Logging:** `console.log`/`console.warn`/`console.error` with emoji-prefixed messages
and structured object payloads (e.g. `console.log('✅ checkout.session.completed — order created', {...})`
in `src/app/api/stripe/webhook/route.ts`); no external logging/observability SDK detected.

**Validation:** Manual, inline (typeof checks, allow-lists like
`VALID_FULFILLMENT_STATUSES` in `src/app/api/admin/orders/[id]/route.ts:9-15`); no
schema validation library (`zod`, `yup`, etc.) is used anywhere in `src/`.

**Authentication:** Custom JWT-cookie auth for the admin dashboard only
(`src/lib/session.ts`, `src/lib/admin-auth.ts`); the public storefront has no customer
authentication — `CustomerContext` is mock/local-only state, not tied to any backend
identity.

---

*Architecture analysis: 2026-07-03*
