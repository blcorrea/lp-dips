import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { ACCEPTED_IMAGE_MIME, ACCEPTED_VIDEO_MIME, MAX_CREATIVE_BYTES } from '@/lib/creatives';

// ── POST /api/admin/creatives/upload-token ────────────────────────────────────
//
// Issues a signed Vercel Blob client-upload token to authenticated admins.
// The token constrains the upload to the accepted MIME types and maximum file
// size defined in @/lib/creatives (D-06: single source of truth).
//
// Auth is checked TWICE (T-02-01):
//   1. At handler entry — returns 401 before handleUpload is called.
//   2. Inside onBeforeGenerateToken — defense-in-depth per ASVS V4.
//
// onUploadCompleted is intentionally OMITTED. It is an inbound webhook from
// Vercel's servers; on localhost no public callbackUrl can be derived, and when
// a callback IS configured the client's upload() blocks waiting for its
// confirmation — which never arrives locally, hanging the upload near 100%.
// The DB row is instead created via a follow-up POST to /api/admin/creatives
// after upload() resolves on the client. See RESEARCH.md Pitfall 1.

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Defense-in-depth: re-verify admin session before issuing the client token.
        // An attacker who obtains the route URL cannot escalate privilege because
        // isAdminAuthenticated() re-validates the session cookie here (Pitfall 3).
        if (!(await isAdminAuthenticated())) {
          throw new Error('Not authenticated');
        }
        return {
          allowedContentTypes: [...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME] as string[],
          maximumSizeInBytes: MAX_CREATIVE_BYTES,
          addRandomSuffix: true,
        };
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
