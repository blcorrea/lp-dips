import { NextRequest, NextResponse } from 'next/server';
import { del, head } from '@vercel/blob';
import { completeSubmissionUpload, getUploadableSubmission } from '@/lib/ugc';
import { UGC_MAX_BYTES, isUgcVideoMime } from '@/lib/ugc-input';

type Params = { params: Promise<{ id: string }> };

// ── POST /api/ugc/:id/complete ───────────────────────────────────────────────
//
// Step 3 of the submit flow: the browser reports the uploaded blob URL. The
// blob is looked up server-side with head() — the client's claims about it are
// never trusted — and must live under ugc/<id>/, be a video and fit the size
// limit. Only then does the submission become NEW (visible to the machine).

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;

  let url = '';
  try {
    const body = (await request.json()) as { url?: unknown };
    url = typeof body?.url === 'string' ? body.url : '';
  } catch {
    // fall through to the validation error below
  }
  if (!url) return NextResponse.json({ error: 'invalid_field', field: 'url' }, { status: 400 });

  if (!(await getUploadableSubmission(id))) {
    return NextResponse.json({ error: 'not_uploadable' }, { status: 409 });
  }

  let blob: Awaited<ReturnType<typeof head>>;
  try {
    blob = await head(url);
  } catch {
    return NextResponse.json({ error: 'invalid_upload' }, { status: 400 });
  }
  if (!blob.pathname.startsWith(`ugc/${id}/`)) {
    return NextResponse.json({ error: 'invalid_upload' }, { status: 400 });
  }
  if (!isUgcVideoMime(blob.contentType) || blob.size > UGC_MAX_BYTES) {
    await del(blob.url).catch(() => {});
    return NextResponse.json({ error: 'invalid_upload' }, { status: 400 });
  }

  const completed = await completeSubmissionUpload(id, {
    url:         blob.url,
    pathname:    blob.pathname,
    size:        blob.size,
    contentType: blob.contentType,
    fileName:    blob.pathname.split('/').pop() ?? 'video',
  });
  if (!completed) return NextResponse.json({ error: 'not_uploadable' }, { status: 409 });

  return NextResponse.json({ ok: true });
}
