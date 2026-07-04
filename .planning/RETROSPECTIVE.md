# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Affiliate Creatives

**Shipped:** 2026-06-18
**Phases:** 3 | **Plans:** 4 | **Tasks:** 9

### What Was Built
- Prisma `AffiliateCreative` model + `CreativeType` enum, `@vercel/blob` wiring, and `src/lib/creatives.ts` CRUD module (mirrors `affiliates.ts`).
- Admin management surface at `/admin/creatives`: Vercel Blob two-step client-upload, inline edit/toggle/reorder/delete, nav link.
- Affiliate-facing "Criativos" gallery: dense localized grid, download, copy-caption, empty state — natural-aspect photos, first-frame video poster.
- Full en/es/pt localization under the `AffiliateCreatives` namespace.

### What Worked
- Strict dependency ordering (foundation → admin → affiliate) kept each phase self-contained and verifiable.
- UAT in a live browser resolved every `human_needed` verification item that static analysis couldn't confirm (download, clipboard, autoplay, responsive layout) — Phases 2 and 3 both reached 8/8.
- Post-UAT polish via a single quick task (`260618-gjn`) absorbed three design changes without reopening the phase.

### What Was Inefficient
- A lint-class error (`@typescript-eslint/no-unused-vars`) shipped to the PR and failed the Vercel deploy, because validation relied on `tsc --noEmit` (type-check only) instead of `next build`/`next lint`. Caught at PR CI, not before push.
- The local `next build` used to reproduce the failure hung in the static-generation phase (pages prerender against DB/Shopify/Stripe), so confirmation had to fall back to `next lint`.

### Patterns Established
- Affiliate gallery uses an auto-fill dense grid (`repeat(auto-fill,minmax(150px,1fr))`) instead of fixed viewport breakpoints — the dashboard is capped at `max-w-4xl`, so viewport breakpoints never fired.
- Video poster defaults to the first frame (`#t=0.001`) rather than an admin-chosen cover.
- `human_needed` verification + a passing UAT = resolved (recorded via `resolved_by:` in VERIFICATION.md), not deferred tech debt.

### Key Lessons
1. Verify with `next lint` / `next build` before pushing to Vercel — `tsc --noEmit` does not catch ESLint errors, and `next build` treats them as fatal. (Saved to project memory.)
2. Container width matters more than viewport for grid density — prefer auto-fill `minmax` when a parent caps the width.
3. Magic-link auth works for local testing by reusing the token against `http://localhost:3000/api/affiliates/verify?token=...` (same DB), or set `NEXT_PUBLIC_SITE_URL` locally.

### Cost Observations
- Model mix: planning on opus, execution on sonnet (GSD default profile).
- Notable: one quick task + targeted lint check was far cheaper than a full re-plan for the post-UAT polish.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 3 | 4 | First milestone — established the affiliate creatives library end-to-end |

### Cumulative Quality

| Milestone | UAT | Security | Notes |
|-----------|-----|----------|-------|
| v1.0 | 16/16 (Phases 2+3, 8 each) | SECURED 11/11 | Vercel deploy fixed pre-merge (lint error) |

### Top Lessons (Verified Across Milestones)

1. Live-browser UAT is the source of truth for runtime behaviors that static verification flags as `human_needed`.
