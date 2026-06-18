# Codebase Structure

**Analysis Date:** 2026-06-17

## Directory Layout

```
lp-dips/
├── src/
│   ├── app/                    # Next.js App Router (pages, APIs, middleware)
│   │   ├── [locale]/           # Customer storefront (multi-language)
│   │   │   ├── page.tsx        # Root page (redirects to /en)
│   │   │   ├── layout.tsx      # Global layout with i18n, providers
│   │   │   ├── (home)/         # Route group for landing page
│   │   │   ├── products/       # Product catalog
│   │   │   ├── product/        # Product detail pages
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── checkout/       # Checkout flow + success page
│   │   │   ├── orders/         # Customer order history
│   │   │   ├── affiliates/     # Affiliate signup, login, dashboard
│   │   │   ├── wishlist/       # Wishlist pages
│   │   │   ├── profile/        # Customer profile
│   │   │   ├── about/          # About page
│   │   │   ├── privacy/        # Privacy policy
│   │   │   ├── terms/          # Terms of service
│   │   │   ├── shipping-policy/# Shipping policy
│   │   │   ├── return-policy/  # Return policy
│   │   │   ├── ingredients-pdf/# PDF ingredients download
│   │   │   └── globals.css     # Global Tailwind styles
│   │   ├── admin/              # Admin dashboard (protected)
│   │   │   ├── layout.tsx      # Admin navbar + auth check
│   │   │   ├── login/          # Admin login page
│   │   │   ├── orders/         # Order management
│   │   │   ├── affiliates/     # Affiliate management
│   │   │   ├── commissions/    # Commission tracking & export
│   │   │   └── users/          # Admin user management
│   │   ├── api/                # API Route Handlers (REST endpoints)
│   │   │   ├── admin/
│   │   │   │   ├── login/      # POST/GET admin login, logout
│   │   │   │   ├── orders/     # GET, PATCH order endpoints
│   │   │   │   ├── affiliates/ # CRUD affiliate endpoints
│   │   │   │   ├── commissions/# GET commissions, export endpoint
│   │   │   │   └── users/      # CRUD admin users
│   │   │   ├── affiliates/
│   │   │   │   ├── join/       # POST affiliate signup
│   │   │   │   ├── login/      # POST affiliate login request
│   │   │   │   ├── logout/     # POST affiliate logout
│   │   │   │   └── verify/     # GET verify magic link token
│   │   │   └── stripe/
│   │   │       ├── create-checkout-session/  # POST checkout
│   │   │       └── webhook/    # POST Stripe webhook
│   │   ├── ingredients/        # Ingredients page (no locale prefix)
│   │   ├── favicon.ico         # Favicon
│   │   └── globals.css         # Global styles
│   │
│   ├── lib/                    # Business logic & utilities
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── admin-auth.ts       # Admin session verification
│   │   ├── affiliate-auth.ts   # Affiliate session retrieval
│   │   ├── affiliate-tokens.ts # Magic link token generation
│   │   ├── affiliates.ts       # Affiliate CRUD operations
│   │   ├── orders.ts           # Order creation, status updates
│   │   ├── email.ts            # SMTP transporter
│   │   ├── email-templates.ts  # Email composition (signup, order, shipped)
│   │   ├── stripe.ts           # Stripe API calls
│   │   ├── shopify.ts          # Shopify queries & sync
│   │   ├── shopify-client.ts   # Shopify GraphQL client
│   │   ├── shopify-product.ts  # Product variant queries
│   │   ├── shopify-queries.ts  # GraphQL query strings
│   │   ├── google-sheets.ts    # Commission export to Sheets
│   │   ├── pricing.ts          # Localized pricing lookup
│   │   ├── tracking.ts         # UTM/influencer tracking
│   │   └── utils.ts            # Formatting, validation helpers
│   │
│   ├── components/             # React components
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Footer.tsx          # Footer
│   │   ├── Hero.tsx            # Landing hero section
│   │   ├── ProductSection.tsx  # Product showcase
│   │   ├── BuySection.tsx      # Call-to-action section
│   │   ├── BuyNowButton.tsx    # CTA button component
│   │   ├── ReviewsSection.tsx  # Customer reviews
│   │   ├── FeaturesStrip.tsx   # Features marquee
│   │   ├── IngredientsSection.tsx # Ingredients section
│   │   ├── AboutSection.tsx    # About section
│   │   ├── FAQSection.tsx      # FAQ accordion
│   │   ├── SocialMediaButtons.tsx # Social links
│   │   ├── AgeVerificationModal.tsx # Age check modal
│   │   ├── BuyImageGallery.tsx # Product gallery
│   │   ├── ProductPurchaseBox.tsx # Product card
│   │   ├── LiveProductPurchase.tsx # Interactive product
│   │   ├── TrackingProvider.tsx # Tracking/attribution wrapper
│   │   ├── TrackViewItem.tsx  # Product view tracking
│   │   ├── LegalPageLayout.tsx # Legal page wrapper
│   │   ├── animations/         # Framer Motion animations
│   │   │   └── *.tsx           # Scroll triggers, parallax
│   │   ├── cart/
│   │   │   ├── CartItem.tsx    # Cart line item component
│   │   │   └── *.tsx           # Cart-related components
│   │   ├── checkout/
│   │   │   └── CheckoutForm.tsx # Stripe Elements form
│   │   ├── products/
│   │   │   ├── ProductGrid.tsx # Product listing grid
│   │   │   └── ProductSidebar.tsx # Filter sidebar
│   │   └── ui/                 # Radix UI primitives
│   │       ├── button.tsx      # <Button /> component
│   │       ├── accordion.tsx   # <Accordion /> component
│   │       ├── checkbox.tsx    # <Checkbox /> component
│   │       ├── label.tsx       # <Label /> component
│   │       └── select.tsx      # <Select /> component
│   │
│   ├── contexts/               # React Context providers
│   │   ├── CartContext.tsx     # Shopping cart state (localStorage)
│   │   └── CustomerContext.tsx # Customer data (email, info)
│   │
│   ├── data/                   # Static data & constants
│   │   ├── products.ts         # Product catalog (hardcoded)
│   │   ├── inventory.ts        # Stock levels
│   │   ├── reviews.ts          # Customer reviews
│   │   ├── customers.ts        # Example customer data
│   │   └── orders.ts           # Example order data
│   │
│   ├── i18n/                   # Internationalization
│   │   ├── routing.ts          # Locale config (en, es, pt)
│   │   └── *.json              # Translation files per locale
│   │
│   ├── generated/              # Auto-generated code
│   │   └── prisma/             # Prisma client (generated)
│   │
│   └── middleware.ts           # Next.js middleware (auth, redirects)
│
├── prisma/
│   ├── schema.prisma           # Database schema & enums
│   └── migrations/             # Database migrations
│
├── public/                     # Static assets
│   ├── images/                 # Product images, logos
│   └── fonts/                  # Custom fonts
│
├── .next/                      # Next.js build output (git ignored)
│
├── node_modules/              # Dependencies (git ignored)
│
├── .claude/                    # Claude Code settings
│   ├── settings.json           # Base configuration
│   └── settings.local.json     # Local overrides
│
├── .env*                       # Environment variables (git ignored)
├── .gitignore                  # Git ignore rules
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── next.config.js              # Next.js config
├── package.json                # Node.js dependencies
├── package-lock.json           # Dependency lock
└── README.md                   # Project documentation
```

