---
phase: 04-design-system-foundation
plan: 01
status: complete
requirements: [DSGN-01, DSGN-02, DSGN-03]
files_modified:
  - src/app/globals.css
commits:
  - fa0135c feat(design-system): add 32 DIPS redesign color tokens
  - baab22c feat(design-system): add card radius tokens and named spacing scale
  - 8f8293d feat(design-system): add extended typography scale and card/cta fonts
---

# 04-01 Summary — Design Token Foundation (globals.css)

## What was built

Expanded the Tailwind 4 `@theme` block in `src/app/globals.css` with every Figma design token from `04-UI-SPEC.md`, split across three atomic commits matching the plan's three tasks. All changes are strictly additive — nothing existing was renamed, removed, or repurposed.

**Task 1 — 32 `--color-dips-*` tokens + CTA orange confirmation (`fa0135c`)**
Added the full redesign-only color palette (hero/section purples, card tints, text roles) transcribed verbatim from the UI-SPEC "New `--color-dips-*` tokens" table, including the `rgba()`-valued tint tokens. Added a section comment confirming `--color-brand-orange: #f27521` (left byte-for-byte untouched) remains the single normalized CTA orange per DSGN-03 — none of the four Figma drift oranges (`#fb6c04`/`#ff6b01`/`#f15a22`/`#f16b16`) were added as tokens or appear anywhere in the file. `--color-dips-cream` (`#fff8f0`) and the existing `--color-brand-cream` (`#f3e9e3`) coexist as distinct tokens as required.

**Task 2 — radius tokens + named spacing scale (`baab22c`)**
Added `--radius-card: 0.9375rem` (15px) and `--radius-card-lg: 1.125rem` (18px) alongside the existing `--radius`/`--radius-xl`/`--radius-2xl`/`--radius-3xl` scale (all four existing lines unchanged). Added the named `--spacing-xs` through `--spacing-3xl` (7 steps: 4/8/16/24/32/48/64px) plus the Figma-locked `--spacing-card-padding: 25px` exception. Per the plan, one-off layout constants (trust bar 45px, header 72px, hero 1054px, etc.) were deliberately NOT tokenized — those are Phase 5's concern.

**Task 3 — 16 typography roles + font registrations (`8f8293d`)**
Added all 16 `--text-*` roles from the UI-SPEC "Extended type scale" table (display-hero, heading-lg/md/side, subtitle-italic-lg/sm, body-lg/md, card-title-lg/sm, card-body, cta-button, nav-link, trust-bar, footer-heading, footer-fine), each as a size token paired with a `--text-*--line-height` token using the Tailwind 4 idiom — weight/family intentionally excluded (Phase 5 applies those via utility classes). Registered `--font-card: var(--font-plus-jakarta-sans), sans-serif;` and `--font-cta: var(--font-dm-sans), sans-serif;`, matching character-for-character the CSS variable names sibling plan 04-02's `src/lib/fonts.ts` exposes via `next/font/google`. No CSS `@import` was added (would break Next.js font optimization). Existing `--font-heading`/`--font-body`/`--font-sans` are unchanged.

## Key files

- `src/app/globals.css` — the only file modified. `@theme` block grew from 31 lines (46–76) to 128 lines (46–173); every other section of the file (both `@font-face` families, `@layer base`, `.text-highlight`, `.ingredient-card`, `.legal-content` rules) is untouched.

## Cross-plan contract (for 04-02 / 04-03)

`--font-card` and `--font-cta` in `globals.css` now reference `var(--font-plus-jakarta-sans)` and `var(--font-dm-sans)` exactly. Plan 04-02's `src/lib/fonts.ts` must export `next/font/google` variable classNames using these exact CSS custom property names for the link to resolve at runtime — this plan does not create or depend on `fonts.ts` existing yet (no build was run from this plan; that verification is owned by 04-02 per the phase's `<verification>` block).

## Deviations from plan

None. All three tasks were implemented exactly as specified: same token names, same values (transcribed verbatim from `04-UI-SPEC.md`), same file, same additive-only approach. Section comment wording ("DIPS REDESIGN COLORS (landing-only, additive)", "SPACING SCALE (named, additive)", "TYPOGRAPHY SCALE (extended, additive)", "FONT FAMILY TOKENS (redesign, additive)") was chosen to avoid embedding the `--color-dips-` substring or any drift-orange hex string inside comment text, so the plan's grep-based verify commands count only real token declarations.

## Self-check

Ran every `<verify>` command from the plan plus the phase-level `<verification>` block against the final file state (after all 3 commits):

| Check | Result |
|---|---|
| `grep -c -- '--color-dips-'` == 32 | 32 ✓ |
| `--color-brand-orange: #f27521` present, unchanged | ✓ |
| `--color-dips-cream` (`#fff8f0`) and `--color-brand-cream` (`#f3e9e3`) both present, distinct | ✓ |
| No Figma drift orange (`#fb6c04`/`#ff6b01`/`#f15a22`/`#f16b16`) anywhere in file | 0 matches ✓ |
| `--radius-card:` and `--radius-card-lg:` present | ✓ |
| Existing `--radius`/`--radius-xl`/`--radius-2xl`/`--radius-3xl` unchanged | ✓ |
| `--spacing-xs` … `--spacing-3xl` (7 steps) present with UI-SPEC values | ✓ |
| `--spacing-card-padding: 25px` present | ✓ |
| `--text-*--line-height` count >= 16 | exactly 16 ✓ |
| `--text-display-hero` (64px) and `--text-footer-fine` (14px) spot checks | ✓ |
| `--font-card: var(--font-plus-jakarta-sans)` present | ✓ |
| `--font-cta: var(--font-dm-sans)` present | ✓ |
| Existing `--font-heading`/`--font-body`/`--font-sans` unchanged | ✓ |
| No CSS `@import` added for Google Fonts | ✓ (only the pre-existing `@import "tailwindcss";`) |
| `git diff` across all 3 commits shows zero removed lines (pure additions) | ✓ |
| `@theme` block brace balance (18 open / 18 close in whole file) | BALANCED ✓ |
| Each task committed individually | 3 commits: `fa0135c`, `baab22c`, `8f8293d` ✓ |
| STATE.md / ROADMAP.md untouched by this plan | ✓ (not modified — orchestrator owns those writes) |

Full Tailwind/Next.js build validation of the `@theme` block is explicitly deferred to plan 04-02 per this plan's `<verification>` section ("confirmed at the phase level by plan 04-02's `next build`") since 04-02 is what actually wires the `next/font/google` variables this plan's tokens reference.

## Self-Check: PASSED
