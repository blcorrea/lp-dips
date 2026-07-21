---
phase: 04-design-system-foundation
verified: 2026-07-16T21:15:37Z
status: passed
score: 8/8 must-haves verified
behavior_unverified: 0
overrides_applied: 1
overrides:
  - must_have: "Títulos, corpo/italic e cards/CTAs renderizam com fontes Google Fonts licenciáveis escolhidas como substitutas de All Round Gothic Bold, Filson Pro e Satoshi/DM Sans"
    reason: "Investigation found AllRoundGothic and FilsonPro are already production-licensed OTF assets (not the Figma file's flagged demo fonts), so no substitute is needed for those two roles — visually identical to the Figma spec, just sourced from a valid license instead of Figma's demo files. Only Satoshi (no existing asset) required a Google Fonts substitute (Plus Jakarta Sans), and DM Sans was already the intended CTA font per REQUIREMENTS.md's own phrasing 'Satoshi/DM Sans'."
    accepted_by: "João Pelluzzo Corrêa"
    accepted_at: "2026-07-16T21:20:00Z"
gaps:
  - truth: "Títulos, corpo/italic e cards/CTAs renderizam com fontes Google Fonts licenciáveis escolhidas como substitutas de All Round Gothic Bold, Filson Pro e Satoshi/DM Sans (Roadmap Phase 4 Success Criterion #2 / DSGN-02)"
    status: partial
    reason: "Only the cards/CTAs role got a new Google Fonts substitute (Plus Jakarta Sans for cards, DM Sans for CTAs). Headings (AllRoundGothic) and body/italic (FilsonPro) were deliberately left on their existing production OTF files — no Google Fonts substitute was defined or applied for those two roles, contradicting the literal text of both REQUIREMENTS.md DSGN-02 and this roadmap success criterion, which name all three roles."
    artifacts:
      - path: "src/app/globals.css"
        issue: "--font-heading: 'AllRoundGothic', sans-serif; and --font-body: 'FilsonPro', sans-serif; (lines 48-49) are byte-for-byte unchanged from before Phase 4 — no Google Font substitute token was added for either role."
      - path: "src/lib/fonts.ts"
        issue: "Only exports plusJakartaSans (cards) and dmSans (CTAs) — no next/font/google loader exists for a headings or body substitute."
      - path: ".planning/phases/04-design-system-foundation/04-UI-SPEC.md"
        issue: "Lines 30-35 and 85-86 document a 'Confirmed decision' to keep AllRoundGothic/FilsonPro as-is 'rather than substituting with Google Fonts', overriding the requirement's literal scope during UI-SPEC authoring, without a corresponding update to REQUIREMENTS.md or an explicit human-accepted override recorded anywhere in STATE.md's Decisions log."
    missing:
      - "Either: (a) accept this as an intentional, human-approved deviation (add a VERIFICATION.md override entry — see suggestion below) and update REQUIREMENTS.md DSGN-02 wording to reflect 'Google Fonts substitute defined for cards/CTAs only; headings/body retain existing licensed OTFs', or (b) wire actual Google Fonts substitutes for AllRoundGothic (headings) and FilsonPro (body/italic) per the requirement as originally written."
---

# Phase 4: Design System Foundation Verification Report

