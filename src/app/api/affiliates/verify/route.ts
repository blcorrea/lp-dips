import { NextRequest, NextResponse } from 'next/server';
import { consumeLoginToken } from '@/lib/affiliate-tokens';
import { setAffiliateSession } from '@/lib/affiliate-auth';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get('token') ?? '';

  if (!token) {
    return NextResponse.redirect(new URL('/en/affiliates/login?error=invalid', req.nextUrl.origin));
  }

  const affiliateId = await consumeLoginToken(token);

  if (!affiliateId) {
    return NextResponse.redirect(new URL('/en/affiliates/login?error=expired', req.nextUrl.origin));
  }

  const dashboardUrl = new URL('/en/affiliates/dashboard', req.nextUrl.origin);
  const res = NextResponse.redirect(dashboardUrl);
  return setAffiliateSession(res, affiliateId);
}
