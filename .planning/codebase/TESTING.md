# Testing Patterns

**Analysis Date:** 2026-06-17

## Test Framework

**Status:** No automated tests present in codebase.

The project currently has:
- No Jest, Vitest, or other test runner configured
- No test files in `src/` (no `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx` files)
- No test configuration files (`jest.config.*`, `vitest.config.*`)
- No test-related npm scripts in `package.json` (only `dev`, `build`, `start`, `lint`)

**Dependencies observation:**
- `@types/react`, `@types/node`, `@types/nodemailer` present (for TypeScript)
- No testing libraries in `devDependencies` (no `@testing-library/react`, `jest`, `vitest`, etc.)

## Recommended Testing Setup

For new test implementation, consider:

**Framework choice:**
- Vitest (recommended): Faster, native ESM support, excellent Vite/Next.js integration
- Jest: More mature ecosystem, widely adopted in Next.js projects

**Assertion library:**
- Vitest includes built-in assertions
- Jest has built-in matchers
- Add `@testing-library/react` for component testing
- Add `@testing-library/user-event` for realistic user interactions

**Configuration path:**
Create `vitest.config.ts` with Next.js support:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Where Tests Should Live

**File location pattern:**
- Co-located with source: `src/lib/orders.test.ts` next to `src/lib/orders.ts`
- Components: `src/components/Header.test.tsx` next to `src/components/Header.tsx`
- API routes: `src/app/api/admin/orders/route.test.ts` next to `src/app/api/admin/orders/route.ts`
- Directory structure mirrors source structure

**Naming convention:**
- `*.test.ts` or `*.test.tsx` (consistent with `@vitest/ui` auto-discovery)
- Not `*.spec.ts` (to avoid double test runs if both exist)

## Test Structure Pattern

Based on codebase patterns, tests should follow this structure:

**Example: Testing a utility function**
```typescript
// src/lib/orders.test.ts
import { describe, it, expect } from 'vitest';
import { generateOrderNumber, resolvePeriod } from './orders';

describe('generateOrderNumber', () => {
  it('should generate a valid order number format', () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^DIPS-\d{8}-[A-Z0-9]{6}$/);
  });

  it('should generate unique numbers on repeated calls', () => {
    const nums = [generateOrderNumber(), generateOrderNumber()];
    expect(new Set(nums).size).toBe(2);
  });
});

describe('resolvePeriod', () => {
  it('should resolve today period correctly', () => {
    const range = resolvePeriod('today', '', '');
    expect(range.createdAfter).toBeDefined();
    expect(range.createdBefore).toBeDefined();
  });

  it('should handle custom date range', () => {
    const range = resolvePeriod('custom', '2026-06-01', '2026-06-30');
    expect(range.createdAfter?.toISOString()).toContain('2026-06-01');
  });
});
```

**Example: Testing an API route**
```typescript
// src/app/api/admin/login/route.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/prisma';

// Mock Prisma and bcrypt
vi.mock('@/lib/prisma');
vi.mock('bcryptjs');

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = 'test-secret';
  });

  it('should create admin user in setup mode', async () => {
    const request = new Request('http://localhost:3000/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@test.com', password: 'test-secret' }),
    });

    vi.mocked(prisma.adminUser.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.adminUser.create).mockResolvedValueOnce({
      id: 'user-123',
      email: 'admin@test.com',
      passwordHash: 'hashed',
      active: true,
      name: 'Admin',
      createdAt: new Date(),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(200);
  });

  it('should reject invalid password in setup mode', async () => {
    const request = new Request('http://localhost:3000/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@test.com', password: 'wrong' }),
    });

    vi.mocked(prisma.adminUser.count).mockResolvedValueOnce(0);

    const response = await POST(request as any);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.error).toContain('Invalid setup key');
  });
});
```

**Example: Testing a React component**
```typescript
// src/components/Header.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartProvider } from '@/contexts/CartContext';
import Header from './Header';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('Header', () => {
  it('should render navigation links', () => {
    render(
      <CartProvider>
        <Header />
      </CartProvider>
    );

    expect(screen.getByText('about')).toBeInTheDocument();
    expect(screen.getByText('product')).toBeInTheDocument();
    expect(screen.getByText('affiliates')).toBeInTheDocument();
  });

  it('should display cart item count', () => {
    render(
      <CartProvider>
        <Header />
      </CartProvider>
    );

    // Cart should initially be empty
    const cartBadges = screen.queryAllByText(/^\d+$/);
    expect(cartBadges).toHaveLength(0);
  });

  it('should toggle mobile menu on button click', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <Header />
      </CartProvider>
    );

    const menuButton = screen.getByLabelText('Toggle menu');
    await user.click(menuButton);

    // Mobile menu should be visible
    expect(screen.getByText('about')).toBeVisible();
  });
});
```

## Mocking

**Database mocking (Prisma):**
- Mock at module level: `vi.mock('@/lib/prisma')`
- Provide resolved/rejected values per test: `vi.mocked(prisma.adminUser.count).mockResolvedValueOnce(0)`
- Reset mocks between tests: `vi.clearAllMocks()` in `beforeEach`

**External service mocking (Stripe, Google Sheets, email):**
- Mock the service module: `vi.mock('@/lib/stripe')`
- For HTTP calls, use `vi.mock()` or mock `fetch` globally
- Stripe webhook testing: Mock `stripe.webhooks.constructEvent()`

**React component mocking:**
- Mock context providers at component level if needed
- Use `vi.mock()` for `next-intl`, `next/navigation`, etc.
- Prefer `render()` from `@testing-library/react` with actual components

