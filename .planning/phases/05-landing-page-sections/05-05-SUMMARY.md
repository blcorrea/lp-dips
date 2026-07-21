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

## Addendum 2026-07-17 — Post-checkpoint fixes (still pending human sign-off)

The user did the Task 3 manual walkthrough and found several real visual bugs
vs. Figma — captured with full root-cause analysis in
`.planning/phases/05-landing-page-sections/05-VISUAL-GAPS.md`. While the user
was away, every objectively-confirmed item (root causes + gaps the new Figma
mobile frame settled) was fixed directly in this worktree. Decision-only items
(mobile nav pattern, blob sizing/position, footer 4-col restructure, FAQ
prefix/heading wording, bundle-panel/social-icon placement, RESP-01 scope
update) were deliberately left alone for discussion.

**Commits (this worktree, chronological):**

1. `a314008` — RC-1: moved `--spacing-{xs..3xl}` out of `@theme` (was silently
   overriding Tailwind's `max-w-*` container scale app-wide, down to 4-64px —
   affected `checkout/success`, legal pages, admin login, age modal, wishlist,
   affiliate pages, 14 sites total) + RC-4: fixed 4 mojibake strings and BOM
   in `messages/en.json` (pre-existing since 2026-05-28, unrelated to Phase 5)
2. `3d3e018` — RC-2: trust bar now sits on an opaque `bg-dips-purple-deepest`
   backdrop instead of compositing its translucent layer directly over
   `<main>`'s cream background
3. `1a79a74` — RC-3: `Hero.tsx` rebuilt as a two-column grid at `lg+` (product
   image right, text left); was a single centered column with the image last
   at every breakpoint
4. `1390064` — GAP-14: removed the non-Figma "Choose your quantity..." header
   from the bundle's cream panel, moved the eyebrow badge to the photo side;
   GAP-07: added the missing "10,000+ Happy Couples" badge + subtitle to
   StorySection's photo overlay (both confirmed by the new Figma mobile frame)
5. `fd4641b` — GAP-03: `Hero.subtitle` updated to "A Chocolate crafted for
   connection." (was stale pre-redesign copy); GAP-05: Hero's 4 feature cards
   now use their own copy (`Hero.feature1..4_title/_desc`) instead of the
   reused `Product.feature1..4_*` keys, matching the Figma mobile frame's
   dedicated title+description per card
6. `0361a9f` — GAP-09/GAP-12: `Ingredients` section now renders an italic
   eyebrow ("The ingredients") over the heading ("Behind the experience.",
   was "The Art of Temptation"), and the intro paragraph gained its closing
   sentence ("Six botanicals, one unforgettable experience.")
7. `0c5e3a1` — GAP-16: `ReviewsSection` converted to use i18n (`Reviews`
   namespace) instead of hardcoded English JSX; removed the "Real people.
   Real results." eyebrow (not in Figma) and added the subtitle paragraph
   the Figma mobile frame shows under the heading
8. `28f3a1f` — GAP-20: footer copyright year was hardcoded to "2025" (already
   wrong the moment it was written) — now computed via `new Date().getFullYear()`

### Second batch (2026-07-20) — remaining Figma-fidelity items, user-approved

The user confirmed the guiding principle: **the Figma is the visual source of
truth; match it faithfully, don't ask fidelity questions** (only documented
functional overrides — real prices/reviews/links/FAQ copy — win over it). Under
that principle, the remaining "decision" gaps were resolved toward Figma:

9. `fba6155` — GAP-17: FAQ heading -> "FAQs" (en) / "Preguntas Frecuentes" /
   "Perguntas Frequentes" (dropped the "(FAQ)" parenthetical); stripped the
   literal "Q1:".."Q6:" prefixes from the en `q1..q6` values (es/pt were clean).
   Answer copy untouched (documented override).
10. `be4d30e` — GAP-04: Hero mini trust items match Figma copy ("100% Natural",
    "Satisfaction Guaranteed", "100% Discreet Shipping") + orange rotated-diamond
    glyph before each (was stale copy, no diamonds).
11. `f369205` — GAP-10: Ingredients cards rebuilt as a single-column list of
    compact horizontal rows (icon | name | keyword badge on one line, badge
    right); badge restyled from solid-orange fill to Figma outlined pill with a
    small orange diamond.
12. `fd4f758` — GAP-19: footer restructured to Figma's two-zone layout (brand +
    real address + "Never Satisfied?" newsletter on the LEFT; Orders / Quick
    Links / Customer Care columns on the RIGHT; full-width legal strip below).
    Real links/email/address kept (documented override). `#footer-contact`
    anchor preserved on the Customer Care column.
13. `930823d` — GAP-15: removed the non-Figma Instagram/TikTok social icons
    from the bundle cream panel.

