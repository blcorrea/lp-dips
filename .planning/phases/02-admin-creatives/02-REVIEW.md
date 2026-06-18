---
phase: 02-admin-creatives
reviewed: 2026-06-17T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/app/api/admin/creatives/upload-token/route.ts
  - src/app/api/admin/creatives/route.ts
  - src/app/api/admin/creatives/[id]/route.ts
  - src/app/admin/creatives/page.tsx
  - src/app/admin/creatives/CreativesGrid.tsx
  - src/app/admin/layout.tsx
findings:
  critical: 1
  warning: 6
  info: 4
  total: 11
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-06-17
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed the Phase 2 "Admin Creatives" implementation: the Vercel Blob client-upload token route, the collection list/create route, the per-item edit/toggle/reorder/delete route, the admin server page, the `CreativesGrid` client component, and the admin layout nav addition. Auth enforcement is solid and consistent across all handlers (including the defense-in-depth re-check inside `onBeforeGenerateToken`), the two-step client-upload wiring is correct, `next.config.mjs` already whitelists the Vercel Blob host for `next/image`, and the error-shape / `@/` import / no-i18n conventions are respected.

The headline problem is functional, not security: the **sortOrder swap reorder is a silent no-op for the common case** because `createCreative` never assigns a `sortOrder` and the column defaults to `0` — so freshly uploaded creatives all share `sortOrder = 0`, and swapping two equal values changes nothing. The reorder buttons will appear to "work" (no error, `router.refresh()` runs) but the displayed order never changes. Secondary concerns: the `DELETE` route has no try/catch so a blob-deletion failure surfaces as an unstructured 500 the client can't parse; the orphaned-blob-on-row-failure path only logs to the console and never cleans up; and reorder concurrency isn't fully guarded because the neighbor card isn't disabled during the swap.

## Critical Issues

### CR-01: sortOrder reorder is a silent no-op for newly uploaded creatives

**File:** `src/app/api/admin/creatives/[id]/route.ts:63-71` (root cause in `src/app/api/admin/creatives/route.ts:82-95` + `src/lib/creatives.ts:144-147`)
**Issue:** `createCreative` writes the row with `prisma.affiliateCreative.create({ data: { ...input } })` and the POST route never supplies a `sortOrder`. The schema declares `sortOrder Int @default(0)` (`prisma/schema.prisma:301`), so **every creative is created with `sortOrder = 0`**. The reorder branch loads rows ordered by `[{ sortOrder: 'asc' }, { createdAt: 'asc' }]`, finds the two adjacent rows, and swaps their `sortOrder` values:

```ts
const a = all[idx];        // sortOrder: 0
const b = all[neighborIdx]; // sortOrder: 0
await prisma.$transaction([
  prisma.affiliateCreative.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }), // 0 -> 0
  prisma.affiliateCreative.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }), // 0 -> 0
]);
```

When `a.sortOrder === b.sortOrder` (the default state for all rows), the swap is a no-op. The tiebreaker (`createdAt asc`) is unchanged, so `listCreatives()` returns the identical order on the next `router.refresh()`. The reorder buttons return `{ ok: true }` and flash success, but the grid order never changes — the feature is non-functional for the normal case. It only "works" if rows happen to already have distinct sortOrder values, which nothing in this code produces.

**Fix:** Assign a deterministic, distinct `sortOrder` at creation time so the swap has meaningful values to exchange. Compute the next position in the POST route (or in `createCreative`) before insert:

```ts
// in createCreative (src/lib/creatives.ts), or in the POST route before calling it
const max = await prisma.affiliateCreative.aggregate({ _max: { sortOrder: true } });
const sortOrder = (max._max.sortOrder ?? -1) + 1;
const row = await prisma.affiliateCreative.create({ data: { ...input, sortOrder } });
```

Alternatively, change the reorder branch to operate on list *position* by normalizing/rewriting `sortOrder = index` for the affected rows (or the whole list) inside the transaction, rather than swapping raw values that may both be `0`. Either approach makes the existing swap logic produce a visible reorder. Add a regression test that uploads two creatives and asserts the order flips after a `down` then `up`.

## Warnings

### WR-01: DELETE route has no try/catch — blob failure returns an unparseable 500

