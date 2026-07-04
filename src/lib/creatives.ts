import { CreativeType } from '../generated/prisma/client/client';
import { prisma }       from './prisma';
import { del }          from '@vercel/blob';

export type { CreativeType };

// ─────────────────────────────────────────────────────────────────────────────
// Constants — re-exported from the client-safe module so this server-only file
// (prisma + @vercel/blob) is never pulled into a client bundle. The single
// source of truth lives in ./creatives-constants (D-06/D-07).
// ─────────────────────────────────────────────────────────────────────────────

export {
  ACCEPTED_IMAGE_MIME,
  ACCEPTED_VIDEO_MIME,
  MAX_CREATIVE_BYTES,
} from './creatives-constants';

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
