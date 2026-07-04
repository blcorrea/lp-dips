# Phase 2: Admin Creatives - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the admin-facing management surface for Affiliate Creatives, built entirely on the Phase 1 data layer (`src/lib/creatives.ts`). Specifically:

- Admin page at `/admin/creatives` (guarded by `isAdminAuthenticated()`).
- **Upload** an image or video with title, description, caption, and an optional poster (video only) — large/video files go directly to Vercel Blob via **signed client-upload** (bypassing the ~4.5MB serverless body limit).
- **Edit** a creative's metadata (title, description, caption, active state).
- **Reorder** creatives with up/down controls (persists `sortOrder`).
- **Activate/deactivate** (soft hide) and **delete** (hard delete + blob removal).
- **Nav link** to `/admin/creatives` from the admin area.

Covers ADMIN-01 through ADMIN-07. The affiliate-facing gallery and i18n (Phase 3) are out of scope here. The data layer (model, enum, `creatives.ts` CRUD, constants, Blob config) is already shipped in Phase 1.

</domain>

<decisions>
## Implementation Decisions

### Management UI shape
- **D-01:** Admin library is a **responsive card grid with previews** — each card shows the image/video thumbnail, title, and controls. (Not the AffiliatesTable data-table pattern.) Rationale: creatives are visual assets and affiliates will see a similar grid in Phase 3, so the admin previews what they'll get.
- **D-02:** Image cards use the image itself as the preview; video cards use the uploaded poster when present, otherwise a generic video placeholder (or the `<video>` first frame). Use `next/image` for image/poster thumbnails — `*.public.blob.vercel-storage.com` is already in `images.remotePatterns` (Phase 1).

### Upload flow & form
- **D-03:** Upload UI is an **inline panel toggle** — an "Add creative" button reveals an inline form panel above the grid, reusing the `showCreate` pattern from `src/app/admin/affiliates/AffiliatesTable.tsx`. (Not a modal or a dedicated `/new` route.) *(User deferred to recommendation.)*
- **D-04:** Form fields: `title` (required), `description` (optional), `caption` (optional), the asset file (required), and an **optional poster image** field shown **only when the selected file is a video**. If no poster is provided for a video, the card shows a placeholder/first-frame fallback (per D-02). Matches the Phase 1 "manual optional poster, no ffmpeg auto-gen" decision.
- **D-05:** Uploads use **signed client-upload** via `@vercel/blob/client` so video files bypass the ~4.5MB serverless body limit (ADMIN-02). Surface upload progress in the inline panel.
- **D-06:** Client-side validation reuses the Phase 1 exported constants (`ACCEPTED_IMAGE_MIME`, `ACCEPTED_VIDEO_MIME`, `MAX_CREATIVE_BYTES`) from `src/lib/creatives.ts`; the server token/handle route re-validates them (never trust the client). Single source of truth — do not redefine accepted types/limits.

### Item controls & reorder
- **D-07:** Reordering persists via **immediate swap on click** — each ▲/▼ click PATCHes a swap of `sortOrder` with the adjacent creative, then `router.refresh()`. Matches the established per-action PATCH + refresh pattern. (Not a batch "Save order" button.)
- **D-08:** **Edit** opens an edit form (modal or inline expander) from a control on the card, exposing metadata only (`title`, `description`, `caption`, `active`). The asset file/blob is **not re-editable** — re-uploading means deleting and re-adding.
- **D-09:** **Delete** uses a native `confirm()` before issuing the DELETE request. Delete removes the blob(s) then the row via the Phase 1 `deleteCreative` (blobs first — orphaned row > orphaned blob).
- **D-10:** Activate/deactivate is a per-card toggle that PATCHes `active` (reuse `updateCreative`).

### Nav entry point
- **D-11:** Add a **global top-nav "Creatives" link** to the admin header (`src/app/admin/layout.tsx`) alongside Orders / Affiliates / Commissions / Users. The header renders on every admin page including affiliates, so this satisfies ADMIN-07 ("from the admin affiliates area") while being the most discoverable. *(User deferred to recommendation.)*