**File:** `src/app/api/admin/creatives/[id]/route.ts:114-128`
**Issue:** Unlike POST and PATCH, the `DELETE` handler calls `await deleteCreative(id)` with no error handling. `deleteCreative` calls `del(blobsToDelete)` against the Vercel Blob API (network call that can fail) before deleting the DB row. If `del()` rejects (network error, expired token, Blob outage), the handler throws and Next.js returns a generic HTML/JSON 500 error-boundary response. The client (`CreativesGrid.handleDelete`, line 162-169) does `await res.json()` and reads `data.ok` — on a non-JSON 500 the `.json()` parse throws and the user only sees the generic catch "Network error" message, masking the real cause, and the DB row silently survives with no clear signal.

**Fix:** Wrap in try/catch matching the PATCH/POST convention so the client always receives the documented `{ error }` shape:

```ts
try {
  await deleteCreative(id);
  return NextResponse.json({ ok: true });
} catch (err) {
  const message = err instanceof Error ? err.message : 'Delete failed';
  return NextResponse.json({ error: message }, { status: 500 });
}
```

### WR-02: Orphaned blob on row-creation failure is logged but never cleaned up

**File:** `src/app/admin/creatives/CreativesGrid.tsx:136-139`
**Issue:** The two-step client-upload pattern uploads the blob(s) to Vercel Blob first, then POSTs to create the DB row. If the POST fails (validation error, 500, etc.), the uploaded blob(s) remain in storage with no DB row referencing them — a permanent storage leak the admin cannot clean up from the UI. The code only logs `console.error('Row creation failed after upload — orphaned blob:', assetBlob.pathname)` and never deletes the blob. The poster blob (`posterBlob.pathname`) isn't even logged. The comment in the upload-token route acknowledges `onUploadCompleted` can't fire on localhost, so there is no server-side fallback cleanup either.

**Fix:** On POST failure, issue a best-effort cleanup. Since the client can't call `del()` directly (server-only token), add a small authenticated cleanup endpoint, or have the failing POST handler delete the just-uploaded blobs server-side before returning the error (it already receives `blobPath`/`thumbnailBlobPath` in the body). At minimum, log *both* orphaned paths so manual cleanup is possible:

```ts
console.error('Row creation failed — orphaned blobs:', {
  asset: assetBlob.pathname,
  poster: posterBlob?.pathname ?? null,
});
```

### WR-03: Reorder neighbor card is not disabled during the swap — concurrent-mutation race

**File:** `src/app/admin/creatives/CreativesGrid.tsx:362-383` (with `[id]/route.ts:68-71`)
**Issue:** `patchCreative` sets `busyId` to the *clicked* row's id only. The reorder transaction mutates `sortOrder` on **two** rows (the target and its neighbor), but only the target's buttons are disabled (`disabled={... || busyId === row.id}`). A fast admin can click the neighbor's up/down button while the first swap is in flight. Two overlapping swap transactions reading the same pre-swap `sortOrder` snapshot can interleave and leave the ordering in an inconsistent/unexpected state (lost update). Combined with CR-01 this is currently masked, but it becomes a live race once sortOrder values are distinct.

