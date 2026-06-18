# Phase 2: Admin Creatives - Research

**Researched:** 2026-06-17
**Domain:** Vercel Blob client-upload, Next.js 15 App Router admin UI, Prisma batch transactions
**Confidence:** MEDIUM

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Admin library is a **responsive card grid with previews** (not a data table)
- D-02: Image cards show the image as preview; video cards show poster or placeholder. Use `next/image` for image/poster thumbnails — `*.public.blob.vercel-storage.com` already in `images.remotePatterns`
- D-03: Upload UI is an **inline panel toggle** — "Add creative" button reveals an inline form panel above the grid, reusing the `showCreate` pattern from `AffiliatesTable.tsx`
- D-04: Form fields: `title` (required), `description` (optional), `caption` (optional), the asset file (required), and an **optional poster image** field shown only when the selected file is a video
- D-05: Uploads use **signed client-upload** via `@vercel/blob/client` for video bypass of ~4.5MB serverless body limit
- D-06: Client-side validation reuses exported constants (`ACCEPTED_IMAGE_MIME`, `ACCEPTED_VIDEO_MIME`, `MAX_CREATIVE_BYTES`) from `src/lib/creatives.ts`; server token route re-validates them
- D-07: Reordering via **immediate swap on click** — each ▲/▼ click PATCHes a swap of `sortOrder` with the adjacent creative, then `router.refresh()`
- D-08: **Edit** opens an edit form (modal or inline expander) from card, metadata only (`title`, `description`, `caption`, `active`); asset blob not re-editable
- D-09: **Delete** uses native `confirm()` before issuing DELETE; `deleteCreative` removes blobs first
- D-10: Activate/deactivate is a per-card toggle PATCHing `active` (reuse `updateCreative`)
- D-11: Add a **global top-nav "Creatives" link** to admin header (`src/app/admin/layout.tsx`)

### Claude's Discretion
- Client-upload row-creation strategy (FLAG FOR RESEARCH — resolved below)
- API route shape, exact component decomposition, edit modal-vs-inline-expander choice, progress-bar styling, validation/error message copy — must follow existing admin conventions

### Deferred Ideas (OUT OF SCOPE)
- Drag-and-drop reordering, categories/tags/folders, download analytics
- Styled in-app confirm dialog (vs native `confirm()`)
- Server-side video poster auto-generation (ffmpeg)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-01 | Admin can upload a creative (image or video) with title, description, caption, and optional poster/thumbnail | Vercel Blob client-upload flow documented below; form pattern from AffiliatesTable |
| ADMIN-02 | Large/video files upload directly to Vercel Blob via signed client-upload (bypasses ~4.5MB serverless body limit) | `upload()` from `@vercel/blob/client` with `handleUploadUrl` + server `handleUpload` route |
| ADMIN-03 | Admin can edit a creative's metadata (title, description, caption, active state) | PATCH `/api/admin/creatives/[id]` calling `updateCreative()`; mirrors affiliates PATCH route |
| ADMIN-04 | Admin can reorder creatives with up/down controls (persists `sortOrder`) | Prisma `$transaction` batch swap pattern; `sortOrder` has no unique constraint so direct swap is safe |
| ADMIN-05 | Admin can activate/deactivate a creative | PATCH `{ active: boolean }` on `/api/admin/creatives/[id]` |
| ADMIN-06 | Admin can delete a creative, which also removes its blob(s) from storage | `deleteCreative()` already does blob-first delete; DELETE `/api/admin/creatives/[id]` calls it |
| ADMIN-07 | Navigation link to `/admin/creatives` from the admin affiliates area | Add `<Link href="/admin/creatives">Creatives</Link>` to `src/app/admin/layout.tsx` nav |
</phase_requirements>

---

## Summary

Phase 2 delivers the admin management surface for Affiliate Creatives on top of the Phase 1 data layer (`src/lib/creatives.ts`). The technical work divides into four areas: (1) a Vercel Blob signed client-upload route that validates MIME types and size limits before issuing a client token; (2) a DB row-creation POST called by the client after `upload()` resolves (the dev-friendly path that avoids the `onUploadCompleted` localhost webhook problem); (3) a card-grid client component with inline create panel, per-card edit, activate/deactivate, reorder (▲/▼), and delete — all following the `AffiliatesTable.tsx` mutation pattern; and (4) a new nav link in `src/app/admin/layout.tsx`.

