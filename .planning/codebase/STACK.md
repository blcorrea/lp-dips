# Technology Stack

**Analysis Date:** 2026-05-14

## Languages

**Primary:**
- TypeScript 5.9.3 - All source files in `src/`; strict mode enabled (`tsconfig.json`)

**Secondary:**
- CSS (Tailwind utility classes) - Component styling throughout `src/components/` and `src/app/`

## Runtime

**Environment:**
- Node.js 20.x (v20.19.6 confirmed on dev machine; `package-lock.json` lockfileVersion 3)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present (lockfileVersion 3)

## Frameworks

**Core:**
- Next.js 15.3.6 - App Router; server components (`rsc: true`); entry at `src/app/layout.tsx`
- React 19.0.0 - UI rendering; React DOM 19.0.0
- next-intl 4.5.8 - i18n routing and translation; configured in `next.config.mjs` via `createNextIntlPlugin`; locales: `en`, `es`, `pt`; routing at `src/i18n/routing.ts`

**ORM / Database:**
- Prisma 7.5.0 - Schema at `prisma/schema.prisma`; generated client output at `src/generated/prisma/client/`; configured via `prisma.config.ts`
- `@prisma/adapter-pg` 7.5.0 - PostgreSQL adapter; used in `src/lib/prisma.ts` with `PrismaPg`
- `pg` 8.20.0 - Underlying PostgreSQL driver

**UI Components:**
- shadcn/ui (new-york style) - Component library scaffolded via `components.json`; components in `src/components/ui/`
- Radix UI primitives: `@radix-ui/react-accordion`, `@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-slot`
- lucide-react 0.559.0 - Icon library (configured as iconLibrary in `components.json`)
- framer-motion 12.23.26 - Animation; components in `src/components/animations/`

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS; PostCSS via `postcss.config.mjs` using `@tailwindcss/postcss`
- tailwind-merge 3.4.0 - Class merging utility (`src/lib/utils.ts`)
- tailwindcss-animate 1.0.7 - Animation utilities
- class-variance-authority 0.7.1 - Variant styling for components

**Testing:**
- Not detected — no test framework configured

**Build/Dev:**
- ESLint 9 with `eslint-config-next` 15.3.6 - Linting; config at `eslint.config.mjs` using `next/core-web-vitals` and `next/typescript` rulesets
- TypeScript compiler - `noEmit: true`; build type-checks only; `tsconfig.json`

## Key Dependencies

**Critical:**
- `stripe` 20.0.0 - Server-side Stripe SDK; used in `src/app/api/stripe/create-checkout-session/route.ts` and `src/app/api/stripe/webhook/route.ts`
- `@stripe/stripe-js` 8.5.3 - Client-side Stripe.js loader; `src/lib/stripe.ts`
- `googleapis` 171.4.0 - Google Sheets API via service account; `src/lib/google-sheets.ts`
- `nodemailer` 8.0.4 - SMTP email delivery (Zoho Mail); `src/lib/email.ts`
- `dotenv` 17.3.1 - Environment loading in `prisma.config.ts` for Prisma CLI commands

**Infrastructure:**
- `next-intl` 4.5.8 - Multi-locale routing and message loading; messages in `messages/en.json`, `messages/es.json`, `messages/pt.json`
- `clsx` 2.1.1 - Conditional class joining

## Configuration

**Environment:**
- `.env.example` documents all required variables (see INTEGRATIONS.md for full list)
- `.env` and `.env.local` present at project root (never committed)
- `NEXT_PUBLIC_*` vars are inlined at build time for client-side use

**Build:**
- `next.config.mjs` - Wraps next-intl plugin; allows remote images from `cdn.shopify.com`
- `tsconfig.json` - Path alias `@/*` maps to `./src/*`; target ES2017; `isolatedModules: true`
- `prisma.config.ts` - Schema path and migrations path; reads `DATABASE_URL` from env
- `postcss.config.mjs` - Tailwind CSS PostCSS plugin
- `components.json` - shadcn/ui configuration; CSS variables enabled; base color neutral

## Platform Requirements

**Development:**
- Node.js 20.x
- PostgreSQL-compatible database (Neon or Supabase recommended per `.env.example`)
- `npm install` triggers `prisma generate` via `postinstall` script
- `npm run dev` starts Next.js dev server

**Production:**
- Deployment target: Vercel (implied by Neon recommendation in `.env.example` and Next.js 15 App Router)
- Build command: `prisma generate && next build` (defined in `package.json` `build` script)
- Requires all env vars populated; Stripe webhook endpoint must be registered

---

*Stack analysis: 2026-05-14*
