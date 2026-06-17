# Phase 1: Foundation - Research

**Researched:** 2026-06-17
**Domain:** Prisma 7 schema migration + @vercel/blob setup + data-access module pattern
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** `AffiliateCreative` fields: `id` (cuid), `title`, `description?`, `caption?`, `type` (CreativeType), `url`, `blobPath`, `thumbnailUrl?`, `thumbnailBlobPath?`, `fileName`, `fileSize` (Int, bytes), `mimeType`, `sortOrder` (Int, default 0), `active` (Boolean, default true), `createdAt`, `updatedAt`. Index `@@index([active, sortOrder])`.
- **D-02:** `CreativeType` enum = `IMAGE | VIDEO` only.
- **D-03:** Follow existing schema conventions: `cuid()` ids, `@default(now())` / `@updatedAt`, explicit columns (no JSON blobs).
- **D-04:** Accepted image formats: jpg, png, webp, gif.
- **D-05:** Accepted video formats: mp4, webm, mov.
- **D-06:** Max file size ceiling: 200 MB per file.
- **D-07:** Expose accepted-type and size limits as exported constants in `src/lib/creatives.ts`.
- **D-08:** Blob pathname scheme: `creatives/<id>/<filename>`.
- **D-09:** Persist `blobPath` and `thumbnailBlobPath` so `deleteCreative` can remove both blobs.
- **D-10:** Hard delete (not soft) for `deleteCreative`; `active=false` is the separate soft-hide mechanism.
- **D-11:** Export a plain `CreativeRow` type with dates serialized as ISO strings.
- **D-12:** `listCreatives({ activeOnly })` orders by `sortOrder` asc, then `createdAt`. `activeOnly` filters `active: true`.
- **D-13:** Import generated Prisma client/enums from `../generated/prisma/client/client` and `./prisma`.

### Claude's Discretion
- Video poster/thumbnail: optional manual upload only — no server-side auto-generation. `thumbnailUrl`/`thumbnailBlobPath` stay nullable.
- Exact constant names, helper signatures, and migration internals left to the planner/executor as long as they match `affiliates.ts` conventions.

### Deferred Ideas (OUT OF SCOPE)
- Automatic video poster generation (ffmpeg / serverless transcode).
- Download/usage analytics, categories/tags, drag-and-drop reorder.
- Admin API routes, affiliate gallery UI, i18n strings — these are Phase 2 and Phase 3.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | `AffiliateCreative` model + `CreativeType` enum (IMAGE/VIDEO) added to `prisma/schema.prisma` and migrated (`add_affiliate_creatives`) | Prisma 7 two-step workflow: `prisma migrate dev --name add_affiliate_creatives` then `prisma generate` |
| DATA-02 | Vercel Blob configured — `@vercel/blob` dependency, `BLOB_READ_WRITE_TOKEN` env, and `*.public.blob.vercel-storage.com` added to `images.remotePatterns` | @vercel/blob v2.4.0 install + Next.js 15 `**` hostname wildcard pattern |
| DATA-03 | Data-access module `src/lib/creatives.ts` with `listCreatives`, `createCreative`, `updateCreative`, `deleteCreative` with serialized dates | Pattern mirrored from `src/lib/affiliates.ts`; `del()` from `@vercel/blob` for blob removal |
</phase_requirements>

## Summary

Phase 1 delivers the schema, blob wiring, and data-access foundation for the Affiliate Creatives feature. It is a pure infrastructure phase: no UI, no API routes, no admin or affiliate screens. The three deliverables are (1) a new Prisma model and enum migrated into PostgreSQL, (2) `@vercel/blob` installed and `BLOB_READ_WRITE_TOKEN` documented with the Vercel CDN domain added to Next.js image config, and (3) the `src/lib/creatives.ts` data-access module that mirrors the established pattern in `src/lib/affiliates.ts`.

The codebase already uses Prisma 7.5.0 with a custom generated client at `src/generated/prisma/client/` and a `prisma.config.ts` that loads dotenv. The critical Prisma 7 behavior change is that `prisma migrate dev` no longer automatically regenerates the client — `prisma generate` must be run explicitly after migration. The `@vercel/blob` `del()` API accepts a URL or an array of URLs/pathnames and does not throw when a blob is not found, making it safe to call even when `thumbnailBlobPath` is null after filtering.

