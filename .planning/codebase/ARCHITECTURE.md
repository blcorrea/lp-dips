<!-- refreshed: 2026-06-17 -->
# Architecture

**Analysis Date:** 2026-06-17

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│            Next.js App Router (Pages & APIs)                │
│  ├── Customer Storefront [locale]/...                       │
│  ├── Admin Dashboard /admin/...                             │
│  └── API Routes /api/...                                    │
├──────────────────┬──────────────────┬───────────────────────┤
│   Client Layer   │   Server Layer   │    Edge Middleware    │
│  (React Hooks)   │  (Server Comps)  │   (Authentication)    │
│  `src/app/`      │  `src/lib/`      │   `src/middleware.ts` │
│  `src/contexts/` │  (Route Handlers)│                       │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Business Logic & Integration Layer               │
│  • Auth (Admin, Affiliate): `src/lib/admin-auth.ts`,        │
│    `src/lib/affiliate-auth.ts`                              │
│  • Orders & Commissions: `src/lib/orders.ts`                │
│  • Email Templates: `src/lib/email-templates.ts`            │
│  • External Services: Stripe, Shopify, Google Sheets        │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│               Data Access Layer (Prisma ORM)                │
│  PostgreSQL Database Connection via Prisma Adapter          │
│  `src/lib/prisma.ts` (singleton instance)                   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  External Integrations (Storage, Payment, Email, Tracking)  │
│  • PostgreSQL Database                                      │
│  • Stripe (Payments)                                        │
│  • Shopify (Products)                                       │
│  • SMTP (Email via Nodemailer)                              │
│  • Google Sheets (Commission tracking)                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **Customer Pages** | Multi-language storefront with product browsing, cart, checkout, orders | `src/app/[locale]/` |
| **Admin Pages** | Order management, affiliate management, commission tracking, user management | `src/app/admin/` |
| **API Routes** | RESTful endpoints for checkout, order updates, affiliate operations, admin functions | `src/app/api/` |
| **Contexts (Client)** | Global client state for cart and customer data via React Context | `src/contexts/CartContext.tsx`, `CustomerContext.tsx` |
| **Auth Middleware** | Edge Runtime cookie validation + redirect logic for admin and affiliate routes | `src/middleware.ts` |
| **Admin Auth** | Server-side admin session verification via cookie + DB lookup | `src/lib/admin-auth.ts` |
| **Affiliate Auth** | Token-based affiliate authentication (magic links, session tokens) | `src/lib/affiliate-auth.ts`, `affiliate-tokens.ts` |
| **Order Logic** | Order creation, status updates, commission calculation, fulfillment | `src/lib/orders.ts` |
| **Email Service** | SMTP transporter, template rendering, async delivery | `src/lib/email.ts`, `email-templates.ts` |
| **Stripe Integration** | Checkout session creation, webhook processing, payment intent handling | `src/lib/stripe.ts`, `src/app/api/stripe/` |
| **Shopify Integration** | Product queries, variant data, inventory sync | `src/lib/shopify.ts`, `shopify-client.ts`, `shopify-product.ts` |
| **Prisma Client** | Singleton database connection with pooling via PrismaPg adapter | `src/lib/prisma.ts` |

## Pattern Overview

**Overall:** Layered Next.js 15 app with server and client components, using middleware for auth routing and server-side business logic in API routes and server components.

**Key Characteristics:**
- **Server-first approach**: Most auth, data fetching, and side effects in Server Components or Route Handlers
- **Client state (local)**: Cart and customer data in React Context with localStorage persistence
- **Database-backed auth**: Admin sessions and affiliate login tokens stored in PostgreSQL
- **Async email delivery**: Email sends via `after()` callback to avoid blocking checkout
- **Commission snapshots**: Rate and amount captured at order creation time (immutable for historical payouts)
- **i18n via middleware**: next-intl middleware rewrites locale from URL; server fetches messages

## Layers

**Edge Middleware:**
- Purpose: Early-stage auth checks and locale routing before hitting the app
- Location: `src/middleware.ts`
- Contains: Cookie validation, redirect logic, i18n middleware delegation
- Depends on: Next.js Request/Response, next-intl routing config
- Used by: All routes matching `/, /en|es|pt/:path*, /admin/:path*, /api/admin/:path*`

