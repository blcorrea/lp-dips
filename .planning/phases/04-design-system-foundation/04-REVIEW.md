---
phase: 04-design-system-foundation
reviewed: 2026-07-16T21:09:35Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/app/globals.css
  - src/lib/fonts.ts
  - src/app/[locale]/layout.tsx
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-07-16T21:09:35Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Reviewed the design-system foundation diff against `9dd57ee`: the new `--color-dips-*`, spacing, typography, and radius tokens added to `src/app/globals.css`, the new `src/lib/fonts.ts` (Plus Jakarta Sans / DM Sans via `next/font/google`), and the wiring of those font variables onto `<html>` in `src/app/[locale]/layout.tsx`.

Every hex/px/line-height value added to `globals.css` was cross-checked line-by-line against `.planning/phases/04-design-system-foundation/04-UI-SPEC.md` (colors, spacing, extended type scale, radii) — all 31 color tokens, 8 spacing tokens, and 16 typography tokens match the spec exactly with no transcription errors. No hardcoded secrets, dangerous functions, debug artifacts, or empty catch blocks are present in any of the three files.

The diff itself is low-risk (purely additive CSS custom properties + one new lib file + a two-line JSX change), but it has one structural gap worth flagging before Phase 5 starts consuming these tokens: `--font-card`/`--font-cta` only resolve correctly on pages rendered under the `[locale]` route tree, not on the app's two other root layouts (`src/app/admin/layout.tsx`, `src/app/ingredients/layout.tsx`), because only `[locale]/layout.tsx` applies the `next/font` variable classes to `<html>`. This is currently latent (nothing consumes `font-card`/`font-cta` yet) but will silently break font rendering if a shared component ever picks up those utility classes outside the locale tree.

## Warnings

### WR-01: `--font-card` / `--font-cta` silently fail to resolve outside the `[locale]` route tree

**File:** `src/app/globals.css:171-172` (token definitions), `src/app/[locale]/layout.tsx:78-82` (only place the backing CSS variables are set)

**Issue:** `--font-card: var(--font-plus-jakarta-sans), sans-serif;` and `--font-cta: var(--font-dm-sans), sans-serif;` are registered globally in the `@theme` block, which Tailwind emits at `:root` — meaning `font-card`/`font-cta` utility classes are generated and usable from *any* page in the app, including `src/app/admin/layout.tsx` and `src/app/ingredients/layout.tsx`. However, the actual `--font-plus-jakarta-sans` / `--font-dm-sans` custom properties are only defined via the `next/font` `.variable` classes applied to `<html>` in `src/app/[locale]/layout.tsx` (lines 78-82). `admin/layout.tsx` and `ingredients/layout.tsx` render their own independent `<html>` root and never import `src/lib/fonts.ts`, so on those pages `var(--font-plus-jakarta-sans)` is an unresolved custom property with no fallback supplied to the `var()` call itself. Per the CSS Custom Properties spec, this makes the whole `font-family` declaration invalid at computed-value time (it does *not* fall through to the trailing `sans-serif` — that fallback is a separate item in the list, not a fallback argument to the failing `var()`), so the browser instead uses the inherited `font-family` value.

This is not exercised today (no component references `font-card`/`font-cta` yet — confirmed via grep, zero consumers in `src/`), but it is an easy trap for Phase 5/6: any shared component that gets reused on an admin or `/ingredients` page and applies `font-card`/`font-cta` will silently render with the wrong (inherited) font instead of erroring.

**Fix:** Document the coupling directly at the token definition so future maintainers don't assume `font-card`/`font-cta` are globally safe, e.g.:
```css
/* NOTE: --font-card / --font-cta only resolve on pages rendered under
   src/app/[locale]/layout.tsx, which is the sole layout applying the
   next/font variable classes (plusJakartaSans.variable / dmSans.variable)
   to <html>. Do not use font-card/font-cta on components shared with
   src/app/admin or src/app/ingredients — they render independent <html>
   roots and will silently fall back to the inherited font. */
--font-card: var(--font-plus-jakarta-sans), sans-serif;
--font-cta: var(--font-dm-sans), sans-serif;
```

### WR-02: `DM_Sans` loads only weight 700 with no documented guard against other weights being requested

**File:** `src/lib/fonts.ts:19-24`

**Issue:** `dmSans` is loaded with `weight: ['700']` only. The comment says "CTA buttons — 700 only per the Phase 4 UI-SPEC," which is correct per spec, but nothing in code enforces it. If a future component applies `font-cta` together with a lighter Tailwind weight utility (e.g. `font-cta font-medium`), there is no 500-weight static file loaded for DM Sans — the browser will render using the only available (700) face regardless of the requested weight, so the button will silently look bolder than intended with no build-time or lint-time signal that the combination is invalid.

**Fix:** Either load the extra weights that might realistically be requested, or add an explicit runtime/lint guard (e.g. a short comment at the `font-cta` Tailwind mapping, or a component-level constraint in the eventual CTA-button component) that only `font-bold`/`font-cta` (no other weight utility) may be paired with `font-cta`. Since no consumer exists yet, this is easy to close in Phase 5 by keeping the CTA button component the single place `font-cta` is applied.

## Info

### IN-01: New design tokens have zero consumers as of this diff

**File:** `src/app/globals.css:84-173`

**Issue:** All 31 `--color-dips-*` tokens, both `--radius-card*` tokens, all 8 spacing tokens, and 15 of 16 typography tokens introduced in this diff (plus `--font-card`/`--font-cta`) have no references anywhere else in `src/` (confirmed via grep). This is expected for a foundation-only phase per the UI-SPEC ("this phase introduces no new UI copy... no components render yet"), so it is not a defect, but flagging for tracking: if Phase 5 doesn't consume all of these, some will end up as permanent dead CSS.

**Fix:** No action needed now; Phase 5/6 checkers should verify each token defined here gets at least one consumer before the milestone closes.

### IN-02: Pre-existing unsafe `as any` cast on locale validation (untouched by this diff, but present in reviewed file)

**File:** `src/app/[locale]/layout.tsx:70-72`

**Issue:** 
```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!routing.locales.includes(locale as any)) {
```
This line predates the diff under review (unchanged by commit range `9dd57ee..HEAD`) but is part of the file scope for this review. `locale as any` fully suppresses type checking on the argument rather than narrowing it to `routing.locales`'s element type, which would catch a typo in a future refactor of `routing.locales`.

**Fix:** Narrow instead of widening to `any`:
```ts
if (!(routing.locales as readonly string[]).includes(locale)) {
```
Not required for this phase's sign-off since it's pre-existing, but worth a follow-up cleanup ticket.

### IN-03: `className` built with raw template literal instead of the project's `cn()` convention

**File:** `src/app/[locale]/layout.tsx:81`

**Issue:** `className={\`${plusJakartaSans.variable} ${dmSans.variable}\`}` combines classes via string interpolation. The project's documented convention (`src/lib/utils.ts`, used elsewhere for `className`) is `cn()` (clsx + tailwind-merge). There's no actual conflict here since `next/font` `.variable` values are opaque hashed class names, so `cn()` isn't strictly necessary, but it's a minor deviation from the established pattern.

**Fix (optional):**
```tsx
import { cn } from '@/lib/utils';
...
className={cn(plusJakartaSans.variable, dmSans.variable)}
```

---

_Reviewed: 2026-07-16T21:09:35Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