**Phase Goal:** A landing page tem uma fundação visual consistente e reutilizável — tokens, fontes e laranja de CTA normalizados no tema Tailwind — pronta para as seções serem construídas em cima dela
**Verified:** 2026-07-16T21:15:37Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | (SC1/DSGN-01) Tailwind `@theme` exposes every Figma color/radius/spacing value as a named token — no stray section hex | ✓ VERIFIED | `src/app/globals.css`: 32/32 `--color-dips-*` tokens present, values match `04-UI-SPEC.md` exactly (byte-checked line by line); `--radius-card`/`--radius-card-lg` present; 7-step `--spacing-xs..3xl` + `--spacing-card-padding: 25px` present. No section components exist yet (Phase 5), so no stray hex is possible. |
| 2 | (SC2/DSGN-02) Headings, body/italic, and cards/CTAs render with licensable Google Fonts chosen as substitutes for AllRoundGothic, FilsonPro, and Satoshi/DM Sans | ✗ FAILED | Only cards/CTAs got new Google Fonts (`src/lib/fonts.ts`: `plusJakartaSans`, `dmSans`). `--font-heading: 'AllRoundGothic'` and `--font-body: 'FilsonPro'` (globals.css:48-49) are unchanged — no Google Fonts substitute exists for headings or body. See Gaps Summary. |
| 3 | (SC3/DSGN-03) Every landing CTA uses a single normalized orange token, replacing the three Figma drift oranges | ✓ VERIFIED | `--color-brand-orange: #f27521` (globals.css:64) unchanged; `grep -E '#fb6c04|#ff6b01|#f15a22|#f16b16' src/app/globals.css` returns zero matches. Foundation-level normalization complete; no alternate orange token exists for Phase 5 to pick up by mistake. |
| 4 | 16 `--text-*` typography role tokens exist, each paired with a `--text-*--line-height` | ✓ VERIFIED | `grep -c -- '--text-.*--line-height' src/app/globals.css` = 16; spot-checked `--text-display-hero: 64px` and `--text-footer-fine: 14px` against UI-SPEC table — exact match. |
| 5 | `--font-card`/`--font-cta` registered in `@theme`, resolving to the exact `next/font` variable names `fonts.ts` exports | ✓ VERIFIED | `--font-card: var(--font-plus-jakarta-sans), sans-serif;` / `--font-cta: var(--font-dm-sans), sans-serif;` (globals.css:171-172) match `fonts.ts`'s `variable: '--font-plus-jakarta-sans'` / `variable: '--font-dm-sans'` character-for-character. |
| 6 | Existing `--color-brand-*`, `--font-heading`/`--font-body`, both `@font-face` families, and admin/ingredients layouts remain unchanged | ✓ VERIFIED | All 8 `--color-brand-*` lines, both `@font-face` blocks (AllRoundGothic + 3x FilsonPro weights), and `--font-heading`/`--font-body` byte-identical to pre-phase state. `src/app/admin/layout.tsx` and `src/app/ingredients/layout.tsx` not touched by any Phase 4 commit (confirmed via `git log` on the three modified paths). |
| 7 | `next build` compiles the storefront cleanly with both new font variables live on `<html>` | ✓ VERIFIED | Ran `npx next build` fresh in this verification session (not trusting SUMMARY's build log) — compiled successfully, all 28 routes generated, zero errors. `src/app/[locale]/layout.tsx` imports `plusJakartaSans, dmSans` from `@/lib/fonts` and applies `className={\`${plusJakartaSans.variable} ${dmSans.variable}\`}` on `<html>`, `lang`/`suppressHydrationWarning` and `<body>` className unchanged. |
| 8 | All 27 Figma-extracted assets exist at `public/images/redesign/` with original filenames, no collision with existing `public/images/` | ✓ VERIFIED | `ls -1 public/images/redesign \| wc -l` = 27; all expected filenames present (hero-product.png, footer-logo-orange.svg, review-avatar-1..6.png, blob-vector-1/2.svg, etc.). Confirmed `public/images/hero-product.png` (1,755,550 bytes, unchanged) and `public/images/redesign/hero-product.png` (213,360 bytes, the Figma export) coexist as distinct files — no overwrite occurred. |

**Score:** 6/8 truths verified (numbering above includes both roadmap SCs and supporting plan-level truths; against the 3 roadmap Success Criteria specifically: 2/3 verified, 1 failed).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/globals.css` | All new `@theme` design tokens for the landing redesign | ✓ VERIFIED | 32 color, 2 radius, 8 spacing, 16 typography, 2 font-family tokens all present and additive; existing tokens/`@font-face` untouched. |
| `src/lib/fonts.ts` | `next/font/google` instances for Plus Jakarta Sans and DM Sans, exported | ✓ VERIFIED | Exports `plusJakartaSans` (400/700, `--font-plus-jakarta-sans`) and `dmSans` (700, `--font-dm-sans`), both `display: 'swap'`. |
| `src/app/[locale]/layout.tsx` | Font CSS variables applied on storefront `<html>` | ✓ VERIFIED | `className={\`${plusJakartaSans.variable} ${dmSans.variable}\`}` on `<html>`; imports from `@/lib/fonts`. |
| `public/images/redesign/` | 27 redesign image/vector assets | ✓ VERIFIED | 27/27 files present, filenames match plan's expected list exactly. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `globals.css` `--font-card` | `fonts.ts` `--font-plus-jakarta-sans` | `var(--font-plus-jakarta-sans)` | ✓ WIRED | Exact variable-name match confirmed by grep on both files. |
| `globals.css` `--font-cta` | `fonts.ts` `--font-dm-sans` | `var(--font-dm-sans)` | ✓ WIRED | Exact variable-name match confirmed by grep on both files. |
| `layout.tsx` `<html>` className | `fonts.ts` `plusJakartaSans.variable` / `dmSans.variable` | `className={\`${plusJakartaSans.variable} ${dmSans.variable}\`}` | ✓ WIRED | Confirmed present at `src/app/[locale]/layout.tsx:81`; `next build` resolves it without error. |

**Structural caveat (from `04-REVIEW.md` WR-01, confirmed still true):** `--font-card`/`--font-cta` are declared globally in `@theme` (Tailwind emits them at `:root`), so the utility classes `font-card`/`font-cta` are generated and usable from *any* route — but the backing `--font-plus-jakarta-sans`/`--font-dm-sans` custom properties are only ever set on `<html>` in `src/app/[locale]/layout.tsx`. `src/app/admin/layout.tsx` and `src/app/ingredients/layout.tsx` render independent `<html>` roots and never import `src/lib/fonts.ts`. If a shared component that uses `font-card`/`font-cta` is ever reused on an admin/ingredients page, the font will silently fall back to the inherited font (no error). Not exercised today (zero consumers of `font-card`/`font-cta` anywhere in `src/`), so it is not a blocker for this phase, but it is a real latent trap for Phase 5/6 — logging as an info item, not a gap.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|--------------|--------|----------|
| DSGN-01 | 04-01, 04-03 | Figma tokens (colors, radius, spacing) centralized in Tailwind theme | ✓ SATISFIED | All 32+2+8 tokens present and additive; 27 assets migrated to a stable repo path. |
| DSGN-02 | 04-02 (plan scoped it down to font-wiring only) | Licensable substitute fonts (Google Fonts) defined and applied for AllRoundGothic (headings), FilsonPro (body/italic), and Satoshi/DM Sans (cards/CTAs) | ✗ BLOCKED (partial) | Google Fonts substitute delivered only for cards/CTAs (Plus Jakarta Sans + DM Sans). Headings/body kept their pre-existing OTF fonts — no substitute was defined for those two roles. See Gaps Summary. |
| DSGN-03 | 04-01 | CTA orange normalized to a single token | ✓ SATISFIED | `--color-brand-orange: #f27521` confirmed as sole CTA orange; no Figma drift orange (#fb6c04/#ff6b01/#f15a22/#f16b16) added. |

**Orphaned requirements:** None — DSGN-01, DSGN-02, DSGN-03 all appear in at least one Phase 4 plan's `requirements` frontmatter, matching REQUIREMENTS.md's traceability table exactly.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found in any of the 3 modified files | — | None |
| `src/app/globals.css` / `src/app/[locale]/layout.tsx` | 171-172 / 78-82 | `--font-card`/`--font-cta` only resolve inside the `[locale]` route tree (see Key Link caveat above) | ℹ️ Info | Latent risk for Phase 5/6 if a shared component leaks onto admin/ingredients pages — not exercised today, already flagged in `04-REVIEW.md` (WR-01). |
| `src/lib/fonts.ts` | 19-24 | `dmSans` loads weight 700 only, no guard against pairing `font-cta` with a different weight utility | ℹ️ Info | Already flagged in `04-REVIEW.md` (WR-02); no consumer exists yet to exercise this. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `@theme` block parses / build compiles with new tokens + fonts | `npx tsc --noEmit -p tsconfig.json` | No output, exit 0 | ✓ PASS |
| Full storefront build with fonts wired | `npx next build` | Compiled successfully, 28/28 routes generated, 0 errors | ✓ PASS |
| No Figma drift orange anywhere in theme | `grep -E '#fb6c04\|#ff6b01\|#f15a22\|#f16b16' src/app/globals.css` | No matches (exit 1) | ✓ PASS |
| All 27 redesign assets present, no collision | `ls -1 public/images/redesign \| wc -l` + size diff on `hero-product.png` | 27 files; existing `public/images/hero-product.png` unchanged (1,755,550 bytes) vs new 213,360-byte redesign export | ✓ PASS |

### Human Verification Required

None. The remaining open item (DSGN-02 scope) is a product/requirements decision, not something that needs visual/UX human testing — it needs a maintainer decision on whether the UI-SPEC's font-reuse deviation is acceptable, captured below.

### Gaps Summary

**One gap, one root cause:** Plan 04-02 and the Phase 4 UI-SPEC narrowed DSGN-02's scope during execution. REQUIREMENTS.md and the Roadmap's Phase 4 Success Criterion #2 both explicitly name three roles needing a Google Fonts substitute — titles (AllRoundGothic), body/italic (FilsonPro), and cards/CTAs (Satoshi/DM Sans). The UI-SPEC (`04-UI-SPEC.md` lines 30-35, 85-86) documents an "Investigation finding" that `AllRoundGothic`/`FilsonPro` are already production-licensed OTF assets (not the Figma file's flagged "FONTSPRING DEMO" fonts) and made a "Confirmed decision" to keep reusing them rather than sourcing Google Fonts substitutes. Plan 04-02's own `must_haves` then baked this narrower scope in directly ("The existing AllRoundGothic/FilsonPro fonts... are unchanged" as an explicit truth), so the plan-level self-check reports 100% pass while the roadmap-level requirement is only ⅓ delivered (cards/CTAs only).

This is very plausibly the *correct* engineering call — reusing already-licensed production fonts avoids re-licensing risk and a 41-file, sitewide typography rewrite of out-of-scope pages — but it was made unilaterally inside a generated UI-SPEC document and self-approved by that same document's "Checker Sign-Off," with no corresponding update to `REQUIREMENTS.md`'s DSGN-02 text or an entry in `STATE.md`'s Decisions log. Per this verifier's mandate not to let a plan silently reduce roadmap-defined scope, this is reported as a gap rather than silently passed.

**This looks intentional.** To accept this deviation, add to VERIFICATION.md frontmatter:

```yaml
overrides:
  - must_have: "Títulos, corpo/italic e cards/CTAs renderizam com fontes Google Fonts licenciáveis escolhidas como substitutas de All Round Gothic Bold, Filson Pro e Satoshi/DM Sans"
    reason: "Investigation found AllRoundGothic and FilsonPro are already production-licensed OTF assets (not the Figma file's flagged demo fonts), so no substitute is needed for those two roles; only Satoshi (no existing asset) required a Google Fonts substitute (Plus Jakarta Sans), and DM Sans was already the intended CTA font per REQUIREMENTS.md's own phrasing 'Satoshi/DM Sans'."
    accepted_by: "<maintainer name>"
    accepted_at: "<ISO timestamp>"
```

If accepted, also update `REQUIREMENTS.md` DSGN-02's wording to reflect the narrowed scope so future phases/audits don't re-flag this same gap.

---

_Verified: 2026-07-16T21:15:37Z_
_Verifier: Claude (gsd-verifier)_
