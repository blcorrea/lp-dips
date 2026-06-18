# Coding Conventions

**Analysis Date:** 2026-06-17

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Header.tsx`, `CartContext.tsx`, `AffiliatesTable.tsx`)
- Pages: `page.tsx` (Next.js convention, exact lowercase)
- Routes: `route.ts` (Next.js API convention)
- Utilities/libraries: camelCase (e.g., `utils.ts`, `email.ts`, `prisma.ts`, `admin-auth.ts`)
- Data files: camelCase (e.g., `products.ts`, `customers.ts`, `inventory.ts`)
- Middleware: `middleware.ts` (exact case)

**Functions:**
- camelCase, descriptive verbs: `createAffiliate()`, `isAdminAuthenticated()`, `sendEmail()`, `getOrderById()`
- Boolean predicates start with `is` or `has`: `isValidAffiliateType()`, `isAdminAuthed()`, `hasSelection`
- Private/internal functions: same camelCase (no leading underscore convention observed)

**Variables:**
- camelCase: `transporter`, `itemCount`, `selectedIds`, `currentItems`
- Constants: UPPER_SNAKE_CASE: `ADMIN_COOKIE_NAME`, `STRIPE_PUBLISHABLE_KEY`, `VALID_AFFILIATE_TYPES`
- State variables: camelCase: `values`, `saving`, `success`, `error`
- Type instances: camelCase: `builder`, `res`, `data`, `orders`

**Types:**
- Interfaces/Types: PascalCase: `CartContextType`, `EmailPayload`, `EditFormValues`, `AffiliateRow`, `Order`
- Type imports: `type { Order, OrderStatus }` (explicit `type` keyword)
- Enum-like objects: UPPER_SNAKE_CASE keys: `PAYMENT_METHODS`, `STATUS_COLORS`, `FULFILLMENT_OPTIONS`

## Code Style

**Formatting:**
- No explicit Prettier config found; uses ESLint and Next.js defaults
- Line breaks: Uses `\n` (Unix style) throughout
- Indentation: 2 spaces (consistent across files)
- Trailing commas: Used in multiline objects/arrays
- Semicolons: Required (enforced by ESLint config extending `next/typescript`)

**Linting:**
- Tool: ESLint (v9) with flat config
- Config: `eslint.config.mjs` extends `next/core-web-vitals` and `next/typescript`
- No custom rules beyond Next.js defaults
- TypeScript strict mode enabled in `tsconfig.json`

**Line length:**
- No hard limit enforced; typical patterns show ~80-120 characters before wrapping

## Import Organization

**Order:**
1. External third-party libraries (`react`, `next/*`, `stripe`, etc.)
2. Type imports from third-party (`import type`)
3. Internal absolute imports (`@/lib/*`, `@/components/*`, `@/contexts/*`)
4. Type imports from internal (`import type { Order } from '@/lib/orders'`)

**Examples from codebase:**
```typescript
// Header.tsx
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import SocialMediaButtons from "@/components/SocialMediaButtons";

// admin-affiliates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client/client';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAffiliate, getAffiliatesWithStats } from '@/lib/affiliates';
```

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use absolute imports with `@/` prefix; never relative paths for module boundaries

## Error Handling

**Patterns:**
- Validation errors: Return `NextResponse.json({ error: string }, { status: 400|401|409 })` from API routes
- Type checking: Explicit `typeof` checks before use (seen in route handlers)
- Try-catch blocks: Used for JSON parsing and database operations
- Prisma errors: Check `err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'`
- Promise handling: `Promise.allSettled()` for bulk operations to capture partial failures
- Error re-throwing: Explicitly re-throw after logging (example in `email.ts` line 53)

**Console error patterns:**
```typescript
console.error('❌ Email error:', error);
console.error('❌ Failed to send shipping notification email:', err);
console.error('Bulk set_fulfillment error:', r.reason);
```

## Logging

**Framework:** `console.log()`, `console.warn()`, `console.error()` (no external logging library)

**Patterns:**
- Informational: Emoji prefix for clarity: `📧`, `📨`, `✅`, `❌`, `ℹ️`, `⚠️`, `💰`
- Log structure: `console.log('Message', { context: data })`
- Error logs: Always include error object or message
- Location: Logs appear in API routes, email functions, and Stripe webhook handlers
- No log levels or structured logging framework

**Examples:**
```typescript
console.log('📧 Sending email to:', options.to);
console.log('📨 Email sent:', info.messageId);
console.error('❌ Email error:', error);
console.log('✅ Order operational data synced to Google Sheets', { orderId, sheetRow });
console.error('❌ Google Sheets update sync failed (non-critical):', err);
```

## Comments

**When to Comment:**
- Section separators: Dashed lines (`// ──────────────────────────────────────...`)
- Complex logic: Explain the "why" before conditional branches
- Non-obvious state management: Document why state is managed a certain way
- Edge cases: Document workarounds and their rationale

**JSDoc/TSDoc:**
- Function documentation: Yes, used for public APIs in `lib/*.ts` files
- Example from `email-templates.ts`:
```typescript
/**
 * Maps a period preset (or 'custom') and optional custom date strings to a
 * UTC date range suitable for filtering orders by createdAt.
 *
 *   today       → [00:00 UTC today,          00:00 UTC tomorrow)
 *   yesterday   → [00:00 UTC yesterday,       00:00 UTC today)
 *   ...
 */
