---
phase: 01-foundation
plan: 01
subsystem: data-access
status: complete
tags: [prisma, vercel-blob, data-access, schema-migration]
dependency_graph:
  requires: []
  provides:
    - AffiliateCreative model + CreativeType enum (prisma/schema.prisma)
    - add_affiliate_creatives migration (prisma/migrations/)
    - creatives.ts CRUD module (src/lib/creatives.ts)
    - ACCEPTED_IMAGE_MIME / ACCEPTED_VIDEO_MIME / MAX_CREATIVE_BYTES constants
    - **.public.blob.vercel-storage.com remotePattern (next.config.mjs)
    - "@vercel/blob dependency (package.json)"
    - BLOB_READ_WRITE_TOKEN env documentation (.env.example)
  affects:
    - Phase 2 admin management (imports all four CRUD functions + constants)
    - Phase 3 affiliate gallery (imports listCreatives + reads blob URLs via next/image)
tech_stack:
  added:
    - "@vercel/blob ^2.4.0"
  patterns:
    - Prisma 7 two-step migration workflow (migrate dev → generate)
    - toRow() serialization helper for Date → ISO string boundary
    - del([blobPath, thumbnailBlobPath].filter(Boolean)) blob cleanup before DB delete
key_files:
  created:
    - src/lib/creatives.ts
    - prisma/migrations/20260617201333_add_affiliate_creatives/migration.sql
  modified:
    - prisma/schema.prisma
    - next.config.mjs
    - package.json
    - package-lock.json
    - .env.example
decisions:
  - "Used prisma db execute + migrate resolve --applied as shadow-DB workaround for Neon managed Postgres with schema drift (brownfield DB has tables added outside migrations)"
  - "Manually authored migration.sql following Prisma 7 SQL conventions; matches what prisma generate produces for the schema"
  - "Generated Prisma client (src/generated/) is gitignored; only migration SQL committed"
metrics:
  duration: "~20 minutes"
  completed: "2026-06-17"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 5
requirements_covered: [DATA-01, DATA-02, DATA-03]
---

# Phase 01 Plan 01: Foundation Data Layer Summary

**One-liner:** Prisma AffiliateCreative table + CreativeType enum migrated into PostgreSQL, @vercel/blob wired for deletion, and creatives.ts CRUD module mirroring affiliates.ts conventions.

## What Was Built

This plan delivered the complete data and storage foundation for the Affiliate Creatives feature. No UI, no API routes — pure infrastructure consumed by Phases 2 and 3.

### Task 1: Schema + Config + Dependency

- **prisma/schema.prisma**: Added `CreativeType` enum (IMAGE | VIDEO) after `CommissionStatus`; added `AffiliateCreative` model after `AdminUser` with all 16 fields from D-01, compound `@@index([active, sortOrder])`, timestamps last.
- **next.config.mjs**: Added `{ protocol: "https", hostname: "**.public.blob.vercel-storage.com" }` to `images.remotePatterns` (double-star wildcard for subdomain matching).
- **package.json**: Installed `@vercel/blob ^2.4.0` via `npm install @vercel/blob`.
- **.env.example**: Added `BLOB_READ_WRITE_TOKEN=` with comment explaining it is required for server-side blob operations and is pulled from Vercel Dashboard or `vercel env pull`.

### Task 2: Migration Applied

- **Migration SQL**: Manually authored `prisma/migrations/20260617201333_add_affiliate_creatives/migration.sql` containing `CREATE TYPE "CreativeType"` and `CREATE TABLE "AffiliateCreative"` with the compound index.
- **Applied via**: `npx prisma db execute --file migration.sql` (direct SQL execution) followed by `npx prisma migrate resolve --applied 20260617201333_add_affiliate_creatives` to register in `_prisma_migrations`.
- **Client regenerated**: `npx prisma generate` regenerated `src/generated/prisma/client/` with `prisma.affiliateCreative` accessor and `CreativeType` enum — confirmed by `tsc --noEmit` passing.

### Task 3: creatives.ts Data-Access Module

