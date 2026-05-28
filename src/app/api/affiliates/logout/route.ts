import { NextRequest, NextResponse } from 'next/server';
import { clearAffiliateSession } from '@/lib/affiliate-auth';

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  return clearAffiliateSession(res);
}
