---
phase: 05-landing-page-sections
plan: 05
subsystem: ui
tags: [nextjs, react, i18n, stripe, tailwind]

# Dependency graph
requires:
  - phase: 05-landing-page-sections (Plans 01-04)
    provides: LandingHeader, LandingFooter, Hero, StorySection, IngredientsSection, FAQSection, ReviewsSection, BuySection (all 8 redesigned section components)
provides:
  - Home page (src/app/[locale]/page.tsx) wired to render all 8 redesigned sections in Figma order using LandingHeader/LandingFooter
  - scroll-smooth enabled on the root <html> for anchor navigation
  - Dead components (WhyDipsSection, ProductSection, AboutSection) deleted with no dangling imports
  - Green build + FUNC-04 typo/placeholder-email sweep clean
affects: [06-responsive-i18n-regression-verification]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Home-only component swap (LandingHeader/LandingFooter) leaving Header.tsx/Footer.tsx untouched for the 9 other pages"]

key-files:
  created: []
  modified:
    - src/app/[locale]/page.tsx
    - src/app/[locale]/layout.tsx

key-decisions:
  - "Copied .env/.env.local from the main repo into the worktree so `npm run build` (which requires DATABASE_URL via prisma.config.ts) could run — these are gitignored dev secrets, not committed"

patterns-established: []

requirements-completed: [SECT-01, SECT-02, SECT-03, SECT-04, SECT-05, SECT-06, SECT-07, SECT-08, FUNC-01, FUNC-04]

# Metrics
duration: -
completed: 2026-07-16
status: in-progress
---

# Phase 5 Plan 5: Home Integration + Cleanup + Verification Gate Summary

**Home page rewired to render all 8 Figma-ordered sections via LandingHeader/LandingFooter with scroll-smooth anchors; dead components deleted; build green and FUNC-04 sweep clean — awaiting human checkpoint (Task 3) before the plan is marked complete.**

## Performance

- **Tasks:** 2 of 3 completed (Task 3 is a human-verify checkpoint, pending)
- **Files modified:** 5 (2 rewired, 3 deleted)

## Accomplishments

- `src/app/[locale]/page.tsx` now renders `LandingHeader`, `Hero`, `StorySection`, `IngredientsSection`, `BuySection` (with `locale` prop), `ReviewsSection`, `FAQSection`, `LandingFooter` in exact Figma order — no more `Header`/`Footer`/`AboutSection`/`ProductSection`/`WhyDipsSection` on the home.
- `src/app/[locale]/layout.tsx` root `<html>` className now includes `scroll-smooth`, combined with each section's pre-existing `scroll-mt-[72px]` (added by Plans 01-04) so anchor jumps land below the sticky 72px header.
- `WhyDipsSection.tsx`, `ProductSection.tsx`, `AboutSection.tsx` deleted — confirmed via grep no remaining file imports them (only comment references in `Hero.tsx` remain, which are non-functional).
- FUNC-04 repo-wide grep sweep (`src/`, `messages/`) confirms zero occurrences of Figma typos ("Igredient", "Aphrodiasiac", "Gaurantee") and zero occurrences of the Figma placeholder support mailbox (`tabs.co`, `help@dips.co`); the real support email `info@dipschocolate.com` is present in `LandingFooter.tsx`.
- `npm run build` (`prisma generate && next build`) exits 0 — no new TypeScript or ESLint errors (pre-existing warnings in unrelated files: jose/Edge Runtime notice, a handful of `<img>` lint warnings in orders pages, one pre-existing `react-hooks/exhaustive-deps` warning — none touched by this plan, out of scope per Scope Boundary).
- Regression check: `git diff` against the plan's base commit shows zero diff on `Header.tsx`, `Footer.tsx`, `BuyNowButton.tsx` — the 9 shared pages and Stripe checkout call are untouched (T-05-12).

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewire page.tsx (8 sections, Figma order, LandingHeader/Footer) + scroll-smooth on layout root** - `e83f85f` (feat)
2. **Task 2: Delete dead components + FUNC-04 grep sweep + build gate** - `67b987b` (chore)
3. **Task 3: Human verification — full home walkthrough + Stripe checkout + out-of-scope regression** - PENDING (checkpoint, awaiting human resume signal)

## Files Created/Modified

- `src/app/[locale]/page.tsx` - Rewired to import/render the 8 redesigned sections in Figma order with LandingHeader/LandingFooter
- `src/app/[locale]/layout.tsx` - Root `<html>` className gains `scroll-smooth`
- `src/components/WhyDipsSection.tsx` - Deleted (no Figma counterpart)
- `src/components/ProductSection.tsx` - Deleted (feature cards absorbed into Hero, Plan 02)
- `src/components/AboutSection.tsx` - Deleted (copy folded into StorySection, Plan 02)

## Decisions Made

- Copied `.env`/`.env.local` from the main repo checkout into this worktree to satisfy `prisma.config.ts`'s `DATABASE_URL` requirement so `npm run build` could execute. Both files are gitignored and were not staged or committed — this is a local-only fix required because git worktrees don't carry over untracked files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Build gate failed without DATABASE_URL — copied gitignored env files into the worktree**
- **Found during:** Task 2 (build gate)
- **Issue:** `npm run build` invokes `prisma generate`, which loads `prisma.config.ts` and fails immediately with `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL` because git worktrees do not copy untracked/gitignored files (`.env`, `.env.local`) from the main checkout.
- **Fix:** Copied `.env` and `.env.local` from the main repo root (`C:/dev/dips/lp-dips/`) into this worktree. Not a package install, not an architectural change — purely a local dev-environment prerequisite.
- **Files modified:** `.env`, `.env.local` (both gitignored, not committed, not part of `git status --short` output)
- **Verification:** `npm run build` subsequently exits 0
- **Committed in:** N/A (gitignored files are never committed)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary local-environment fix to run the build gate; no source code or committed-file impact.

## Issues Encountered

None beyond the build-gate env-file deviation documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Tasks 1 and 2 complete, committed, and verified (build green, FUNC-04 sweep clean, no regression diff on `Header.tsx`/`Footer.tsx`/`BuyNowButton.tsx`).
- **Blocked on Task 3**: human-verify checkpoint requires a manual dev-server browser walkthrough of all 8 sections, anchor-scroll confirmation, and a Stripe test-mode click-through — no test framework exists in this repo (05-CONTEXT.md), so this cannot be automated.
- Once Task 3 is approved, this plan (and Phase 5) is complete; STATE.md/ROADMAP.md updates are owned by the orchestrator after all wave agents finish.

---
*Phase: 05-landing-page-sections*
*Completed: pending human verification*
