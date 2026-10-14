import { ACCEPTED_IMAGE_MIME, ACCEPTED_VIDEO_MIME } from './creatives-constants';

// ─────────────────────────────────────────────────────────────────────────────
// Input parsing for POST /api/machine/creatives. Pure (no prisma, no blob) so
// it's unit-testable; the route handles fetching and storing the file.
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_TITLE_CHARS       = 200;
export const MAX_DESCRIPTION_CHARS = 2000;
export const MAX_CAPTION_CHARS     = 5000;
export const EXTERNAL_ID_REGEX     = /^[A-Za-z0-9_.:-]{1,100}$/;

export type MachineCreativeInput = {
  sourceUrl:   URL;
  title:       string;
  description: string | null;
  captions:    { en: string; es: string | null; pt: string | null };
  externalId:  string | null;
  fileName:    string | null;
  active:      boolean;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; field: string; message: string };

const MIME_BY_EXTENSION: Record<string, string> = {
  mp4:  'video/mp4',
  m4v:  'video/mp4',
  webm: 'video/webm',
  mov:  'video/quicktime',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  webp: 'image/webp',
  gif:  'image/gif',
};

const EXTENSION_BY_MIME: Record<string, string> = {
  'video/mp4':       'mp4',
  'video/webm':      'webm',
  'video/quicktime': 'mov',
  'image/jpeg':      'jpg',
  'image/png':       'png',
  'image/webp':      'webp',
  'image/gif':       'gif',
};

const ACCEPTED_MIME = new Set<string>([...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME]);

export function isVideoMime(mime: string): boolean {
  return (ACCEPTED_VIDEO_MIME as readonly string[]).includes(mime);
}

function optionalText(
  raw: unknown,
  field: string,
  max: number
): ParseResult<string | null> {
  if (raw === undefined || raw === null) return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false, field, message: `${field} must be a string.` };
  const value = raw.trim();
  if (value.length > max) {
    return { ok: false, field, message: `${field} must be at most ${max} characters.` };
  }
  return { ok: true, value: value || null };
}

export function parseMachineCreativeInput(
  raw: Record<string, unknown>,
  { allowHttp = false }: { allowHttp?: boolean } = {}
): ParseResult<MachineCreativeInput> {
  // ── sourceUrl ─────────────────────────────────────────────────────────────
  if (typeof raw.sourceUrl !== 'string' || !raw.sourceUrl.trim()) {
    return { ok: false, field: 'sourceUrl', message: 'sourceUrl is required.' };
  }
  let sourceUrl: URL;
  try {
    sourceUrl = new URL(raw.sourceUrl.trim());
  } catch {
    return { ok: false, field: 'sourceUrl', message: 'sourceUrl must be an absolute URL.' };
  }
  const schemeOk = sourceUrl.protocol === 'https:' || (allowHttp && sourceUrl.protocol === 'http:');
  if (!schemeOk) {
    return { ok: false, field: 'sourceUrl', message: 'sourceUrl must use https.' };
  }

  // ── title ─────────────────────────────────────────────────────────────────
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) return { ok: false, field: 'title', message: 'title is required.' };
  if (title.length > MAX_TITLE_CHARS) {
    return { ok: false, field: 'title', message: `title must be at most ${MAX_TITLE_CHARS} characters.` };
  }

  const description = optionalText(raw.description, 'description', MAX_DESCRIPTION_CHARS);
  if (!description.ok) return description;

  // ── captions ──────────────────────────────────────────────────────────────
  const captions = raw.captions;
  if (!captions || typeof captions !== 'object' || Array.isArray(captions)) {
    return { ok: false, field: 'captions', message: 'captions must be an object with at least "en".' };
  }
  const c = captions as Record<string, unknown>;
  const en = optionalText(c.en, 'captions.en', MAX_CAPTION_CHARS);
  if (!en.ok) return en;
  if (!en.value) return { ok: false, field: 'captions.en', message: 'captions.en is required.' };
  const es = optionalText(c.es, 'captions.es', MAX_CAPTION_CHARS);
  if (!es.ok) return es;
  const pt = optionalText(c.pt, 'captions.pt', MAX_CAPTION_CHARS);
  if (!pt.ok) return pt;

  // ── externalId ────────────────────────────────────────────────────────────
  let externalId: string | null = null;
  if (raw.externalId !== undefined && raw.externalId !== null) {
    if (typeof raw.externalId !== 'string' || !EXTERNAL_ID_REGEX.test(raw.externalId)) {
      return {
        ok: false,
        field: 'externalId',
        message: 'externalId must be 1-100 chars of letters, digits, "_", ".", ":" or "-".',
      };
    }
    externalId = raw.externalId;
  }

  // ── fileName ──────────────────────────────────────────────────────────────
  const fileName = optionalText(raw.fileName, 'fileName', 200);
  if (!fileName.ok) return fileName;

  // ── active ────────────────────────────────────────────────────────────────
  if (raw.active !== undefined && typeof raw.active !== 'boolean') {
    return { ok: false, field: 'active', message: 'active must be a boolean.' };
  }

  return {
    ok: true,
    value: {
      sourceUrl,
      title,
      description: description.value,
      captions:    { en: en.value, es: es.value, pt: pt.value },
      externalId,
      fileName:    fileName.value,
      active:      raw.active ?? true,
    },
  };
}

/**
 * Resolves the stored MIME type: the source's Content-Type when it's one we
 * accept, else (for generic/missing types) the file extension. Returns null
 * when the file isn't an accepted image/video.
 */
export function resolveMimeType(contentType: string | null, fileName: string): string | null {
  const declared = contentType?.split(';')[0].trim().toLowerCase() ?? '';
  if (ACCEPTED_MIME.has(declared)) return declared;
  if (declared && declared !== 'application/octet-stream' && declared !== 'binary/octet-stream') {
    return null;
  }
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXTENSION[ext] ?? null;
}

/**
 * Blob-safe file name: the caller's fileName, else the last URL path segment,
 * reduced to [A-Za-z0-9._-]. Guarantees an extension matching the MIME type
 * when one is known.
 */
export function deriveFileName(sourceUrl: URL, requested: string | null, mime?: string): string {
  const lastSegment = sourceUrl.pathname.split('/').pop() ?? '';
  let fromUrl = lastSegment;
  try {
    fromUrl = decodeURIComponent(lastSegment);
  } catch {
    // Malformed percent-encoding — keep the raw segment; it's sanitized below.
  }
  const base = (requested || fromUrl || 'creative')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[-.]+|-+$/g, '')
    .slice(0, 100) || 'creative';
  const ext = mime ? EXTENSION_BY_MIME[mime] : undefined;
  if (!ext) return base;
  const current = base.includes('.') ? base.split('.').pop()!.toLowerCase() : '';
  return MIME_BY_EXTENSION[current] === mime ? base : `${base}.${ext}`;
}
