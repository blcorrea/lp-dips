# Codebase Structure

**Analysis Date:** 2026-05-14

## Directory Layout

```
lp-dips/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Storefront — i18n-prefixed routes (en/es/pt)
│   │   │   ├── layout.tsx      # Root layout: providers + metadata
│   │   │   ├── page.tsx        # Landing page (home)
│   │   │   ├── cart/           # Cart page
│   │   │   ├── checkout/       # Checkout redirect + success page
│   │   │   ├── product/        # Product detail pages
│   │   │   │   ├── [slug]/     # Dynamic product page
│   │   │   │   └── dips-chocolate/  # Static alias for main product
│   │   │   ├── products/       # Product listing/shop
│   │   │   ├── shop/           # Shop page
│   │   │   ├── orders/         # Customer order history (mock/POC)
│   │   │   │   └── [id]/       # Individual order detail (mock/POC)
│   │   │   ├── profile/        # Customer profile (mock/POC)
│   │   │   ├── wishlist/       # Customer wishlist (mock/POC)
│   │   │   ├── ingredients-pdf/ # PDF-friendly ingredients page
│   │   │   ├── privacy/        # Privacy policy
│   │   │   ├── terms/          # Terms of service
│   │   │   ├── return-policy/  # Return policy
│   │   │   └── shipping-policy/ # Shipping policy
│   │   ├── admin/              # Admin dashboard (no locale prefix)
│   │   │   ├── layout.tsx      # Admin nav shell (auth-aware)
│   │   │   ├── orders/         # Order management + dashboard
│   │   │   │   ├── page.tsx    # Orders list with stats + charts
│   │   │   │   ├── OrdersTable.tsx     # Client: row selection + bulk actions
│   │   │   │   ├── OrderFilters.tsx    # Client: filter controls
│   │   │   │   ├── DashboardCharts.tsx # Client: Recharts charts
│   │   │   │   └── [id]/       # Order detail + edit form
│   │   │   ├── affiliates/     # Affiliate management
│   │   │   │   ├── page.tsx
│   │   │   │   └── AffiliatesTable.tsx
│   │   │   ├── commissions/    # Commission management
│   │   │   │   ├── page.tsx
│   │   │   │   └── CommissionsTable.tsx
│   │   │   └── login/          # Admin login form
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── create-checkout-session/route.ts  # POST: create Stripe session
│   │   │   │   └── webhook/route.ts                  # POST: Stripe webhook handler
│   │   │   ├── admin/
│   │   │   │   ├── login/route.ts                    # POST: set cookie / GET: logout
│   │   │   │   ├── orders/route.ts                   # GET: list orders
│   │   │   │   ├── orders/[id]/route.ts               # GET+PATCH: single order
│   │   │   │   ├── orders/bulk/route.ts               # PATCH: bulk status update
│   │   │   │   ├── orders/export/route.ts             # GET: CSV export
│   │   │   │   ├── affiliates/route.ts                # GET+POST: list/create affiliates
│   │   │   │   ├── affiliates/[id]/route.ts           # PATCH: update affiliate
│   │   │   │   ├── commissions/route.ts               # GET: list commissions
│   │   │   │   ├── commissions/[id]/route.ts          # PATCH: transition status
│   │   │   │   └── commissions/export/route.ts        # GET: CSV export
│   │   │   └── test-shopify/route.ts                  # Dev: test Shopify connectivity
│   │   └── ingredients/        # Standalone ingredients page (no locale prefix)
│   ├── components/
│   │   ├── Header.tsx          # Site header/navigation
│   │   ├── Footer.tsx          # Site footer
│   │   ├── Hero.tsx            # Landing page hero section
│   │   ├── BuySection.tsx      # Buy/CTA section on landing page
│   │   ├── BuyNowButton.tsx    # Checkout initiator (client)
│   │   ├── ProductSection.tsx  # Product feature section
│   │   ├── AboutSection.tsx
│   │   ├── IngredientsSection.tsx
│   │   ├── WhyDipsSection.tsx
│   │   ├── FAQSection.tsx
│   │   ├── LegalPageLayout.tsx # Shared layout for policy pages
│   │   ├── TrackingProvider.tsx # Attribution capture on mount (client)
│   │   ├── TrackViewItem.tsx   # Client: fires view_item tracking event
│   │   ├── AgeVerificationModal.tsx
│   │   ├── SocialMediaButtons.tsx
│   │   ├── LiveProductPurchase.tsx
│   │   ├── ProductPurchaseBox.tsx
│   │   ├── BuyImageGallery.tsx
│   │   ├── animations/         # Framer Motion animation wrappers
│   │   │   ├── FadeIn.tsx
│   │   │   ├── ScaleIn.tsx
│   │   │   ├── ScrollReveal.tsx
│   │   │   └── SlideIn.tsx
│   │   ├── cart/               # Cart UI components
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── checkout/           # Checkout form
│   │   │   └── CheckoutForm.tsx
│   │   ├── products/           # Product listing components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductSidebar.tsx
│   │   │   ├── QuantitySelector.tsx
│   │   │   └── VariantSelector.tsx
│   │   └── ui/                 # Shadcn/ui primitives
│   │       ├── accordion.tsx
│   │       ├── button.tsx
│   │       ├── checkbox.tsx
│   │       ├── label.tsx
│   │       └── select.tsx
│   ├── contexts/
│   │   ├── CartContext.tsx     # Cart state + localStorage persistence
│   │   └── CustomerContext.tsx # Customer session (mock/demo)
│   ├── data/                   # Static/mock data (NOT database data)
│   │   ├── products.ts         # Hardcoded product catalog
│   │   ├── customers.ts        # Mock customer for demo
│   │   ├── orders.ts           # Mock order data
│   │   └── inventory.ts        # Mock inventory data
│   ├── generated/
│   │   └── prisma/             # Auto-generated Prisma client (DO NOT EDIT)
│   │       └── client/
│   ├── i18n/
│   │   ├── routing.ts          # Locale list (en, es, pt) + navigation helpers
│   │   └── request.ts          # next-intl server request config
│   ├── lib/                    # Server-side service layer
│   │   ├── prisma.ts           # Singleton Prisma client
│   │   ├── orders.ts           # Order CRUD, stats, dashboard queries
│   │   ├── affiliates.ts       # Affiliate + Commission CRUD, state machine
│   │   ├── shopify.ts          # Shopify Storefront API product fetch
│   │   ├── shopify-client.ts   # Raw GraphQL fetch wrapper for Shopify
│   │   ├── shopify-queries.ts  # GraphQL query strings
│   │   ├── shopify-product.ts  # Maps Shopify product to PurchasableProduct
│   │   ├── pricing.ts          # Locale-to-currency/price mapping
│   │   ├── stripe.ts           # Stripe SDK instance (if any shared config)
│   │   ├── email.ts            # Nodemailer SMTP transport
│   │   ├── email-templates.ts  # Order confirmation + warehouse notification HTML
│   │   ├── google-sheets.ts    # Google Sheets warehouse mirror (append + update)
│   │   ├── tracking.ts         # Meta Pixel, GA4, Google Ads events; attribution
│   │   ├── admin-auth.ts       # isAdminAuthenticated() for Server Components
│   │   └── utils.ts            # Shared utility functions (cn, etc.)
│   └── middleware.ts           # Edge middleware: i18n routing + admin auth
├── prisma/
│   ├── schema.prisma           # Database schema (Order, OrderItem, StripeEvent,
│   │                           #   Affiliate, Commission)
│   └── migrations/             # Timestamped SQL migration files
│       ├── 20260325000823_init/
│       ├── 20260329124456_add_email_sent_at_timestamps/
│       ├── 20260506232233_add_influencer_attribution/
│       └── 20260507024217_add_affiliate_commissions/
├── messages/                   # next-intl translation files
│   ├── en/
│   ├── es/
│   └── pt/
├── public/
│   ├── images/                 # Product images, OG image
│   ├── videos/                 # Brand videos
│   └── fonts/                  # Custom fonts
├── scripts/                    # One-off utility scripts
├── .planning/codebase/         # GSD architecture docs
├── next.config.mjs             # Next.js config (next-intl plugin)
├── prisma.config.ts            # Prisma config (output path override)
├── tsconfig.json               # TypeScript config (@/ path alias)
├── components.json             # Shadcn/ui component config
└── package.json
```

