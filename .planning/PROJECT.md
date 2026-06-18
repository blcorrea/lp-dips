# DIPS

## What This Is

DIPS is a multilingual (en/es/pt) e-commerce storefront for a chocolate product, built on Next.js 15. It sells via Shopify product data + Stripe checkout, has an admin dashboard for orders/affiliates/commissions/users, and runs an affiliate program where partners log in via magic link, get a referral code, and earn snapshotted commissions on attributed orders.

This milestone adds an **Affiliate Creatives** section: a single shared library of marketing assets (images and videos) that admins upload via Vercel Blob, and that logged-in affiliates can browse, download, and copy ready-made captions from — so affiliates have on-brand content to promote with.

## Core Value

Affiliates can grab ready-to-post, on-brand creative assets (with a copy-paste caption) in one place, and admins can manage that library without touching code.

## Business Context

- **Customer**: Affiliate partners (influencers, media buyers) promoting DIPS; admins manage the program.
- **Revenue model**: Affiliate-driven sales — better creatives → more affiliate posts → more attributed orders/commissions.
- **Success metric**: Affiliates actively downloading/using creatives (assets available and used in promotion).

## Requirements

### Validated

<!-- Existing capabilities inferred from the codebase map (.planning/codebase/). -->

- ✓ Multilingual storefront (en/es/pt) with product browsing — existing
- ✓ Cart (localStorage) + Stripe checkout flow — existing
- ✓ Stripe webhook → order creation + commission snapshot — existing
- ✓ Admin dashboard: orders, affiliates, commissions, users — existing
- ✓ Admin auth (bcrypt + cookie/session, `isAdminAuthenticated()`) — existing
- ✓ Affiliate magic-link signup/login + session cookie — existing
- ✓ Affiliate dashboard showing attributed earnings/commissions — existing
- ✓ Commission export to Google Sheets — existing
- ✓ Transactional email via Nodemailer (async `after()`) — existing
- ✓ Admin can upload a creative (image or video) with title, description, and caption — Phase 2
- ✓ Large files (esp. video) upload directly to Vercel Blob via client upload (bypass ~4.5MB serverless body limit) — Phase 2
- ✓ Admin can edit a creative's metadata (title, description, caption, active state) — Phase 2
- ✓ Admin can reorder creatives with up/down controls (sortOrder) — Phase 2
- ✓ Admin can deactivate/activate and delete a creative (delete also removes the blob) — Phase 2
- ✓ Logged-in affiliates see a "Criativos" section on their dashboard (grid of cards) — Phase 3
- ✓ Affiliate can download a creative and copy its caption to clipboard — Phase 3
- ✓ Empty state when no creatives exist — Phase 3
- ✓ All new UI strings localized in en/es/pt (next-intl `AffiliateCreatives` namespace) — Phase 3

### Active

<!-- Milestone v1.0 (Affiliate Creatives) complete — no active requirements. -->

_None — milestone v1.0 shipped. Next milestone's requirements go here._

### Out of Scope

- Download/usage analytics per affiliate — deferred; not needed to validate the library (revisit if adoption tracking becomes important)
- Categories/tags/folders for creatives — single flat library is enough for v1
- Drag-and-drop reordering — up/down controls cover v1; DnD adds dependency/complexity
- Per-affiliate or segmented creative visibility — all active creatives visible to all affiliates
- Affiliate-facing API — affiliate dashboard reads creatives directly in a server component
- Admin-chosen video poster/cover image — removed post-UAT (quick task 260618-gjn); videos default to their first frame. `thumbnailUrl`/`thumbnailBlobPath` columns retained but no longer populated by the admin form

## Context

- **Brownfield**: codebase mapped in `.planning/codebase/` (STACK.md, ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, etc.).
- **Stack**: Next.js 15 (App Router), React 19, TypeScript, Prisma 7 + PostgreSQL, Tailwind 4, Radix UI, next-intl, Stripe, Shopify Storefront API, Nodemailer.
- **Patterns to follow**: data-access modules in `src/lib/*` with serialized dates (mirror `src/lib/affiliates.ts`); admin API routes guarded by `isAdminAuthenticated()`; Prisma migrations via `prisma/migrations`; glassmorphism UI style already used on the affiliate dashboard.
- **New dependency/infra**: `@vercel/blob` + `BLOB_READ_WRITE_TOKEN`; add `*.public.blob.vercel-storage.com` to `images.remotePatterns` in `next.config.mjs`.
- Recent work fixed affiliate onboarding emails and admin→affiliate-area redirect (see git history).

