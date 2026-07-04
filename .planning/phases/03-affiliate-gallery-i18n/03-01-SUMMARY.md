---
phase: 03-affiliate-gallery-i18n
plan: "01"
subsystem: affiliate-dashboard
tags: [affiliate, gallery, i18n, client-component, glassmorphism, vercel-blob]
dependency_graph:
  requires:
    - "01-foundation/01-01 (AffiliateCreative schema + listCreatives + CreativeRow)"
    - "02-admin-creatives/02-01 (admin upload, active/sortOrder fields)"
    - "02-admin-creatives/02-02 (CreativesGrid pattern reference)"
  provides:
    - "AffiliateCreativesGallery default export — client island rendering creatives grid"
    - "AffiliateCreatives i18n namespace (en/es/pt)"
    - "Criativos section in affiliate dashboard page"
  affects:
    - "src/app/[locale]/affiliates/dashboard/page.tsx"
    - "messages/en.json, messages/es.json, messages/pt.json"
tech_stack:
  added: []
  patterns:
    - "getDownloadUrl from @vercel/blob for cross-origin forced save"
    - "useState<string | null> copiedId atom for multi-card copy confirmation"
    - "preload=none + poster on <video> for lazy grid loading"
    - "type-only CreativeRow import to avoid server-only module in client bundle"
key_files:
  created:
    - "src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx"
  modified:
    - "src/app/[locale]/affiliates/dashboard/page.tsx"
    - "messages/en.json"
    - "messages/es.json"
    - "messages/pt.json"
decisions:
  - "Single copiedId: string|null atom tracks copy-confirmation state across all cards (one at a time)"
  - "VIDEO-without-poster: <Video> icon + hidden opacity-0 <video> element activates on click"
  - "getDownloadUrl() anchor (not fetch->objectURL) for all download actions — works for 200MB video"
metrics:
  duration: "~4 min"
  completed: "2026-06-18T14:11:15Z"
  tasks_completed: 3
  tasks_total: 3
  files_changed: 5
status: complete
---

# Phase 03 Plan 01: Affiliate Gallery & i18n Summary

**One-liner:** Glassmorphism creatives grid on affiliate dashboard with inline-playable video, `getDownloadUrl` forced download, and copy-caption confirmation — all strings in AffiliateCreatives namespace (en/es/pt).

## What Was Built

A "Criativos" section was appended to the existing affiliate dashboard server component. The section renders active creatives (ordered by sortOrder) as a responsive 1→2→3 column glassmorphism card grid. Each card shows a media preview (IMAGE via `next/image`, VIDEO via inline `<video preload="none">`), a localized type badge, an optional line-clamped caption, a Download anchor using `getDownloadUrl()`, and an optional "Copiar legenda" copy button with 2s confirmation. An empty-state message replaces the grid when no active creatives exist.

### Requirements Covered

| Requirement | Status | Evidence |
|---|---|---|
| AFFL-01 | Done | Criativos section renders glassmorphism grid below commission history |
| AFFL-02 | Done | Download anchor uses `getDownloadUrl(row.url)` — forced save for images + videos |
| AFFL-03 | Done | Copy caption button + copiedId state with 2s "Copiado" confirmation |
| AFFL-04 | Done | Empty-state `<p>` rendered when `creatives.length === 0` |
| AFFL-05 | Done | `listCreatives({ activeOnly: true })` — only active, ordered by sortOrder |
| I18N-01 | Done | AffiliateCreatives namespace with 7 keys in en/es/pt |

## Tasks Completed

| Task | Name | Commit | Files |
|---|---|---|---|
| 1 | Add AffiliateCreatives i18n namespace to en/es/pt | c5887c8 | messages/en.json, messages/es.json, messages/pt.json |
| 2 | Create AffiliateCreativesGallery client component | 6b07a7f | src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx |
| 3 | Wire Criativos section into dashboard server component | d381981 | src/app/[locale]/affiliates/dashboard/page.tsx |

## Verification Results

### Automated checks (all passed)

1. **i18n parity (I18N-01):** All three message files parse as valid JSON and contain all 7 AffiliateCreatives keys.
2. **Type safety:** `npx tsc --noEmit` exits 0 — no type errors in `AffiliateCreativesGallery.tsx` or `dashboard/page.tsx`.
3. **Lint:** `npm run lint` exits 0. One pre-existing error in `upload-token/route.ts` (Phase 02 file, not touched here).
4. **Wiring:** `page.tsx` contains `listCreatives({ activeOnly: true })` and `<AffiliateCreativesGallery rows={creatives} />`.
5. **Download mechanism:** `AffiliateCreativesGallery.tsx` uses `href={getDownloadUrl(row.url)}`; no `fetch()->blob()` path.
6. **No client-side server import:** Only `import type { CreativeRow }` from `@/lib/creatives` — never `listCreatives`.
7. **Security:** No `dangerouslySetInnerHTML`; the word "autoplay" appears only in a code comment, not as an attribute.

### Human verification (auto-approved — auto chain active)

The plan has a `checkpoint:human-verify` gate that was auto-approved because `workflow._auto_chain_active` is `true`. The user should exercise these steps manually:

1. Run `npm run dev`, log in as an affiliate, visit `/{locale}/affiliates/dashboard` (try `pt` and `en`).
2. Confirm "Criativos" / "Marketing Creatives" section appears at the BOTTOM of the dashboard, below commission history, using glassmorphism style.
3. Confirm grid is 1 col narrow → 2 col tablet → 3 col desktop.
4. For an IMAGE: image renders in the card. For a VIDEO with poster: poster shows, video plays on click (no autoplay). For a VIDEO without poster: icon placeholder shows, clicking plays.
5. Type badge reads localized "Foto"/"Vídeo" (pt) or "Photo"/"Video" (en) — not hardcoded.
6. Click Download on an image AND a video — both must save to disk, not open a preview tab.
7. On a card WITH a caption: caption text shows (clamped ~3 lines), "Copiar legenda" button present; click it and confirm label briefly becomes "Copiado" and caption is in clipboard.
8. On a card WITHOUT a caption: neither caption text nor copy button appears.
9. If no active creatives: section shows empty-state message instead of grid.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The gallery reads real data from `listCreatives({ activeOnly: true })` and renders actual blob URLs. No hardcoded empty values or placeholder text in the rendered output.

## Threat Flags

No new security-relevant surface beyond what the plan's threat model covers:
- T-03-01 (auth gate): Mitigated — Criativos section is inside the existing `getAffiliateSessionId()` guard.
- T-03-03 (XSS via caption/title): Mitigated — `{row.caption}` and `{row.title}` are plain React text children; no `dangerouslySetInnerHTML`.
- T-03-04 (download anchor): Accepted — `getDownloadUrl` only appends `?download=1`; no user-supplied URLs.

## Self-Check: PASSED

- FOUND: `src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx`
- FOUND: `.planning/phases/03-affiliate-gallery-i18n/03-01-SUMMARY.md`
- FOUND: commit c5887c8 (i18n namespace)
- FOUND: commit 6b07a7f (gallery component)
- FOUND: commit d381981 (page wiring)