The single most important implementation question — how to create the DB row without relying on `onUploadCompleted` — is answered definitively: the client calls `upload()`, gets back a `PutBlobResult` with the blob `url` and `pathname`, then immediately POSTs those values plus form metadata to `/api/admin/creatives`. The `handleUpload` server route still exists (required to generate the client token), but its `onUploadCompleted` callback is intentionally left as a no-op comment. The `onBeforeGenerateToken` callback does all the security work (calls `isAdminAuthenticated()`, validates MIME and size constraints). This two-step flow (upload → POST) is the standard pattern for dev environments and is exactly what the official Vercel Blob docs recommend when ngrok is not in use.

The blob pathname scheme uses `addRandomSuffix: true` in `onBeforeGenerateToken` (so Vercel appends a collision-avoidance suffix to the filename) and the client passes `creatives/<filename>` as the `pathname` to `upload()`. The DB row captures whatever `pathname` Vercel returns in `PutBlobResult.pathname`. This bypasses the chicken-and-egg problem of needing a cuid before upload: the cuid is generated at row-creation time (after upload), and `blobPath` is set from the returned `pathname` at that point.

**Primary recommendation:** Two-route upload architecture — `/api/admin/creatives/upload-token` (POST, handles token generation only) + `/api/admin/creatives` (POST, creates DB row after blob is already uploaded) — keeps localhost dev working with zero tunneling.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Upload token generation + auth check | API / Backend | — | Must run server-side; requires `isAdminAuthenticated()` + `BLOB_READ_WRITE_TOKEN` |
| File transfer to blob storage | Browser / Client | CDN / Static | Direct browser → Vercel Blob; never touches Next.js server body |
| DB row creation after upload | API / Backend | — | Authenticated POST after client `upload()` resolves; requires Prisma |
| Creative CRUD (edit/delete/reorder) | API / Backend | — | All mutations through guarded API routes consuming `creatives.ts` |
| Admin card grid + mutation UI | Browser / Client | — | `"use client"` component; mirrors AffiliatesTable pattern |
| Admin page data fetch | Frontend Server (SSR) | — | Server component calls `listCreatives()` and passes rows to client grid |
| Nav link | Frontend Server (SSR) | — | Static addition to `admin/layout.tsx` |

---

## Standard Stack

### Core (already installed — no new installs required)

| Library | Version (installed) | Purpose | Why Standard |
|---------|---------------------|---------|--------------|
| `@vercel/blob` | `^2.4.0` (resolved: 2.4.0) [VERIFIED: npm registry] | Blob storage; `del()` in Phase 1, `handleUpload` from `@vercel/blob/client` in Phase 2 | Official Vercel storage SDK |
| `next` | 15.3.6 | App Router, `next/image` for previews | Project standard |
| `prisma` / `@prisma/client` | 7.5.0 | DB row CRUD + `$transaction` for sortOrder swap | Project ORM |

### Supporting (no new packages)

No new npm packages are required for this phase. Everything needed is:
- `@vercel/blob/client` — subpath export of the already-installed `@vercel/blob` package
- `next/image` — part of `next`
- `useRouter` / `useState` from React — already in use

**Installation:** None needed. All dependencies are satisfied by Phase 1.

---

## Package Legitimacy Audit

> No new packages are installed in this phase. All dependencies are from Phase 1.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `@vercel/blob` | npm | ~2 yrs | 4.2M/wk | github.com/vercel/storage | OK | Approved (Phase 1) |

**Packages removed due to SLOP verdict:** none
**Packages flagged as suspicious (SUS):** none

---

## Architecture Patterns

### System Architecture Diagram

```
Admin Browser
  │
  ├─► [1] POST /api/admin/creatives/upload-token
  │       (file.name → onBeforeGenerateToken → isAdminAuthenticated() + MIME/size check)
  │       ◄── { clientToken }
  │
  ├─► [2] upload(pathname, file, { access:'public', handleUploadUrl: ... })
  │       Browser → Vercel Blob CDN (direct, bypasses Next.js server)
  │       ◄── PutBlobResult { url, pathname }
  │
  ├─► [3] POST /api/admin/creatives
  │       body: { title, description, caption, type, url, blobPath, fileName, fileSize, mimeType }
  │       + optional poster fields after step 2b (if video)
  │       → createCreative() → DB row
  │       ◄── { ok: true, creative }
  │
  ├─► [4] PATCH /api/admin/creatives/[id]
  │       body: { title? | description? | caption? | active? | sortOrder? }
  │       → updateCreative() OR sortOrder swap transaction
  │       ◄── { ok: true, creative }
  │
  └─► [5] DELETE /api/admin/creatives/[id]
          → deleteCreative() (blob-first, then DB row)
          ◄── { ok: true }

Admin Page (Server Component)
  listCreatives() → rows → <CreativesGrid rows={rows} />
```

