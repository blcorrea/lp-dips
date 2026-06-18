# Roadmap: DIPS — Affiliate Creatives

## Overview

This milestone adds a shared creative asset library to the existing DIPS affiliate program. Admins upload images and videos via Vercel Blob (client-upload for large files); affiliates browse, download, and copy captions from their dashboard. Three phases build in strict dependency order: foundation (data + infra), admin management surface, then affiliate-facing gallery with full i18n.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Prisma model, Vercel Blob config, and data-access module (completed 2026-06-17)
- [x] **Phase 2: Admin Creatives** - Admin upload, edit, reorder, activate/deactivate, delete, and nav link (completed 2026-06-17)
- [x] **Phase 3: Affiliate Gallery & i18n** - Affiliate creative gallery with download, copy caption, empty state, and full localization (completed 2026-06-18)

## Phase Details

### Phase 1: Foundation

**Goal**: The data layer and storage infrastructure for creatives exist and are ready for use
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):

  1. `AffiliateCreative` model and `CreativeType` enum are present in `prisma/schema.prisma` and the migration has been applied to the database
  2. `@vercel/blob` is installed, `BLOB_READ_WRITE_TOKEN` is documented in env setup, and `*.public.blob.vercel-storage.com` is in `images.remotePatterns` in `next.config.mjs`
  3. `src/lib/creatives.ts` exports `listCreatives`, `createCreative`, `updateCreative`, and `deleteCreative` with dates serialized as strings, following the `src/lib/affiliates.ts` pattern

**Plans**: 1/1 plans complete

- [x] 01-01-PLAN.md — Schema (AffiliateCreative + CreativeType) + migration, @vercel/blob wiring (config + env doc), and src/lib/creatives.ts data-access module

### Phase 2: Admin Creatives

**Goal**: Admins can manage the full creative library (upload, edit, reorder, activate/deactivate, delete) via the admin dashboard without touching code
**Depends on**: Phase 1
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ADMIN-07
**Success Criteria** (what must be TRUE):

  1. Admin can upload an image or video with title, description, caption, and optional poster — large/video files upload directly to Vercel Blob via signed client-upload (bypassing the 4.5MB serverless body limit)
  2. Admin can edit a creative's title, description, caption, and active state via the admin UI
  3. Admin can reorder creatives using up/down controls and the new `sortOrder` persists across page reloads
  4. Admin can toggle a creative active/inactive; deleting a creative also removes its blob(s) from Vercel storage
  5. A navigation link to `/admin/creatives` is visible in the admin affiliates area

**Plans**: 2/2 plans complete
**Wave 1**

- [x] 02-01-PLAN.md — API layer: Vercel Blob client-upload token route + collection (GET list / POST create-row) + item route (PATCH edit/toggle/reorder, DELETE)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — UI layer: /admin/creatives page, CreativesGrid client component (upload/edit/reorder/activate/delete), and admin nav link

**UI hint**: yes

### Phase 3: Affiliate Gallery & i18n

**Goal**: Logged-in affiliates can browse, download, and copy captions from the active creative library, with all strings localized in en/es/pt
**Depends on**: Phase 2
**Requirements**: AFFL-01, AFFL-02, AFFL-03, AFFL-04, AFFL-05, I18N-01
**Success Criteria** (what must be TRUE):

  1. Logged-in affiliate sees a "Criativos" section on their dashboard rendered as a glassmorphism grid of cards showing only active creatives in `sortOrder` order
  2. Affiliate can click a download button on any creative card and the file downloads to their device
  3. Affiliate can click "Copiar legenda" on a creative card and the caption is copied to clipboard, with a visible "Copiado" confirmation
  4. When no active creatives exist, an empty state message is displayed instead of the grid
  5. All new UI strings (title, download label, copy label, copied confirmation, empty state, photo/video labels) are present and correct in `messages/en.json`, `messages/es.json`, and `messages/pt.json` under the `AffiliateCreatives` namespace

**Plans**: 1/1 plans complete

- [x] 03-01-PLAN.md — Criativos affiliate gallery (glass grid, image/video preview, download, copy caption, empty state) + AffiliateCreatives i18n in en/es/pt

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete    | 2026-06-17 |
| 2. Admin Creatives | 2/2 | Complete    | 2026-06-17 |
| 3. Affiliate Gallery & i18n | 1/1 | Complete   | 2026-06-18 |