**Primary recommendation:** Follow the strict two-step migration workflow (`migrate dev` → `generate`), mirror `affiliates.ts` exactly for `creatives.ts`, and use the `**` hostname wildcard in `remotePatterns` rather than `*` (which only matches a single subdomain segment).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Schema definition + migration | Database/Storage | — | New model lives in Prisma schema; migration updates PostgreSQL directly |
| Blob storage wiring | API/Backend | CDN/Static | `@vercel/blob` SDK used server-side; CDN serves public blob URLs |
| Data-access CRUD | API/Backend | — | `src/lib/creatives.ts` is a server-only module; no client imports |
| Image domain allowlist | Frontend Server (SSR) | — | `next.config.mjs` remotePatterns gates which domains `next/image` optimizes |
| Exported constants (MIME/size) | API/Backend | — | Defined in `creatives.ts`; consumed by Phase 2 upload validation |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `prisma` | 7.5.0 (already installed) | Schema migrations, client generation | Established ORM for this project |
| `@prisma/client` | 7.5.0 (already installed) | Type-safe DB queries | Matches existing pattern in all `src/lib/*.ts` modules |
| `@vercel/blob` | 2.4.0 [CITED: vercel.com/docs/storage/vercel-blob/using-blob-sdk] | Upload, delete blobs; `del()` for cleanup on hard delete | Official Vercel SDK; project targets Vercel hosting |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dotenv` | 17.3.1 (already installed) | Env var loading via `prisma.config.ts` | Already loaded by `import 'dotenv/config'` in `prisma.config.ts` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@vercel/blob` | AWS S3, Cloudflare R2 | Those require different SDKs and env var names; project is Vercel-native |
| Hard delete + `del()` | Soft-delete only | Project decision (D-10) is hard delete; soft-hide is `active=false` |

**Installation (new dependency only):**
```bash
npm install @vercel/blob
```

**Version verification:** `npm view @vercel/blob dist-tags.latest` → `2.4.0` (confirmed 2026-06-17). Package created 2023-04-18, 4.2M weekly downloads, owned by `vercel` org on npm.

## Package Legitimacy Audit

> Phase 1 adds one new external package.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `@vercel/blob` | npm | ~3 yrs (created 2023-04-18) | 4.2M/wk | github.com/vercel/storage | SUS (tool: "too-new" for latest patch) | Approved — flag is false-positive; owned by Vercel org, established package |

