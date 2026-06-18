// ─────────────────────────────────────────────────────────────────────────────
// Creative upload constants — single source of truth (D-06/D-07).
//
// Kept in a SERVER-FREE module (no prisma, no @vercel/blob) so that client
// components (e.g. CreativesGrid) can import these values without dragging the
// server-only data-access layer — and its `pg`/`fs` dependencies — into the
// browser bundle. `src/lib/creatives.ts` re-exports these for server callers.
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