## Directory Purposes

**`src/app/[locale]/`:**
- Purpose: Multi-language customer-facing pages and layouts
- Contains: Page components (page.tsx), nested layouts (layout.tsx), route groups for organization
- Key files: `layout.tsx` (i18n + provider setup), `page.tsx` (route handler per page)
- Pattern: URL-driven locale in param `{locale: string}`, all pages accept `params.locale`

**`src/app/admin/`:**
- Purpose: Protected admin dashboard for order, affiliate, and user management
- Contains: Page components for admin operations, layout with navbar
- Key files: `layout.tsx` (auth + navbar), individual pages for orders/affiliates/users
- Auth: `isAdminAuthenticated()` check in layout; redirects to login if no valid cookie
- Pattern: All pages are Server Components; access DB directly

**`src/app/api/`:**
- Purpose: REST API endpoints for checkout, webhooks, CRUD operations
- Contains: Route handlers (route.ts) organized by resource and method (GET, POST, PATCH, DELETE)
- Key files: Stripe checkout and webhook, affiliate signup/login, admin resource CRUD
- Pattern: Validate auth in handler, return JSON with status codes, use business logic layer (src/lib/)

**`src/lib/`:**
- Purpose: Shared business logic, integrations, and utilities
- Contains: Service functions (orders, email, auth), client libraries (Stripe, Shopify, Prisma), helpers
- Pattern: Export pure functions or initialized clients (e.g., Prisma singleton); no exports of React components
- Key responsibilities:
  - `prisma.ts` — DB connection (singleton, prevents pool exhaustion)
  - `admin-auth.ts`, `affiliate-auth.ts` — Auth checks and user retrieval
  - `orders.ts` — Order CRUD and commission calculation
  - `email.ts`, `email-templates.ts` — Email composition and sending
  - `stripe.ts` — Stripe API (sessions, refunds)
  - `shopify*.ts` — Product and variant queries
  - `affiliates.ts` — Affiliate management CRUD
  - `google-sheets.ts` — Commission export