**Packages removed due to [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** `@vercel/blob` received a `SUS` verdict from the legitimacy seam due to a recent patch version date (2026-05-18), but the package was created in 2023, has 4.2M weekly downloads, is maintained by the Vercel organization, and is the official SDK for the Vercel Blob product. The "too-new" signal applies to the patch release, not the package itself. **Approved for use.** [CITED: vercel.com/docs/storage/vercel-blob/using-blob-sdk]

## Architecture Patterns

### System Architecture Diagram

```
prisma/schema.prisma
      |
      | prisma migrate dev --name add_affiliate_creatives
      v
PostgreSQL (AffiliateCreative table + CreativeType enum)
      |
      | prisma generate
      v
src/generated/prisma/client/   <── regenerated after migration
      |
      | import { PrismaClient, CreativeType } from '../generated/prisma/client/client'
      v
src/lib/creatives.ts
  listCreatives({ activeOnly }) ──→ PostgreSQL SELECT
  createCreative(input)        ──→ PostgreSQL INSERT
  updateCreative(id, input)    ──→ PostgreSQL UPDATE
  deleteCreative(id)           ──→ @vercel/blob del([blobPath, thumbnailBlobPath])
                                    + PostgreSQL DELETE

@vercel/blob (BLOB_READ_WRITE_TOKEN env)
      |
      | called from deleteCreative only in Phase 1
      v
Vercel Blob CDN (*.public.blob.vercel-storage.com)
      |
      | next/image fetches via optimized pipeline
      v
next.config.mjs remotePatterns: [{ hostname: '**.public.blob.vercel-storage.com' }]
```

### Recommended Project Structure

No new directories needed. Files to create or modify:

```
prisma/
├── schema.prisma           # ADD: CreativeType enum + AffiliateCreative model
├── migrations/
│   └── YYYYMMDDHHMMSS_add_affiliate_creatives/
│       └── migration.sql   # AUTO-GENERATED by prisma migrate dev

src/
├── generated/prisma/client/ # AUTO-REGENERATED by prisma generate
└── lib/
    └── creatives.ts         # CREATE: data-access module

next.config.mjs              # EDIT: add *.public.blob.vercel-storage.com remotePattern
```

### Pattern 1: Prisma 7 Two-Step Migration Workflow

**What:** Add new model to schema, run migration, explicitly regenerate client.

**When to use:** Every schema change in this project (brownfield, existing DB).

```bash
# Source: prisma.io/docs/orm/reference/prisma-cli-reference (CITED)
# Step 1: Apply migration to DB and record in _prisma_migrations
npx prisma migrate dev --name add_affiliate_creatives

# Step 2: Regenerate TypeScript client (NOT automatic in Prisma 7)
npx prisma generate
```

**Important:** In Prisma 7, `migrate dev` no longer automatically calls `prisma generate`. The client at `src/generated/prisma/client/` will be stale until `prisma generate` is run. TypeScript will not error immediately — but any new model fields or enum values added to the schema will be missing from the generated types until regeneration. [CITED: prisma.io/docs/orm/reference/prisma-cli-reference#migrate-dev]

### Pattern 2: AffiliateCreative Schema Block

**What:** New model following established schema conventions (D-01 through D-03).

```prisma
// Source: prisma/schema.prisma conventions in this project [VERIFIED: codebase grep]
enum CreativeType {
  IMAGE
  VIDEO
}

model AffiliateCreative {
  id               String       @id @default(cuid())
  title            String
  description      String?
  caption          String?
  type             CreativeType
  url              String
  blobPath         String
  thumbnailUrl     String?
  thumbnailBlobPath String?
  fileName         String
  fileSize         Int
  mimeType         String
  sortOrder        Int          @default(0)
  active           Boolean      @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([active, sortOrder])
}
```

### Pattern 3: creatives.ts Data-Access Module Shape

**What:** Mirrors `src/lib/affiliates.ts` exactly — serialized dates, plain row types, no Prisma runtime types crossing the server boundary.

```typescript
// Source: src/lib/affiliates.ts pattern [VERIFIED: codebase]
import { CreativeType }            from '../generated/prisma/client/client';
import { prisma }                  from './prisma';
import { del }                     from '@vercel/blob';

export type { CreativeType };

// ── Constants (D-07) ──────────────────────────────────────────────────────────
export const ACCEPTED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const ACCEPTED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export const MAX_CREATIVE_BYTES   = 200 * 1024 * 1024; // 200 MB

// ── Plain row type (D-11) ─────────────────────────────────────────────────────
export type CreativeRow = {
  id:               string;
  title:            string;
  description:      string | null;
  caption:          string | null;
  type:             CreativeType;
  url:              string;
  blobPath:         string;
  thumbnailUrl:     string | null;
  thumbnailBlobPath: string | null;
  fileName:         string;
  fileSize:         number;
  mimeType:         string;
  sortOrder:        number;
  active:           boolean;
  createdAt:        string; // ISO string
  updatedAt:        string; // ISO string
};

// ── Serialization helper ──────────────────────────────────────────────────────
function toRow(c: /* Prisma.AffiliateCreative */): CreativeRow {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

// ── Reads (D-12) ──────────────────────────────────────────────────────────────
export async function listCreatives(
  { activeOnly }: { activeOnly?: boolean } = {}
): Promise<CreativeRow[]> {
  const rows = await prisma.affiliateCreative.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return rows.map(toRow);
}

// ── Writes ────────────────────────────────────────────────────────────────────
export type CreateCreativeInput = {
  title:             string;
  description?:      string | null;
  caption?:          string | null;
  type:              CreativeType;
  url:               string;
  blobPath:          string;
  thumbnailUrl?:     string | null;
  thumbnailBlobPath?: string | null;
  fileName:          string;
  fileSize:          number;
  mimeType:          string;
  sortOrder?:        number;
  active?:           boolean;
};

export async function createCreative(input: CreateCreativeInput): Promise<CreativeRow> {
  const row = await prisma.affiliateCreative.create({ data: { ...input } });
  return toRow(row);
}

export type UpdateCreativeInput = Partial<Pick<CreateCreativeInput,
  'title' | 'description' | 'caption' | 'thumbnailUrl' | 'thumbnailBlobPath' |
  'sortOrder' | 'active'>>;

export async function updateCreative(id: string, input: UpdateCreativeInput): Promise<CreativeRow> {
  const row = await prisma.affiliateCreative.update({ where: { id }, data: input });
  return toRow(row);
}

// D-09 + D-10: hard delete DB row AND remove both blobs when present
export async function deleteCreative(id: string): Promise<void> {
  const creative = await prisma.affiliateCreative.findUnique({ where: { id } });
  if (!creative) return;

  // del() does not throw for missing blobs [CITED: vercel.com/docs/storage/vercel-blob]
  const blobsToDelete = [creative.blobPath, creative.thumbnailBlobPath].filter(Boolean) as string[];
  if (blobsToDelete.length > 0) {
    await del(blobsToDelete);
  }

  await prisma.affiliateCreative.delete({ where: { id } });
}
```

### Pattern 4: next.config.mjs remotePatterns Wildcard

**What:** Add Vercel Blob CDN domain to allow `next/image` to optimize images served from blob storage.

```javascript
// Source: nextjs.org/docs/app/api-reference/components/image#remotepatterns [CITED]
// In next.config.mjs — add alongside the existing Shopify CDN entry:
{
  protocol: "https",
  hostname: "**.public.blob.vercel-storage.com",
}
```

**Why `**` not `*`:** The `*` wildcard matches a single subdomain segment. Vercel Blob public URLs take the form `<store-hash>.public.blob.vercel-storage.com`. The store hash is the only subdomain segment, so technically `*` would also work here — but `**` is the documented pattern for "any number of subdomains at the beginning" and is the safer choice if Vercel ever introduces nested subdomains. [CITED: nextjs.org/docs/app/api-reference/components/image#remotepatterns]

### Anti-Patterns to Avoid

- **Skipping `prisma generate` after `migrate dev`:** In Prisma 7 these are decoupled. Forgetting `generate` means the TypeScript types still reflect the old schema. The build script in `package.json` already runs `prisma generate && next build` — but local dev requires the manual step.
- **Importing Prisma runtime types in `CreativeRow`:** All dates must be serialized as ISO strings. Never export `Date` objects from data-access modules — Next.js server components passing data to client components will error at runtime ("Cannot serialize a `Date` object").
- **Calling `del()` with `null` or `undefined`:** Filter the blobs array before passing to `del()`. Passing `null` to `del()` would cause a runtime error.
- **Using `*` in `hostname` when you mean `**`:** `*` only matches one segment; `**` matches zero or more. Always test the remotePattern against an actual blob URL after setup.
- **Running `prisma migrate dev` in production:** The command is development-only. Production uses `prisma migrate deploy`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Blob deletion on record delete | Custom fetch to blob API | `del()` from `@vercel/blob` | Handles CDN cache invalidation, retries, no-op on missing blob |
| Date serialization | Manual `.toISOString()` inline everywhere | `toRow()` helper (like affiliates.ts pattern) | Single serialization point prevents drift |
| Enum validation | Custom string checks | TypeScript + generated Prisma enum types | Type system enforces valid values at compile time |
| Migration tracking | Custom migration table | Prisma Migrate (`_prisma_migrations` table) | Already established in this project |

**Key insight:** The data-access layer is intentionally thin — no business logic, no validation beyond types. Phase 2 (upload route) is where file-size and MIME-type enforcement happens using the exported constants.

## Common Pitfalls

### Pitfall 1: `prisma generate` Not Run After Migration

**What goes wrong:** TypeScript compiles fine against the old generated types, but runtime queries for `affiliateCreative` model will fail with "model not found" errors. The generated client at `src/generated/prisma/client/` reflects the schema state at the time of the last `prisma generate` call, not the last migration.

**Why it happens:** Prisma 7 explicitly broke the coupling between `migrate dev` and `prisma generate`. The CLI reference confirms: "migrate dev no longer automatically triggers prisma generate." [CITED: prisma.io/docs/orm/reference/prisma-cli-reference#migrate-dev]

**How to avoid:** Always run both commands in sequence after any schema change:
```bash
npx prisma migrate dev --name <migration-name>
npx prisma generate
```

**Warning signs:** TypeScript errors for `prisma.affiliateCreative` (undefined) or missing enum values on `CreativeType`.

### Pitfall 2: Wrong `remotePatterns` Wildcard

**What goes wrong:** `next/image` throws 400 errors when rendering creative thumbnails in Phase 3 because the Vercel Blob domain is not on the allowlist.

**Why it happens:** Using `hostname: "*.public.blob.vercel-storage.com"` (single star) instead of `hostname: "**.public.blob.vercel-storage.com"` (double star). Single star only matches a single subdomain segment but the actual Vercel Blob hostname form is `<hash>.public.blob.vercel-storage.com`. While single-star does work for this single-level case, the recommended pattern for subdomain wildcards uses `**`.

**How to avoid:** Use `**` for hostname wildcards as documented by Next.js. [CITED: nextjs.org/docs/app/api-reference/components/image#remotepatterns]

**Warning signs:** `next/image` 400 errors in console for blob URLs; "hostname is not configured under images.remotePatterns" error.

### Pitfall 3: Serializing Dates Inconsistently

**What goes wrong:** Some callers get `Date` objects, others get ISO strings. Client components that receive `Date` objects crash with "Cannot serialize a Date object" in Next.js App Router.

**Why it happens:** The raw Prisma result has `createdAt: Date` and `updatedAt: Date`. If the serialization is done ad-hoc in each function rather than in a shared `toRow()` helper, some code paths miss it.

**How to avoid:** Use a single `toRow()` function for all DB-to-row conversions (identical pattern to `affiliates.ts`). Never return the raw Prisma result directly.

**Warning signs:** Runtime error "Cannot serialize a Date object" when passing data from Server Component to Client Component.

### Pitfall 4: `del()` Called With Nullish Blob Paths

**What goes wrong:** `deleteCreative` crashes with a runtime type error when `thumbnailBlobPath` is null and it is passed directly to `del()`.

**Why it happens:** `thumbnailBlobPath` is nullable (thumbnail is optional). Calling `del(null)` or `del([null])` throws.

**How to avoid:** Filter the array before calling `del()`:
```typescript
const blobsToDelete = [creative.blobPath, creative.thumbnailBlobPath].filter(Boolean) as string[];
if (blobsToDelete.length > 0) await del(blobsToDelete);
```

**Warning signs:** Uncaught TypeError on delete operation when no thumbnail was uploaded.

### Pitfall 5: Brownfield Migration and Shadow Database

**What goes wrong:** `prisma migrate dev` fails if there is no shadow database available and the PostgreSQL user lacks permission to create databases.

**Why it happens:** Prisma uses a shadow database to detect schema drift in development. On managed Postgres services (Vercel Postgres, Supabase) the shadow DB URL must be configured explicitly. [ASSUMED]

**How to avoid:** If `prisma migrate dev` fails with a shadow database error, add `shadowDatabaseUrl` to `prisma.config.ts` or use a local PostgreSQL where the user has `CREATEDB` privilege. Alternatively, `prisma migrate dev --create-only` generates the SQL without applying it, then `prisma migrate resolve` can be used manually.

**Warning signs:** Error "The migration `add_affiliate_creatives` was modified after it was applied" or "Unable to create shadow database".

## Code Examples

### Schema Addition (complete block)

```prisma
// Place after existing CommissionStatus enum in prisma/schema.prisma
// Source: CONTEXT.md D-01 + project schema conventions [VERIFIED: codebase]

enum CreativeType {
  IMAGE
  VIDEO
}

// ─────────────────────────────────────────────────────────────────────────────
// AffiliateCreative — marketing assets managed by admins, browsable by affiliates
// ─────────────────────────────────────────────────────────────────────────────

model AffiliateCreative {
  id                String       @id @default(cuid())
  title             String
  description       String?
  caption           String?
  type              CreativeType
  /// Public URL returned by Vercel Blob after upload
  url               String
  /// Pathname used with @vercel/blob del() on hard delete
  blobPath          String
  thumbnailUrl      String?
  thumbnailBlobPath String?
  fileName          String
  /// File size in bytes
  fileSize          Int
  mimeType          String
  sortOrder         Int          @default(0)
  active            Boolean      @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([active, sortOrder])
}
```

### next.config.mjs remotePatterns Addition

```javascript
// Source: nextjs.org/docs/app/api-reference/components/image#remotepatterns [CITED]
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      // ADD THIS:
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
};
```

### deleteCreative with Blob Cleanup

```typescript
// Source: @vercel/blob SDK docs [CITED: vercel.com/docs/storage/vercel-blob]
import { del } from '@vercel/blob';

export async function deleteCreative(id: string): Promise<void> {
  const creative = await prisma.affiliateCreative.findUnique({ where: { id } });
  if (!creative) return;

  // del() accepts array; does not throw for missing blobs
  const blobsToDelete = [creative.blobPath, creative.thumbnailBlobPath]
    .filter(Boolean) as string[];
  if (blobsToDelete.length > 0) {
    await del(blobsToDelete);
  }

  await prisma.affiliateCreative.delete({ where: { id } });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `prisma migrate dev` auto-generates client | Must run `prisma generate` separately | Prisma 7.x | Two-step workflow required in this project |
| `remotePatterns` as object array only | Also accepts `new URL(...)` syntax | Next.js 14+ | Object form still works; no change needed |
| `BLOB_READ_WRITE_TOKEN` only auth | OIDC token preferred on Vercel (`VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID`) | @vercel/blob 2.x | For Phase 1, `BLOB_READ_WRITE_TOKEN` is correct (server-side del() calls); OIDC is relevant when connecting the store to the Vercel project dashboard |

**Deprecated/outdated:**
- Prisma schema `generator client { provider = "prisma-client-js" }` — this project uses `prisma-client` (Prisma 7 new generator name). Already correct in `prisma/schema.prisma`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Shadow database errors occur on managed Postgres when user lacks CREATEDB privilege | Pitfall 5 | Low — if local Postgres has CREATEDB, this is a non-issue; but important for staging/CI |
| A2 | `video/quicktime` is the correct MIME type for `.mov` files | Pattern 3 (ACCEPTED_VIDEO_MIME) | Low — browsers send `video/quicktime` for .mov; server-side validation in Phase 2 will confirm |

**If this table is empty:** N/A — two assumed claims documented above.

## Open Questions

1. **`del()` accepts pathname or URL?**
   - What we know: The official docs say `del()` accepts "a string or array of strings specifying the URL(s) or pathname(s)". [CITED: vercel.com/docs/storage/vercel-blob]
   - What's unclear: Whether to store `blobPath` (pathname like `creatives/abc123/photo.jpg`) or the full `url` in the DB for blob deletion.
   - Recommendation: Store `blobPath` (pathname) per D-08's `creatives/<id>/<filename>` scheme. The `url` field in `AffiliateCreative` holds the CDN URL. `del()` accepts both, so either works — but `blobPath` is more portable if the CDN domain changes.

2. **BLOB_READ_WRITE_TOKEN for local dev `deleteCreative`?**
   - What we know: `deleteCreative` calls `del()`, which needs the token. In local dev, the token must be in `.env.local` (pulled via `vercel env pull`).
   - What's unclear: Whether the team has an existing Vercel Blob store or needs to create one.
   - Recommendation: Document in `.env.local.example` that `BLOB_READ_WRITE_TOKEN` is required. Phase 2 E2E testing requires the actual store to be provisioned (STATE.md already notes this blocker).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 20.x | npm install, prisma commands | [ASSUMED] present per .nvmrc | 20.x | — |
| PostgreSQL | `prisma migrate dev` | [ASSUMED] running (project uses it today) | — | — |
| `prisma` CLI | Migration + generation | Available (in `node_modules/.bin/`) | 7.5.0 | — |
| `@vercel/blob` | `deleteCreative` | Not yet installed | — | None — must install |
| `BLOB_READ_WRITE_TOKEN` | `del()` calls in deleteCreative | Not yet documented/provisioned | — | Cannot test blob deletion locally without it |

**Missing dependencies with no fallback:**
- `@vercel/blob` package — must run `npm install @vercel/blob` before implementing `creatives.ts`
- `BLOB_READ_WRITE_TOKEN` env var — must be added to `.env.local` (and documented in a `.env.example`) before blob deletion can be tested. Actual Vercel Blob store must be provisioned in the Vercel dashboard before Phase 2 E2E testing.

**Missing dependencies with fallback:**
- None.

## Security Domain

> `security_enforcement: true`, ASVS level 1.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 1 has no auth surfaces (no API routes, no UI) |
| V3 Session Management | No | No session handling in this phase |
| V4 Access Control | No | No access control in data-access module itself — callers (Phase 2 routes) enforce admin auth |
| V5 Input Validation | Partial | Constants exported define allowed MIME types and max size; enforcement deferred to Phase 2 |
| V6 Cryptography | No | No crypto operations; blob URLs are managed by Vercel Blob |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Orphaned blobs (delete DB row, skip blob delete) | Tampering | `deleteCreative` deletes blobs BEFORE deleting the DB row; if blob `del()` throws, the row is preserved |
| BLOB_READ_WRITE_TOKEN leaking to client code | Information Disclosure | Token is server-only env var; never expose in `NEXT_PUBLIC_*` variables |
| Unauthorized blob deletion via `del()` | Elevation of Privilege | `del()` is called only from `deleteCreative`; callers (Phase 2 API routes) must verify admin auth before calling `deleteCreative` |

**Security note for Phase 2:** The `del()` call in `deleteCreative` uses `BLOB_READ_WRITE_TOKEN` which grants full write/delete access to the entire blob store. Phase 2 must ensure admin authentication is verified before any call to `deleteCreative`.

## Sources

### Primary (MEDIUM confidence)
- [vercel.com/docs/storage/vercel-blob/using-blob-sdk] — `del()` API signature, `put()` API, `BLOB_READ_WRITE_TOKEN` auth resolution order, last updated 2026-05-19
- [nextjs.org/docs/app/api-reference/components/image#remotepatterns] — `remotePatterns` wildcard syntax (`**` for subdomain), last updated 2026-03-10
- [prisma.io/docs/orm/reference/prisma-cli-reference#migrate-dev] — `migrate dev` no longer auto-runs `prisma generate` in Prisma 7
- [prisma.io/docs/orm/prisma-migrate/workflows/development-and-production] — shadow database behavior, migration lifecycle

### Secondary (MEDIUM confidence)
- `src/lib/affiliates.ts` [VERIFIED: codebase] — canonical pattern for data-access module
- `prisma/schema.prisma` [VERIFIED: codebase] — established conventions (cuid, @@index, @updatedAt)
- `prisma.config.ts` [VERIFIED: codebase] — dotenv + defineConfig pattern
- `next.config.mjs` [VERIFIED: codebase] — existing remotePatterns structure to extend
- `npm view @vercel/blob` [VERIFIED: npm registry] — v2.4.0, created 2023-04-18, 4.2M weekly downloads

### Tertiary (LOW confidence)
- Shadow database behavior on managed Postgres [ASSUMED] — not verified against actual deployment environment

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — `@vercel/blob` v2.4.0 confirmed via npm registry; Prisma 7.5.0 already in project
- Architecture: HIGH — directly derived from reading existing codebase files
- Pitfalls: MEDIUM — Prisma 7 `generate` decoupling confirmed via official docs; shadow DB pitfall is assumed

**Research date:** 2026-06-17
**Valid until:** 2026-07-17 (stable domain — 30 days)
