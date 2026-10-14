import { NextRequest, NextResponse } from 'next/server';
import { machineError, readJsonObject, requireMachineAuth } from '@/lib/machine-api';
import { reviewSubmission } from '@/lib/ugc';
import { parseUgcReviewInput } from '@/lib/ugc-input';

type Params = { params: Promise<{ id: string }> };

// ── PATCH /api/machine/ugc/:id ───────────────────────────────────────────────
// Stores the machine's verdict, score and reasons; re-sending overwrites the
// previous review. Contract: docs/machine-api.md.

export async function PATCH(request: NextRequest, { params }: Params) {
  const authError = requireMachineAuth(request);
  if (authError) return authError;

  const parsedBody = await readJsonObject(request);
  if ('response' in parsedBody) return parsedBody.response;

  const review = parseUgcReviewInput(parsedBody.body);
  if (!review.ok) return machineError(400, 'invalid_field', review.message, review.field);

  const { id } = await params;
  const result = await reviewSubmission(id, review.value);
  if (!result.ok) {
    return result.reason === 'not_found'
      ? machineError(404, 'not_found', 'No UGC submission with this id.')
      : machineError(409, 'not_uploaded', 'This submission has no uploaded video yet.');
  }

  return NextResponse.json({ ok: true, submission: result.submission });
}