## Constraints

- **Tech stack**: Must fit existing Next.js 15 + Prisma 7 + PostgreSQL app — no new framework. — consistency and maintainability
- **Storage**: Vercel Blob for asset storage; client-upload flow required for videos. — serverless body limit (~4.5MB) blocks server-proxied video upload
- **Auth**: Admin creative management behind `isAdminAuthenticated()`; affiliate views behind affiliate session. — reuse established auth, no new auth surface
- **i18n**: Every user-facing string in en/es/pt. — multilingual is a product invariant
- **DB migrations**: Prisma migrate (`prisma migrate dev`), versioned in `prisma/migrations`. — established migration workflow

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single shared creative library (no segmentation) | Simplest model that delivers value; all affiliates see same assets | — Pending |
| Vercel Blob + client upload | Handle video > serverless 4.5MB body limit | — Pending |
| Up/down reordering (sortOrder int) over drag-drop | Lower complexity, no new dependency | — Pending |
| No download analytics in v1 | Not required to validate the library | — Pending |
| Affiliate view reads via server component (no affiliate API) | Matches existing server-first pattern | — Pending |
| Vercel Blob + client upload | Handle video > serverless 4.5MB body limit | ✓ Good (admin upload shipped + UAT-verified in Phase 2) |
| Up/down reordering (sortOrder int) over drag-drop | Lower complexity, no new dependency | ✓ Good (shipped in Phase 2) |
| Single shared creative library (no segmentation) | Simplest model that delivers value | ✓ Good (full affiliate-facing library shipped in Phase 3) |
| `onUploadCompleted` no-op; DB row via follow-up POST | Avoids localhost webhook limitation in client-upload flow | ✓ Good (Phase 2) |
| `mimeType` re-validated server-side; `CreativeType` derived server-side | Defense-in-depth; never trust client-declared type (T-02-05) | ✓ Good (Phase 2, security-verified) |
| Affiliate view reads via server component (no affiliate API) | Matches existing server-first pattern | ✓ Good (shipped in Phase 3) |
| Affiliate gallery uses auto-fill dense thumbnail grid (not fixed breakpoints) | Dashboard is capped at max-w-4xl, so viewport breakpoints never fired; auto-fill packs small previews regardless of container width | ✓ Good (quick task 260618-gjn, UAT-confirmed) |
| Drop admin video poster upload; default to first frame (#t=0.001) | Choosing a cover was unnecessary friction; first frame is a good-enough poster | ✓ Good (quick task 260618-gjn) |

**Phase 1 (Foundation) complete (2026-06-17):** `AffiliateCreative` model + `CreativeType` enum migrated; `@vercel/blob` wired; `src/lib/creatives.ts` data-access shipped. DATA-01/02/03 validated.

**Phase 2 (Admin Creatives) complete (2026-06-18):** Full admin management surface — Vercel Blob client-upload token route + collection/item API routes, `/admin/creatives` page with `CreativesGrid` (upload/edit/reorder/activate/delete), and admin nav link. UAT 8/8 passed; security review SECURED (11/11 threats closed). ADMIN-01..07 validated.

**Phase 3 (Affiliate Gallery & i18n) complete (2026-06-18):** Affiliate-facing "Criativos" section on the dashboard server component — dense thumbnail grid of active creatives with download, copy-caption, empty state, and localized strings (en/es/pt). UAT 8/8 passed. Post-UAT polish via quick task 260618-gjn: natural-aspect photos, first-frame video poster, denser auto-fill grid, removed admin poster upload. **Milestone v1.0 (Affiliate Creatives) is 100% complete.**

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-18 after Phase 3 (Affiliate Gallery & i18n) completion — milestone v1.0 complete*
