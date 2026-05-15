# Coding Conventions

**Analysis Date:** 2026-05-14

## Naming Patterns

**Files:**
- React page components: `page.tsx` (Next.js App Router convention)
- React layout components: `layout.tsx`
- React client components (co-located with pages): `PascalCase.tsx` — e.g., `OrdersTable.tsx`, `EditForm.tsx`, `LoginForm.tsx`
- Shared components: `PascalCase.tsx` in `src/components/` — e.g., `CartDrawer.tsx`, `ProductCard.tsx`
- UI primitives: `lowercase.tsx` in `src/components/ui/` — e.g., `button.tsx`, `select.tsx`
- Library/utility modules: `kebab-case.ts` in `src/lib/` — e.g., `admin-auth.ts`, `shopify-product.ts`
- API route files: `route.ts` (Next.js convention)
- Context providers: `PascalCaseContext.tsx` — e.g., `CartContext.tsx`, `CustomerContext.tsx`
- Data modules: `plural-noun.ts` in `src/data/` — e.g., `products.ts`, `orders.ts`

**Functions:**
- camelCase for all functions: `createOrder`, `getLocalizedPricing`, `isAdminAuthenticated`
- Boolean predicates prefixed with `is` or `has`: `isInCart`, `isInWishlist`, `hasDiscount`, `isSupportedLocale`, `isAdminAuthenticated`
- Factory/getter functions: `createPrismaClient`, `getStripe`, `getPurchasableDipsProduct`
- Event handlers: `handle` prefix — `handleAddToCart`, `handleWishlistToggle`
- Builder/internal helpers: `build` prefix — `buildOrderWhere`, `buildCommissionWhere`, `buildAffiliateLink`

**Variables:**
- camelCase throughout: `stripeSecretKey`, `webhookSecret`, `normalizedLocale`
- Single-letter abbreviations used for loop/map vars: `a` (affiliate), `g` (group), `r` (result), `c` (commission), `b` (bucket)
- Constants (module-level, non-exported): SCREAMING_SNAKE_CASE — `CLIENT_REF_PATTERN`, `CART_STORAGE_KEY`, `ADMIN_COOKIE_NAME`
- Exported constants: SCREAMING_SNAKE_CASE — `VALID_COMMISSION_STATUSES`, `REF_REGEX`, `LOCALIZED_PRICING`

**Types and Interfaces:**
- PascalCase for all types/interfaces: `CreateOrderInput`, `AffiliateRow`, `CartItem`
- `Input` suffix for function parameter types: `CreateOrderInput`, `UpdateOrderInput`, `GetOrdersInput`
- `Row` suffix for serializable/flat display types: `AffiliateRow`, `CommissionRow`, `OrderRow`
- `type` keyword preferred over `interface` for most definitions — `interface` used for React props and exported API shapes
- Props interfaces named `ComponentNameProps`: `ProductCardProps`, `ButtonProps`

## Code Style

**Formatting:**
- No Prettier config detected — formatting is ad hoc (indentation varies: 2 spaces in `src/lib/`, 4 spaces in `src/components/`)
- Single quotes for strings in most files; double quotes in some JSX attributes
- Trailing commas in multi-line objects/arrays

**Linting:**
- ESLint with `next/core-web-vitals` and `next/typescript` rule sets
- Config: `eslint.config.mjs` using ESLint flat config format
- `eslint-disable` comments used sparingly (e.g., `@typescript-eslint/no-explicit-any` in `src/app/[locale]/layout.tsx`)

**TypeScript:**
- `strict: true` in `tsconfig.json`
- `noEmit: true` — TypeScript used for type-checking only, not compilation
- Target `ES2017`
- Prefer explicit return types on exported async functions: `Promise<Order>`, `Promise<boolean>`
- Use `unknown` for untyped input, then narrow: `body as Record<string, unknown>` pattern in API routes

## Import Organization

**Order:**
1. Next.js/React built-ins: `import { NextRequest, NextResponse } from 'next/server'`, `import React from 'react'`
2. Third-party packages: `import Stripe from 'stripe'`, `import nodemailer from 'nodemailer'`
3. Internal `@/lib/*` modules
4. Internal `@/components/*` modules
5. Internal `@/contexts/*`, `@/data/*`, `@/i18n/*` modules