**`src/components/`:**
- Purpose: React components for UI rendering (client and server)
- Contains: Page sections (Hero, ProductSection, etc.), form components (CheckoutForm), UI primitives
- Key subdirectories:
  - `ui/` — Radix UI base components (button, checkbox, select, label, accordion)
  - `cart/` — Shopping cart display and manipulation
  - `checkout/` — Checkout form with Stripe Elements
  - `products/` — Product grid and filter sidebar
  - `animations/` — Framer Motion scroll/parallax effects
- Pattern: Mix of "use client" components (interactive) and Server Components (display); use `@/` path alias

**`src/contexts/`:**
- Purpose: Global client-side state via React Context API
- Contains: CartContext (cart items, actions), CustomerContext (customer info)
- Key files:
  - `CartContext.tsx` — Cart state with localStorage persistence, add/remove/update/clear actions
  - `CustomerContext.tsx` — Customer email and info (set at checkout)
- Pattern: Provider wraps layout; hooks export for use in pages/components; localStorage key `dpis-cart`

**`src/data/`:**
- Purpose: Static data constants (products, inventory, reviews)
- Contains: TypeScript exports of product array, review data, example orders/customers
- Key files: `products.ts` (Product[] with variants), `reviews.ts`, `inventory.ts`
- Pattern: Hardcoded data; real product/pricing from Shopify in future; no dynamic load from DB

**`src/i18n/`:**
- Purpose: Internationalization setup and routing config
- Contains: `routing.ts` (locale definitions), translation JSON files per locale
- Locales: en, es, pt
- Pattern: next-intl middleware uses routing config; Server Components call `getMessages()` to fetch translations

**`prisma/`:**
- Purpose: Database schema, migrations, and ORM configuration
- Contains: `schema.prisma` (data model), `migrations/` (SQL migration files)
- Key models: Order, OrderItem, Affiliate, AffiliateLoginToken, Commission, AdminUser, StripeEvent
- Pattern: Models reference by CUID primary keys; enums for status fields (OrderStatus, CommissionStatus, etc.)

**`public/`:**
- Purpose: Static assets served directly by Next.js
- Contains: Images (product photos, logos), fonts
- Pattern: Reference in JSX as `/images/...` or `/fonts/...`

**`.claude/`:**
- Purpose: Claude Code project configuration
- Contains: `settings.json` (base), `settings.local.json` (local overrides)
- Pattern: User-specific settings; shared config in base settings.json

## Key File Locations

**Entry Points:**
- `src/app/[locale]/layout.tsx` — Customer storefront root (i18n + providers)
- `src/app/admin/layout.tsx` — Admin dashboard root (auth + navbar)
- `src/app/[locale]/page.tsx` — Home page redirect
- `src/middleware.ts` — Edge middleware (auth routing, i18n, locale redirects)

**Configuration:**
- `tsconfig.json` — TypeScript config with `@/*` path alias to `src/`
- `next.config.js` — Next.js options (image optimization, env vars, etc.)
- `tailwind.config.js` — Tailwind CSS utilities and theme
- `prisma/schema.prisma` — Database schema and enums
- `.env.local` — Local environment variables (git ignored)

**Core Logic:**
- `src/lib/prisma.ts` — Database client (singleton pattern for connection pooling)
- `src/lib/admin-auth.ts` — Admin authentication (cookie + DB verification)
- `src/lib/affiliate-auth.ts` — Affiliate session retrieval
- `src/lib/orders.ts` — Order CRUD and commission calculation
- `src/lib/email.ts` — SMTP transporter and sendEmail function
- `src/lib/email-templates.ts` — Email composition (signup, confirmation, shipped)
- `src/lib/stripe.ts` — Stripe API calls (checkout sessions, refunds)
- `src/lib/shopify.ts` — Shopify GraphQL queries

**Testing:**
- No dedicated test files in current structure; tests would be co-located as `*.test.ts` or `*.spec.ts` (not found)

**API Endpoints:**
- `src/app/api/stripe/create-checkout-session/route.ts` — POST to create Stripe session
- `src/app/api/stripe/webhook/route.ts` — POST webhook receiver (idempotent via StripeEvent)
- `src/app/api/affiliates/join/route.ts` — POST affiliate signup
- `src/app/api/affiliates/login/route.ts` — POST request magic link
- `src/app/api/affiliates/verify/route.ts` — GET verify token + set session
- `src/app/api/admin/login/route.ts` — POST/GET admin login/logout
- `src/app/api/admin/orders/bulk/route.ts` — PATCH bulk order updates
- `src/app/api/admin/commissions/export/route.ts` — GET export to Google Sheets

