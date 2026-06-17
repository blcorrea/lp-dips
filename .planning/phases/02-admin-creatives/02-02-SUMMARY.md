---
phase: 02-admin-creatives
plan: 02
subsystem: admin-ui
tags: [admin, creatives, upload, client-component, vercel-blob]
status: complete

depends_on:
  requires: [02-01]
  provides: [admin-creatives-ui]
  affects: [admin-layout]

tech_stack:
  added: []
  patterns:
    - server-component-fetches-client-grid (AdminCreativesPage → CreativesGrid)
    - two-step-client-upload (asset then poster, sequential)
    - busyId-flash-router-refresh mutation cycle
    - conditionally-mounted-poster-field (video-only)
    - inline-edit-panel (metadata-only, no file re-upload)

key_files:
  created:
    - src/app/admin/creatives/page.tsx
    - src/app/admin/creatives/CreativesGrid.tsx
  modified:
    - src/app/admin/layout.tsx

decisions:
  - Reorder emits empty successMsg string to patchCreative — no flash for silent reorder (matches UI-SPEC "no flash — silent refresh" contract)
  - Edit panel closes after patchCreative resolves, not on open (setEditingId(null) in handleEdit after await)
  - Poster file picker accepts ACCEPTED_IMAGE_MIME only (images as video poster thumbnails)

metrics:
  duration: 3m
  completed: 2026-06-17
  tasks_completed: 2
  tasks_total: 3
  files_changed: 3
---

# Phase 02 Plan 02: Admin Creatives UI Summary

**One-liner:** Admin card-grid UI with two-step Vercel Blob client-upload, inline edit/toggle/reorder/delete, and a Creatives nav link wired to the Plan 02-01 API routes.

---

## What Was Built

### Task 1 — Admin Creatives server-component page + nav link (commit 0c89607)

- Created `src/app/admin/creatives/page.tsx`: async server component that calls `listCreatives()` (no `activeOnly` — admin sees all) and renders `<CreativesGrid rows={rows} />` inside a `space-y-6` wrapper with a `text-2xl font-bold` heading and a pluralized `{N} creative(s) total` subtitle.
- Modified `src/app/admin/layout.tsx`: added `<Link href="/admin/creatives">Creatives</Link>` immediately after the "Users" link with the shared nav class string `text-sm text-gray-600 hover:text-gray-900 transition-colors`.

### Task 2 — CreativesGrid client component (commit 596b863)

Created `src/app/admin/creatives/CreativesGrid.tsx` — a full `"use client"` component implementing:

