---
phase: 02-admin-creatives
audit_date: 2026-06-18
asvs_level: 1
block_on: high
auditor: gsd-secure-phase
result: SECURED
threats_closed: 11
threats_total: 11
threats_open: 0
---

# Security Audit — Phase 02: Admin Creatives

**Result: SECURED**
**Threats Closed:** 11 / 11
**ASVS Level:** 1
**Block-on policy:** high (open `mitigate` threats block shipping)

---

## Threat Verification Table

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-02-01 | Elevation of Privilege | mitigate | CLOSED | `upload-token/route.ts:24` — `if (!(await isAdminAuthenticated()))` at handler entry returns 401; `upload-token/route.ts:38` — second `if (!(await isAdminAuthenticated()))` inside `onBeforeGenerateToken` throws `'Not authenticated'` |
| T-02-02 | Tampering | mitigate | CLOSED | `upload-token/route.ts:42` — `allowedContentTypes: [...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME] as string[]`; both constants imported from `@/lib/creatives` at line 4 (re-exported from `@/lib/creatives-constants` — single source of truth) |
| T-02-03 | Denial of Service | mitigate | CLOSED | `upload-token/route.ts:43` — `maximumSizeInBytes: MAX_CREATIVE_BYTES`; constant imported from `@/lib/creatives` at line 4; defined in `creatives-constants.ts:26` as `200 * 1024 * 1024` — no hardcoded number in the token route |
| T-02-04 | Elevation of Privilege | mitigate | CLOSED | `route.ts:15` (GET) and `route.ts:34` (POST) — both return 401 before any logic when `isAdminAuthenticated()` is false; `[id]/route.ts:26` (PATCH) and `[id]/route.ts:118` (DELETE) — identical guard at each handler entry |
| T-02-05 | Tampering | mitigate | CLOSED | `route.ts:64-73` — `mimeType` extracted from raw body as string, validated against `allMimes = [...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME]` (400 on failure), then `type: CreativeType` derived server-side from `ACCEPTED_VIDEO_MIME` membership; client-supplied `type` field is never read |
| T-02-06 | Information Disclosure (storage waste) | accept | CLOSED | Accepted risk: two-step upload has inherent TOCTOU gap; short token TTL bounds exposure; assets are marketing material with no PII. No sensitive data at risk. |
| T-02-07 | Tampering | mitigate | CLOSED | `upload-token/route.ts:44` — `addRandomSuffix: true` returned in `onBeforeGenerateToken`; Vercel Blob appends a random suffix to every stored pathname, making paths non-enumerable |
| T-02-SC | Tampering | accept | CLOSED | Accepted risk: no new npm packages installed this phase; `@vercel/blob` 2.4.0 (including `@vercel/blob/client` subpath) and `lucide-react` are existing Phase 1 dependencies already audited |
| T-02-08 | Spoofing | mitigate | CLOSED | All `CreativesGrid.tsx` mutations (`patchCreative`, `reorderCreative`, `handleCreate`, `handleDelete`) route to the Plan 02-01 routes which each call `isAdminAuthenticated()` server-side (verified per T-02-04). The admin layout at `admin/layout.tsx:15` additionally gates the entire `/admin/*` surface via `isAdminAuthenticated()` before rendering the nav |
| T-02-09 | Tampering | mitigate | CLOSED | `CreativesGrid.tsx:110-118` — client validates `assetFile.type` against `[...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME]` and `assetFile.size <= MAX_CREATIVE_BYTES`; constants imported from `@/lib/creatives-constants` at line 7-10 (same canonical source as server routes, not redefined); server re-validates in upload-token route (T-02-02) and collection POST (T-02-05) |
| T-02-10 | Information Disclosure (storage waste) | accept | CLOSED | Accepted risk: `CreativesGrid.tsx:170-173` — `console.error` logs both orphaned blob paths (`asset` and `poster`) on row-create failure; marketing assets, no PII |
| T-02-11 | Repudiation | mitigate | CLOSED | `CreativesGrid.tsx:195` — `if (!confirm(...)) return;` gates `handleDelete` before the DELETE fetch is dispatched; `[id]/route.ts:129` — `deleteCreative(id)` is idempotent (no-ops on missing row via `findUnique` returning null in `creatives.ts:156-157`) |

---

## Unregistered Threat Flags

No new attack surface flags were raised in `02-01-SUMMARY.md` or `02-02-SUMMARY.md` `## Threat Flags` sections. Both summaries note "No new security surface beyond what is in the plan's threat model."

---

## Notes

### Constants split across two modules (T-02-02, T-02-03, T-02-09)

The plan specified imports from `@/lib/creatives`. In the implementation, a split was introduced:
- `@/lib/creatives-constants.ts` — client-safe module holding the three constant definitions (`ACCEPTED_IMAGE_MIME`, `ACCEPTED_VIDEO_MIME`, `MAX_CREATIVE_BYTES`).
- `@/lib/creatives.ts` — server-only module that re-exports all three from `creatives-constants`.

API routes import from `@/lib/creatives` (satisfying the prohibition). `CreativesGrid.tsx` imports from `@/lib/creatives-constants` directly (justified: avoids pulling `prisma`/`@vercel/blob` server-only code into the browser bundle). Both paths resolve to the same definitions — there is no duplication or divergence. The single-source-of-truth invariant (D-06) is preserved.

### onUploadCompleted omitted (T-02-06 / T-02-10)

The upload-token route does not include `onUploadCompleted` at all (the handler object ends after `onBeforeGenerateToken`). The plan's prohibition required no DB/blob write logic inside the callback and the SUMMARY records this as "intentional no-op" per RESEARCH Pitfall 1 (localhost webhook limitation). The omission is consistent with the accepted-risk posture for T-02-06.

### Reorder race condition fix (WR-03)

The implementation added a `reordering` boolean state flag beyond what was planned, to disable all reorder controls while a two-row swap is in flight. This is a defense improvement that does not introduce new attack surface and is outside the threat register scope.

---

## Accepted Risks Log

| ID | Risk | Rationale | Owner |
|----|------|-----------|-------|
| T-02-06 | Orphaned Vercel Blob asset if client does not POST row metadata after upload() resolves | Short token TTL limits exposure window; marketing assets only; no PII; logged for manual cleanup | Product |
| T-02-10 | Orphaned blob(s) if DB row creation fails after successful upload | `console.error` logs both asset + poster paths; marketing assets only; no PII | Product |
| T-02-SC | Supply chain — no new packages this phase | `@vercel/blob` and `lucide-react` are pre-existing Phase 1 dependencies | Engineering |