## Naming Conventions

**Files:**
- Page components: `page.tsx` (Next.js convention)
- Layout files: `layout.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention for handlers)
- Client components: `.tsx` with `"use client"` directive at top
- Server components: `.tsx` (default in App Router)
- Utilities: Lowercase with hyphens (e.g., `admin-auth.ts`, `email-templates.ts`)
- Components: PascalCase (e.g., `CartContext.tsx`, `CheckoutForm.tsx`)

**Directories:**
- Feature folders (plural): `components/`, `contexts/`, `lib/`, `data/`, `i18n/`
- Route segments: Lowercase (e.g., `admin/`, `affiliates/`, `checkout/`)
- Dynamic segments: Square brackets (e.g., `[locale]/`, `[id]/`)
- Route groups: Parentheses (e.g., `(home)/`, `(auth)/`)
- Generated code: `generated/` (Prisma client auto-generated here)

**Functions & Exports:**
- Utilities: camelCase (e.g., `isAdminAuthenticated()`, `sendEmail()`)
- React components: PascalCase (e.g., `CartProvider`, `CheckoutForm`)
- Constants: UPPER_SNAKE_CASE (e.g., `ADMIN_COOKIE_NAME`, `CART_STORAGE_KEY`)
- Type definitions: PascalCase (e.g., `CartItem`, `EmailPayload`, `AdminUserRow`)

## Where to Add New Code

**New Feature (e.g., Wishlist):**
- Primary code: `src/app/[locale]/wishlist/page.tsx` (customer page), `src/app/api/wishlist/route.ts` (API)
- Business logic: `src/lib/wishlist.ts` (CRUD functions)
- Database: Add `Wishlist` model to `prisma/schema.prisma`, run migration
- Tests: `src/app/api/wishlist/route.test.ts` (co-located with route handler)

**New Component/Module:**
- Implementation: `src/components/` (if UI) or `src/lib/` (if business logic)
- Client state: `src/contexts/NewContext.tsx` (if global state needed)
- Types: Define inline in file or in a separate `types.ts` if large
- Styling: Tailwind classes directly in JSX; custom CSS in `src/app/globals.css` if needed

**Utilities & Helpers:**
- Shared helpers: `src/lib/utils.ts` (append to existing file or create new `src/lib/foo.ts`)
- Formatting: `src/lib/formatting.ts` or functions in `utils.ts`
- Validation: `src/lib/validation.ts` or inline in API routes with type guards

**Email Templates:**
- New email type: Add function to `src/lib/email-templates.ts` (e.g., `buildRefundEmail()`)
- Send email: Call `sendEmail()` from route handler or job queue (currently uses `after()` in webhooks)

**Admin Features:**
- Page: `src/app/admin/[feature]/page.tsx` with `isAdminAuthenticated()` check in layout
- API: `src/app/api/admin/[feature]/route.ts` with auth check (returns 401 if not authenticated)
- Access: All requests must carry `admin_token` cookie (set by `/api/admin/login`)

**Affiliate Features:**
- Page: `src/app/[locale]/affiliates/[feature]/page.tsx` with affiliate auth check (middleware + cookie)
- API: `src/app/api/affiliates/[feature]/route.ts` with optional auth check
- Access: Dashboard requires `affiliate_session` cookie (set by `/api/affiliates/verify`)

**Database Model Changes:**
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe_change`
3. Prisma client auto-generates in `src/generated/prisma/client/`
4. Import `{ prisma }` from `@/lib/prisma` and use in services

**API Route Pattern:**
```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    // Validate, call business logic
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Special Directories

**`src/generated/`:**
- Purpose: Auto-generated code (Prisma client)
- Generated: Yes (by `prisma generate`)
- Committed: No (output path points to build artifacts; sources in `prisma/schema.prisma`)
- Do NOT edit manually

**`src/app/globals.css`:**
- Purpose: Global Tailwind CSS and custom styles
- Generated: No
- Committed: Yes
- Pattern: Import in root layout; used across all pages

**`.next/`:**
- Purpose: Next.js build output and type definitions
- Generated: Yes (by `npm run build`)
- Committed: No
- Pattern: Contains type stubs; referenced by TypeScript but not source

**`prisma/migrations/`:**
- Purpose: Database migration history (SQL files)
- Generated: Yes (by `prisma migrate` commands)
- Committed: Yes (for reproducible schema changes)
- Pattern: Each migration file numbered chronologically; applied in order

---

*Structure analysis: 2026-06-17*
