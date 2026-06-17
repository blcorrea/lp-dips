import { CreativeType } from '../generated/prisma/client/client';
import { prisma }       from './prisma';
import { del }          from '@vercel/blob';

export type { CreativeType };

// ─────────────────────────────────────────────────────────────────────────────
// Constants — single source of truth for Phase 2 upload validation (D-07)
// ─────────────────────────────────────────────────────────────────────────────

/** Accepted image MIME types. Phase 2 enforces these; Phase 1 only defines them. */
export const ACCEPTED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/** Accepted video MIME types. mov files use the video/quicktime MIME type. */
export const ACCEPTED_VIDEO_MIME = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

/** Maximum creative file size in bytes (200 MB). */
export const MAX_CREATIVE_BYTES = 200 * 1024 * 1024;

// ─────────────────────────────────────────────────────────────────────────────
// Types — plain client-safe row; no Prisma runtime types cross the boundary
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Client-safe representation of an AffiliateCreative row.
 * Dates are ISO strings so Server → Client serialization never throws.
 */
export type CreativeRow = {
  id:                string;
  title:             string;
  description:       string | null;
  caption:           string | null;
  type:              CreativeType;
  /** Public CDN URL returned by Vercel Blob after upload */
  url:               string;
  /** Pathname used with @vercel/blob del() — follows creatives/<id>/<filename> scheme */
  blobPath:          string;
  thumbnailUrl:      string | null;
  thumbnailBlobPath: string | null;
  fileName:          string;
  /** File size in bytes */
  fileSize:          number;
  mimeType:          string;
  sortOrder:         number;
  active:            boolean;
  createdAt:         string; // ISO string
  updatedAt:         string; // ISO string
};

export type CreateCreativeInput = {
  title:              string;
  description?:       string | null;
  caption?:           string | null;
  type:               CreativeType;
  url:                string;
  blobPath:           string;
  thumbnailUrl?:      string | null;
  thumbnailBlobPath?: string | null;
  fileName:           string;
  fileSize:           number;
  mimeType:           string;
  sortOrder?:         number;
  active?:            boolean;
};

export type UpdateCreativeInput = Partial<Pick<CreateCreativeInput,
  'title' | 'description' | 'caption' | 'thumbnailUrl' | 'thumbnailBlobPath' |
  'sortOrder' | 'active'>>;

// ─────────────────────────────────────────────────────────────────────────────
// Serialization helper — single point for Date → ISO string conversion (D-11)
// ─────────────────────────────────────────────────────────────────────────────

function toRow(c: {
  id: string;
  title: string;
  description: string | null;
  caption: string | null;
  type: CreativeType;
  url: string;
  blobPath: string;
  thumbnailUrl: string | null;
  thumbnailBlobPath: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CreativeRow {
  return {
    id:                c.id,
    title:             c.title,
    description:       c.description,
    caption:           c.caption,
    type:              c.type,
    url:               c.url,
    blobPath:          c.blobPath,
    thumbnailUrl:      c.thumbnailUrl,
    thumbnailBlobPath: c.thumbnailBlobPath,
    fileName:          c.fileName,
    fileSize:          c.fileSize,
    mimeType:          c.mimeType,
    sortOrder:         c.sortOrder,
    active:            c.active,
    createdAt:         c.createdAt.toISOString(),
    updatedAt:         c.updatedAt.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all creatives ordered by sortOrder asc, then createdAt asc.
 * Pass `activeOnly: true` to restrict to active creatives (used by affiliate gallery in Phase 3).
 */
export async function listCreatives(
  { activeOnly }: { activeOnly?: boolean } = {}
): Promise<CreativeRow[]> {
  const rows = await prisma.affiliateCreative.findMany({
    where:   activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return rows.map(toRow);
}

// ─────────────────────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────────────────────

/** Create a new creative and return the serialized row. */
export async function createCreative(input: CreateCreativeInput): Promise<CreativeRow> {
  const row = await prisma.affiliateCreative.create({ data: { ...input } });
  return toRow(row);
}

/** Update editable fields on an existing creative and return the serialized row. */
export async function updateCreative(
  id: string,
  input: UpdateCreativeInput
): Promise<CreativeRow> {
  const row = await prisma.affiliateCreative.update({ where: { id }, data: input });
  return toRow(row);
}

/**
 * Hard-delete a creative: removes both Vercel Blob assets (when present) BEFORE
 * deleting the DB row. Deleting blobs first ensures that if del() fails the row
 * is preserved (orphaned-row is recoverable; orphaned-blob is not) — T-01-01 mitigation.
 *
 * Returns void and no-ops if the creative does not exist.
 */
export async function deleteCreative(id: string): Promise<void> {
  const creative = await prisma.affiliateCreative.findUnique({ where: { id } });
  if (!creative) return;

  // Filter nullish paths before calling del() — del(null) would throw at runtime
  const blobsToDelete = [creative.blobPath, creative.thumbnailBlobPath]
    .filter(Boolean) as string[];

  // Delete blobs BEFORE the DB row (T-01-01: orphaned row > orphaned blob)
  if (blobsToDelete.length > 0) {
    await del(blobsToDelete);
  }

  await prisma.affiliateCreative.delete({ where: { id } });
}