- **src/lib/creatives.ts**: 179-line module mirroring `src/lib/affiliates.ts` conventions.
- Imports: `CreativeType` from `../generated/prisma/client/client`, `prisma` from `./prisma`, `del` from `@vercel/blob`.
- Exports: `CreativeRow`, `CreateCreativeInput`, `UpdateCreativeInput`, `listCreatives`, `createCreative`, `updateCreative`, `deleteCreative`, `ACCEPTED_IMAGE_MIME`, `ACCEPTED_VIDEO_MIME`, `MAX_CREATIVE_BYTES`.
- `toRow()` helper: single Date→ISO serialization point used by all four functions.
- `deleteCreative`: blobs deleted BEFORE DB row (T-01-01 STRIDE mitigation), `.filter(Boolean)` guards against null paths.
- `listCreatives`: compound `orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]`, `activeOnly` filter.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Shadow-database workaround for Neon managed Postgres**
- **Found during:** Task 2
- **Issue:** `npx prisma migrate dev --name add_affiliate_creatives` (both with and without `--create-only`) failed with "Drift detected" — the production Neon DB has tables/indexes added outside tracked migrations (AdminUser, AffiliateLoginToken with their proper unique indexes, plus a `playing_with_neon` test table). Prisma requires a DB reset to resolve drift, which would destroy production data.
- **Fix:** Used the documented fallback from RESEARCH.md Pitfall 5:
  1. Manually authored the migration SQL following Prisma 7 PostgreSQL conventions.
  2. Applied via `npx prisma db execute --file migration.sql` (direct, no shadow DB needed).
  3. Registered in `_prisma_migrations` via `npx prisma migrate resolve --applied 20260617201333_add_affiliate_creatives`.
  4. Ran `npx prisma generate` to regenerate the client.
- **Files modified:** `prisma/migrations/20260617201333_add_affiliate_creatives/migration.sql` (created manually rather than auto-generated)
- **Commits:** 5dd895b
- **Impact:** Functionally equivalent outcome — AffiliateCreative table and CreativeType type exist in the DB and are registered in Prisma's migration history. The migration SQL follows the exact column types Prisma uses for this schema.

**Note on generated client:** The project's `.gitignore` excludes `src/generated/` — the regenerated Prisma client is not committed (this is the existing project convention). Only `migration.sql` is committed.

## Verification Results

| Check | Result |
|-------|--------|
| `npx prisma validate` | PASS — schema valid with new enum + model |
| Migration SQL has AffiliateCreative + CreativeType | PASS |
| Migration registered in `_prisma_migrations` | PASS (via migrate resolve) |
| Generated client has `prisma.affiliateCreative` | PASS (confirmed in class.ts) |
| Generated client exports `CreativeType.IMAGE / VIDEO` | PASS (confirmed in enums.ts) |
| `npx tsc --noEmit` | PASS — creatives.ts type-checks against generated client |
| All 8 required exports in creatives.ts | PASS |
| `del()` + `.filter(Boolean)` + `.toISOString()` + compound orderBy | PASS |
| `**.public.blob.vercel-storage.com` in next.config.mjs | PASS |
| `@vercel/blob` in package.json dependencies | PASS (`^2.4.0`) |
| `BLOB_READ_WRITE_TOKEN` documented in .env.example | PASS |

## Known Stubs

None — this plan defines constants but does not stub data sources. The MIME/size constants (`ACCEPTED_IMAGE_MIME`, `ACCEPTED_VIDEO_MIME`, `MAX_CREATIVE_BYTES`) are intentionally defined but not enforced here; enforcement is Phase 2's responsibility per D-07.

## Threat Surface Scan

No new threat surface beyond what the plan's `<threat_model>` anticipated:
- T-01-01 (blob + row cleanup order): mitigated in `deleteCreative` — blobs deleted before row.
- T-01-02 (token in client bundle): `creatives.ts` is server-only (imports `@vercel/blob` + prisma).
- T-01-SC (package legitimacy): `@vercel/blob` vetted in 01-RESEARCH.md; no new unvetted packages added.

## Known Blockers for Next Phase

- `BLOB_READ_WRITE_TOKEN` must be provisioned in Vercel Dashboard (Blob store) before Phase 2 upload testing can run end-to-end. Already documented in STATE.md and `.env.example`.

## Self-Check: PASSED

| Item | Result |
|------|--------|
| `src/lib/creatives.ts` exists | FOUND |
| `prisma/migrations/20260617201333_add_affiliate_creatives/migration.sql` exists | FOUND |
| `.env.example` exists | FOUND |
| Commit b2fa3c9 (Task 1) exists | CONFIRMED |
| Commit 5dd895b (Task 2) exists | CONFIRMED |
| Commit ba04d3c (Task 3) exists | CONFIRMED |
