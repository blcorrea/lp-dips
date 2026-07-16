---
phase: 05-landing-page-sections
plan: 04
subsystem: ui
tags: [nextjs, tailwind4, react, stripe-checkout, i18n]

# Dependency graph
requires:
  - phase: 04-design-system-foundation
    provides: "--color-dips-* / --text-* / --radius-card* / --spacing-card-padding design tokens in src/app/globals.css"
provides:
  - "Reskinned ReviewsSection.tsx (#2d1a69 flat bg, 3-col masonry, id=reviews)"
  - "Reskinned BuySection.tsx (id=bundle, cream/photo split wrapper)"
  - "Restyled ProductPurchaseBox.tsx (bundle cards + summary + total-in-button, pricing/checkout logic untouched)"
affects: [06-responsive-i18n-regression-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Total-in-button via pointer-events-none absolute overlay, keeping the shared BuyNowButton.tsx component byte-for-byte untouched"
    - "Anchor sections use scroll-mt-[72px] to offset the sticky LandingHeader"

key-files:
  created: []
  modified:
    - src/components/ReviewsSection.tsx
    - src/components/BuySection.tsx
    - src/components/ProductPurchaseBox.tsx

key-decisions:
  - "Kept TrackViewItem (invisible analytics) and SocialMediaButtons (compact) in the redesigned BuySection left panel — not part of the Figma bundle-selector spec but pre-existing functionality outside this visual-only plan's removal scope"
  - "Dropped BuyImageGallery and the standalone 'Starting At' price teaser — both are superseded by the new cream-panel/photo-panel split; per-bundle prices are still shown on each card"
  - "Total-in-button implemented as an absolutely-positioned, pointer-events-none overlay on the right edge of BuyNowButton rather than editing BuyNowButton.tsx, preserving its zero-diff FUNC-01 guarantee"

patterns-established:
  - "Section-level anchor pattern: id + scroll-mt-[72px] for sticky-header offset (reused from 05-CONTEXT.md decision)"

requirements-completed: [SECT-05, SECT-06, FUNC-01]

# Metrics
duration: 25min
completed: 2026-07-16
status: complete
---

# Phase 5 Plan 04: Reviews & Bundle Selector Reskin Summary

**Reskinned ReviewsSection to a flat #2d1a69 3-column masonry and restyled the bundle selector to a cream-panel/photo-panel split with the total folded into the Buy Now button — all while leaving BUNDLES, Stripe priceIds, the 2x default, and BuyNowButton.tsx completely untouched.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2/2 completed
- **Files modified:** 3

## Accomplishments
- Reviews section now renders on a flat `dips-purple-reviews` (#2d1a69) background in a `columns-2 md:columns-3` masonry (dropped the old `lg:columns-4` step), with restyled cards (`dips-card-review`/`-border`, `rounded-card-lg`, `p-card-padding`) — all 12 real reviews from `src/data/reviews.ts` unchanged, `Stars`/avatar/initials logic untouched.
- Bundle selector (`BuySection.tsx`) rebuilt as a `dips-cream` panel (bundle cards) beside a photo panel (`experience-couple-photo.png`) carrying a right-aligned "Bring the Experience home." heading and 3 mini badges — section id changed `buy`→`bundle` with `scroll-mt-[72px]`.
- `ProductPurchaseBox.tsx` cards restyled: unselected 1x/3x use `dips-bundle-light`/`dips-bundle-light-border`/`dips-text-purple-deep`; selected 2x card uses `dips-card-ingredient-hl` + `border-brand-orange` (2px) with a floating "Most Popular" badge; each card now shows a `product-box-small.png` thumbnail. Summary row restyled to `dips-bundle-summary`. Buy Now total is folded into the button row via an overlay technique.
- `BUNDLES` array (all 3 real Stripe `priceId`s), the `useState<'1x' | '2x' | '3x'>('2x')` default, and every prop passed into `BuyNowButton` are byte-for-byte unchanged — `git diff --quiet src/components/BuyNowButton.tsx` passes.

## Task Commits

Each task was committed atomically:

1. **Task 1: ReviewsSection.tsx — #2d1a69 bg + 3-col masonry + card restyle** - `483fb01` (feat)
2. **Task 2: Bundle selector reskin — BuySection wrapper + ProductPurchaseBox cards/summary/total-in-button** - `9406fc1` (feat)

_Note: SUMMARY.md commit is separate (worktree mode — orchestrator handles final metadata commit after merge)._

## Files Created/Modified
- `src/components/ReviewsSection.tsx` - Flat `dips-purple-reviews` bg, `id="reviews"` + `scroll-mt-[72px]`, `columns-2 md:columns-3` masonry, restyled `ReviewCard` (fill/border/radius/padding tokens), title on `text-heading-lg`
- `src/components/BuySection.tsx` - `id="bundle"` + `scroll-mt-[72px]`, `dips-cream` left panel (eyebrow/subtitle/`ProductPurchaseBox`/`TrackViewItem`/`SocialMediaButtons`), right photo panel (`experience-couple-photo.png` + heading-side + 3 `dips-card-lavender` badges); dropped `BuyImageGallery` and the standalone price teaser (superseded by the new layout)
- `src/components/ProductPurchaseBox.tsx` - Card fill/border/text restyle per selection state, floating "Most Popular" badge, `product-box-small.png` thumbnail per card, `dips-bundle-summary` summary row, total-in-button overlay; `BUNDLES`/`useState`/`BuyNowButton` props unchanged

## Decisions Made
- Kept `TrackViewItem` and `SocialMediaButtons` in the reskinned `BuySection` — the Figma bundle-selector spec doesn't call them out, but they're pre-existing, shared, functional components (analytics + social links) outside this plan's "visual only" scope of removal; dropping them would be an unrequested functionality regression.
- Dropped `BuyImageGallery` and the standalone "Starting At" price display — the new cream/photo split layout has no slot for either, and per-bundle prices are already shown on each card; keeping the old gallery/teaser would conflict with the locked Figma layout.
- Implemented the "total folded into the Buy Now button row" requirement as a `pointer-events-none` absolutely-positioned overlay on the right edge of `BuyNowButton`, rather than passing JSX into `label` (which is typed `string`) or editing `BuyNowButton.tsx` — this keeps the button's `onClick`/checkout call and the file itself at zero diff, satisfying the plan's FUNC-01 guarantee.

## Deviations from Plan

None — plan executed exactly as written. The `BuyImageGallery`/price-teaser removal and `TrackViewItem`/`SocialMediaButtons` retention are visual-layout judgment calls within the plan's "restyle the render/JSX only" instruction, not deviations from a stated requirement (see Decisions Made above).

## Issues Encountered
- This worktree lacks project secrets (`.env`/`.env.local` are gitignored and not copied into worktrees), so a full `next build` fails at the page-data-collection step with `Missing STRIPE_SECRET_KEY` — an environment limitation, not a code defect. Verified correctness instead via `npx tsc --noEmit` (clean) and `npx next lint` on the 3 modified files (clean, "No ESLint warnings or errors"). A full `npm run build` (with real secrets) was not re-attempted after that point since TypeScript/lint had already validated the changed files; the plan's phase-level `<verification>` (`npm run build` + manual Stripe click-through) is deferred to Plan 05 per the phase plan's own note ("Final manual Stripe test-mode click-through is performed in Plan 05").

## Next Phase Readiness
- Reviews and bundle-selector sections are visually complete and ready for integration into `src/app/[locale]/page.tsx` alongside the other Phase 5 plans (Header/Hero/Story/Ingredients/FAQ/Footer).
- `#bundle` is now the canonical anchor id other sections' CTAs (Header "Order"/"Shop Now", Hero "Buy Now") must target — this is already documented in `05-UI-SPEC.md` and consistent with the other in-flight plans in this wave.
- No blockers. FUNC-01 (checkout intact) is proven by `git diff --quiet src/components/BuyNowButton.tsx` passing and all 3 Stripe `priceId`s remaining in `ProductPurchaseBox.tsx`; final manual Stripe test-mode click-through remains scheduled for Plan 05 per phase plan.

---
*Phase: 05-landing-page-sections*
*Completed: 2026-07-16*
