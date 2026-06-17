# Requirements: DIPS — Affiliate Creatives

**Defined:** 2026-06-17
**Core Value:** Affiliates can grab ready-to-post, on-brand creative assets (with a copy-paste caption) in one place, and admins can manage that library without touching code.

## v1 Requirements

Requirements for the Affiliate Creatives milestone. Each maps to roadmap phases.

### Data & Storage

- [x] **DATA-01**: `AffiliateCreative` model + `CreativeType` enum (IMAGE/VIDEO) added to `prisma/schema.prisma` and migrated (`add_affiliate_creatives`)
- [x] **DATA-02**: Vercel Blob configured — `@vercel/blob` dependency, `BLOB_READ_WRITE_TOKEN` env, and `*.public.blob.vercel-storage.com` added to `images.remotePatterns` in `next.config.mjs`
- [x] **DATA-03**: Data-access module `src/lib/creatives.ts` (`listCreatives`, `createCreative`, `updateCreative`, `deleteCreative`) with dates serialized as strings (mirrors `src/lib/affiliates.ts`)

### Admin

<!-- All admin routes/pages guarded by isAdminAuthenticated() -->

- [ ] **ADMIN-01**: Admin can upload a creative (image or video) with title, description, caption, and optional poster/thumbnail
- [ ] **ADMIN-02**: Large/video files upload directly to Vercel Blob via signed client-upload (bypasses ~4.5MB serverless body limit)
- [ ] **ADMIN-03**: Admin can edit a creative's metadata (title, description, caption, active state)
- [ ] **ADMIN-04**: Admin can reorder creatives with up/down controls (persists `sortOrder`)
- [ ] **ADMIN-05**: Admin can activate/deactivate a creative
- [ ] **ADMIN-06**: Admin can delete a creative, which also removes its blob(s) from storage
- [ ] **ADMIN-07**: Navigation link to `/admin/creatives` from the admin affiliates area

### Affiliate

- [ ] **AFFL-01**: Logged-in affiliate sees a "Criativos" section on the dashboard rendered as a grid of cards (glassmorphism style)
- [ ] **AFFL-02**: Affiliate can download a creative file
- [ ] **AFFL-03**: Affiliate can copy a creative's caption to clipboard, with a "copied" confirmation
- [ ] **AFFL-04**: Empty state shown when no active creatives exist
- [ ] **AFFL-05**: Only active creatives are shown to affiliates, ordered by `sortOrder`

### Internationalization

- [ ] **I18N-01**: New `AffiliateCreatives` next-intl namespace added to `messages/en.json`, `es.json`, and `pt.json` covering all new strings (title, "Baixar", "Copiar legenda", "Copiado", empty state, photo/video labels)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analytics

- **ANLY-01**: Track download counts per creative
- **ANLY-02**: Track which affiliate downloaded which creative

### Organization

- **ORG-01**: Categories/tags/folders for creatives
- **ORG-02**: Drag-and-drop reordering

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Download/usage analytics | Not needed to validate the library; deferred to v2 |
| Categories/tags/folders | Single flat library is sufficient for v1 |
| Drag-and-drop reordering | Up/down controls cover v1; DnD adds dependency/complexity |
| Per-affiliate / segmented creative visibility | All active creatives visible to all affiliates |
| Affiliate-facing API | Affiliate dashboard reads creatives directly in a server component |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| ADMIN-01 | Phase 2 | Pending |
| ADMIN-02 | Phase 2 | Pending |
| ADMIN-03 | Phase 2 | Pending |
| ADMIN-04 | Phase 2 | Pending |
| ADMIN-05 | Phase 2 | Pending |
| ADMIN-06 | Phase 2 | Pending |
| ADMIN-07 | Phase 2 | Pending |
| AFFL-01 | Phase 3 | Pending |
| AFFL-02 | Phase 3 | Pending |
| AFFL-03 | Phase 3 | Pending |
| AFFL-04 | Phase 3 | Pending |
| AFFL-05 | Phase 3 | Pending |
| I18N-01 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-17*
*Last updated: 2026-06-17 after roadmap creation (traceability complete)*
