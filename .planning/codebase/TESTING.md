# Testing Patterns

**Analysis Date:** 2026-07-03

## Test Framework

**Runner:**
- None configured. No `jest.config.*`, `vitest.config.*`, `playwright.config.*`, or any other test-runner config file exists in the project root (`/Users/blcorrea/lp-dips`).
- `package.json` `devDependencies` contain no test framework (`jest`, `vitest`, `@testing-library/*`, `mocha`, `playwright`, `cypress`, etc. are all absent). See `/Users/blcorrea/lp-dips/package.json`.
- No `test` (or `test:*`) script exists in `package.json`'s `scripts` block — only `dev`, `build`, `start`, `lint`, `create-admin`, `postinstall`.

**Assertion Library:**
- Not applicable — none present.

**Run Commands:**
```bash
# No test command exists. Available scripts are:
npm run dev            # next dev
npm run build           # prisma generate && next build
npm run lint             # next lint
npm run create-admin      # npx tsx scripts/create-admin.ts
```

## Test File Organization

**Location:**
- Not applicable. A repository-wide search for `*.test.*` and `*.spec.*` files (excluding `node_modules`) returned zero results.

**Naming:**
- No convention exists yet.

**Structure:**
```
No test directory or co-located test files exist anywhere in the repo.
```

## Test Structure

**Suite Organization:**
```typescript
// Not applicable — no test suites exist in this codebase.
```

**Patterns:**
- None established.

## Mocking

**Framework:** None.

**Patterns:**
```typescript
// Not applicable — no mocking library or patterns exist in this codebase.
```

**What to Mock:**
- Not established. If tests are introduced, likely candidates for mocking based on current external-dependency surface area:
  - Stripe SDK calls in `src/app/api/stripe/webhook/route.ts` and `src/app/api/stripe/create-checkout-session/route.ts` (`stripe.webhooks.constructEvent`, `stripe.checkout.sessions.retrieve`)
  - Prisma client (`src/lib/prisma.ts`) — used throughout `src/lib/orders.ts`, all `src/app/api/admin/**/route.ts` handlers
  - Google Sheets API client in `src/lib/google-sheets.ts` (`google.sheets(...)`)
  - Nodemailer transport in `src/lib/email.ts`
  - `node:crypto` timing-sensitive functions in `src/lib/password.ts` (scrypt is intentionally slow; would need mocking or increased timeouts in unit tests)

**What NOT to Mock:**
- Not established.

## Fixtures and Factories

**Test Data:**
```typescript
// No fixtures or factory files exist. `src/data/*.ts` (products.ts, orders.ts,
// customers.ts, inventory.ts, reviews.ts) contains static demo/seed content
// used directly by pages and components, not test fixtures.
```

**Location:**
- Not applicable.

## Coverage

**Requirements:** None enforced — no coverage tooling configured.

**View Coverage:**
```bash
# Not applicable — no coverage command exists.
```

## Test Types

**Unit Tests:**
- Not present. Highest-value untested logic includes pure functions well-suited to unit testing without mocks:
  - `resolvePeriod` (date-range resolution for admin dashboard filters) — `src/lib/orders.ts:116`
  - `buildOrderWhere` (Prisma WHERE-clause builder) — `src/lib/orders.ts:347`
  - `generateOrderNumber` — `src/lib/orders.ts:194`
  - `getLocalizedPricing`, `formatLocalizedPrice`, `getWeightLabel`, `isSupportedLocale` — `src/lib/pricing.ts`
  - `hashPassword` / `verifyPassword` round-trip — `src/lib/password.ts`
  - `createSessionToken` / `verifySessionToken` round-trip and tamper/expiry rejection — `src/lib/session.ts`

**Integration Tests:**
- Not present. The Stripe webhook handler (`src/app/api/stripe/webhook/route.ts`) is the highest-risk untested surface: it handles payment idempotency (P2002 "claim" pattern), order creation, commission calculation, and three non-critical downstream side effects (email, Google Sheets, warehouse notification). A regression here has direct revenue/data-integrity impact.
- Admin auth flow (`src/app/api/admin/login/route.ts` bootstrap-vs-normal-login branching) is also untested and security-sensitive.

**E2E Tests:**
- Not used. No Playwright/Cypress/etc. present.

## Common Patterns

**Async Testing:**
```typescript
// Not applicable — no async test patterns exist yet in this codebase.
```

**Error Testing:**
```typescript
// Not applicable — no error-path test patterns exist yet in this codebase.
```

## Recommendations for Introducing Tests

If a phase requires adding tests to this codebase for the first time:
- No existing convention to match — establish one deliberately rather than inferring from source.
- Given the stack (Next.js 15, TypeScript, Prisma 7, `pg` driver), **Vitest** is the lowest-friction choice (native ESM/TS support, fast, works well with Next.js App Router route handlers tested as plain async functions).
- Prisma access is centralized through the singleton in `src/lib/prisma.ts` — this is the natural seam to mock or point at a test database.
- `src/lib/session.ts` explicitly documents Edge-runtime compatibility constraints (no `node:crypto`, no `next/headers`, no Prisma) — any test harness touching this module must respect the same constraints or test it in isolation from Node-only modules like `src/lib/password.ts`.
- Route handlers (`src/app/api/**/route.ts`) export plain `async function GET/POST(request)` — they can be unit-tested by constructing a `NextRequest` directly and calling the exported handler, without needing a running server.

---

*Testing analysis: 2026-07-03*
