# Coding Conventions

**Analysis Date:** 2026-07-03

## Naming Patterns

**Files:**
- React components: PascalCase — `src/components/ProductCard.tsx`, `src/components/cart/CartDrawer.tsx`
- Route handler files: always `route.ts` inside a route segment directory — `src/app/api/admin/users/route.ts`
- Next.js page files: always `page.tsx` — `src/app/[locale]/product/[slug]/page.tsx`
- Library/utility modules: kebab-case or lowercase single word — `src/lib/admin-auth.ts`, `src/lib/google-sheets.ts`, `src/lib/pricing.ts`
- Data modules: lowercase plural nouns — `src/data/products.ts`, `src/data/orders.ts`
- Admin "manager"/table components co-located with their page: `src/app/admin/users/UsersManager.tsx` next to `src/app/admin/users/page.tsx`

**Functions:**
- camelCase throughout — `getOrders`, `createSessionToken`, `hashPassword`, `resolvePeriod`
- Boolean-returning helpers prefixed `is`/`has` — `isSupportedLocale` (`src/lib/pricing.ts`), `isAdminAuthenticated`, `isInCart`, `isUniqueConstraintError` (`src/app/api/stripe/webhook/route.ts`)
- Handlers in components prefixed `handle` — `handleAddToCart`, `handleWishlistToggle` (`src/components/products/ProductCard.tsx`)
- Data-fetch/mutation functions read like verbs on the resource: `getOrderById`, `updateOrderByStripePaymentIntentId`, `getDashboardData` (`src/lib/orders.ts`)

**Variables:**
- camelCase for locals and object fields.
- SCREAMING_SNAKE_CASE for module-level constants — `ADMIN_COOKIE_NAME`, `ADMIN_COOKIE_MAX_AGE` (`src/lib/admin-auth.ts`), `KEYLEN`, `SALT_BYTES` (`src/lib/password.ts`), `CART_STORAGE_KEY` (`src/contexts/CartContext.tsx`)
- Raw/unvalidated input values prefixed `raw` before narrowing — `rawEmail`, `rawPassword`, `rawRole` in `src/app/api/admin/users/route.ts` and `src/app/api/admin/login/route.ts`, then reassigned to a clean, typed const with the same base name (`email`, `password`, `role`).

**Types:**
- PascalCase for types/interfaces — `CartItem`, `CartContextType` (`src/contexts/CartContext.tsx`), `CreateOrderInput`, `PaginatedOrders` (`src/lib/orders.ts`)
- `*Input` suffix for function-argument shapes — `CreateOrderInput`, `UpdateOrderInput`, `GetOrdersInput` (`src/lib/orders.ts`)
- `*Data` suffix for cross-module payload shapes — `SheetRowData`, `SheetUpdateData` (`src/lib/google-sheets.ts`), `ConfirmationEmailData` (`src/lib/email-templates.ts`)
- Prisma-derived types re-exported/aliased from `src/lib/orders.ts` rather than importing `@prisma/client` types directly elsewhere: `export type Order = Prisma.OrderGetPayload<{ include: { items: true } }>`.

## Code Style

**Formatting:**
- No Prettier config present (`.prettierrc*` not found) — formatting is manual/editor-driven, not enforced by a formatter.
- **Two coexisting quote styles** depending on file age/area:
  - `src/lib/*.ts` and `src/app/api/**/route.ts` (newer, backend code): single quotes, semicolons — see `src/lib/orders.ts`, `src/app/api/admin/login/route.ts`.
  - `src/components/**/*.tsx` (older, frontend code): double quotes in many files, e.g. `src/lib/utils.ts` (`import { type ClassValue, clsx } from "clsx"`), `src/contexts/CartContext.tsx` mixes single quotes for JS strings with double quotes for JSX attributes.
  - **When adding new code:** match the surrounding file's existing quote style. For new `src/lib/` or `src/app/api/` files, prefer single quotes + semicolons (dominant pattern in backend code, ~127 files use the aligned-comment-block style below).
- **Aligned object/key formatting** is a strong, consistent convention in `src/lib/*.ts` and API routes — colons in object literals and multi-line destructuring are column-aligned for readability:
  ```typescript
  const email    = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';
  ```
  ```typescript
  return prisma.order.create({
    data: {
      orderNumber:           generateOrderNumber(),
      stripeSessionId:       input.stripeSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      ...
  ```
  Apply this alignment style when editing existing aligned blocks in `src/lib/` and `src/app/api/`; it is not used in `src/components/`.