### Recommended Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx               # add Creatives link (D-11)
│   │   └── creatives/
│   │       ├── page.tsx             # server component: listCreatives() → <CreativesGrid>
│   │       └── CreativesGrid.tsx    # "use client" — card grid + inline panel + mutations
│   └── api/
│       └── admin/
│           └── creatives/
│               ├── route.ts         # GET (list) + POST (create row after upload)
│               ├── [id]/
│               │   └── route.ts     # PATCH (edit/toggle/reorder) + DELETE
│               └── upload-token/
│                   └── route.ts     # POST — handleUpload for client token generation
```

### Pattern 1: Two-Step Client Upload (Dev-Friendly)

**What:** Client calls `upload()` which fetches a token from `upload-token` route, then uploads directly to Vercel Blob. On `upload()` resolution, client POSTs blob metadata + form fields to create the DB row.

**When to use:** Always — this is the only pattern that works on localhost without ngrok.

```typescript
// Source: https://vercel.com/docs/storage/vercel-blob/client-upload
// Step 1 (client component — CreativesGrid.tsx):
import { upload } from '@vercel/blob/client';

const blob = await upload(`creatives/${file.name}`, file, {
  access: 'public',
  handleUploadUrl: '/api/admin/creatives/upload-token',
  onUploadProgress: ({ percentage }) => setProgress(percentage),
});
// blob.pathname is the actual stored path (with random suffix if addRandomSuffix: true)
// blob.url is the public CDN URL