## Directory Purposes

**`src/app/[locale]/`:**
- Purpose: Internationalized storefront pages. All routes under this directory are locale-prefixed (e.g. `/en/product/dips-chocolate`)
- Contains: Async Server Component pages, client components co-located where needed
- Key files: `layout.tsx` (provider tree), `page.tsx` (landing page)

**`src/app/admin/`:**
- Purpose: Admin-only management UI. Not locale-prefixed. Protected by middleware.
- Contains: Server Component pages with inline client components for interactive tables/filters
- Key files: `layout.tsx`, `orders/page.tsx`, `orders/OrdersTable.tsx`

**`src/app/api/`:**
- Purpose: All HTTP API endpoints. Two subtrees: `stripe/` (public webhook + checkout) and `admin/` (protected REST-ish endpoints)
- Contains: `route.ts` files only — no UI
- Key files: `stripe/webhook/route.ts`, `stripe/create-checkout-session/route.ts`

**`src/components/`:**
- Purpose: Reusable React components. Top level = page-section components. Subdirectories = feature-grouped components.
- Contains: Server and Client Components. Client Components are marked `"use client"` at the top.
- Key files: `BuyNowButton.tsx`, `TrackingProvider.tsx`, `Header.tsx`

**`src/lib/`:**
- Purpose: All server-side business logic. Imported by Server Components and API routes only — never imported by Client Components directly.
- Contains: Service functions, SDK clients, utility functions
- Key files: `orders.ts`, `affiliates.ts`, `shopify.ts`, `prisma.ts`