**What to mock:**
- Database (Prisma) — always mock to avoid test database
- External APIs (Stripe, Google Sheets, email) — avoid network calls
- `next-intl`, `next/navigation` hooks — mock for predictable behavior
- `process.env` — set in test setup or per test
- Long-running operations — mock or stub for speed

**What NOT to mock:**
- Core utilities (`src/lib/utils.ts` — real `cn()` function)
- Internal business logic (test it as integration)
- Standard library functions (Promise, Date, etc.)
- User interactions (use `@testing-library/user-event` instead)

## Fixtures and Test Data

**Test data factory patterns (to create when implementing tests):**

```typescript
// test/fixtures/orders.ts
import { type Order } from '@/lib/orders';

export const createMockOrder = (overrides?: Partial<Order>): Order => ({
  id: 'order-123',
  orderNumber: 'DIPS-20260617-ABC123',
  stripeSessionId: 'cs_test_123',
  stripePaymentIntentId: null,
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  subtotal: 1000,
  shippingCost: 500,
  tax: 100,
  discount: 0,
  total: 1600,
  currency: 'usd',
  status: 'PENDING_PAYMENT',
  paymentStatus: 'PENDING',
  fulfillmentStatus: 'UNFULFILLED',
  shippingName: 'John Doe',
  shippingAddressLine1: '123 Main St',
  shippingAddressLine2: null,
  shippingCity: 'Springfield',
  shippingState: 'IL',
  shippingPostalCode: '62701',
  shippingCountry: 'US',
  shopifyProductId: null,
  shopifyVariantId: null,
  shopifyHandle: null,
  items: [],
  notes: null,
  internalNotes: null,
  confirmationEmailSentAt: null,
  shippedEmailSentAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockAffiliate = (overrides?: Partial<AffiliateRow>): AffiliateRow => ({
  id: 'aff-123',
  name: 'Test Influencer',
  ref: 'test-influencer',
  email: 'aff@example.com',
  instagram: '@testinfluencer',
  type: 'INFLUENCER' as const,
  commissionRate: 0.15,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  ordersCount: 5,
  attributedRevenueCents: 50000,
  pendingAmount: 5000,
  approvedAmount: 3000,
  paidAmount: 2000,
  ...overrides,
});
```

**Location:** `test/fixtures/` directory (create when implementing tests)

## Coverage

**Requirements:** None currently enforced.

**When implementing tests, add to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

**Add coverage config to `vitest.config.ts`:**
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/generated/',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
});
```

**View Coverage:**
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

**Suggested minimums (when tests are added):**
- `src/lib/` utilities: 80%+ (business logic)
- `src/app/api/` routes: 70%+ (integration-heavy)
- `src/components/` presentational: 50%+ (UI changes frequently)

## Test Types

**Unit Tests:**
- Scope: Single function or utility in isolation
- Approach: Mock all external dependencies
- Location: `src/lib/*.test.ts`
- Examples: `generateOrderNumber()`, `resolvePeriod()`, validation helpers

**Integration Tests:**
- Scope: Multiple modules working together (lib + API route)
- Approach: Mock only external services (database, Stripe)
- Location: `src/app/api/*/route.test.ts`
- Examples: POST /api/admin/login (validates input → hashes password → creates user)

**Component Tests:**
- Scope: React component rendering and interactions
- Approach: Mock context providers and external dependencies
- Location: `src/components/*.test.tsx`
- Examples: Header navigation, CartDrawer state changes

**E2E Tests:**
- Status: Not currently implemented
- Recommended framework: Playwright or Cypress (if added)
- Scope would cover: Full user workflows (affiliate signup → login → dashboard)

## Common Patterns

**Async Testing:**
```typescript
// Vitest pattern
it('should fetch orders', async () => {
  const orders = await getOrders({ page: 1, limit: 10 });
  expect(orders.orders).toHaveLength(0);
  expect(orders.totalPages).toBe(0);
});

// With mocking
vi.mocked(prisma.order.findMany).mockResolvedValueOnce([]);
vi.mocked(prisma.order.count).mockResolvedValueOnce(0);
```

**Error Testing:**
```typescript
it('should throw on missing DATABASE_URL', () => {
  delete process.env.DATABASE_URL;
  expect(() => createPrismaClient()).toThrow('Missing DATABASE_URL');
});

it('should reject duplicate email', async () => {
  vi.mocked(prisma.affiliate.create).mockRejectedValueOnce(
    new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      meta: { target: ['ref'] },
    })
  );

  await expect(
    createAffiliate({ name: 'Test', ref: 'test', ... })
  ).rejects.toThrow('already exists');
});
```

**Promise Testing:**
```typescript
it('should handle partial failures in bulk operations', async () => {
  const results = await Promise.allSettled([
    Promise.resolve('ok'),
    Promise.reject(new Error('fail')),
  ]);

  expect(results[0]).toEqual({ status: 'fulfilled', value: 'ok' });
  expect(results[1]).toEqual({ status: 'rejected', reason: Error('fail') });
});
```

---

*Testing analysis: 2026-06-17*

## Summary

This codebase currently has **zero automated tests**. To establish a testing foundation:

1. **Install Vitest** and testing libraries
2. **Create `vitest.config.ts`** with Next.js + jsdom environment
3. **Start with utility tests** (`src/lib/*.test.ts`) — highest ROI, easiest to test
4. **Add API route tests** (`src/app/api/*/route.test.ts`) — cover business logic paths
5. **Add component tests** for complex interactive components (Header, AdminTables, Forms)
6. **Coverage targets:** 80%+ for `src/lib/`, 70%+ for `src/app/api/`

The patterns above show how to structure tests to match this codebase's architecture.
