# Testing Patterns

**Analysis Date:** 2026-05-14

## Test Framework

**Runner:** None detected.

No test runner is configured in this project. There is no `jest.config.*`, `vitest.config.*`, or equivalent file present. There are no `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files anywhere in the repository.

**Assertion Library:** None.

**Run Commands:**
```bash
# No test commands available — package.json scripts:
npm run dev       # next dev
npm run build     # prisma generate && next build
npm run start     # next start
npm run lint      # next lint
```

## Test File Organization

**Location:** Not applicable — no test files exist.

**Naming:** Not applicable.

**Structure:** Not applicable.

## Test Structure

No test infrastructure is present. The codebase contains only production code.

## Mocking

**Framework:** None.

No mocking library (jest, vitest, msw, etc.) is installed as a dev dependency.

## Fixtures and Factories

**Test Data:** Not applicable.

Static fixture data does exist as in-memory arrays in `src/data/products.ts`, `src/data/customers.ts`, `src/data/inventory.ts`, and `src/data/orders.ts`. These are used for development/seeding purposes, not as test fixtures.

## Coverage

**Requirements:** None enforced.

**View Coverage:**
```bash
# Not available — no coverage tooling configured.
```

## Test Types

**Unit Tests:** Not present.

**Integration Tests:** Not present.

**E2E Tests:** Not present — no Playwright, Cypress, or similar tooling installed.

## Key Areas Lacking Test Coverage

The following business-critical paths have zero automated test coverage:

**Order processing:**
- `src/lib/orders.ts` — `createOrder`, `updateOrder`, `generateOrderNumber`, `resolvePeriod`, `buildOrderWhere`
- `src/app/api/stripe/webhook/route.ts` — idempotency logic, commission creation, P2002 handling

**Pricing and locale:**
- `src/lib/pricing.ts` — `getLocalizedPricing`, `formatLocalizedPrice`, `isSupportedLocale`

**Affiliate commissions:**
- `src/lib/affiliates.ts` — `transitionCommission` state machine, `buildAffiliateLink`, `buildCommissionWhere`

**Authentication:**
- `src/lib/admin-auth.ts` — `isAdminAuthenticated`
- `src/middleware.ts` — admin route protection, locale redirect logic

**Cart context:**
- `src/contexts/CartContext.tsx` — `addItem` quantity capping, `updateQuantity`, localStorage persistence

---

*Testing analysis: 2026-05-14*