### Claude's Discretion
- **Client-upload row-creation strategy — FLAG FOR RESEARCH:** Vercel Blob's server `handleUpload` `onUploadCompleted` callback **cannot reach `localhost`** (it's an inbound webhook), so a pure server-callback row creation breaks local dev. The researcher must choose a dev-friendly path — e.g. create the DB row via a follow-up client `POST` to an admin route after `upload()` resolves, OR use `onUploadCompleted` with a documented localhost workaround. Whichever path is chosen must keep the row + blob consistent (no orphaned blobs if the row write fails). This is the single most important implementation decision for the phase.
- API route shape (e.g. `/api/admin/creatives` + `/api/admin/creatives/[id]` + a client-upload token route), exact component decomposition, edit modal-vs-inline-expander choice, progress-bar styling, and validation/error message copy are left to the planner/executor as long as they follow the existing admin conventions (`isAdminAuthenticated()` guard, `NextResponse.json({ ok }/{ error }, { status })`, `router.refresh()`).
- Whether a video poster field also appears for images: no — poster is video-only (D-04).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data layer (Phase 1 — already shipped, consume directly)
- `src/lib/creatives.ts` — `listCreatives`, `createCreative`, `updateCreative`, `deleteCreative`; `CreativeRow` / `CreateCreativeInput` / `UpdateCreativeInput`; constants `ACCEPTED_IMAGE_MIME`, `ACCEPTED_VIDEO_MIME`, `MAX_CREATIVE_BYTES`. Blob path scheme `creatives/<id>/<filename>`.
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 decisions (schema fields D-01, accepted types/size D-04..07, hard-delete D-10, manual poster discretion) that constrain Phase 2.

### Admin patterns to mirror
- `src/app/admin/affiliates/page.tsx` — server-component page shape (fetch data, render client table/grid).
- `src/app/admin/affiliates/AffiliatesTable.tsx` — `"use client"` mutation component: `showCreate` inline-panel toggle, `fetch` PATCH/POST, `router.refresh()`, `busyId`/`copiedId` state, `flash()` notices, shared input styles. **Direct template for the creatives grid + upload panel.**
- `src/app/api/admin/affiliates/route.ts` + `src/app/api/admin/affiliates/[id]/route.ts` — admin API route conventions: `isAdminAuthenticated()` guard, JSON validation, `NextResponse.json({ ok }/{ error }, { status })`, Prisma `P2002` handling.
- `src/app/admin/layout.tsx` — admin header nav; add the "Creatives" link here (D-11).
- `src/lib/admin-auth.ts` — `isAdminAuthenticated()` guard used by all admin routes.

### Storage / config
- `next.config.mjs` — `*.public.blob.vercel-storage.com` already in `images.remotePatterns` (Phase 1); use `next/image` for previews.
- `@vercel/blob` (`del` already used in `creatives.ts`) + `@vercel/blob/client` (`upload`) for client-upload. `BLOB_READ_WRITE_TOKEN` env (provision in Vercel before E2E upload test — see STATE.md blocker).

### Project specs
- `.planning/REQUIREMENTS.md` — ADMIN-01..07 acceptance criteria.
- `.planning/PROJECT.md` — Key Decisions (Vercel Blob + client upload, single library, up/down reorder, hard delete).
- `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/INTEGRATIONS.md` — brownfield conventions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AffiliatesTable.tsx`: closest template for the creatives client component — inline create-panel toggle, per-row PATCH actions, `router.refresh()`, notice/flash UX, copy-to-clipboard helper.
- `creatives.ts` (Phase 1): all data access + validation constants already exist; Phase 2 only adds API routes + UI on top.
- `del` from `@vercel/blob` already wired in `deleteCreative`; client-upload (`@vercel/blob/client`) is the new piece.

### Established Patterns
- Admin page = server component fetching data, passing serialized rows to a `"use client"` component for mutations.
- API routes guard with `isAdminAuthenticated()` and return `{ ok }` / `{ error }` JSON with explicit status codes.
- Mutations re-fetch via `router.refresh()` rather than client cache updates.

### Integration Points
- New routes under `src/app/api/admin/creatives/` (collection + `[id]` + a client-upload token route) consume `creatives.ts`.
- New page `src/app/admin/creatives/page.tsx` + client grid component.
- New nav link in `src/app/admin/layout.tsx`.
- Phase 3 (affiliate gallery) will reuse `listCreatives({ activeOnly: true })` and the same Blob URLs.

</code_context>

<specifics>
## Specific Ideas

- Admin grid should visually preview assets so it doubles as a sanity-check of what affiliates will see in Phase 3 (glassmorphism affiliate grid comes in Phase 3; the admin grid can stay in the plain admin style).
- Reuse the affiliate-table interaction feel (inline panel, flash notices, per-action refresh) so the new screen feels native to the existing admin.

</specifics>

<deferred>
## Deferred Ideas

- Drag-and-drop reordering, categories/tags/folders, download analytics — already deferred to v2 in REQUIREMENTS.md; up/down controls cover v1.
- Styled in-app confirm dialog (vs native `confirm()`) — could be revisited if/when admin gets a shared modal component; out of scope for v1.
- Server-side video poster auto-generation (ffmpeg) — deferred at milestone init; posters stay manual/optional.

None of these belong in Phase 2.

</deferred>

---

*Phase: 2-Admin Creatives*
*Context gathered: 2026-06-17*
