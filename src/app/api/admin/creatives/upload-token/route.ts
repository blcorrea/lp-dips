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
// onUploadCompleted is intentionally a no-op: it is an inbound webhook from
// Vercel's servers and cannot reach localhost (127.0.0.1). The DB row is
// created via a follow-up POST to /api/admin/creatives after upload() resolves
// on the client. See RESEARCH.md Pitfall 1.

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
      onUploadCompleted: async () => {
        // Intentionally no-op: DB row is created via follow-up POST from client.
        // onUploadCompleted is an inbound webhook from Vercel's servers and
        // cannot reach localhost (127.0.0.1). See RESEARCH.md Pitfall 1.
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
