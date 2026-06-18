# Phase 1: Foundation - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the data + storage foundation for Affiliate Creatives — no UI, no API routes, no admin/affiliate screens. Specifically:
- `AffiliateCreative` model + `CreativeType` enum (IMAGE/VIDEO) in `prisma/schema.prisma`, with a versioned Prisma migration (`add_affiliate_creatives`).
- Vercel Blob wiring: `@vercel/blob` dependency, `BLOB_READ_WRITE_TOKEN` env documented, and `*.public.blob.vercel-storage.com` added to `images.remotePatterns` in `next.config.mjs`.
- Data-access module `src/lib/creatives.ts` (`listCreatives`, `createCreative`, `updateCreative`, `deleteCreative`) mirroring the conventions in `src/lib/affiliates.ts`.

Covers requirements DATA-01, DATA-02, DATA-03. Admin management (Phase 2) and affiliate gallery + i18n (Phase 3) are out of scope here.

</domain>

<decisions>
## Implementation Decisions

### Schema (locked from the original feature spec)
- **D-01:** `AffiliateCreative` fields: `id` (cuid), `title`, `description?`, `caption?`, `type` (CreativeType), `url`, `blobPath`, `thumbnailUrl?`, `thumbnailBlobPath?`, `fileName`, `fileSize` (Int, bytes), `mimeType`, `sortOrder` (Int, default 0), `active` (Boolean, default true), `createdAt`, `updatedAt`. Index `@@index([active, sortOrder])`.
- **D-02:** `CreativeType` enum = `IMAGE | VIDEO` only (no AUDIO/DOCUMENT — out of scope).
- **D-03:** Follow existing schema conventions: `cuid()` ids, `@default(now())` / `@updatedAt`, explicit columns (no JSON blobs).

### Accepted media types & size
- **D-04:** Accepted image formats: **jpg, png, webp, gif** (gif included for animated marketing assets).
- **D-05:** Accepted video formats: **mp4, webm, mov** (mov covers phone exports).
- **D-06:** Max file size ceiling: **200 MB** per file.
- **D-07:** Expose accepted-type and size limits as **exported constants** in `src/lib/creatives.ts` (e.g. `ACCEPTED_IMAGE_MIME`, `ACCEPTED_VIDEO_MIME`, `MAX_CREATIVE_BYTES`) so the Phase 2 upload/validation layer reuses one source of truth. Phase 1 does not enforce them at the data layer — it only defines them.

### Blob storage organization
- **D-08:** Blob pathname scheme: **`creatives/<id>/<filename>`** — one folder per creative so the asset and its thumbnail live together and are easy to delete.
- **D-09:** Persist both `blobPath` and `thumbnailBlobPath` so `deleteCreative` can remove the asset and its poster from Blob. Phase 1's `deleteCreative` deletes the DB row and both blobs (when present).
- **D-10:** Hard delete (not soft) for `deleteCreative`; `active=false` is the separate soft-hide mechanism (deactivate, kept in DB).

### Data-access shape (mirror `src/lib/affiliates.ts`)
- **D-11:** Export a plain `CreativeRow` type with dates serialized as ISO strings (no Prisma runtime types leak to clients).
- **D-12:** `listCreatives({ activeOnly }: { activeOnly?: boolean })` orders by `sortOrder` asc, then `createdAt`. `activeOnly` filters `active: true` (used by affiliate view in Phase 3).
- **D-13:** Import the generated Prisma client/enums from `../generated/prisma/client/client` and `./prisma`, same as `affiliates.ts`.

### Claude's Discretion
- Video poster/thumbnail: **optional manual upload only** — no server-side auto-generation (ffmpeg) in this milestone. The `thumbnailUrl`/`thumbnailBlobPath` fields stay nullable; populating them is the admin's choice in Phase 2.
- Exact constant names, helper signatures, and migration internals left to the planner/executor as long as they match `affiliates.ts` conventions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pattern to mirror
- `src/lib/affiliates.ts` — canonical data-access module pattern: serialized dates, Decimal→number conversion, plain row types, create/update input shapes.
- `prisma/schema.prisma` — existing model conventions (cuid, enums, indexes, timestamps); add `AffiliateCreative` + `CreativeType` here.
- `src/lib/prisma.ts` — Prisma singleton import used by all data-access modules.

### Config to touch
- `next.config.mjs` — add `*.public.blob.vercel-storage.com` to `images.remotePatterns` (Shopify CDN pattern already present as the example).
- `prisma.config.ts` — Prisma config (dotenv load) for running `prisma migrate dev`.

### Project specs
- `.planning/PROJECT.md` — Key Decisions table (Vercel Blob + client upload, single library, hard delete).
- `.planning/REQUIREMENTS.md` — DATA-01..03 acceptance.
- `.planning/codebase/STACK.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/INTEGRATIONS.md` — brownfield context.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/affiliates.ts`: direct template for `creatives.ts` (read/write split, serialization, input types).
- `src/lib/prisma.ts`: shared Prisma client singleton.

### Established Patterns
- Data-access modules return serialized, client-safe row types; dates as ISO strings; no Prisma types past the server boundary.
- Schema uses `cuid()` ids, explicit columns, `@@index` for query paths, `@updatedAt` timestamps.
- Generated Prisma client lives at `src/generated/prisma/client/` and is imported via relative path.

### Integration Points
- New model joins `prisma/schema.prisma`; migration added under `prisma/migrations/`.
- `creatives.ts` will be consumed by Phase 2 (admin API routes) and Phase 3 (affiliate server component).
- `@vercel/blob` is a new dependency; `BLOB_READ_WRITE_TOKEN` a new env var (provision in Vercel before Phase 2 E2E upload testing — noted in STATE.md).

</code_context>

<specifics>
## Specific Ideas

The original feature spec (provided by the user) defines the exact `AffiliateCreative` model and `creatives.ts` function set — treat it as the source of truth for field names and signatures. Accepted formats/size and the `creatives/<id>/<filename>` blob scheme were decided in this discussion.

</specifics>

<deferred>
## Deferred Ideas

- Automatic video poster generation (ffmpeg / serverless transcode) — out of milestone; posters are manual optional uploads for now.
- Download/usage analytics, categories/tags, drag-and-drop reorder — already deferred to v2 in REQUIREMENTS.md.

None of these belong in Phase 1.

</deferred>

---

*Phase: 1-Foundation*
*Context gathered: 2026-06-17*