- **Section-header comment banners** using full-width `─` (box-drawing) characters are used pervasively (127 occurrences) to divide files into logical sections. Pattern from `src/lib/orders.ts`:
  ```typescript
  // ─────────────────────────────────────────────────────────────────────────────
  // Read operations
  // ─────────────────────────────────────────────────────────────────────────────
  ```
  Shorter inline variant used for sub-sections inside route handlers, e.g. `src/app/api/admin/login/route.ts`:
  ```typescript
  // ── Bootstrap: the very first login. ... ──────────────────────────────────
  ```
  Use this convention for any new `src/lib/` module or non-trivial route handler with multiple logical sections.

**Linting:**
- ESLint via flat config `eslint.config.mjs`, extending `next/core-web-vitals` and `next/typescript` through `FlatCompat`. No custom rule overrides — relies entirely on Next.js's default rule sets.
- Run with `npm run lint` (`next lint`).

## Import Organization

**Order (observed convention, not enforced by tooling):**
1. External/framework packages first — `next/server`, `next/headers`, `react`, `stripe`, `googleapis`
2. Internal absolute imports via `@/` alias, typically framework-adjacent modules first (`@/lib/...`) then components/contexts
3. Relative imports (`./`, `../`) only used within the same directory/module family, e.g. `src/lib/orders.ts` imports the generated Prisma client via `../generated/prisma/client/client` and `./prisma`

Example (`src/app/api/stripe/webhook/route.ts`):
```typescript
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Prisma } from '@/generated/prisma/client/client';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/orders';
import {
  sendOrderConfirmationEmail,
  sendWarehouseNotificationEmail,
  type ConfirmationEmailData,
} from '@/lib/email-templates';
```

**Path Aliases:**
- `@/*` → `./src/*`, configured in `tsconfig.json`. Always use `@/lib/...`, `@/components/...`, `@/contexts/...`, `@/data/...` instead of deep relative paths (`../../../lib/...`) outside of same-directory imports.
- No barrel files (`index.ts`/`index.tsx`) exist anywhere in `src/` — every module is imported directly by its file path. Do not introduce barrel re-export files; follow the direct-import convention.

## Error Handling

**API routes (`src/app/api/**/route.ts`):**
- Parse untrusted JSON bodies defensively with a try/catch around `request.json()`, returning `400` on failure:
  ```typescript
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  ```
  Seen in `src/app/api/admin/login/route.ts` and `src/app/api/admin/users/route.ts`.
- Untyped body fields are cast to `unknown`, then narrowed with `typeof` checks before use — never trust a request-body shape directly.
- Auth/authorization failures return early with `NextResponse.json({ error: ... }, { status: 401|403|409 })` before doing any work — guard clauses at the top of the handler (`requireSuperAdmin()` check first in `src/app/api/admin/users/route.ts`).
- Errors returned to the client are plain `{ error: string }` JSON bodies with an appropriate HTTP status; there is no shared error-response helper/wrapper — each route constructs `NextResponse.json` inline.

**Webhook handler (`src/app/api/stripe/webhook/route.ts`) — the most sophisticated error-handling example in the codebase:**
- Outer try/catch wraps the entire handler; unexpected errors return `{ ok: false, error: message }` with status `400` so Stripe retries delivery.
- Idempotency is implemented via a DB-level "claim" pattern: the first write inside a `prisma.$transaction` is `tx.stripeEvent.create({ data: { id: event.id, ... } })`. A Prisma `P2002` unique-constraint violation there means the event was already processed, and the code returns `{ ok: true, duplicate: true }` instead of erroring.
- A typed guard distinguishes expected DB duplicate errors from unexpected failures:
  ```typescript
  function isUniqueConstraintError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
    return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
  }
  ```
- Non-critical side effects (confirmation email, Google Sheets sync, warehouse notification) run **after** the DB transaction commits and are each individually wrapped in their own try/catch that only logs on failure (`console.error(...)`) — a failure in any of these must never fail the webhook response or roll back the order.
- Comments explicitly document *why* each error-handling decision was made (e.g., "Network calls cannot participate in a DB transaction", "CFA workaround: capture let-vars into typed consts before narrowing"). Follow this pattern: explain non-obvious control-flow/async reasoning inline, not just what the code does.

**Library functions (`src/lib/*.ts`):**
- Functions that may legitimately find nothing return `null` rather than throwing (`getOrderById`, `updateOrderByStripePaymentIntentId` in `src/lib/orders.ts`) — throwing is reserved for genuinely exceptional/configuration errors (`throw new Error('ADMIN_SECRET is not configured on the server.')` in `src/lib/session.ts`).
- Functions with side effects that can fail externally document their throwing behavior in a JSDoc comment and push the try/catch obligation to the caller, e.g. `src/lib/google-sheets.ts`: "Throws on missing config or API error; callers MUST wrap in try/catch."
- `verifyPassword` and `verifySessionToken` swallow internal errors and return `false`/`null` rather than throwing, since a malformed/tampered credential is an expected case, not an exceptional one (`src/lib/password.ts`, `src/lib/session.ts`).