**`src/contexts/`:**
- Purpose: React Context providers for client-side shared state
- Contains: `CartContext.tsx`, `CustomerContext.tsx`

**`src/data/`:**
- Purpose: Static hardcoded data and mock data for POC features. Not connected to the database.
- Contains: TypeScript modules exporting typed arrays and helper functions

**`src/generated/prisma/`:**
- Purpose: Auto-generated Prisma client output
- Generated: Yes (by `prisma generate`)
- Committed: Yes (configured via `prisma.config.ts` to output to `src/generated/prisma/`)
- DO NOT edit manually

**`prisma/`:**
- Purpose: Database schema and migration history
- Contains: `schema.prisma`, `migrations/` directory
- Key files: `schema.prisma` is the source of truth for all DB models

**`messages/`:**
- Purpose: next-intl translation JSON files, one subdirectory per locale
- Contains: `en/`, `es/`, `pt/` subdirectories

## Key File Locations

**Entry Points:**
- `src/middleware.ts`: Request interception for auth + i18n
- `src/app/[locale]/layout.tsx`: Storefront provider tree
- `src/app/admin/layout.tsx`: Admin shell
- `src/app/[locale]/page.tsx`: Home/landing page

**Configuration:**
- `next.config.mjs`: Next.js config with next-intl plugin
- `tsconfig.json`: TypeScript with `@/` alias pointing to `src/`
- `prisma/schema.prisma`: Database schema
- `prisma.config.ts`: Prisma output directory override
- `components.json`: Shadcn/ui configuration
- `src/i18n/routing.ts`: Supported locales

**Core Logic:**
- `src/app/api/stripe/webhook/route.ts`: Order creation (primary write path)
- `src/lib/orders.ts`: All order queries and mutations
- `src/lib/affiliates.ts`: Affiliate + commission management
- `src/lib/pricing.ts`: Locale-to-price mapping
- `src/lib/tracking.ts`: All analytics event functions

**Database:**
- `src/lib/prisma.ts`: Prisma client singleton
- `src/generated/prisma/client/`: Generated Prisma client (import from here)

## Naming Conventions

**Files:**
- Page files: `page.tsx` (Next.js App Router convention)
- Layout files: `layout.tsx`
- API route files: `route.ts`
- Component files: PascalCase — `BuyNowButton.tsx`, `CartDrawer.tsx`
- Service/utility files: kebab-case — `shopify-client.ts`, `email-templates.ts`
- Context files: PascalCase + `Context` suffix — `CartContext.tsx`

**Directories:**
- App routes: lowercase kebab-case — `checkout/`, `products/`, `return-policy/`
- Component groups: lowercase — `cart/`, `products/`, `ui/`, `animations/`
- Locale: `[locale]` dynamic segment, values `en`, `es`, `pt`

**Exports:**
- Context providers: Named exports — `export function CartProvider`, `export function useCart`
- Service functions: Named exports — `export async function getOrders`
- Components: Default exports — `export default function BuyNowButton`
- Types: Named exports at top of service files — `export type OrderRow`

## Where to Add New Code

**New Storefront Page:**
- Create `src/app/[locale]/{route-name}/page.tsx`
- If needed, add translations to `messages/en/`, `messages/es/`, `messages/pt/`

**New Admin Page:**
- Create `src/app/admin/{feature-name}/page.tsx`
- Add nav link in `src/app/admin/layout.tsx`
- Add corresponding API routes under `src/app/api/admin/{feature-name}/route.ts`

**New API Endpoint:**
- Public (Stripe/webhooks): `src/app/api/stripe/{endpoint}/route.ts`
- Admin-protected: `src/app/api/admin/{endpoint}/route.ts` (middleware handles auth automatically)

**New Service Function:**
- Database operations: Add to relevant file in `src/lib/` (e.g. order queries → `src/lib/orders.ts`)
- New integration: Create `src/lib/{service-name}.ts`

**New Component:**
- Page-section component: `src/components/{ComponentName}.tsx`
- Feature-grouped component: `src/components/{feature}/{ComponentName}.tsx`
- UI primitive: `src/components/ui/{component-name}.tsx` (follow Shadcn/ui pattern)

**New Database Table:**
- Add model to `prisma/schema.prisma`
- Run `npx prisma migrate dev --name {description}` to create migration
- Run `npx prisma generate` to regenerate client in `src/generated/prisma/`

**New Translation Key:**
- Add key to `messages/en/{file}.json`, `messages/es/{file}.json`, `messages/pt/{file}.json`
- Use `useTranslations('{namespace}')` in Client Components, `getTranslations()` in Server Components

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (gitignored)

**`src/generated/`:**
- Purpose: Prisma-generated client code
- Generated: Yes (by `prisma generate`)
- Committed: Yes

**`.planning/`:**
- Purpose: GSD planning documents (phases, codebase analysis)
- Generated: Yes (by GSD commands)
- Committed: Yes

---

*Structure analysis: 2026-05-14*
