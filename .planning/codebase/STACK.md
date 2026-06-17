# Technology Stack

**Analysis Date:** 2026-06-17

## Languages

**Primary:**
- TypeScript 5.9.3 - Full source code and API routes in `src/` directory
- JSX/TSX - React components and Next.js pages

**Secondary:**
- JavaScript (ESM) - Configuration files (`next.config.mjs`, `postcss.config.mjs`, `eslint.config.mjs`)

## Runtime

**Environment:**
- Node.js 20 (specified in `.nvmrc`)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- Next.js 15.3.6 - Full-stack framework with App Router in `src/app/`
- React 19.0.0 - UI rendering and client components
- Prisma 7.5.0 - ORM for PostgreSQL database access with custom client generation

**UI/Styling:**
- Tailwind CSS 4 - Utility-first CSS framework (via `@tailwindcss/postcss`)
- Radix UI components:
  - `@radix-ui/react-accordion` 1.2.12
  - `@radix-ui/react-checkbox` 1.3.3
  - `@radix-ui/react-label` 2.1.8
  - `@radix-ui/react-select` 2.2.6
  - `@radix-ui/react-slot` 1.2.4
- Lucide React 0.559.0 - Icon library
- Framer Motion 12.23.26 - Animation library
- class-variance-authority 0.7.1 - CSS class composition
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Tailwind CSS merge utility

**Internationalization:**
- next-intl 4.5.8 - Multi-language support (plugin in `next.config.mjs`)

**Testing:**
- Not currently configured in `package.json`

**Build/Dev:**
- TypeScript compiler (tsc) - Type checking
- ESLint 9 - Linting with Next.js configuration
- Tailwind CSS CLI - CSS processing via PostCSS

## Key Dependencies

**Critical:**

- `@prisma/client` 7.5.0 - Database client with generated types in `src/generated/prisma/client/`
- `@prisma/adapter-pg` 7.5.0 - PostgreSQL adapter for Prisma

**Payment Processing:**
- `stripe` 20.0.0 - Stripe server-side SDK
- `@stripe/stripe-js` 8.5.3 - Stripe client-side JavaScript library

**Email:**
- `nodemailer` 8.0.4 - SMTP email sending for order confirmations and warehouse notifications

**Authentication/Security:**
- `bcryptjs` 3.0.3 - Password hashing for admin users

**Google APIs:**
- `googleapis` 171.4.0 - Google Sheets API for order logging

**Database:**
- `pg` 8.20.0 - PostgreSQL client (peer dependency for Prisma)

**Environment:**
- `dotenv` 17.3.1 - Environment variable loading (auto-loaded via Prisma config)

## Configuration

**Environment:**
- Environment variables loaded from `.env`, `.env.local`, or system environment
- `dotenv` configured in `prisma.config.ts` to load variables before Prisma client initialization
- Critical vars required (from code inspection):
  - `DATABASE_URL` - PostgreSQL connection string
  - `STRIPE_SECRET_KEY` - Stripe API secret for server-side operations
  - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
  - `STRIPE_SHIPPING_RATE_ID` - Stripe shipping rate identifier
  - `STRIPE_PRICE_1X`, `STRIPE_PRICE_2X`, `STRIPE_PRICE_3X` - Product price IDs
  - `SHOPIFY_STORE_DOMAIN` - Shopify store domain
  - `SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Shopify GraphQL Storefront API token
  - `SHOPIFY_PRODUCT_HANDLE` - Product handle (default: 'dips-chocolate')
  - `SHOPIFY_API_VERSION` - Shopify API version (default: '2024-10')
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email server credentials
  - `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` - Email sender identity
  - `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEETS_SHEET_NAME` - Google Sheets integration
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key for frontend
  - `NEXT_PUBLIC_SITE_URL` - Site URL for checkout redirects (default: http://localhost:3000)
  - `NEXT_PUBLIC_META_PIXEL_ID` - Meta Pixel ID for Facebook tracking (optional)
  - `NEXT_PUBLIC_GA4_ID` - Google Analytics 4 ID (optional)
  - `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_LABEL` - Google Ads conversion tracking (optional)

**Build:**
- `next.config.mjs` - Next.js configuration with:
  - Shopify CDN image optimization (`cdn.shopify.com` as remote pattern)
  - next-intl plugin integration for i18n
- `tsconfig.json` - TypeScript configuration with:
  - Path alias: `@/*` → `./src/*`
  - Next.js plugin for type generation
- `postcss.config.mjs` - PostCSS with Tailwind CSS v4 plugin
- `prisma.config.ts` - Prisma configuration pointing to `prisma/schema.prisma`
- `components.json` - shadcn/ui component registry configuration
- `eslint.config.mjs` - ESLint with Next.js core-web-vitals and TypeScript support

## Database

**Provider:** PostgreSQL (via `@prisma/adapter-pg`)

**Schema Location:** `prisma/schema.prisma`

**Generated Client:** `src/generated/prisma/client/` (auto-generated, not committed to repo in typical setups)

**Models:**
- `Order` - Customer orders with Stripe and shipping details
- `OrderItem` - Line items within orders
- `Affiliate` - Referral partners (influencers, media buyers, etc.)
- `AffiliateLoginToken` - One-time magic link tokens for affiliate login
- `Commission` - Commission payables per order
- `StripeEvent` - Idempotency log for Stripe webhooks
- `AdminUser` - Multi-user admin authentication

## Platform Requirements

**Development:**
- Node.js 20.x
- PostgreSQL database (local or remote)
- Shopify store with Storefront API access
- Stripe account with API keys
- Google Cloud project with Sheets API enabled (for order logging)
- SMTP mail server (for transactional emails)

**Production:**
- Node.js 20.x runtime
- PostgreSQL database (managed or self-hosted)
- All external API credentials (Stripe, Shopify, Google Sheets, SMTP)
- CDN for static assets (typically Vercel or similar)

---

*Stack analysis: 2026-06-17*
