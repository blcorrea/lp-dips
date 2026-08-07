---
quick_id: 260807-cid
status: complete
date: 2026-08-07
commit: 1a244be
files_modified:
  - src/components/LandingHeader.tsx
---

# Quick Task 260807-cid — Summary

## What was wrong

The mobile hamburger toggled state and swapped its icon (Menu ↔ X), but no
drawer was ever rendered. `LandingHeader.tsx` carried a `TODO(Phase 6)`
marking the toggle as a scaffold for a nav pattern that was never built.

## What changed

`src/components/LandingHeader.tsx`:

- **Drawer added** — a `md:hidden` `<nav id="mobile-nav">` rendered inside
  `<header>` (below the nav row, within the sticky/`z-50` box) when
  `mobileOpen`. Contains the five nav links, the Shop Now pill CTA, and the
  language switcher. Reuses existing `LandingHeader` i18n keys — no new
  strings in en/es/pt.
- **Dismissal** — closes on link tap, Shop Now tap, locale pick, backdrop
  tap, `Escape`, and `pathname` change (the `/affiliates/join` route change,
  where `<header>` never unmounts).
- **Backdrop** — fixed `z-40` overlay rendered after the panel; the nav row
  and the panel are `z-50` so the X and the links stay tappable over it.
- **`LanguageSwitcher`** — gained an optional `onNavigate` callback so the
  mobile instance also closes the drawer; its stale "mobile drawer doesn't
  exist yet" comment was replaced.
- **A11y** — toggle now carries `aria-expanded` and `aria-controls`.

Desktop is untouched: every new node is `md:hidden` and no existing `md:`
class was altered.

## Verification

- `npx tsc --noEmit` — clean
- `npx next lint --file src/components/LandingHeader.tsx` — no warnings or errors

Not yet exercised on a real device — worth a manual check at <768px that the
panel opens, links scroll to their sections, and the backdrop dismisses.