export function resolvePeriod(period: string, fromStr: string, toStr: string): DateRange
```
- Component props: Minimal JSDoc; interfaces define the shape

**Section headers:**
- Format: `// ─────────────────────────────────────────────────────────────────────────────`
- Used to organize code into logical chunks (Types, Setup, Operations, Helpers)

## Function Design

**Size:** 
- Small utility functions: ~5–15 lines (formatting, validation)
- Handlers: ~20–60 lines (API route handlers, event handlers)
- Large complex functions: 100+ lines (webhook processing, dashboard queries)
- No explicit size limit; composition preferred over monolithic functions

**Parameters:**
- Use destructuring for related parameters: `{ email, password }` from request body
- Object params for configurations: `{ page, limit, status, ... }` in filter objects
- Single complex objects for data: `input: CreateOrderInput` rather than spreading fields

**Return Values:**
- Explicit return types: `Promise<Order | null>`, `NextResponse`, `PaginatedOrders`
- Null for "not found" patterns (never throw): `getOrderById() → Order | null`
- Wrapped responses: API routes always return JSON: `NextResponse.json({ ok: true, data }, { status })`
- Type narrowing: Use type predicates for validation: `isValidAffiliateType(v): v is AffiliateType`

## Module Design

**Exports:**
- Named exports for utility functions: `export function sendEmail()`, `export async function createOrder()`
- Default export for components: `export default function Header()`
- Type exports: `export type { Order, CommissionRow }`
- Re-exports for public interfaces: `export type { OrderStatus } from Prisma`

**Barrel Files:**
- Not used; imports are direct to modules (e.g., `@/lib/email`, `@/lib/prisma`)
- Generated Prisma client in `src/generated/prisma/client/` is the closest to a barrel

**Module organization in `src/lib/`:**
- `admin-auth.ts`: Admin session management
- `affiliate-auth.ts`: Affiliate session management
- `prisma.ts`: Prisma client singleton
- `email.ts`: SMTP transport
- `email-templates.ts`: Email HTML generation
- `orders.ts`: Order CRUD and queries
- `affiliates.ts`: Affiliate and commission queries
- `stripe.ts`: Stripe client and payment method constants
- `google-sheets.ts`: Google Sheets integration
- Boundary: Libraries export public types so consumers don't import generated Prisma client directly

## Async/Await

**Patterns:**
- Used extensively in API routes and server components
- Promise.all() for parallel operations
- Promise.allSettled() for bulk operations where partial failures are acceptable
- No callback-based patterns; Promises are standard
- Transaction use: `prisma.$transaction(async (tx) => { ... })`

## Conditional Rendering (React)

**Patterns:**
- Inline ternary for simple cases: `{itemCount > 0 && <span>...</span>}`
- Short-circuit evaluation: `{condition && <Component />}`
- Multiple sections: Separate `{section1} {section2}` renders

## Tailwind CSS

**Patterns:**
- Class string construction: `const inputCls = 'rounded-lg border ... '`
- Conditional classes: `className={cn(baseClass, { 'extra-class': condition })}`
- `cn()` utility function from `src/lib/utils.ts` merges Tailwind classes with `clsx` + `tailwind-merge`
- No custom CSS files; all styling via Tailwind classes
- Color tokens: `text-brand-purple`, `bg-brand-orange`, `bg-brand-cream` (custom theme configured)

---

*Convention analysis: 2026-06-17*
