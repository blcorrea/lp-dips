import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { Prisma } from '@/generated/prisma/client/client';
import {
  createCreative,
  findCreativeByExternalId,
  nextCreativeSortOrder,
  MAX_CREATIVE_BYTES,
  type CreativeRow,
} from '@/lib/creatives';
import { machineError, readJsonObject, requireMachineAuth } from '@/lib/machine-api';
import {
  deriveFileName,
  isVideoMime,
  parseMachineCreativeInput,
  resolveMimeType,
} from '@/lib/machine-creatives';

// ── POST /api/machine/creatives ──────────────────────────────────────────────
//
// Adds an approved machine video (or image) to the affiliate creatives library.
// The machine can't push the file through this function — Vercel caps request
// bodies at ~4.5MB — so it sends a URL instead and this route streams the file
// from that URL straight into Vercel Blob, enforcing MAX_CREATIVE_BYTES as the
// bytes flow. The creative is active (visible to affiliates) by default.
//
// Idempotent on `externalId`: a repeat call returns the existing creative with
// 200 and `created: false` instead of storing a duplicate.
//
// Contract: docs/machine-api.md.

// Streaming up to 200MB from the VPS can take a while.
export const maxDuration = 300;

const SOURCE_FETCH_TIMEOUT_MS = 240_000;

class TooLargeError extends Error {}

function toMachineCreative(c: CreativeRow) {
  return {
    id:          c.id,
    externalId:  c.externalId,
    title:       c.title,
    description: c.description,
    type:        c.type,
    mimeType:    c.mimeType,
    fileName:    c.fileName,
    fileSize:    c.fileSize,
    url:         c.url,
    captions:    { en: c.caption, es: c.captionEs, pt: c.captionPt },
    active:      c.active,
    sortOrder:   c.sortOrder,
    createdAt:   c.createdAt,
  };
}

/** Passes bytes through, erroring the stream once more than `max` bytes flow. */
function byteLimiter(max: number) {
  let total = 0;
  const stream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      total += chunk.byteLength;
      if (total > max) {
        controller.error(new TooLargeError());
        return;
      }
      controller.enqueue(chunk);
    },
  });
  return { stream, bytes: () => total, exceeded: () => total > max };
}

export async function POST(request: NextRequest) {
  const authError = requireMachineAuth(request);
  if (authError) return authError;

  const parsedBody = await readJsonObject(request);
  if ('response' in parsedBody) return parsedBody.response;

  const parsed = parseMachineCreativeInput(parsedBody.body, {
    allowHttp: process.env.NODE_ENV !== 'production',
  });
  if (!parsed.ok) return machineError(400, 'invalid_field', parsed.message, parsed.field);
  const input = parsed.value;

  // ── Idempotency short-circuit ─────────────────────────────────────────────
  if (input.externalId) {
    const existing = await findCreativeByExternalId(input.externalId);
    if (existing) {
      return NextResponse.json({ ok: true, created: false, creative: toMachineCreative(existing) });
    }
  }

  // ── Fetch the source ──────────────────────────────────────────────────────
  let source: Response;
  try {
    source = await fetch(input.sourceUrl, {
      redirect: 'follow',
      signal:   AbortSignal.timeout(SOURCE_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    return machineError(
      502,
      'source_unreachable',
      `Could not fetch sourceUrl: ${err instanceof Error ? err.message : 'network error'}`,
      'sourceUrl'
    );
  }
  if (!source.ok || !source.body) {
    return machineError(
      502,
      'source_bad_status',
      `sourceUrl responded with HTTP ${source.status}.`,
      'sourceUrl'
    );
  }

  const provisionalName = deriveFileName(input.sourceUrl, input.fileName);
  const mimeType = resolveMimeType(source.headers.get('content-type'), provisionalName);
  if (!mimeType) {
    await source.body.cancel();
    return machineError(
      415,
      'unsupported_media_type',
      'Source must be MP4, WebM or MOV video (or JPEG, PNG, WebP, GIF image).',
      'sourceUrl'
    );
  }

  const declaredLength = Number(source.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CREATIVE_BYTES) {
    await source.body.cancel();
    return machineError(413, 'file_too_large', 'File exceeds the 200 MB limit.', 'sourceUrl');
  }

  // ── Stream into Vercel Blob ───────────────────────────────────────────────
  const fileName = deriveFileName(input.sourceUrl, input.fileName, mimeType);
  const limiter  = byteLimiter(MAX_CREATIVE_BYTES);
  let blob: { url: string; pathname: string };
  try {
    blob = await put(`creatives/machine/${fileName}`, source.body.pipeThrough(limiter.stream), {
      access:          'public',
      contentType:     mimeType,
      addRandomSuffix: true,
      multipart:       true,
    });
  } catch (err) {
    if (limiter.exceeded() || err instanceof TooLargeError) {
      return machineError(413, 'file_too_large', 'File exceeds the 200 MB limit.', 'sourceUrl');
    }
    return machineError(
      502,
      'storage_failed',
      `Upload to storage failed: ${err instanceof Error ? err.message : 'unknown error'}`
    );
  }

  // ── DB row ────────────────────────────────────────────────────────────────
  try {
    const creative = await createCreative({
      title:       input.title,
      description: input.description,
      caption:     input.captions.en,
      captionEs:   input.captions.es,
      captionPt:   input.captions.pt,
      externalId:  input.externalId,
      type:        isVideoMime(mimeType) ? 'VIDEO' : 'IMAGE',
      url:         blob.url,
      blobPath:    blob.pathname,
      fileName,
      fileSize:    limiter.bytes(),
      mimeType,
      sortOrder:   await nextCreativeSortOrder(),
      active:      input.active,
    });
    return NextResponse.json(
      { ok: true, created: true, creative: toMachineCreative(creative) },
      { status: 201 }
    );
  } catch (err) {
    // The file is stored but has no row — remove it so it isn't orphaned.
    await del(blob.url).catch((delErr) =>
      console.error('❌ Orphaned machine creative blob', { pathname: blob.pathname, delErr })
    );

    // Lost an idempotency race: a concurrent call with the same externalId won.
    if (
      input.externalId &&
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const existing = await findCreativeByExternalId(input.externalId);
      if (existing) {
        return NextResponse.json({ ok: true, created: false, creative: toMachineCreative(existing) });
      }
    }
    return machineError(
      500,
      'internal_error',
      err instanceof Error ? err.message : 'Could not save the creative.'
    );
  }
}