**Page & API Layer (App Router):**
- Purpose: Route handlers and page components that serve HTTP responses
- Location: `src/app/`
  - `[locale]/`: Customer pages (products, cart, checkout, orders, affiliates)
  - `admin/`: Admin dashboard pages (orders, affiliates, commissions, users)
  - `api/`: REST endpoints for checkout, order updates, affiliate operations
- Depends on: Middleware auth, Business Logic layer
- Used by: Browsers and client applications

**Business Logic Layer:**
- Purpose: Core business operations: orders, commissions, auth, email, integrations
- Location: `src/lib/` (utility functions and services)
- Contains:
  - `admin-auth.ts` — Admin session validation
  - `affiliate-auth.ts`, `affiliate-tokens.ts` — Affiliate login & token generation
  - `orders.ts` — Order creation, status updates, commission calculation
  - `email.ts`, `email-templates.ts` — Email composition and sending
  - `stripe.ts` — Stripe API interaction (session creation, refunds)
  - `shopify.ts`, `shopify-client.ts`, `shopify-product.ts` — Product data
  - `pricing.ts` — Localized pricing logic
  - `google-sheets.ts` — Commission export to Google Sheets
  - `utils.ts` — Common helpers (formatting, validation)
- Depends on: Prisma client, external APIs (Stripe, Shopify, SMTP)
- Used by: API routes, Server Components

**Data Access Layer (Prisma):**
- Purpose: Type-safe database access with connection pooling
- Location: `src/lib/prisma.ts`
- Contains: PrismaClient singleton, PrismaPg adapter for PostgreSQL
- Depends on: PostgreSQL database, environment DATABASE_URL
- Used by: All business logic that reads/writes to DB

**Client Components:**
- Purpose: Interactive UI with client-side state (cart, filters, forms)
- Location: `src/components/`, marked with `"use client"`
- Depends on: React Context (CartContext, CustomerContext)
- Used by: Page components

**Data & Constants:**
- Purpose: Static product catalog, inventory, customer templates
- Location: `src/data/` (products, orders, inventory, reviews, customers)
- Depends on: None
- Used by: Client pages and product queries

## Data Flow

### Primary Request Path: Product Browse → Cart → Checkout → Order

1. **Customer lands on product page** (`src/app/[locale]/product/[slug]/page.tsx`)
   - Server renders page with static product data from `src/data/products.ts`
   - Client hydrates with CartProvider context (reads cart from localStorage)

2. **Customer adds product to cart** (Cart is stored in localStorage via CartContext)
   - Client-side CartContext updates `localStorage['dpis-cart']`
   - Cart persists across page reloads

3. **Customer navigates to checkout** (`src/app/[locale]/checkout/page.tsx`)
   - Server Component fetches cart state from client context
   - CheckoutForm component renders and accepts customer email, shipping address
   - On submit: POST to `src/app/api/stripe/create-checkout-session`

4. **Create checkout session** (`src/app/api/stripe/create-checkout-session/route.ts`)
   - Validates price IDs against Stripe environment variables
   - Calls Stripe API to create checkout session
   - Returns `sessionId` to client
   - Client redirects to Stripe Checkout

5. **Customer completes payment on Stripe**
   - Stripe processes payment, redirects back to `/{locale}/checkout/success` or `/checkout/cancel`

6. **Webhook processes payment** (`src/app/api/stripe/webhook/route.ts`)
   - Stripe sends `charge.succeeded` event
   - Webhook validates Stripe signature
   - Finds/creates Order in PostgreSQL
   - Calculates commission and creates Commission record (with snapshotted rate)
   - Sends confirmation email via `after()` callback (non-blocking)

7. **Admin reviews order** (`src/app/admin/orders/page.tsx`)
   - Fetches orders from PostgreSQL via `/api/admin/orders/[id]`
   - Admin can update fulfillment status
   - PATCH `/api/admin/orders/bulk` updates multiple orders
   - Email sends via `after()` callback when status changes

### Secondary Flow: Affiliate Signup → Login → Dashboard

1. **Affiliate joins** (`src/app/[locale]/affiliates/join/page.tsx`)
   - POST `/api/affiliates/join` with email and name
   - Backend validates email uniqueness via Prisma
   - Creates Affiliate record with lowercased email and slug ref code
   - Creates AffiliateLoginToken (15-min TTL)
   - Sends magic link email via Nodemailer