// Step 2 (client component — after upload() resolves):
const res = await fetch('/api/admin/creatives', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title, description, caption,
    type,               // 'IMAGE' | 'VIDEO'
    url: blob.url,
    blobPath: blob.pathname,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    // For video with poster:
    thumbnailUrl: posterBlob?.url ?? null,
    thumbnailBlobPath: posterBlob?.pathname ?? null,
  }),
});
```

```typescript
// Source: https://vercel.com/docs/storage/vercel-blob/using-blob-sdk#handleupload
// upload-token route (src/app/api/admin/creatives/upload-token/route.ts):
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  ACCEPTED_IMAGE_MIME, ACCEPTED_VIDEO_MIME, MAX_CREATIVE_BYTES,
} from '@/lib/creatives';

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Re-validate auth inside the callback too (double check)
        if (!(await isAdminAuthenticated())) {
          throw new Error('Not authenticated');
        }
        return {
          allowedContentTypes: [
            ...ACCEPTED_IMAGE_MIME,
            ...ACCEPTED_VIDEO_MIME,
          ],
          maximumSizeInBytes: MAX_CREATIVE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ adminVerified: true }),
        };
      },
      onUploadCompleted: async () => {
        // Intentionally no-op: DB row is created via a follow-up POST
        // from the client after upload() resolves. This is the dev-friendly
        // path that works without ngrok on localhost.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
```

### Pattern 2: Blob Pathname Scheme (No Pre-generated ID Needed)

**What:** Pass `creatives/${file.name}` as the pathname to `upload()`, set `addRandomSuffix: true` in `onBeforeGenerateToken`. Vercel Blob returns the actual path (e.g. `creatives/video.mp4-abc123XYZ`) in `PutBlobResult.pathname`. Store this returned `pathname` as `blobPath` in the DB row. The DB row cuid is generated at row-creation time (after upload), so there is no chicken-and-egg problem.

**Key insight:** `blobPath` in `CreativeRow` is the Vercel-assigned pathname (with random suffix), not a pre-computed path. The schema comment `creatives/<id>/<filename>` in Phase 1 was a design intention; using `addRandomSuffix: true` achieves collision-safety without needing the id upfront. The executor may choose `creatives/<filename>` + random suffix (the Vercel default behavior) rather than embedding an id. Either is valid — the stored `blobPath` is what `del()` uses.

### Pattern 3: SortOrder Swap via Prisma Batch Transaction

**What:** Atomic two-row update to swap `sortOrder` between two adjacent creatives.

**When to use:** ▲/▼ click on a card triggers PATCH `/api/admin/creatives/[id]` with `{ direction: 'up' | 'down' }` or separate `PATCH /api/admin/creatives/[id]/reorder`.

```typescript
// Source: Prisma docs (ASSUMED — transaction pattern well-established in this codebase)
// The AffiliateCreative.sortOrder has NO unique constraint (schema verified),
// so direct value swap is safe without a temporary placeholder.

async function swapSortOrder(idA: string, idB: string): Promise<void> {
  const [a, b] = await Promise.all([
    prisma.affiliateCreative.findUniqueOrThrow({ where: { id: idA } }),
    prisma.affiliateCreative.findUniqueOrThrow({ where: { id: idB } }),
  ]);
  await prisma.$transaction([
    prisma.affiliateCreative.update({
      where: { id: idA },
      data:  { sortOrder: b.sortOrder },
    }),
    prisma.affiliateCreative.update({
      where: { id: idB },
      data:  { sortOrder: a.sortOrder },
    }),
  ]);
}
```

The PATCH handler for reorder receives the target creative's id and looks up the adjacent creative (next lower or next higher `sortOrder`) from the sorted list, then calls `swapSortOrder`.

### Pattern 4: Admin Card Grid Component Structure

**What:** The `CreativesGrid.tsx` component mirrors `AffiliatesTable.tsx` structure: same `showCreate` toggle, same `busyId`/`notice`/`flash()` pattern, same `router.refresh()` after mutations.

**Additions over AffiliatesTable:**
- Upload progress state: `const [progress, setProgress] = useState<number>(0)`
- File type detection: `const isVideo = file.type.startsWith('video/')` — controls poster field visibility
- Edit state: `const [editingId, setEditingId] = useState<string | null>(null)` — which card shows the edit panel
- Two-file upload: sequential `upload()` calls for main asset then poster (if provided)

### Pattern 5: next/image for Blob Thumbnails

```tsx
// Source: https://vercel.com/docs/storage/vercel-blob/client-upload (remotePatterns confirmed in next.config.mjs)
import Image from 'next/image';

// For image cards:
<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
  <Image
    src={creative.url}
    alt={creative.title}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 33vw"
  />
</div>

// For video cards with poster:
<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
  {creative.thumbnailUrl ? (
    <Image
      src={creative.thumbnailUrl}
      alt={creative.title}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  ) : (
    <div className="flex h-full items-center justify-center text-gray-400">
      {/* Video placeholder icon */}
    </div>
  )}
</div>
```

### Anti-Patterns to Avoid

- **Relying on `onUploadCompleted` for DB row creation:** Breaks on localhost. Always use the two-step pattern: `upload()` resolves → POST to create row.
- **Pre-generating a cuid for the blob path before upload:** Unnecessary complexity. Use `addRandomSuffix: true` and capture the returned `pathname`.
- **Using OIDC token for `handleUpload`:** Explicitly not supported. `handleUpload` requires `BLOB_READ_WRITE_TOKEN`.
- **Uploading via server-proxied route for videos:** The ~4.5MB serverless body limit would reject large videos. Client-upload is mandatory for ADMIN-02.
- **Redefining MIME/size constants in the route handler:** Breaks D-06. Always import from `src/lib/creatives.ts`.
- **Skipping auth in `onBeforeGenerateToken`:** Anyone can call the upload-token route and upload arbitrary files. Always call `isAdminAuthenticated()` inside the callback.
- **Unique constraint on sortOrder:** The schema has none. Do not add one — direct swap is the intended pattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secure client token for direct-to-blob upload | Custom presigned URL logic | `handleUpload` from `@vercel/blob/client` | Handles token signing, expiry, MIME restriction, size limit |
| Upload progress tracking | `XMLHttpRequest` with progress events | `onUploadProgress` callback in `upload()` | Built into the SDK |
| Blob deletion | Manual HTTP DELETE to Vercel API | `del()` from `@vercel/blob` (already used in `deleteCreative`) | Handles auth, batch deletion |
| Image optimization for blob-hosted assets | Custom resizing/caching layer | `next/image` with existing `remotePatterns` | CDN optimization + lazy loading built in |
| Atomic two-row update | Application-level locking | `prisma.$transaction([...])` | Single round-trip, atomic in Postgres |

**Key insight:** The `@vercel/blob` SDK handles all upload security complexity. The only application-level work is auth checking in `onBeforeGenerateToken`.

---

## Common Pitfalls

### Pitfall 1: `onUploadCompleted` Never Fires in Dev

**What goes wrong:** Developer writes DB row creation code in `onUploadCompleted`, works in production/preview but silently skips on localhost. Creative is uploaded to blob but no DB row is created.

**Why it happens:** `onUploadCompleted` is an inbound webhook from Vercel's servers. Vercel cannot reach `127.0.0.1`.

**How to avoid:** Do not use `onUploadCompleted` for any work this phase requires. Use the two-step pattern: `upload()` resolves → client POST to `/api/admin/creatives`. Leave `onUploadCompleted` as an explicit no-op with a comment explaining why.

**Warning signs:** Upload appears to succeed (no error from `upload()`), but no creative appears in the grid after `router.refresh()`.

### Pitfall 2: Orphaned Blobs on Row-Creation Failure

**What goes wrong:** `upload()` succeeds (blob exists in Vercel), but the follow-up POST to create the DB row fails (validation error, network timeout, etc.). The blob is now orphaned — no DB row references it, and `deleteCreative` cannot clean it up.

**Why it happens:** Two-step pattern has an inherent TOCTOU gap between blob upload and DB row creation.

**How to avoid:** The follow-up POST must validate all fields strictly (same validations as `createCreative`). If the POST fails, the client should catch the error and — if possible — call a cleanup endpoint to delete the orphaned blob via `del(blobPath)`. However, since the existing `deleteCreative` is blob-first anyway (orphaned row > orphaned blob is the stated project preference), the mitigation is: keep the token TTL short (default 1hr is fine), document that orphaned blobs may accumulate in Vercel dashboard, and trust that the Vercel Blob store has no capacity concern at this scale.

**Warning signs:** Vercel Blob dashboard shows blobs under `creatives/` that have no matching DB row.

### Pitfall 3: Missing `isAdminAuthenticated()` in `onBeforeGenerateToken`

**What goes wrong:** The upload-token route's outer POST handler checks auth, but `onBeforeGenerateToken` is called asynchronously inside `handleUpload`. If auth is only checked at the outer level, a race condition or code restructure could allow token generation without re-verification.

**Why it happens:** `handleUpload` separates token-generation from the outer auth check. The callback is the canonical security boundary per Vercel docs.

**How to avoid:** Always call `isAdminAuthenticated()` inside `onBeforeGenerateToken` (in addition to the outer guard). The outer guard returns 401 before `handleUpload` is called; the inner guard throws inside the callback as a defense-in-depth.

### Pitfall 4: Video Poster Upload Ordering

**What goes wrong:** If both main asset and poster are uploaded in parallel, the form submit races and either blob URL may be unavailable when the DB POST fires.

**Why it happens:** Two `upload()` calls with no sequencing.

**How to avoid:** Upload main asset first, await completion. Then upload poster (if present), await completion. Then POST to `/api/admin/creatives` with both URLs. Sequential, not parallel.

### Pitfall 5: `next/image` `fill` Prop Requires Positioned Parent

**What goes wrong:** `<Image fill>` inside a div with no explicit height and no `position: relative` causes layout shift or zero-height container.

**Why it happens:** `fill` sets `position: absolute` on the img element; parent must be `position: relative` with explicit dimensions.

**How to avoid:** Always wrap `<Image fill>` in a container with `className="relative"` and an explicit aspect ratio class (e.g. `aspect-video`) or a fixed height.

### Pitfall 6: sortOrder Gap After Delete

**What goes wrong:** After deleting a creative, `sortOrder` values have a gap (e.g. 0, 1, 3 after deleting index 2). ▲/▼ controls find no adjacent creative for the last item in a direction.

**Why it happens:** Delete only removes the row; it does not compact `sortOrder` values.

**How to avoid:** The ▲/▼ swap operates on the sorted list from `listCreatives()` — it finds the next/previous item in the sorted array, not by `sortOrder` arithmetic. Gaps are harmless. The reorder PATCH should receive the ID of the target creative and the ID of the neighbor (or `direction + currentId`), then look up the neighbor from the current DB state.

---

## Code Examples

### Complete Upload-Token Route

```typescript
// Source: https://vercel.com/docs/storage/vercel-blob/using-blob-sdk#handleupload
// src/app/api/admin/creatives/upload-token/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { ACCEPTED_IMAGE_MIME, ACCEPTED_VIDEO_MIME, MAX_CREATIVE_BYTES } from '@/lib/creatives';

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname) => {
        if (!(await isAdminAuthenticated())) {
          throw new Error('Not authenticated');
        }
        return {
          allowedContentTypes: [...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME] as string[],
          maximumSizeInBytes: MAX_CREATIVE_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Intentionally no-op: DB row is created via follow-up POST from client.
        // onUploadCompleted cannot reach localhost (requires ngrok in dev).
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
```

### Collection Route (POST = create row after upload)

```typescript
// src/app/api/admin/creatives/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createCreative, listCreatives, ACCEPTED_IMAGE_MIME, ACCEPTED_VIDEO_MIME } from '@/lib/creatives';
import { CreativeType } from '@/generated/prisma/client/client';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const creatives = await listCreatives();
  return NextResponse.json({ ok: true, creatives });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;

  // Validate required fields
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

  const url  = typeof raw.url      === 'string' ? raw.url.trim()      : '';
  const path = typeof raw.blobPath === 'string' ? raw.blobPath.trim() : '';
  if (!url || !path) return NextResponse.json({ error: 'url and blobPath are required' }, { status: 400 });

  const mimeType = typeof raw.mimeType === 'string' ? raw.mimeType : '';
  const allMimes = [...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME] as string[];
  if (!allMimes.includes(mimeType)) {
    return NextResponse.json({ error: 'Unsupported mimeType' }, { status: 400 });
  }

  const type: CreativeType = (ACCEPTED_VIDEO_MIME as readonly string[]).includes(mimeType) ? 'VIDEO' : 'IMAGE';

  const creative = await createCreative({
    title,
    description:       typeof raw.description === 'string' ? raw.description || null : null,
    caption:           typeof raw.caption      === 'string' ? raw.caption      || null : null,
    type,
    url,
    blobPath:          path,
    thumbnailUrl:      typeof raw.thumbnailUrl      === 'string' ? raw.thumbnailUrl      || null : null,
    thumbnailBlobPath: typeof raw.thumbnailBlobPath === 'string' ? raw.thumbnailBlobPath || null : null,
    fileName:          typeof raw.fileName  === 'string' ? raw.fileName  : '',
    fileSize:          typeof raw.fileSize  === 'number' ? raw.fileSize  : 0,
    mimeType,
  });

  return NextResponse.json({ ok: true, creative }, { status: 201 });
}
```

### Item Route (PATCH + DELETE)

```typescript
// src/app/api/admin/creatives/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client/client';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { updateCreative, deleteCreative } from '@/lib/creatives';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const raw = (await request.json()) as Record<string, unknown>;

  // Reorder: swap sortOrder with adjacent creative
  if (raw.direction === 'up' || raw.direction === 'down') {
    const all = await prisma.affiliateCreative.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, sortOrder: true },
    });
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const neighborIdx = raw.direction === 'up' ? idx - 1 : idx + 1;
    if (neighborIdx < 0 || neighborIdx >= all.length) {
      return NextResponse.json({ error: 'Already at boundary' }, { status: 400 });
    }
    const a = all[idx];
    const b = all[neighborIdx];
    await prisma.$transaction([
      prisma.affiliateCreative.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
      prisma.affiliateCreative.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  // Metadata edit: title, description, caption, active
  try {
    const creative = await updateCreative(id, {
      title:       typeof raw.title       === 'string'  ? raw.title       : undefined,
      description: raw.description !== undefined ? (typeof raw.description === 'string' ? raw.description || null : null) : undefined,
      caption:     raw.caption     !== undefined ? (typeof raw.caption     === 'string' ? raw.caption     || null : null) : undefined,
      active:      raw.active      !== undefined ? Boolean(raw.active)    : undefined,
    });
    return NextResponse.json({ ok: true, creative });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Creative not found' }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await deleteCreative(id); // blobs deleted first, then DB row
  return NextResponse.json({ ok: true });
}
```

### Client-Side Upload Sequence (CreativesGrid.tsx)

```typescript
// Source: https://vercel.com/docs/storage/vercel-blob/client-upload
import { upload } from '@vercel/blob/client';
import { ACCEPTED_IMAGE_MIME, ACCEPTED_VIDEO_MIME, MAX_CREATIVE_BYTES } from '@/lib/creatives';

async function handleCreate(e: React.FormEvent) {
  e.preventDefault();
  if (!assetFile) return;

  // Client-side validation (reuses constants from creatives.ts per D-06)
  const allMimes = [...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME] as string[];
  if (!allMimes.includes(assetFile.type)) {
    flash(false, 'Unsupported file type.');
    return;
  }
  if (assetFile.size > MAX_CREATIVE_BYTES) {
    flash(false, `File too large (max ${MAX_CREATIVE_BYTES / 1024 / 1024} MB).`);
    return;
  }

  setUploading(true);
  try {
    // Step 1: Upload main asset
    const assetBlob = await upload(`creatives/${assetFile.name}`, assetFile, {
      access: 'public',
      handleUploadUrl: '/api/admin/creatives/upload-token',
      onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage * 0.8)), // 0–80%
    });

    // Step 2: Upload poster (video only, if provided)
    let posterBlob: { url: string; pathname: string } | null = null;
    if (posterFile) {
      const pb = await upload(`creatives/${posterFile.name}`, posterFile, {
        access: 'public',
        handleUploadUrl: '/api/admin/creatives/upload-token',
        onUploadProgress: ({ percentage }) => setProgress(80 + Math.round(percentage * 0.15)), // 80–95%
      });
      posterBlob = { url: pb.url, pathname: pb.pathname };
    }

    // Step 3: Create DB row
    setProgress(98);
    const res = await fetch('/api/admin/creatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim() || null,
        caption: form.caption.trim() || null,
        url: assetBlob.url,
        blobPath: assetBlob.pathname,
        fileName: assetFile.name,
        fileSize: assetFile.size,
        mimeType: assetFile.type,
        thumbnailUrl: posterBlob?.url ?? null,
        thumbnailBlobPath: posterBlob?.pathname ?? null,
      }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (res.ok && data.ok) {
      flash(true, `Creative "${form.title}" created.`);
      setShowCreate(false);
      resetForm();
      router.refresh();
    } else {
      // Row creation failed: blob is orphaned. Log for manual cleanup.
      console.error('Row creation failed after upload — orphaned blob:', assetBlob.pathname);
      flash(false, data.error ?? 'Create failed after upload.');
    }
  } catch (err) {
    flash(false, err instanceof Error ? err.message : 'Upload failed.');
  } finally {
    setUploading(false);
    setProgress(0);
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-proxied file upload (multipart form) | Direct browser → Blob via signed client token | ~2023 (Vercel Blob launch) | Removes serverless body size limit for video |
| `onUploadCompleted` webhook for all DB writes | Two-step: `upload()` resolves → client POST | Vercel Blob docs recommendation | Works on localhost without tunneling |
| Custom presigned URL generation | `handleUpload` from `@vercel/blob/client` | ~2023 | Handles token signing, MIME validation, size enforcement |

**Deprecated/outdated:**
- `generateClientToken` — older API; `handleUpload` with `onBeforeGenerateToken` is the current pattern [CITED: vercel.com/docs/storage/vercel-blob/using-blob-sdk]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | sortOrder swap via `prisma.$transaction([update, update])` is sufficient (no unique constraint on sortOrder) | Pattern 3 | If unique constraint existed, direct swap would fail; use temp value. Schema verified: no unique constraint. Risk: LOW |
| A2 | `upload()` from `@vercel/blob/client` resolves synchronously with the final `PutBlobResult` (does not require waiting for `onUploadCompleted` to fire) | Pattern 1 | If `upload()` resolved before blob was ready, two-step pattern would fail. Docs confirm `upload()` returns after blob is committed. Risk: LOW |
| A3 | Admin page grid uses plain admin styling (no glassmorphism) — affiliate-facing glassmorphism comes in Phase 3 | Architecture Patterns | No functional risk; cosmetic only |

**If this table is empty:** All claims were verified or cited. Assumptions present but low-risk.

---

## Open Questions

1. **Blob access level: public vs. private?**
   - What we know: `*.public.blob.vercel-storage.com` is in `remotePatterns` for `next/image`. Both affiliate and admin need to view assets.
   - What's unclear: Whether assets should be public (accessible without auth) or private (require signed URL for each request).
   - Recommendation: Use `access: 'public'` — affiliate gallery will need to serve these assets without server-side token lookup per request, and the assets are marketing materials (not PII). This matches Phase 1's `remotePatterns` setup.

2. **Poster MIME types: should the poster field also validate via `ACCEPTED_IMAGE_MIME`?**
   - What we know: Poster is always an image (per D-04).
   - Recommendation: Yes — validate poster file against `ACCEPTED_IMAGE_MIME` only on the client. The upload-token route allows all accepted MIME types; client-side validation gates what goes to the poster field.

3. **`BLOB_READ_WRITE_TOKEN` in local dev: provisioned?**
   - What we know: STATE.md records this as a blocker — "BLOB_READ_WRITE_TOKEN must be provisioned in Vercel before Phase 2 upload can be tested end-to-end."
   - Recommendation: Phase executor must run `vercel env pull` to pull the token into `.env.local` before testing uploads. The planner should include this as a Wave 0 setup step.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 20+ | Runtime | Yes | 24.16.0 | — |
| npm | Package management | Yes | 11.13.0 | — |
| `@vercel/blob` 2.4.0 | Client-upload flow | Yes | 2.4.0 (installed) | — |
| `BLOB_READ_WRITE_TOKEN` env | `handleUpload` signing | Blocked (see STATE.md) | — | Run `vercel env pull` before upload tests |
| PostgreSQL (local or remote) | Prisma queries | Yes (assumed, Phase 1 complete) | — | — |

**Missing dependencies with no fallback:**
- `BLOB_READ_WRITE_TOKEN` — required to test upload flow end-to-end; planner must add a Wave 0 setup task: "run `vercel env pull` to pull token into `.env.local`"

**Missing dependencies with fallback:**
- None beyond the token blocker

---

## Validation Architecture

> `workflow.nyquist_validation` is explicitly `false` in `.planning/config.json` — this section is skipped.

---

## Security Domain

> `security_enforcement: true` and `security_asvs_level: 1` in `.planning/config.json`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | `isAdminAuthenticated()` guard on ALL routes + inside `onBeforeGenerateToken` |
| V3 Session Management | No (existing) | Admin cookie session already implemented; Phase 2 adds no new session surface |
| V4 Access Control | Yes | All creative routes require admin session; `onBeforeGenerateToken` re-verifies before issuing client token |
| V5 Input Validation | Yes | MIME type + size validation server-side in `onBeforeGenerateToken`; field validation in POST/PATCH handlers |
| V6 Cryptography | No | Blob token signing handled entirely by `@vercel/blob` SDK |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized blob upload (missing auth in `onBeforeGenerateToken`) | Elevation of Privilege | Always call `isAdminAuthenticated()` inside `onBeforeGenerateToken`; outer guard is defense layer 1, callback is layer 2 |
| MIME type confusion / polyglot files | Tampering | `allowedContentTypes` enforced in `onBeforeGenerateToken` via `ACCEPTED_IMAGE_MIME` + `ACCEPTED_VIDEO_MIME`; server POST re-validates `mimeType` field |
| Oversized file bypass | Denial of Service | `maximumSizeInBytes: MAX_CREATIVE_BYTES` (200MB) in `onBeforeGenerateToken`; client-side pre-check is UX only |
| Orphaned blob via row-creation failure | Information Disclosure (storage waste) | Mitigated by consistent error logging; short token TTL (1hr default) prevents indefinite open tokens |
| Blob path traversal | Tampering | Vercel Blob pathnames are opaque to clients; `addRandomSuffix: true` prevents predictable enumeration |
| CSRF on PATCH/DELETE routes | Spoofing | Next.js route handlers + cookie auth; `isAdminAuthenticated()` validates session on every request; SameSite cookie behavior mitigates CSRF for non-cross-origin requests |

---

## Sources

### Primary (MEDIUM confidence)
- `https://vercel.com/docs/storage/vercel-blob/client-upload` — client-upload quickstart, `handleUpload` pattern, `onUploadCompleted` localhost limitation, `VERCEL_BLOB_CALLBACK_URL` env var [CITED: vercel.com/docs/storage/vercel-blob/client-upload]
- `https://vercel.com/docs/storage/vercel-blob/using-blob-sdk` — complete SDK reference: `upload()` parameters, `handleUpload()` parameters, `onBeforeGenerateToken` return type, `onUploadCompleted` arguments [CITED: vercel.com/docs/storage/vercel-blob/using-blob-sdk]

### Secondary (codebase — HIGH confidence)
- `src/lib/creatives.ts` — Phase 1 data layer: all CRUD functions, constants, `CreativeRow`/`CreateCreativeInput`/`UpdateCreativeInput` types, blob-path scheme [VERIFIED: codebase grep]
- `src/app/admin/affiliates/AffiliatesTable.tsx` — canonical template for client mutation component: `showCreate`, `busyId`, `flash()`, `router.refresh()` [VERIFIED: codebase grep]
- `src/app/api/admin/affiliates/route.ts` + `[id]/route.ts` — API route conventions: auth guard, JSON validation, response shape [VERIFIED: codebase grep]
- `src/app/admin/layout.tsx` — admin nav structure; where Creatives link is added [VERIFIED: codebase grep]
- `prisma/schema.prisma` — `AffiliateCreative` model: no unique constraint on `sortOrder`, `@index([active, sortOrder])` composite [VERIFIED: codebase grep]
- `package.json` — `@vercel/blob` ^2.4.0 installed; npm registry confirms current version is 2.4.0 [VERIFIED: npm registry]

### Tertiary (LOW confidence — training knowledge)
- Prisma `$transaction` batch pattern for two-row atomic swap [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed and confirmed in package.json
- Vercel Blob client-upload API: MEDIUM — verified from official Vercel docs
- Architecture patterns: MEDIUM — derived from official docs + direct codebase reading
- Pitfalls: MEDIUM — localhost limitation confirmed by official docs; others derived from code reading
- sortOrder swap pattern: LOW — Prisma transaction pattern from training knowledge (well-established, low risk)

**Research date:** 2026-06-17
**Valid until:** 2026-07-17 (stable APIs; `@vercel/blob` 2.4.0 is current as of research date)