**Client components:**
- `try/catch` around browser APIs that can throw (`localStorage` access) with `console.error` and a `finally` to unblock state, e.g. `CartProvider` in `src/contexts/CartContext.tsx`.
- `useContext` guard-throws when used outside its provider: `if (context === undefined) throw new Error('useCart must be used within a CartProvider')`.

## Logging

**Framework:** None — plain `console.log` / `console.warn` / `console.error` (45 call sites across `src/`, excluding generated code).

**Patterns:**
- Emoji-prefixed log messages act as a lightweight visual severity/category marker, used consistently in `src/app/api/stripe/webhook/route.ts`: `✅` success, `⚠️` warning/recoverable, `❌` error, `ℹ️` informational/no-op, `↩️` refund/reversal, `💰` money/commission, `🚀` kicking off an async operation.
- Structured second-argument object for context, not string interpolation, e.g. `console.log('✅ Order confirmation email sent to', emailData.customerEmail)` and `console.warn('⚠️ P2002 on stripeSessionId — order already exists for this session', { eventId: event.id, type: event.type, target })`.
- Client-side `console.error` calls use a short prefix string plus the raw error object: `console.error('Error loading cart from localStorage:', error)`.
- When adding new logging in webhook/backend flows, follow the emoji + structured-context-object pattern already established in `src/app/api/stripe/webhook/route.ts` for consistency.

## Comments

**When to Comment:**
- Section-banner comments (see Code Style) divide files by responsibility, not by function boundary — used at the module level, not per-function.
- JSDoc-style `/** ... */` comments are used heavily on exported functions and types in `src/lib/` to explain *behavior contracts* (nullability, side effects, throwing behavior, idempotency guarantees) rather than restating the signature. Example from `src/lib/orders.ts`:
  ```typescript
  /**
   * Finds the order linked to a Stripe PaymentIntent and applies an update.
   * Returns null (without throwing) when no matching order is found — safe to
   * call from webhook handlers where the order may not exist yet.
   */
  ```
- Single-line `/** ... */` field comments annotate units/meaning on type properties, especially money values which are always documented as cents: `/** Unit price in cents */ unitPrice: number;` (`src/lib/orders.ts`).
- Inline `//` comments explain *why*, especially around timing/ordering constraints in async flows (transaction boundaries, "must run after X", idempotency reasoning) — see `src/app/api/stripe/webhook/route.ts` extensively.

**JSDoc/TSDoc:**
- Used consistently on exported functions in `src/lib/*.ts` files, not on internal/unexported helpers unless the logic is non-obvious (e.g. `buildOrderWhere` in `src/lib/orders.ts` still gets a one-line comment despite being internal).
- Not used in `src/components/**/*.tsx` — components rely on TypeScript prop interfaces for self-documentation instead.

## Function Design

**Size:** Route handlers and `src/lib/` functions favor single-responsibility, often under ~30 lines; the Stripe webhook handler (`src/app/api/stripe/webhook/route.ts`, ~500 lines) is the deliberate exception — a large `switch` over Stripe event types inside one transaction, explicitly commented section by section since the transaction boundary requires it to stay in one function.

**Parameters:**
- Multi-field inputs use a single typed object parameter (`CreateOrderInput`, `GetOrdersInput`) rather than long positional parameter lists.
- Simple 1-2 argument functions (IDs, tokens) use positional parameters — `getOrderById(id: string)`, `updateOrder(id: string, data: UpdateOrderInput)`.
- Optional fields on input types default via `??` at the point of use rather than `Partial<>`+ manual merging, e.g. `stripeSessionId: input.stripeSessionId, ... status: input.status ?? 'PENDING_PAYMENT'` in `createOrder` (`src/lib/orders.ts`).

**Return Values:**
- Async DB/query functions always declare an explicit `Promise<T>` return type annotation, even when inferable — e.g. `export async function getOrderById(id: string): Promise<Order | null>`.
- Functions that can meaningfully return "nothing found" return `null`, never `undefined`, and the type signature makes this explicit (`T | null`).

## Module Design

**Exports:**
- Library modules (`src/lib/`) use **named exports only** — never `export default`.
- React components use `export default function ComponentName()` when the component is the sole/primary export of the file (most of `src/components/`), and named exports (`export function ProductCard(...)`) when co-located with other exports like prop types, e.g. `src/components/products/ProductCard.tsx`.
- Types are exported alongside the functions/values that produce or consume them in the same file rather than a separate `types.ts` — see `CreateOrderInput`/`createOrder` co-location in `src/lib/orders.ts`.

**Barrel Files:** Not used anywhere in `src/`. Import each module by its direct path via the `@/` alias.

---

*Convention analysis: 2026-07-03*
