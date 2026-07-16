---
phase: 05-landing-page-sections
plan: 01
subsystem: landing-chrome
tags: [i18n, header, footer, design-tokens]
dependency-graph:
  requires: []
  provides: [LandingHeader, LandingFooter, LandingHeader-i18n, LandingFooter-i18n, footer-contact-anchor]
  affects: [src/app/[locale]/page.tsx (wired in Plan 05-05)]
tech-stack:
  added: []
  patterns: ["additive dark-theme chrome components separate from shared Header/Footer", "client-only newsletter form (no backend) with local success-state toggle"]
key-files:
  created:
    - src/components/LandingHeader.tsx
    - src/components/LandingFooter.tsx
  modified:
    - messages/en.json
    - messages/es.json
    - messages/pt.json
decisions:
  - "Logo marks (LandingHeader tagline mark + LandingFooter logo) render as two absolutely-stacked SVG layers (orange part over purple part) inside a fixed-size relative container, since the Figma source is a two-tone icon split across two files with no documented offset."
  - "Newsletter submit is a local useState toggle (preventDefault, no network call) showing the existing successMsg copy — matches the threat model's 'no backend this phase' disposition; Footer.tsx itself has no submit handler today, so this is new client behavior modeled on the existing successMsg i18n key that was already present but unused."
  - "Copyright/FDA disclaimer and column headings use the text-footer-fine size token with the dips-text-lavender / dips-text-footer-fine color tokens rather than inventing new sizes."
metrics:
  duration: 25m
  completed: 2026-07-16
status: complete
---

# Phase 5 Plan 1: Landing Header & Footer Summary

Built the two new landing "chrome" components (`LandingHeader.tsx` trust bar + minimal anchor nav, `LandingFooter.tsx` newsletter + columns + real contact) as additive, dark-themed replacements used only by the future home page — the existing `Header.tsx`/`Footer.tsx` remain byte-for-byte unchanged for the 9 shared pages.

## What Was Built

### Task 1 — `LandingHeader.tsx`
- Trust bar row (`h-[45px]`, `bg-[rgba(45,26,105,0.4)]`) rendering 6 items via `LandingHeader.trustBar1..6`, each with a small `bg-brand-orange rotate-[43deg]` decorative diamond, using the `text-trust-bar` token and `dips-text-lavender-muted` color.
- Sticky (`sticky top-0 z-50`) nav row (`h-[72px]`, `px-[40px]` desktop) on `bg-dips-purple-deepest`, with a two-layer SVG logo (`logo-purple-part.svg` + `logo-orange-part.svg`) plus the `tagline` wordmark.
- Exactly 4 anchor nav links (`text-nav-link` token, `dips-text-lavender-muted` → hover `brand-orange`): Menu → `#hero`, Our Story → `#story`, Order → `#bundle`, Contact → `#footer-contact`.
- "Shop Now" pill CTA (`bg-brand-orange`, `text-cta-button` token, 50px height, `rounded-full`) linking to `#bundle`.
- Mobile `Menu`/`X` toggle button kept present (`md:hidden`) behind a `TODO(Phase 6)` comment — no drawer implemented, desktop nav is `hidden md:flex`.
- No `SocialMediaButtons` import, no language switcher, no inline Affiliates link.

### Task 2 — `LandingFooter.tsx`
- Two-layer SVG logo (`footer-logo-purple.svg` + `footer-logo-orange.svg`).
- Newsletter block: "Never Satisfied?" heading (`LandingFooter.neverSatisfied`), pill email input + "Sign Up" `bg-brand-orange` button; client `onSubmit` (`preventDefault`) toggles a local `submitted` state that swaps the form for the existing `successMsg` copy — no network call (matches threat model T-05: "no backend this phase").
- 3 link columns (Orders / Quick Links / Customer Care) — Quick Links includes the Affiliates link (`/${locale}/affiliates/join`, carried verbatim from `Footer.tsx`).
- Contact column has `id="footer-contact"` + `scroll-mt-[72px]` so the header's Contact anchor lands on this specific column; carries the real `mailto:info@dipschocolate.com` and `tel:7544576844` verbatim from `Footer.tsx` (FUNC-04 correct-email source of truth — no Figma placeholder mailbox used).
- Real registered address block ("Dips Wellness Corporation", "8211 NW 64th Street Unit 4, Miami, FL 33166") reused verbatim from `Footer.tsx` — Figma's placeholder address was not used.
- Copyright + FDA disclaimer via the `text-footer-fine` token, reusing `rightsReserved`/`ageRestriction`/`madeWith`/`productDesigned` copy.

### i18n
- `LandingHeader` namespace (12 keys: `tagline`, `menu`, `ourStory`, `order`, `contact`, `shopNow`, `trustBar1..6`) added to `messages/en.json`, `es.json`, `pt.json`. English trust-bar copy matches the FUNC-04 spelling corrections ("100% Natural Ingredients", "Aphrodisiac Blend").
- `LandingFooter` namespace added to all 3 locale files, reusing the existing `Footer` namespace copy for carried-over keys plus the new `neverSatisfied` key.

## Deviations from Plan

None — plan executed as written. One clarification: the plan's task 2 action described "carry the existing Footer newsletter client logic and success-message behavior forward," but `Footer.tsx`'s form currently has no `onSubmit` handler at all (it's a plain, non-functional `<form>`); the `successMsg` i18n key already existed in all 3 locale files but was unused. `LandingFooter.tsx` implements the client submit + success-message behavior as new code (Rule 2 — missing basic client functionality implied by the existing unused i18n key and the plan's explicit instruction), keeping it local-only per the threat model's "no backend this phase" disposition (T-05-01/T-05-02 unaffected — no new network write, no `dangerouslySetInnerHTML`).

## Verification

- `npx prisma generate` (with a placeholder `DATABASE_URL`, since no `.env` exists in this worktree) succeeded.
- `next build` (with placeholder Stripe/Shopify/Blob env vars for the worktree's missing `.env`) completed with **zero TypeScript errors** and **zero new ESLint errors** — only pre-existing warnings in unrelated files (`orders/page.tsx`, `orders/[id]/page.tsx`, `TrackingProvider.tsx`, `CustomerContext.tsx`) plus a pre-existing `jose`/Edge Runtime warning, none touched by this plan.
- `git diff --stat -- src/components/Header.tsx src/components/Footer.tsx` → empty (no diff), confirming the 9 shared pages did not regress.
- Both new components are not yet imported anywhere (expected — they are wired into `page.tsx` in Plan 05-05).
- All 3 locale JSON files parse as valid JSON (`JSON.parse` after BOM strip — the pre-existing UTF-8 BOM in these files is unrelated to this plan's edits).

## Self-Check: PASSED

- FOUND: `src/components/LandingHeader.tsx`
- FOUND: `src/components/LandingFooter.tsx`
- FOUND: commit `05dd2a8` (LandingHeader + i18n)
- FOUND: commit `1e43bb1` (LandingFooter + i18n)
