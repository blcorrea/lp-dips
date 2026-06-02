import { NextResponse } from 'next/server';
import { clearAffiliateSession } from '@/lib/affiliate-auth';

export async function POST(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  return clearAffiliateSession(res);
}
