import { NextRequest, NextResponse } from 'next/server';
import { findActiveAffiliateByEmail, createLoginToken } from '@/lib/affiliate-tokens';
import { sendAffiliateMagicLinkEmail } from '@/lib/email-templates';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body  = await req.json() as Record<string, unknown>;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }

    const affiliate = await findActiveAffiliateByEmail(email);

    // Always return success to avoid email enumeration
    if (affiliate && affiliate.email) {
      const token     = await createLoginToken(affiliate.id);
      const firstName = affiliate.name.split(' ')[0];

      // Fire-and-forget — a send failure should not reveal whether the email exists
      sendAffiliateMagicLinkEmail(affiliate.email, firstName, token).catch((err) => {
        console.error('❌ Magic link email failed', { affiliateId: affiliate.id, err });
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
