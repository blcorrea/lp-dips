import { NextRequest, NextResponse, after } from 'next/server';
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
      const to        = affiliate.email;
      const id        = affiliate.id;

      // Send after the response is flushed. `after()` keeps the serverless
      // function alive until the send completes; a plain fire-and-forget promise
      // is killed when the function freezes, so the email never goes out. Sending
      // after the response also keeps response timing constant (anti-enumeration).
      after(async () => {
        try {
          await sendAffiliateMagicLinkEmail(to, firstName, token);
        } catch (err) {
          console.error('❌ Magic link email failed', { affiliateId: id, err });
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