**Deferred (not guessed):** GAP-06 (Hero decorative blobs exact size/position)
— needs precise Figma measurements via `get_design_context`, which is blocked
by the Figma MCP monthly quota (Starter plan, 6 calls/month, exhausted). The
current upper-left / lower-right blob arrangement matches the Figma's general
placement; exact fidelity waits for quota reset or a hand-nudge during the
1440px walkthrough.

All second-batch changes verified: `npm run build` exits 0, `npm test` 71/71,
and `git diff` vs the plan base still shows zero diff on
`Header.tsx`/`Footer.tsx`/`BuyNowButton.tsx` (FUNC-03 boundary intact).

---

**First-batch verification note (unchanged):** `npm run build` exits 0, `npm test`
(vitest) 71/71 passing, and `git diff` against this plan's base commit (`ee75d66`)
shows zero diff on `Header.tsx`/`Footer.tsx`/`BuyNowButton.tsx`.

**Still pending (unchanged from before this addendum):**
- The actual human walkthrough re-verification (Task 3's checkpoint is still
  open — these fixes need a fresh look, not a rubber stamp)
- Story/Ingredients/Bundle split layouts re-checked at a true 1440px viewport
  (prior walkthrough used a ~985px half-screen window)
- FAQs/Footer mobile Figma extraction (rate-limited, not yet captured)
- Everything logged as a decision item in `05-VISUAL-GAPS.md`'s "para
  discutir" sections

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Tasks 1 and 2 complete, committed, and verified (build green, FUNC-04 sweep clean, no regression diff on `Header.tsx`/`Footer.tsx`/`BuyNowButton.tsx`).
- **Blocked on Task 3**: human-verify checkpoint requires a manual dev-server browser walkthrough of all 8 sections, anchor-scroll confirmation, and a Stripe test-mode click-through — no test framework exists in this repo (05-CONTEXT.md), so this cannot be automated.
- Once Task 3 is approved, this plan (and Phase 5) is complete; STATE.md/ROADMAP.md updates are owned by the orchestrator after all wave agents finish.

---

## Addendum 2026-07-20 (5th round) — nav-frame offset root cause (`39774b7`)

Fourth post-checkpoint feedback round: box image slow to appear, upper-left blob too far from the navbar, lower-right blob still wrong, feature-card font looking oversized.

Root cause for 3 of the 4: every Y-offset pulled from the Figma "Copy as CSS" dump (both blobs, the product image, the H1) is measured from the top of Figma's full 1054px Hero frame, which in Figma's own composition includes the nav (72px) + trust bar (45px) = 117px drawn on top of the gradient. `LandingHeader` is a separate component rendered before `<Hero>` in our DOM, so our section's own top already corresponds to frame-y:117, not frame-y:0. Every offset used verbatim from the dump was landing 117px too low. Corrected by subtracting 117px throughout: small blob 121→4px, large blob clip-window 659→542px, product image 200→83px, text column margin retuned to 187px (same 267px target for the H1).

Also found the image's fade-in `delay` was 0.85s vs. 0.15s for the H1 — by the time every text element had faded in, the box was still invisible, reading as "it never shows up beside the H1." Dropped to 0.1s.

Card font: verified 18px/24px line-height, `rgba(49,34,89,.25)` bg, `#392a61` 2px border, 15px radius, 25px padding all match the Figma dump exactly via `globals.css` tokens. The "looks bigger" perception is the expected side effect of the already-accepted Satoshi→Plus Jakarta Sans substitution (different font metrics at the same declared size) — no code change made.

Build green, 71/71 tests green.

## Addendum 2026-07-20 (6th round) — exact per-layer CSS, blob geometry rebuilt (`58ec330`)

Small blob confirmed fixed. Asked the user for individual-layer Copy as CSS (blob, product image, one card) instead of the flattened parent "Hero Section" dump — this gave exact numbers without needing to infer nested offsets.

Large blob: the previous clip window (341x395) matched the box's *unrotated* size. Rotating 341x511 by 53.34deg produces a ~614x579 bounding box, and Figma's 1440x1054 frame clips that rotated silhouette on both the bottom and the right edge (not just the bottom, as previously assumed) — the old window cropped along the wrong lines, producing a kite-shaped artifact. Recomputed the 4 rotated corners from the exact layer CSS (`left:71.81% right:4.49% top:62.52% bottom:-11.01%`, `rotate(53.34deg)`), intersected with the frame's clip rect, and rebuilt as an outer clip window (542x429, flush right) containing an unclipped inner 614x579 box with the image centered and rotated inside.

Product image: width was 52%/780px (an earlier eyeballed approximation); exact CSS (`width:821.74px` in a 1440-wide frame) gives 57.06%/822px.

Feature cards: exact CSS for the card ("Frame 8", 301x127px) shows `flex-direction: row`, not column — the diamond sits beside a stacked title+description block, not above a full-width description row. The narrower effective text column in the row layout was reading as "font too big" even though the declared size (18px) was already correct.

Build green, 71/71 tests green.

---
*Phase: 05-landing-page-sections*
*Completed: pending human verification*
