---
phase: 05-landing-page-sections
plan: 02
subsystem: ui
tags: [nextjs, react, next-intl, framer-motion, tailwind-v4, i18n]

# Dependency graph
requires:
  - phase: 05-01
    provides: messages/{en,es,pt}.json LandingHeader/LandingFooter namespaces (shared file ownership only, no code dependency)
  - phase: 04-design-system-foundation
    provides: dips-* design tokens (colors, typography, spacing) in src/app/globals.css
provides:
  - "Rewritten Hero.tsx: Figma gradient hero with two-tone H1, social-proof badge, dual CTA, product image, decorative blobs, and 4 absorbed ProductSection feature cards"
  - "New StorySection.tsx: split photo/dark-panel layout replacing AboutSection's copy role"
  - "New Hero i18n keys (h1, socialProof, trust1..3, ctaPrimary, ctaSecondary) in en/es/pt"
  - "New Story namespace (ourStoryTitle, sideTitle, p1..p3, badge1..3) in en/es/pt"
  - "Anchor targets #hero and #story, both scroll-mt-[72px] offset for the sticky LandingHeader"
affects: [05-03, 05-04, 05-05, 06-responsive-i18n-regression]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next-intl t.rich() rich-text rendering for the two-tone H1 (data-only message, JSX markup supplied by code callback, not dangerouslySetInnerHTML)"
    - "Tailwind v4 3-stop gradient via from-<token> from-0% via-<token> via-[57.4%] to-<token> to-100%"
    - "Hand-merged i18n paragraph folding (4 About paragraphs -> 3 Story paragraph slots) authored per-locale, not runtime string concatenation"

key-files:
  created:
    - src/components/StorySection.tsx
  modified:
    - src/components/Hero.tsx
    - messages/en.json
    - messages/es.json
    - messages/pt.json

key-decisions:
  - "Hero.subtitle key value ('Pleasure in its purest form.' / es / pt) left unchanged — its existing content already fits the new italic-subtitle slot, so it was reused rather than rewritten"
  - "Hero's 3 mini trust items reuse the same locked copy as LandingHeader.trustBar1..3 ('100% Natural Ingredients' / 'Made in the USA' / 'Secure Checkout') for visual/textual consistency with the trust bar, per UI-SPEC's 'same visual family' instruction, written under Hero's own trust1..3 keys (not a namespace reference)"
  - "Story.p3 hand-merges About.p3 + About.p4 per locale (per 05-CONTEXT.md fold instruction) — no content dropped, no runtime concatenation"

requirements-completed: [SECT-02, SECT-03]

# Metrics
duration: ~15min
completed: 2026-07-16
status: complete
---

# Phase 5 Plan 2: Hero Rebuild + StorySection Summary

**Rebuilt `Hero.tsx` as the Figma dark-gradient hero (two-tone H1 via next-intl rich text, dual CTA, absorbed feature-card row) and added new `StorySection.tsx` split photo/dark-panel component with hand-merged 3-paragraph copy, replacing `AboutSection`'s content role.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-16T23:48:58Z
- **Tasks:** 2/2 completed
- **Files modified:** 5 (1 created, 4 modified — Hero.tsx + 3 locale files touched by both tasks)

## Accomplishments
- `Hero.tsx` fully rewritten in place (same path/default export): 3-stop purple gradient background, two-tone H1 rendered via `t.rich("h1", { hl: ... })` with the `<hl>` chunk styled `text-dips-text-headline-lilac`, italic subtitle, 5-star social-proof badge pill, 3 mini trust items, dual CTA ("Buy Now" -> `#bundle`, "How It Works?" -> `#ingredients` with the one-off `#58477e` outline border), rotated product image, two `aria-hidden` decorative blob SVGs, and a row of 4 feature cards absorbing `ProductSection`'s content (`Product.feature1..4_title/_desc` reused verbatim, zero new copy in that namespace)
- New `StorySection.tsx` created: split grid (photo left with gradient overlay + side heading + 3 mini badges, dark `dips-purple-deepest` panel right with "Our Story" heading + 3 hand-merged paragraphs), `id="story"` with `scroll-mt-[72px]`
- New `Hero` i18n keys (`h1`, `socialProof`, `trust1..3`, `ctaPrimary`, `ctaSecondary`) and new top-level `Story` namespace (`ourStoryTitle`, `sideTitle`, `p1..p3`, `badge1..3`) added to `messages/en.json`, `messages/es.json`, `messages/pt.json` — all three locale files remain valid JSON
- `npm run build` (`prisma generate && next build`) completes cleanly with dummy env vars supplied for the worktree sandbox (no `.env` present, expected — see Issues Encountered): zero TypeScript errors, zero new ESLint errors, all 28 static/dynamic routes generated successfully

