import { NextRequest, NextResponse } from 'next/server';
import { machineError, requireMachineAuth } from '@/lib/machine-api';
import { listMachineSubmissions } from '@/lib/ugc';
import { parseUgcListQuery } from '@/lib/ugc-input';

// ── GET /api/machine/ugc?status=new|reviewed|all&limit=&cursor= ──────────────
// UGC queue for the creatives machine, oldest first. Contract: docs/machine-api.md.

export async function GET(request: NextRequest) {
  const authError = requireMachineAuth(request);
  if (authError) return authError;

  const query = parseUgcListQuery(request.nextUrl.searchParams);
  if (!query.ok) return machineError(400, 'invalid_field', query.message, query.field);

  const result = await listMachineSubmissions(query.value);
  if (!result) return machineError(400, 'invalid_field', 'Unknown cursor.', 'cursor');

  return NextResponse.json({ ok: true, ...result });
}
