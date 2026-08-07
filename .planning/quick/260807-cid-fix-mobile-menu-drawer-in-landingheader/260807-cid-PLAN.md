---
quick_id: 260807-cid
description: Fix mobile menu — implement the LandingHeader mobile drawer
date: 2026-08-07
mode: quick (inline execution, no subagents)
must_haves:
  truths:
    - Tapping the hamburger on mobile renders a visible nav panel with the same links as the desktop nav.
    - Tapping a link, the backdrop, or Escape closes the panel.
    - Nothing about the desktop (md+) header changes.
  artifacts:
    - src/components/LandingHeader.tsx
  key_links:
    - src/components/LandingHeader.tsx
    - messages/en.json (LandingHeader namespace — all needed keys already exist)
---

# Quick Task 260807-cid: Fix mobile menu drawer in LandingHeader

## Problem

On mobile the hamburger button toggles its icon (Menu ↔ X) but no menu appears.

Root cause: the drawer was never built. `LandingHeader.tsx:95-98` carries a
`TODO(Phase 6)` noting the toggle button is a scaffold only — `mobileOpen` state
exists and drives the icon swap at line 266, but no panel is rendered anywhere in
the component.

## Tasks

### Task 1 — Render the mobile drawer

**files:** `src/components/LandingHeader.tsx`

**action:**
- Add a `md:hidden` panel rendered when `mobileOpen`, anchored under the sticky
  nav row inside `<header>` so it inherits the sticky positioning and the
  `bg-dips-purple-hero-start` treatment.
- Panel contents (reusing the existing `LandingHeader` i18n keys — no new
  strings needed): Menu, Our Story, Order, Affiliates, Contact, then the
  Shop Now CTA, then the language switcher.
- Add a fixed backdrop below the panel that closes on tap.
- Close on: link/CTA tap, locale change, backdrop tap, Escape key, and any
  pathname change (guards against the panel surviving client navigation).
- Give `LanguageSwitcher` an optional `onNavigate` callback so picking a locale
  also dismisses the drawer; update its stale "mobile drawer doesn't exist yet"
  comment.
- Wire a11y on the toggle: `aria-expanded`, `aria-controls`.

**verify:** `npx tsc --noEmit` and `npx next lint` both clean.

**done:** Panel visible and dismissible at <768px; desktop markup unchanged
(all new nodes are `md:hidden`, all existing nav nodes keep their `md:` classes).

## Out of scope

- Any change to the desktop header layout, trust bar, or logo.
- New translation strings (existing keys cover every label).