**Fix:** Disable all reorder controls during any in-flight reorder, e.g. track a separate `reordering` boolean (or disable the whole grid's reorder buttons when `busyId !== null`). Server-side, you could also re-read both rows inside the transaction or use a conditional update guarded on the expected current `sortOrder`.

### WR-04: POST does not validate fileName / fileSize and silently defaults them

**File:** `src/app/api/admin/creatives/route.ts:79-80`
**Issue:** `fileName` defaults to `''` and `fileSize` defaults to `0` when the client omits them or sends the wrong type — no rejection. A malformed/forged POST (the route is the trust boundary; the blob already exists) can persist a creative with an empty filename and `fileSize: 0`, degrading any future "download" or size-display feature and producing misleading data. The schema requires these columns (`fileName String`, `fileSize Int`) but accepts empty/zero. `fileSize` is also not range-checked against `MAX_CREATIVE_BYTES`.

**Fix:** Reject missing/invalid values rather than defaulting:

```ts
const fileName = typeof raw.fileName === 'string' ? raw.fileName.trim() : '';
const fileSize = typeof raw.fileSize === 'number' ? raw.fileSize : NaN;
if (!fileName || !Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_CREATIVE_BYTES) {
  return NextResponse.json({ error: 'fileName and a valid fileSize are required' }, { status: 400 });
}
```

### WR-05: POST trusts client-supplied url / blobPath / thumbnail without validation

**File:** `src/app/api/admin/creatives/route.ts:56-60, 77-78`
**Issue:** `url`, `blobPath`, `thumbnailUrl`, and `thumbnailBlobPath` are taken verbatim from the request body with only a non-empty string check. The handler never verifies that `url`/`thumbnailUrl` point at the project's Vercel Blob host, nor that `thumbnailUrl` is actually an image. A forged authenticated request could store an arbitrary external `url` (e.g. an attacker-controlled host), which is then rendered through `next/image` and surfaced to affiliates in Phase 3 — an open-redirect / content-injection vector for downstream consumers. `mimeType` is correctly re-validated (good), but the URLs that actually get served are not.

**Fix:** Validate the host/scheme of `url` and `thumbnailUrl` against the expected Vercel Blob domain (e.g. `new URL(url).hostname.endsWith('.public.blob.vercel-storage.com')`) and reject otherwise. Optionally enforce that `thumbnailUrl`/`thumbnailBlobPath` are only accepted when `type === 'VIDEO'`.

### WR-06: Title length is unbounded on create and edit

**File:** `src/app/api/admin/creatives/route.ts:50-53` and `[id]/route.ts:82-83`
**Issue:** `title` is required but has no maximum-length check, and the metadata-edit branch passes `raw.title` straight through (it doesn't even `.trim()`, unlike create). `description`/`caption` are likewise unbounded. The DB columns are unbounded `String`, so an extremely large payload is persisted and later rendered in the grid (`truncate`/`line-clamp` only hide it visually). This is a robustness/abuse gap on the admin trust boundary.

**Fix:** Add a reasonable max length (e.g. 200 for title, larger for caption) and `.trim()` the edit-branch title for consistency with create:

```ts
title: typeof raw.title === 'string' ? raw.title.trim().slice(0, 200) : undefined,
```

## Info

### IN-01: `_pathname` parameter is unused in onBeforeGenerateToken

**File:** `src/app/api/admin/creatives/upload-token/route.ts:32`
**Issue:** The callback ignores its `_pathname` argument. This is intentional (underscore-prefixed) and harmless, but note the upload path is therefore entirely client-controlled (`creatives/${assetFile.name}`). With `addRandomSuffix: true` collisions are avoided, but the raw client filename becomes part of the public blob path. Not a vulnerability, just worth being aware that pathnames are not server-normalized.
**Fix:** Optional — derive/sanitize the pathname server-side in `onBeforeGenerateToken` if you want predictable `creatives/<id>/<file>` paths matching the schema comment.

### IN-02: Create-form filename collision risk across asset and poster

**File:** `src/app/admin/creatives/CreativesGrid.tsx:93, 102`
**Issue:** Both asset and poster upload to `creatives/${file.name}`. If a user picks an asset and poster with the same filename, the two uploads share a base path; `addRandomSuffix` on the server token prevents an actual overwrite, so this is safe today, but the code relies on that server setting rather than constructing distinct paths.
**Fix:** Optional — namespace the poster path, e.g. `creatives/poster-${posterFile.name}`.

### IN-03: Progress bar caps at 98% and never reaches 100 before reset

**File:** `src/app/admin/creatives/CreativesGrid.tsx:96, 105, 111`
**Issue:** Asset upload maps to 0–80%, poster to 80–95%, then `setProgress(98)` before the POST. The bar never hits 100; on success the form closes and `progress` resets to 0 in `finally`. The label logic `progress < 100 ? 'Uploading…' : 'Saving…'` therefore shows "Saving… " only if it ever reached 100, which it doesn't — so "Saving…" is effectively dead. Cosmetic.
**Fix:** Optional — set `setProgress(100)` right before the POST, or simplify the label threshold.

### IN-04: Reorder success uses an empty success message

**File:** `src/app/admin/creatives/CreativesGrid.tsx:368, 379`
**Issue:** `patchCreative(row.id, { direction: 'up' }, '')` passes an empty `successMsg`, so `flash(true, '')` renders a bare "✓" with no text. Minor UX inconsistency versus the other actions which all provide a message.
**Fix:** Optional — pass a message like `'Moved up.'` / `'Moved down.'`.

---

_Reviewed: 2026-06-17_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