## Task Commits

Each task was committed atomically:

1. **Task 1: Hero.tsx full rebuild** - `2e9fad7` (feat)
2. **Task 2: StorySection.tsx split layout** - `c66d974` (feat)

_Note: each task's commit includes the i18n changes specific to that task — Hero's new keys were committed with Task 1, the Story namespace was committed with Task 2, keeping the message-file diffs attributable to the task that introduced them despite both tasks sharing the same 3 locale files._

## Files Created/Modified
- `src/components/Hero.tsx` - Full rewrite: gradient hero, two-tone H1, badge, dual CTA, product image, blobs, 4 absorbed feature cards
- `src/components/StorySection.tsx` - New split photo/dark-panel component replacing `AboutSection`'s copy role (file itself not deleted this plan, per 05-CONTEXT.md's deferred cleanup — deletion happens once `page.tsx` stops importing it)
- `messages/en.json` - New `Hero.h1/socialProof/trust1..3/ctaPrimary/ctaSecondary` keys + new `Story` namespace
- `messages/es.json` - Same key set, Spanish translations, `<hl>` tag preserved around "chocolate"
- `messages/pt.json` - Same key set, Portuguese translations, `<hl>` tag preserved around "chocolate"

## Decisions Made
- Reused `Hero.subtitle`'s existing value across all 3 locales rather than rewriting it — the pre-existing copy ("Pleasure in its purest form." / es / pt equivalents) already reads correctly as the new italic hero subtitle
- Hero's 3 mini trust items reuse the same first-3 trust-bar phrases (`100% Natural Ingredients` / `Made in the USA` / `Secure Checkout`, matching `LandingHeader.trustBar1..3`'s exact translations) for visual/copy consistency, authored under Hero's own `trust1..3` keys since UI-SPEC treats them as "same visual family" but not a shared namespace reference
- `Story.p3` hand-merges `About.p3` + `About.p4` per locale (en/es/pt each authored independently, not concatenated at runtime) so no content from the original 4-paragraph About copy is silently dropped, per 05-CONTEXT.md's fold instruction

## Deviations from Plan

None - plan executed exactly as written. Both tasks' acceptance criteria and automated verification greps pass as specified.

## Issues Encountered
- `npm run build` failed on first attempt because this worktree has no `.env`/`.env.local` file (gitignored, not copied into git worktrees) — `prisma generate` needs `DATABASE_URL` and page-data collection for Stripe/Shopify/SMTP-backed routes needs several more secrets. This is a pre-existing environment gap unrelated to this plan's files (no code in `Hero.tsx`/`StorySection.tsx` touches any of those integrations). Resolved by supplying dummy values for `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SHIPPING_RATE_ID`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_PRODUCT_HANDLE`, `SESSION_SECRET`, `ADMIN_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` as shell-scoped env vars for the build invocation only (nothing written to disk/committed). With those in place, the build completed with zero TypeScript/ESLint errors and generated all 28 routes; the only warnings present were pre-existing ones in unrelated files (`orders/page.tsx`, `orders/[id]/page.tsx`, `TrackingProvider.tsx`, `CustomerContext.tsx`).

## User Setup Required

None - no external service configuration required. (The dummy env vars above were sandbox-only for build verification; they are not part of any commit.)

## Next Phase Readiness
- `Hero.tsx` and `StorySection.tsx` are both build-clean and ready to be wired into `src/app/[locale]/page.tsx` in a later plan (per 05-CONTEXT.md, wiring/deletion of `AboutSection.tsx`/`ProductSection.tsx` happens once all sections are built, not per-section)
- `#bundle` and `#ingredients` anchor targets referenced by Hero's CTAs don't exist yet (built in later 05-xx plans) — this is expected per the phase's wave sequencing, not a blocker for this plan
- No blockers for subsequent Phase 5 plans

---
*Phase: 05-landing-page-sections*
*Completed: 2026-07-16*