2. **Affiliate clicks magic link** (`src/app/[locale]/affiliates/login/page.tsx`)
   - GET `/api/affiliates/verify?token=<TOKEN>`
   - Validates token against database
   - Creates affiliate_session cookie (8-hour TTL)
   - Redirects to dashboard

3. **Affiliate dashboard** (`src/app/[locale]/affiliates/dashboard/page.tsx`)
   - Middleware checks affiliate_session cookie (Edge Runtime)
   - Server Component fetches affiliate's commissions, earnings
   - Displays orders attributed to affiliate via influencerRef

4. **Admin manages affiliates** (`src/app/admin/affiliates/page.tsx`)
   - Requires admin_token cookie (set during admin login)
   - Middleware redirects unauthenticated users to `/admin/login`
   - Admin can create, update, deactivate affiliates
   - Can export commissions to Google Sheets via `/api/admin/commissions/export`

**State Management:**
- **Client-side**: CartContext (localStorage) and CustomerContext (in-memory)
- **Server-side**: Request context via cookies (admin_token, affiliate_session)
- **Database**: Orders, Commissions, Affiliates, AdminUsers, AffiliateLoginTokens
- **Idempotency**: Stripe events logged in StripeEvent table (keyed by event ID)

## Key Abstractions

**Order:**
- Purpose: Represents a customer purchase with payment, fulfillment, and shipping tracking
- Examples: `src/lib/orders.ts`, `prisma/schema.prisma` (Order model)
- Pattern: Rich value object with enums (OrderStatus, PaymentStatus, FulfillmentStatus), address fields, and Stripe references

**Commission:**
- Purpose: Payable record snapshotted at order time (rate and amount immutable)
- Examples: `prisma/schema.prisma` (Commission model)
- Pattern: Snapshot pattern — stores affiliateId, baseAmount, rate, and calculated amount; status tracks approval/payment

**Affiliate:**
- Purpose: Referral partner with configurable commission rate
- Examples: `src/lib/affiliates.ts`, `prisma/schema.prisma` (Affiliate model)
- Pattern: Lowercased email uniqueness, slug ref code, AffiliateLoginToken for magic-link auth

**EmailPayload:**
- Purpose: Structured email envelope passed to sendEmail()
- Examples: `src/lib/email.ts`
- Pattern: Simple {to, subject, html} tuple; templates render HTML in `email-templates.ts`

**AdminUser:**
- Purpose: Multi-user admin authentication with password hashing
- Examples: `prisma/schema.prisma` (AdminUser model)
- Pattern: Email-based login, bcryptjs password hashing, 8-hour session cookie TTL

## Entry Points

**Customer Storefront:**
- Location: `src/app/[locale]/layout.tsx`
- Triggers: Browser navigation to `/{en|es|pt}/*`
- Responsibilities: Provides i18n context, CartProvider, CustomerProvider; wraps children in providers

**Admin Dashboard:**
- Location: `src/app/admin/layout.tsx`
- Triggers: Browser navigation to `/admin/*`
- Responsibilities: Auth check via `isAdminAuthenticated()`; renders navbar if authenticated; renders children (login page if not)

**Checkout Session Creator:**
- Location: `src/app/api/stripe/create-checkout-session/route.ts`
- Triggers: POST request from checkout form
- Responsibilities: Validates request, creates Stripe session, returns sessionId for redirect

**Stripe Webhook:**
- Location: `src/app/api/stripe/webhook/route.ts`
- Triggers: `charge.succeeded`, `charge.refunded` events from Stripe
- Responsibilities: Verifies signature, creates Order, calculates commission, sends email (async)

**Affiliate Signup:**
- Location: `src/app/api/affiliates/join/route.ts`
- Triggers: POST request from join form
- Responsibilities: Validates email, creates Affiliate, generates login token, sends magic link

**Affiliate Login:**
- Location: `src/app/api/affiliates/verify/route.ts`
- Triggers: GET request with token query param (from magic link)
- Responsibilities: Validates token, sets affiliate_session cookie, redirects to dashboard

**Admin Login:**
- Location: `src/app/api/admin/login/route.ts`
- Triggers: POST request with email/password or GET with logout=1
- Responsibilities: Validates credentials via bcryptjs, creates admin_token cookie, redirects

## Architectural Constraints

