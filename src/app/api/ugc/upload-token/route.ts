import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getUploadableSubmission } from '@/lib/ugc';
import { UGC_ACCEPTED_MIME, UGC_MAX_BYTES } from '@/lib/ugc-input';

// ── POST /api/ugc/upload-token ───────────────────────────────────────────────
//
// Issues a Vercel Blob client-upload token for a public UGC video. Public by
// design, but each token is bound to an existing PENDING_UPLOAD submission
// (passed as clientPayload) inside its upload window, may only write under
// ugc/<submissionId>/, and is limited to video types and UGC_MAX_BYTES.
//
// onUploadCompleted is omitted for the same reason as the admin creatives
// route (no callback on localhost; the client would hang near 100%). The
// browser confirms via POST /api/ugc/:id/complete instead, which re-verifies
// the stored blob server-side.

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const submissionId = typeof clientPayload === 'string' ? clientPayload : '';
        const submission = submissionId ? await getUploadableSubmission(submissionId) : null;
        if (!submission) throw new Error('Submission not found or upload window expired');
        if (!pathname.startsWith(`ugc/${submission.id}/`)) throw new Error('Invalid upload path');
        return {
          allowedContentTypes: [...UGC_ACCEPTED_MIME],
          maximumSizeInBytes:  UGC_MAX_BYTES,
          addRandomSuffix:     true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
