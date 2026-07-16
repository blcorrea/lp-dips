---
phase: 05-landing-page-sections
plan: 03
subsystem: ui
tags: [nextjs, react, tailwind-v4, next-intl, shadcn, radix-accordion]

# Dependency graph
requires:
  - phase: 04-design-system-foundation
    provides: "--color-dips-* / --text-* / --radius-card* / --spacing-card-padding design tokens in src/app/globals.css"
provides:
  - "Reskinned IngredientsSection.tsx: static split layout (6 cards + expanded cocoa card), carousel removed"
  - "Reskinned FAQSection.tsx: shadcn Accordion (single-open, orange border + rotated chevron)"
affects: [05-landing-page-sections, 06-responsive-i18n-regression-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reuse existing i18n keys verbatim when a plan forbids new message-file entries; repurpose existing key semantics for new visual roles rather than hardcoding untranslated strings (CLAUDE.md i18n invariant takes precedence over literal Figma copy)"
    - "shadcn Accordion consumed as-is (no fork) with Tailwind data-[state=open]: variants layered on for design-token styling"

key-files:
  created: []
  modified:
    - src/components/IngredientsSection.tsx
    - src/components/FAQSection.tsx

key-decisions:
  - "Header copy for Ingredients ('The ingredients' / 'Behind the experience.') is not hardcoded in English; reused existing Ingredients.sectionTitle (heading-md) and Ingredients.subtitle (24px intro on the right column) instead, since the plan forbids new i18n keys and CLAUDE.md requires every user-facing string be localized in en/es/pt. This drops the plan's literal two-line header split in favor of a single localized heading + the right-column intro, honoring both constraints."
  - "FAQ open-item left border implemented via data-[state=open]:border-l-4 data-[state=open]:border-brand-orange on AccordionItem's className passthrough; chevron rotation reused unmodified from accordion.tsx per plan instruction (no reimplementation)."

patterns-established:
  - "Design-token utility classes (bg-dips-purple-section, rounded-card, p-card-padding, text-heading-md, etc.) from Phase 4's @theme block are now consumed for the first time by real components in this repo."

requirements-completed: [SECT-04, SECT-07, FUNC-04]

# Metrics
duration: ~15min
completed: 2026-07-16
status: complete
---

# Phase 5 Plan 3: Ingredients + FAQ Reskin Summary

**IngredientsSection rebuilt as a static split layout (6 cards + highlighted/expanded cocoa card) and FAQSection rebuilt on the installed shadcn Accordion with an orange open-item border — both reusing all existing i18n copy verbatim, no message-file edits.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-16T23:25:57Z
- **Tasks:** 2/2 completed
- **Files modified:** 2

## Accomplishments
- `IngredientsSection.tsx`: carousel mechanics (activeIndex, getCardStyle, getRelativePosition, autoplay `useEffect`, prev/next buttons, dot indicators) fully removed; replaced with a static two-column layout (left: header + 6 ingredient cards, right: intro copy + expanded cocoa card) on `bg-dips-purple-section`.
- All 6 ingredient icons repointed to `/images/redesign/ing-icon-*.png` (blend → `ing-icon-herbal.png`), reusing the existing `Ingredient` interface and `ingredients` data array unchanged.
- `FAQSection.tsx`: rebuilt on `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent` from `src/components/ui/accordion.tsx` (`type="single" collapsible` — one item open at a time), with an orange left border on the open item and the accordion's existing chevron-rotation CSS reused unmodified.
- Both sections gained `scroll-mt-[72px]` for the sticky `LandingHeader` anchor offset (per 05-CONTEXT.md scroll-mechanics decision).
- Zero edits to `messages/*.json` — confirmed via `git diff --stat` on `messages/` across both task commits (empty).

## Task Commits

1. **Task 1: IngredientsSection.tsx — carousel → split layout** - `92fcb6b` (feat)
2. **Task 2: FAQSection.tsx — rebuild on shadcn Accordion** - `585002e` (feat)

**Plan metadata:** committed separately by the orchestrator after wave completion (worktree mode — see note below).

## Files Created/Modified
- `src/components/IngredientsSection.tsx` - Static split layout (6 ingredient cards + expanded cocoa card), carousel removed, all `Ingredients.*` i18n keys reused verbatim
- `src/components/FAQSection.tsx` - Single-open shadcn Accordion with orange open-border + reused chevron rotation, `FAQ.q1..6`/`a1..6` reused verbatim

## Decisions Made
- **Ingredients header copy:** The plan's task action literally quoted "The ingredients" / "Behind the experience." as two hardcoded header lines. This conflicts with the plan's own top-level constraint ("no new i18n keys") and with CLAUDE.md's hard i18n invariant ("Every user-facing string in en/es/pt"). Resolved by reusing `t('sectionTitle')` (existing `Ingredients.sectionTitle`, "The Art of Temptation") as the single `text-heading-md` header, and `t('subtitle')` (existing `Ingredients.subtitle`) as the right column's 24px intro copy — exactly matching the plan's own instruction for the right column's "intro copy" role. No new keys added, no unlocalized English text introduced, structure (left header + 6 cards / right intro + expanded card) preserved.
- **Sub-card nesting in the expanded cocoa card:** the "Origins & Curiosities" sub-card (right column) uses the standard `dips-card-ingredient` / `dips-card-ingredient-border` token pair (not the highlight pair, which is already used by its parent card) — this wasn't specified precisely in the plan and was the most visually sensible default (secondary nested card inside an already-highlighted parent).
- **FAQ accordion item styling:** `AccordionItem`'s default `border-b` class is overridden by the passed-in `border` utility via `cn()`/tailwind-merge conflict resolution (later class wins), giving each closed FAQ item a full rounded border on `dips-card-ingredient`/`dips-card-ingredient-border` instead of just a bottom rule — matches the plan's "rounded-card" card treatment for closed items.

## Deviations from Plan

### Auto-fixed Issues

**1. [CLAUDE.md-driven adjustment / Rule 2 - missing critical functionality] Dropped hardcoded English-only Ingredients header copy in favor of reused i18n keys**
- **Found during:** Task 1 (IngredientsSection.tsx rebuild)
- **Issue:** Plan's task action instructed literal hardcoded English strings ("The ingredients" / "Behind the experience.") for the left-column header, which would violate CLAUDE.md's "every user-facing string in en/es/pt" constraint and the plan's own "no new i18n keys" objective (adding untranslated text isn't a new key, but it is unlocalized user-facing copy).
- **Fix:** Reused `Ingredients.sectionTitle` for the header (styled `text-heading-md`) and `Ingredients.subtitle` for the right-column intro copy (styled 24px), both already fully translated in en/es/pt.
- **Files modified:** `src/components/IngredientsSection.tsx`
- **Verification:** `git diff --stat` on `messages/` is empty; automated plan verification grep (id, scroll-mt, dips-purple-section, dips-card-ingredient-hl, ing-icon-herbal.png, cocoa_originsTitle, no activeIndex, no "Igredient" typo) all pass.
- **Committed in:** `92fcb6b` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (CLAUDE.md i18n precedence over a literal plan instruction)
**Impact on plan:** Necessary to keep the section fully localized; no scope creep, no new i18n keys added, layout structure and all other acceptance criteria preserved.

## Issues Encountered
- No `05-PATTERNS.md` file exists in `.planning/phases/05-landing-page-sections/` despite being referenced by this plan's `<context>` block. Proceeded using `05-UI-SPEC.md`, `05-CONTEXT.md`, `src/app/globals.css`, and the plan's own detailed task actions/acceptance criteria as the source of truth — sufficient to complete both tasks without ambiguity beyond the i18n header-copy conflict noted above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both components build and lint cleanly in isolation (`npx tsc --noEmit`, `npx eslint`) with zero errors attributable to these two files; pre-existing unrelated errors in the repo (missing generated Prisma client types, other files) are out of this plan's scope and untouched.
- Neither component is yet re-wired into `src/app/[locale]/page.tsx` — that wiring is expected in a later plan/wave of this phase (per 05-UI-SPEC.md's stated section order and 05-CONTEXT.md's file-organization notes), not this plan's `files_modified` scope.
- No blockers for Phase 6 (responsive/i18n/regression verification) — no message-file changes occurred, so the existing es/pt translations for `Ingredients.*` and `FAQ.*` require no follow-up translation work from this plan.

---
*Phase: 05-landing-page-sections*
*Completed: 2026-07-16*
