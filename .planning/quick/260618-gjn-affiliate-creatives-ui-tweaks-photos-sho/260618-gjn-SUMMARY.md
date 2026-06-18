---
phase: quick-260618-gjn
plan: 01
subsystem: affiliate-creatives
tags: [ui, gallery, creatives, affiliate, admin]
status: complete
completed_date: "2026-06-18"
duration: "~10m"
tasks_completed: 3
tasks_total: 3
key_files:
  modified:
    - src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx
    - src/app/admin/creatives/CreativesGrid.tsx
decisions:
  - "IMAGE creatives use intrinsic 800x800 dimension hint with w-full h-auto so Next.js can compute layout without forcing a fixed aspect ratio"
  - "VIDEO first-frame poster via preload=metadata + #t=0.001 src fragment (only applied when thumbnailUrl is absent); existing play-overlay button retained as browser fallback"
  - "Admin form sends thumbnailUrl: null / thumbnailBlobPath: null explicitly — API and DB columns untouched per quick-mode constraint"
commits:
  - hash: 5168eb3
    message: "feat(quick-260618-gjn): affiliate gallery UI tweaks — natural-aspect photos, first-frame video poster, denser grid, remove admin poster upload"
---

# Quick Task 260618-gjn: Affiliate Creatives UI Tweaks Summary

**One-liner:** Natural-aspect photo rendering, first-frame video poster via `#t=0.001`, 4-5 col denser gallery grid, and admin poster-upload UI removed — all without touching the DB schema.

## Tasks Executed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Full-aspect photos + first-frame video poster in affiliate gallery card | Done | 5168eb3 |
| 2 | Denser 4-5 column responsive grid in affiliate gallery | Done | 5168eb3 |
| 3 | Remove video poster/cover option from admin creatives upload form | Done | 5168eb3 |

## Changes Made

### Task 1 — Natural-aspect photos + first-frame video poster (`AffiliateCreativesGallery.tsx`)

**Before:** IMAGE creatives rendered in a fixed `aspect-video` container with `fill` + `object-cover` (cropping tall/portrait photos). VIDEO used `preload="none"` with no poster visible until play.

**After:**
- IMAGE branch: replaced the fixed-aspect container with a `relative w-full bg-black/20` wrapper containing a non-fill `next/image` with `width={800} height={800}` intrinsic hints and `className="w-full h-auto"`. Photo scales to card width at its own natural ratio. No `object-cover`, no `aspect-video`.
- VIDEO branch: changed to `preload="metadata"` and appends `#t=0.001` to the src when no `thumbnailUrl` is set, so the browser paints the first frame as the default poster. When `thumbnailUrl` exists, src is unchanged and `poster` attribute is passed as before. Play-overlay button retained as graceful fallback.
- Type badge moved inside each branch's own `relative` wrapper so it remains absolutely positioned top-left over the media in both cases.

### Task 2 — Denser grid (`AffiliateCreativesGallery.tsx`)

**Before:** `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4` (max 3 cols, comment said "D-09: max 3 cols").

**After:** `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3` — 4 cols at `lg`, 5 cols at `2xl`, gap reduced from 4 to 3. Comment updated to "D-09: denser grid — 1 col mobile → up to 4-5 cols on large desktop". No horizontal-scroll container introduced.

### Task 3 — Remove poster upload from admin form (`CreativesGrid.tsx`)

Removed:
- `posterFile` state declaration (`useState<File | null>(null)`)
- Step 2 poster upload block in `handleCreate` (the `if (posterFile) { ... }` upload + `posterBlob` variable)
- Poster JSX input block (`{assetFile?.type.startsWith('video/') && (...)`) including label and file input
- "Clear poster when switching back to image" branch inside asset file `onChange`
- `setPosterFile(null)` from success-path reset
- `poster: posterBlob?.pathname ?? null` from the orphaned-blob error log

Changed:
- `onUploadProgress` mapping: was `percentage * 0.8` (reserving 20% for poster upload that no longer exists); now maps directly to `Math.round(percentage)` so the bar fills to 100% for the single upload
- POST body: `thumbnailUrl: null` and `thumbnailBlobPath: null` (explicit nulls, API/schema unchanged)
- Error log now logs only the asset pathname

## Verification

### TypeScript (`npx tsc --noEmit -p tsconfig.json`)

**Result: PASS** — zero errors, zero unused-variable warnings. Output was empty (success).

### Schema guard (`git diff --stat HEAD~1 HEAD`)

Only `AffiliateCreativesGallery.tsx` and `CreativesGrid.tsx` appear in the diff. `prisma/schema.prisma` and `prisma/migrations/**` are NOT in the diff.

### i18n

No `AffiliateCreatives` next-intl namespace keys added or removed. All existing keys (`photoLabel`, `videoLabel`, `download`, `copyCaption`, `copied`) remain in use. Admin form labels were hardcoded English; the removed poster label block (`Poster (video only)`) was not in any i18n file.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Both components are fully wired to real data.

## Threat Flags

None. This change is layout/UX-only with no new network surface, auth paths, or schema changes.

## Self-Check

- [x] `src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx` exists and is modified
- [x] `src/app/admin/creatives/CreativesGrid.tsx` exists and is modified
- [x] Commit `5168eb3` exists in git log
- [x] TypeScript: PASS (no output = no errors)
- [x] Prisma schema untouched