- **Top bar:** flash notice + `+ Add creative` / `Close` toggle button.
- **Inline upload panel:** title (required), description, caption, asset file (required), and a poster file input that is conditionally **mounted** only when the selected file's `type.startsWith('video/')` is true. Progress bar with `role="progressbar"` and aria values during upload.
- **Two-step sequential upload:** Step 1 uploads the asset via `upload()` targeting `/api/admin/creatives/upload-token` (0–80% progress). Step 2 uploads the poster if provided (80–95% progress). Step 3 POSTs blob metadata to `/api/admin/creatives` to create the DB row (98% progress). On row-create failure, `console.error` logs the orphaned `assetBlob.pathname`.
- **Client validation:** validates `assetFile.type` against `[...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME]` and `assetFile.size <= MAX_CREATIVE_BYTES` imported from `@/lib/creatives` — constants are not redefined.
- **Responsive card grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`. Each card shows a thumbnail (`aspect-video`, `next/image fill object-cover` for image/poster, `Video` icon placeholder for posterless video), type badge (top-left), active/inactive badge (top-right), title, description, and a controls row.
- **Per-card controls:** ▲/▼ reorder (PATCH `{ direction }`, no flash, immediate `router.refresh()`; ▲ disabled at idx 0, ▼ at last), Edit (opens inline panel), Activate/Deactivate toggle (`patchCreative` with `{ active: !row.active }`), Delete (`confirm()` first, then DELETE). All controls `disabled={busyId === row.id}`.
- **Inline edit panel:** metadata fields only (title, description, caption, active checkbox); note "To replace the asset, delete this creative and upload a new one." — no file input. Save/Discard buttons.
- **No i18n:** all strings are plain English literals; no `useTranslations`.
- **No brand tokens:** gray-ramp admin style only; no brand colors or glassmorphism.

---

## Verification

### Automated (tsc + lint)

- `npx tsc --noEmit` — **PASSED** (no errors for any of the three files)
- `npx next lint --file src/app/admin/creatives/CreativesGrid.tsx` — **PASSED** (no ESLint warnings or errors)
- `npx next lint --file src/app/admin/creatives/page.tsx` — **PASSED** (no ESLint warnings or errors)

### Acceptance Criteria Checks

| Check | Result |
|-------|--------|
| `grep -c "MAX_CREATIVE_BYTES" CreativesGrid.tsx` ≥ 1 | 2 matches |
| `grep -c "useTranslations" CreativesGrid.tsx` == 0 | 0 matches |
| `grep -c "/admin/creatives" layout.tsx` ≥ 1 | 1 match |
| Upload targets `/api/admin/creatives/upload-token` | confirmed (2 occurrences) |
| Poster field conditionally mounted | confirmed (`assetFile?.type.startsWith('video/')`) |
| No file input in edit panel | confirmed (edit panel has no `type="file"`) |
| Direction PATCH for reorder | confirmed (2 occurrences) |

---

## Pending Manual Verification (Task 3 — DEFERRED TO USER)

Task 3 is a `checkpoint:human-verify` that requires a running dev server AND a provisioned `BLOB_READ_WRITE_TOKEN`. Per the auto-mode directive, this task is deferred — the browser checks were NOT auto-approved.

### Prerequisites

1. Provision `BLOB_READ_WRITE_TOKEN` in `.env.local` (copy from Vercel Dashboard or run `vercel env pull`).
2. Run `npm run dev` and log into the admin area.

### 8 Browser Checks to Perform

1. Confirm a "Creatives" link appears in the top nav from any admin page (e.g., `/admin/affiliates`). Click → `/admin/creatives` loads showing the empty state with "No creatives yet. Click + Add creative to upload one." (ADMIN-07).
2. Click "+ Add creative". Upload an IMAGE with a title (+ optional description/caption). Confirm the progress bar advances and the card appears with the image preview, an "Image" type badge, and an "Active" badge after refresh (ADMIN-01).
3. Upload a VIDEO (> 4.5MB if available, to confirm the serverless-limit bypass — ADMIN-02). Confirm the poster field appeared (video-only). With no poster, the card shows the Video placeholder icon; with a poster, the poster image shows in the thumbnail.
4. Click Edit on a card → change the title → click "Save changes". Confirm it updates on the card after refresh (ADMIN-03).
5. With 2+ cards, click ▼/▲ → confirm order changes and persists after a manual page reload (ADMIN-04). Confirm ▲ is disabled on the first card and ▼ on the last.
6. Click Deactivate → badge flips to "Inactive"; click Activate → back to "Active" (ADMIN-05).
7. Click Delete → accept the `confirm()` → card disappears from the grid (ADMIN-06). Optionally verify in the Vercel Blob dashboard the blob is gone.
8. Confirm no `useTranslations` or brand-color classes appear in the rendered admin surface.

---

## Deviations from Plan

None — plan executed exactly as written. All PATTERNS.md class strings and UI-SPEC.md copy strings were used verbatim. The `font-bold` label override (vs. `font-semibold` in the AffiliatesTable analog) was applied as specified by PATTERNS.md and UI-SPEC.md.

---

## Known Stubs

None. The component is fully wired to the Plan 02-01 API routes. No hardcoded/mock data.

---

## Threat Surface Scan

No new network endpoints, auth paths, or file access patterns beyond those documented in the Plan 02-02 threat model (T-02-08 through T-02-SC). All mutations route through the Plan 02-01 routes which re-check `isAdminAuthenticated()` server-side.

---

## Self-Check: PASSED

- [x] `src/app/admin/creatives/page.tsx` — exists and committed (0c89607)
- [x] `src/app/admin/creatives/CreativesGrid.tsx` — exists and committed (596b863)
- [x] `src/app/admin/layout.tsx` — Creatives nav link added and committed (0c89607)
- [x] `tsc --noEmit` — clean
- [x] `next lint` — clean for both new files
- [x] Task 3 — deferred to user with exact verification steps listed above