- **Threading:** Single-threaded event loop (Node.js). Database pool configured in PrismaPg adapter (default 10 connections). Email sends asynchronously via Nodemailer transporter.
- **Global state:** Prisma client singleton attached to `globalThis` in development to prevent connection exhaustion on hot reload (`src/lib/prisma.ts`). Module-scoped Nodemailer transporter in `src/lib/email.ts`. Stripe SDK instance created once per module load.
- **Circular imports:** None detected. Imports follow clear dependency direction: App → Business Logic → Prisma.
- **Database transaction isolation:** Stripe webhook idempotency via StripeEvent PK (Stripe event ID); multiple delivery attempts won't duplicate orders.
- **Edge Runtime limitation:** Middleware cannot import Prisma; cookie validation only via raw headers. Full auth check deferred to Server Components / Route Handlers.
- **Locale propagation:** URL-driven via next-intl middleware; all Server Components and client pages must accept `params.locale`.
- **Affiliate session scope:** Affiliate cookie independent from admin cookie; a user can have both (e.g., an affiliate who is also staff), but middleware routes admin-with-no-affiliate-cookie away from affiliate pages.

## Anti-Patterns

### Blocking Email in Checkout Response

**What happens:** Email sends synchronously within checkout session creation, delaying the Stripe redirect.
**Why it's wrong:** Long SMTP delays could timeout the request or keep the customer waiting; better to send after response is committed.
**Do this instead:** Use `after()` callback (Next.js 15+) to queue email after response. See `src/app/api/stripe/webhook/route.ts` for pattern: `after(() => sendOrderShippedEmail(...))`.

### Cart as Database Record

**What happens:** Cart stored as dedicated table in database, requiring sync logic.
**Why it's wrong:** Complicates order creation, requires cleanup, adds DB load; ephemeral client state better served by localStorage.
**Do this instead:** Keep cart in React Context with localStorage persistence (CartContext). Only commit to Order when checkout succeeds. See `src/contexts/CartContext.tsx`.

### Hardcoded Stripe Price IDs in Client

**What happens:** Frontend knows price ID, passes it directly to checkout API.
**Why it's wrong:** Price changes require code updates; validation deferred to backend allows flexibility.
**Do this instead:** Validate price ID against allow-list in API route. See `src/app/api/stripe/create-checkout-session/route.ts` lines 14–16: `const VALID_BUNDLE_PRICE_IDS = new Set(...)`.

### Real-time Commission Calculations

**What happens:** Commission amount recalculated from affiliate.commissionRate and order total when querying.
**Why it's wrong:** If commission rate changes, historical payouts appear to change; auditing fails.
**Do this instead:** Snapshot rate and calculated amount at order creation time in Commission record (immutable). See `prisma/schema.prisma` Commission model: rate stored, not recomputed.

## Error Handling

**Strategy:** Async errors logged to console; HTTP errors return JSON with status code; database errors bubble up and are caught by Next.js error boundary.

**Patterns:**
- **API route errors:** Return `NextResponse.json({ error: 'message' }, { status: ### })`. See `src/app/api/admin/orders/bulk/route.ts` lines 23–50.
- **Email errors:** Logged and re-thrown so callers know delivery failed. See `src/lib/email.ts` lines 50–54.
- **Auth errors:** Middleware redirects to login; route handlers return 401 Unauthorized.
- **Stripe errors:** Logged; webhook returns 200 to acknowledge Stripe (don't retry on our validation error).
- **Database errors:** Prisma throws; caught by Next.js error boundary and returned as 500.

## Cross-Cutting Concerns

**Logging:** Console.log with emoji prefixes (📧 for email, 📨 for success, ❌ for error). No structured logging library. See `src/lib/email.ts`, `src/lib/stripe.ts`.

**Validation:** Manual type guards and regex validation. See `src/app/api/stripe/create-checkout-session/route.ts` lines 26–50 (CLIENT_REF_PATTERN, attrString helpers). No Zod/Yup.

**Authentication:** 
- **Admin:** Cookie + database lookup for active status. See `src/lib/admin-auth.ts`.
- **Affiliate:** Cookie-based session set after magic-link verification. See `src/lib/affiliate-auth.ts`.
- **Middleware:** Cookie presence check (Edge Runtime). See `src/middleware.ts` lines 15–21.

---

*Architecture analysis: 2026-06-17*
