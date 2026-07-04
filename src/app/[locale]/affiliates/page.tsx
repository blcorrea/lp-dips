import { redirect } from 'next/navigation';
import { getAffiliateSessionId } from '@/lib/affiliate-auth';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AffiliatesIndexPage({ params }: Props) {
  const { locale } = await params;
  const sessionId = await getAffiliateSessionId();

  if (sessionId) {
    redirect(`/${locale}/affiliates/dashboard`);
  }

  redirect(`/${locale}/affiliates/join`);
}