**Path Aliases:**
- `@/*` maps to `./src/*` — used throughout (e.g., `@/lib/prisma`, `@/components/ui/button`, `@/contexts/CartContext`)
- Relative imports only used within the same sub-tree (e.g., `'../generated/prisma/client/client'` in `src/lib/`)

## Error Handling

**API Routes (server-side):**
- Wrap entire handler body in `try/catch`
- Return typed JSON: `NextResponse.json({ error: message }, { status: N })`
- Use `ok: true/false` as response envelope — e.g., `{ ok: true, order }` vs `{ ok: false, error: '...' }`
- Prisma error codes checked explicitly: `P2002` (unique constraint), `P2025` (not found)
- Pattern: `err instanceof Error ? err.message : 'Fallback message'`

**Client-side:**
- `try/catch` around localStorage access (e.g., `CartContext.tsx`, `CustomerContext.tsx`)
- Error state surfaced via `console.error` in contexts
- UI error state: `useState` for local `error: string | null` field

**Library functions:**
- Throw on missing required env vars at module initialization (fail-fast): `throw new Error('Missing DATABASE_URL')`
- Return `null` (not throw) for optional "not found" results: `getOrderById`, `getPurchasableDipsProduct`
- Result-object pattern for state-machine transitions: `{ ok: true } | { ok: false; reason: string }` in `transitionCommission`

## Logging

**Framework:** `console` (no structured logger library)

**Patterns:**
- Server/API code: prefixed emoji labels for quick visual scanning:
  - `✅` — success
  - `❌` — failure/error
  - `⚠️` — warning/duplicate
  - `ℹ️` — informational/skipped
  - `💰` — commission events
  - `📧`/`📨` — email events
  - `🚀` — operation started
- Log objects as second argument for structured context: `console.log('✅ order created', { eventId, sessionId })`
- `console.error` for caught exceptions; `console.log` for business events; `console.warn` for non-critical anomalies
- No logging in pure data/utility functions (`src/lib/pricing.ts`, `src/lib/utils.ts`)
- Debug `console.log` left in client pages (e.g., `src/app/[locale]/checkout/page.tsx` lines 33–35) — not systematically removed

## Comments

**When to Comment:**
- Section dividers using dashed rule comments: `// ─────────────────── Section Name ───────────────────`
- Inline `// ── Sub-section heading ──` for visual scoping within large files
- JSDoc `/** ... */` blocks on exported functions explaining non-obvious behavior or caveats
- Inline comments explaining business rules or tradeoffs (e.g., webhook idempotency strategy)
- Portuguese comments appear occasionally in layout files (mixed-language code comments)

**JSDoc/TSDoc:**
- Used on exported library functions in `src/lib/orders.ts` and `src/lib/affiliates.ts`
- Not consistently applied across components or API routes

## Function Design

**Size:** Large functions are common in route handlers (webhook handler in `src/app/api/stripe/webhook/route.ts` is ~550 lines). Helper extraction used within files but no systematic size limit enforced.

**Parameters:** Input objects (typed with `*Input` suffix) preferred over positional parameters for functions with more than 2 args.

**Return Values:**
- Async functions always return `Promise<T>` with explicit generic
- Nullable results typed as `T | null` (not `T | undefined`)
- Collections return `T[]` (never `null` for empty sets — see `getOrdersByIds`)

## Module Design

**Exports:**
- Named exports preferred throughout (`export function`, `export type`, `export const`)
- Default export only for Next.js conventions (page components, layout, middleware, API routes)
- `"use client"` directive at top of client component files; absent means Server Component by default

**Barrel Files:** Not used. No `index.ts` re-exports. Consumers import directly from source file paths.

**Section Organization in Lib Files:**
- Large lib files (`orders.ts`, `affiliates.ts`) use visual section dividers (`// ── Section ──`) grouping: Types → Input types → Helpers → Read operations → Write operations

---

*Convention analysis: 2026-05-14*
