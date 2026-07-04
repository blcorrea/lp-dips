# Codebase Structure

**Analysis Date:** 2026-07-03

## Directory Layout

```
lp-dips/
├── prisma/
│   ├── schema.prisma          # Single-file schema: Order, OrderItem, Affiliate,
│   │                          #   Commission, AdminUser, StripeEvent + enums
│   └── migrations/            # Timestamped SQL migrations (Prisma Migrate)
├── scripts/
│   ├── create-admin.ts        # CLI: bootstrap/reset an AdminUser (npm run create-admin)
│   └── seed-affiliates.ts     # CLI: seed Affiliate rows
├── messages/                  # next-intl JSON message bundles
│   ├── en.json
│   ├── es.json
│   └── pt.json
├── public/                    # Static assets served at /
│   ├── images/
│   ├── videos/
│   └── fonts/
├── src/
│   ├── middleware.ts           # Edge middleware: admin auth gate + i18n routing
│   ├── i18n/                   # next-intl routing/message config
│   │   ├── routing.ts
│   │   └── request.ts
│   ├── app/
│   │   ├── [locale]/           # Public, locale-aware storefront (App Router)
│   │   │   ├── layout.tsx      # Providers: NextIntlClientProvider, Customer/Cart
│   │   │   ├── page.tsx        # Homepage (live purchase flow entry point)
│   │   │   ├── product/[slug]/ # Legacy/demo product detail (mock catalog)
│   │   │   ├── product/dips-chocolate/ # Legacy/demo dedicated product page
│   │   │   ├── products/       # Legacy/demo product listing
│   │   │   ├── cart/           # Legacy/demo cart (localStorage only)
│   │   │   ├── checkout/       # Legacy/demo checkout (no real payment)
│   │   │   │   └── success/    # Shared success page — used by BOTH real
│   │   │   │                   #   Stripe redirects and the legacy demo flow
│   │   │   ├── orders/[id]/    # Legacy/demo "my orders" (mock data)
│   │   │   ├── wishlist/       # Legacy/demo wishlist
│   │   │   ├── profile/        # Legacy/demo customer profile
│   │   │   ├── ingredients-pdf/
│   │   │   ├── privacy/, terms/, return-policy/, shipping-policy/  # Legal pages
│   │   ├── admin/               # Admin dashboard — NOT under [locale], English-only
│   │   │   ├── layout.tsx       # Session check + nav shell
│   │   │   ├── login/
│   │   │   ├── orders/[id]/
│   │   │   ├── affiliates/
│   │   │   ├── commissions/
│   │   │   ├── account/         # Self-service password change
│   │   │   └── users/           # SUPER_ADMIN-only user management
│   │   ├── api/
│   │   │   ├── stripe/create-checkout-session/route.ts  # Live purchase flow
│   │   │   ├── stripe/webhook/route.ts                   # Order persistence (source of truth)
│   │   │   └── admin/           # Mirrors src/app/admin/ page structure 1:1
│   │   │       ├── login/route.ts
│   │   │       ├── account/password/route.ts
│   │   │       ├── orders/[id]/route.ts, bulk/route.ts, export/route.ts
│   │   │       ├── affiliates/[id]/route.ts
│   │   │       ├── commissions/[id]/route.ts, export/route.ts
│   │   │       └── users/[id]/route.ts
│   │   ├── ingredients/         # Standalone (non-[locale]) marketing page
│   │   └── globals.css          # Tailwind v4 entry + design tokens
│   ├── components/              # Shared React components, feature-grouped
│   │   ├── ui/                  # shadcn/ui primitives (button, select, accordion, ...)
│   │   ├── cart/                # Legacy/demo cart UI (CartDrawer, CartItem, CartSummary)
│   │   ├── checkout/             # Legacy/demo checkout form
│   │   ├── products/             # Legacy/demo catalog UI (ProductCard, ProductGrid, ...)
│   │   ├── animations/           # framer-motion wrappers (FadeIn, ScaleIn, SlideIn, ScrollReveal)
│   │   └── *.tsx                 # Top-level marketing sections (Hero, BuySection, ...) +
│   │                              #   live purchase components (BuyNowButton, ProductPurchaseBox)
│   ├── contexts/                 # Client-only React Context providers
│   │   ├── CartContext.tsx       # localStorage cart (legacy/demo flow)
│   │   └── CustomerContext.tsx   # Mock customer session
│   ├── data/                     # In-memory mock fixtures (legacy/demo flow only)
│   │   ├── products.ts, customers.ts, inventory.ts, orders.ts, reviews.ts
│   ├── lib/                      # Flat domain/service modules (no subfolders)
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── orders.ts             # Order CRUD/queries (Prisma-backed, real orders)
│   │   ├── affiliates.ts         # Affiliate + Commission CRUD/queries
│   │   ├── admin-auth.ts         # Node-runtime session helpers (cookies())
│   │   ├── session.ts            # Edge-safe JWT sign/verify (shared with middleware)
│   │   ├── password.ts           # scrypt hashing
│   │   ├── stripe.ts             # Client-side Stripe.js loader + payment method metadata
│   │   ├── shopify.ts, shopify-client.ts, shopify-product.ts, shopify-queries.ts
│   │   │                          # Shopify Storefront GraphQL client + typed product mapping
│   │   ├── pricing.ts             # Locale-aware price/weight formatting
│   │   ├── email.ts, email-templates.ts  # nodemailer transport + templated emails
│   │   ├── google-sheets.ts       # Google Sheets warehouse sync
│   │   ├── tracking.ts            # Meta Pixel / GA4 / Google Ads + attribution capture
│   │   └── utils.ts               # `cn()` class-merging helper (shadcn convention)
│   └── generated/prisma/client/   # Prisma-generated client — DO NOT hand-edit
│       ├── client.ts, browser.ts, enums.ts, models.ts, commonInputTypes.ts
│       ├── internal/
│       └── models/
├── next.config.mjs               # next-intl plugin wrapper, Shopify CDN image allowlist
├── middleware matcher config lives inside src/middleware.ts (not a separate file)
├── tsconfig.json                 # `@/*` → `./src/*` path alias
├── components.json               # shadcn/ui generator config
├── prisma.config.ts               # Prisma 7 CLI config (schema/migrations paths, env)
└── .env.example                   # Documents all required env vars (names only)
```

## Directory Purposes

**`src/app/[locale]/`:**
- Purpose: Every public-facing, locale-aware route.
- Contains: `page.tsx`/`layout.tsx` files (App Router convention), a mix of the live
  purchase flow (homepage `BuySection`) and an entirely separate legacy/demo
  catalog+cart+checkout flow.
- Key files: `src/app/[locale]/layout.tsx` (providers), `src/app/[locale]/page.tsx`
  (homepage composition)

**`src/app/admin/`:**
- Purpose: Internal operations dashboard (orders, affiliates, commissions, admin users).
- Contains: Server Components for data-heavy pages, `"use client"` sibling components
  for interactive tables/forms (naming convention: `page.tsx` + a co-located
  `PascalCase.tsx` client component, e.g. `orders/OrdersTable.tsx`).
- Key files: `src/app/admin/layout.tsx` (auth-gated nav shell)

**`src/app/api/`:**
- Purpose: All server-side mutation/integration endpoints. Structure mirrors the
  resource it manages (`api/admin/orders/` mirrors `app/admin/orders/`, etc.).
- Contains: `route.ts` files exporting `GET`/`POST`/`PATCH`/`DELETE` named exports.
- Key files: `src/app/api/stripe/webhook/route.ts` (order source of truth),
  `src/app/api/stripe/create-checkout-session/route.ts` (live checkout entry)

**`src/lib/`:**
- Purpose: All business logic, external API clients, and cross-cutting utilities.
- Contains: Flat `.ts` modules, one per concern/integration. No nested subfolders —
  this is the primary "where do I put new logic" location.
- Generated types are re-exported from here (e.g. `src/lib/orders.ts` re-exports
  `OrderStatus`/`PaymentStatus`/`FulfillmentStatus` from the generated Prisma client)
  so callers never import `@/generated/prisma/client` directly.

**`src/components/`:**
- Purpose: Shared/reusable UI. Feature-specific components are grouped into
  subdirectories (`cart/`, `checkout/`, `products/`, `animations/`, `ui/`); page-level
  marketing sections live flat at the top of `src/components/`.
- `src/components/ui/`: shadcn/ui-generated primitives — regenerate via the shadcn CLI
  (`components.json`), do not hand-roll new primitives here; add app-specific
  components elsewhere.

**`src/contexts/` and `src/data/`:**
- Purpose: Support the legacy/demo cart+checkout flow only. Not used by the live
  Shopify+Stripe purchase path.
- Generated: No (hand-written).
- Committed: Yes.

**`src/generated/prisma/client/`:**
- Purpose: Prisma Client output (custom `output` path set in `prisma/schema.prisma:3`,
  not the npm-package default).
- Generated: Yes — regenerated by `prisma generate` (runs automatically via
  `postinstall` and as the first step of `npm run build`).
- Committed: Check `.gitignore` before assuming; treat as build output, never edit by hand.

**`prisma/migrations/`:**
- Purpose: Ordered, timestamped SQL migration history (Prisma Migrate).
- Generated: Yes (via `prisma migrate dev`), but committed and reviewed like code.
- Naming: `YYYYMMDDHHMMSS_description/migration.sql`

## Key File Locations

**Entry Points:**
- `src/app/[locale]/page.tsx`: Public homepage, composes all marketing sections
- `src/app/[locale]/layout.tsx`: Root providers for the locale tree
- `src/app/admin/layout.tsx`: Admin auth gate + nav shell
- `src/middleware.ts`: Edge request interceptor (admin auth + i18n)

**Configuration:**
- `next.config.mjs`: Next.js + next-intl plugin, image remote patterns
- `tsconfig.json`: Path alias `@/*` → `src/*`, strict TypeScript
- `prisma.config.ts`: Prisma 7 CLI config
- `components.json`: shadcn/ui codegen config
- `.env.example`: Full list of required/optional environment variables (74 lines)

**Core Logic:**
- `src/lib/orders.ts`: Real Order/OrderItem Prisma queries + types
- `src/lib/affiliates.ts`: Affiliate/Commission Prisma queries + types
- `src/app/api/stripe/webhook/route.ts`: Order creation, commission attribution,
  transactional email, Sheets sync, warehouse notification
- `src/lib/admin-auth.ts` / `src/lib/session.ts`: Admin authentication

**Testing:**
- Not present. No `*.test.*`/`*.spec.*` files or test runner config exist in this repo.

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g. `BuySection.tsx`, `ProductCard.tsx`)
- shadcn/ui primitives: `kebab-case.tsx` (e.g. `button.tsx`, `checkbox.tsx`) — matches
  shadcn CLI output convention, distinct from the rest of `src/components/`
- Route files: Next.js App Router reserved names — `page.tsx`, `layout.tsx`, `route.ts`
- Domain/service modules: `kebab-case.ts` (e.g. `shopify-product.ts`, `admin-auth.ts`,
  `email-templates.ts`)
- Admin page + its client-component sibling: `page.tsx` alongside a `PascalCase.tsx`
  file in the same directory (e.g. `admin/users/page.tsx` + `admin/users/UsersManager.tsx`)

**Directories:**
- Dynamic route segments: Next.js bracket syntax — `[locale]`, `[id]`, `[slug]`
- Feature grouping under `src/components/`: lowercase plural nouns (`cart/`, `products/`)
- API routes mirror the admin page tree 1:1 under `src/app/api/admin/`

## Where to Add New Code

**New live-storefront feature (real product/checkout):**
- Page/section: `src/app/[locale]/` (new route) or new component in `src/components/`
- Business logic: new module in `src/lib/` (or extend `shopify*.ts`/`pricing.ts`)
- Do NOT wire it through `src/contexts/CartContext.tsx` or `src/data/products.ts` —
  those back the legacy/demo flow only.

**New admin feature (new resource to manage):**
- Prisma model: `prisma/schema.prisma`, then `npx prisma migrate dev`
- Service module: `src/lib/<resource>.ts` (follow `affiliates.ts` pattern — derive
  types from `Prisma.<Model>GetPayload`, convert `Decimal`s to `number` at the boundary)
- API routes: `src/app/api/admin/<resource>/route.ts` (+ `[id]/route.ts` as needed)
- Admin UI: `src/app/admin/<resource>/page.tsx` + co-located `PascalCase.tsx` client
  component for interactive tables/forms
- Add nav link + role gate (if SUPER_ADMIN-only) in `src/app/admin/layout.tsx` and, if
  role-restricted, in `src/middleware.ts`'s `isUserMgmt`-style check

**New external integration:**
- New `kebab-case.ts` module in `src/lib/`, reading its own `process.env.*` vars with
  a fail-fast check at module load (follow `src/lib/shopify-client.ts` /
  `src/app/api/stripe/webhook/route.ts:14-18` pattern)
- Document new env vars in `.env.example`

**Utilities:**
- Generic, framework-agnostic helpers: `src/lib/utils.ts`
- Locale-aware formatting: extend `src/lib/pricing.ts`
- Client-side analytics events: extend `src/lib/tracking.ts`

**New shadcn/ui primitive:**
- Generate via shadcn CLI (uses `components.json` aliases) into `src/components/ui/`;
  do not hand-write these — copy the existing `kebab-case.tsx` style if adding manually.

## Special Directories

**`src/generated/prisma/client/`:**
- Purpose: Generated Prisma Client (custom output path).
- Generated: Yes (`prisma generate`).
- Committed: Not intended for manual edits regardless of git tracking status — always
  regenerate via Prisma, never hand-patch.

**`.next/`:**
- Purpose: Next.js build output/cache.
- Generated: Yes.
- Committed: No (standard `.gitignore` entry).

**`node_modules/`:**
- Purpose: npm dependencies.
- Generated: Yes.
- Committed: No.

**`messages/`:**
- Purpose: next-intl translation JSON, one file per locale (`en`, `es`, `pt`).
- Generated: No (hand-maintained).
- Committed: Yes. Adding a new locale requires: a new `messages/<locale>.json`, adding
  the locale to `src/i18n/routing.ts`'s `locales` array, and updating
  `src/middleware.ts`'s matcher regex `'/(en|es|pt)/:path*'`.

---

*Structure analysis: 2026-07-03*
