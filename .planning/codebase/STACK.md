# Technology Stack

**Analysis Date:** 2026-07-03

## Languages

**Primary:**
- TypeScript 5.9.3 (strict mode) - entire `src/` tree (`tsconfig.json`)

**Secondary:**
- SQL (Prisma migrations) - `prisma/migrations/*/migration.sql`
- CSS (Tailwind v4 utility classes + globals) - `src/app/globals.css`

## Runtime

**Environment:**
- Node.js v20.19.6 (pinned via `.nvmrc`)
- Deployment target implied: Vercel (Next.js app, `images.remotePatterns` for Shopify CDN in `next.config.mjs`)

**Package Manager:**
- npm (lockfile: `package-lock.json` present, 317KB)

## Frameworks

**Core:**
- Next.js 15.3.6 (App Router, React Server Components) - `src/app/`, `next.config.mjs`
- React 19.0.0 / React DOM 19.0.0
- next-intl 4.5.8 - i18n routing/middleware (`src/i18n/routing.ts`, `src/i18n/request.ts`, `src/middleware.ts`), locales: `en` (default), `es`, `pt`

**Testing:**
- Not detected — no test runner, no `*.test.*`/`*.spec.*` files, no `jest.config.*`/`vitest.config.*` found in the repo.

**Build/Dev:**
- Tailwind CSS v4 (`@tailwindcss/postcss` plugin) - `postcss.config.mjs`, styling via `components.json` (shadcn/ui, "new-york" style, `neutral` base color, `lucide` icons)
- ESLint 9 (flat config) extending `next/core-web-vitals` and `next/typescript` - `eslint.config.mjs`
- Prisma CLI 7.5.0 - schema/migrations (`prisma/schema.prisma`, `prisma.config.ts`)
- `tsx` (via `npx tsx`) - runs the admin bootstrap script (`scripts/create-admin.ts`)

## Key Dependencies

**Critical:**
- `stripe` 20.0.0 (server SDK) + `@stripe/stripe-js` 8.5.3 (client SDK) - payments, checkout sessions, webhooks (`src/lib/stripe.ts`, `src/app/api/stripe/*`)
- `@prisma/client` 7.5.0 + `@prisma/adapter-pg` 7.5.0 + `pg` 8.20.0 - PostgreSQL ORM/driver, custom output path `src/generated/prisma/client` (`src/lib/prisma.ts`)
- `jose` 6.2.3 - Edge-safe JWT signing/verification for admin sessions (`src/lib/session.ts`)
- `googleapis` 171.4.0 - Google Sheets API client for warehouse order sync (`src/lib/google-sheets.ts`)
- `nodemailer` 8.0.4 - transactional email via SMTP (`src/lib/email.ts`, `src/lib/email-templates.ts`)
- Node built-in `node:crypto` (scrypt) - admin password hashing, no external dependency (`src/lib/password.ts`)

**UI/Presentation:**
- Radix UI primitives: `@radix-ui/react-accordion`, `react-checkbox`, `react-label`, `react-select`, `react-slot`
- `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate` - styling utility stack (shadcn/ui pattern)
- `framer-motion` 12.23.26 - animation components (`src/components/animations/*`)
- `lucide-react` - icon library

**Infrastructure:**
- `dotenv` 17.3.1 - loads env vars for Prisma CLI config (`prisma.config.ts`)

## Configuration

**Environment:**
- `.env` / `.env.local` present locally (not committed; `.gitignore` excludes `.env*` except `.env.example`)
- `.env.example` documents required vars (names only, see INTEGRATIONS.md)
- Env vars read directly via `process.env.*` throughout `src/lib/*` — no centralized config/env-validation module (e.g. no `zod` env schema detected)

**Build:**
- `next.config.mjs` - wraps config with `next-intl` plugin, whitelists `cdn.shopify.com` for `next/image`
- `tsconfig.json` - path alias `@/*` → `./src/*`, target ES2017, strict mode, bundler module resolution
- `components.json` - shadcn/ui generator config (aliases for `@/components`, `@/lib`, `@/hooks`, `@/components/ui`)
- `prisma.config.ts` - Prisma 7 config format (schema path, migrations path, datasource URL from env)

## Platform Requirements

**Development:**
- Node 20.x, npm, local PostgreSQL (or remote `DATABASE_URL`) for Prisma
- `npm run dev` (Next.js dev server), `npm run create-admin` (bootstrap script via `scripts/create-admin.ts`)

**Production:**
- `npm run build` → runs `prisma generate` then `next build` (see `package.json` `build` script)
- `postinstall` hook also runs `prisma generate` automatically after `npm install`
- Requires PostgreSQL database, Stripe account, Shopify Storefront API access, SMTP provider, and optionally Google Sheets service account + Meta/Google tracking IDs (see INTEGRATIONS.md)

---

*Stack analysis: 2026-07-03*
