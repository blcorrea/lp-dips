import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getAffiliateSessionId } from '@/lib/affiliate-auth';
import AffiliateLoginForm from './AffiliateLoginForm';

type Props = {
  params:      Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AffiliateDashboard' });
  return {
    title: `${t('loginTitle')} — Dips Chocolate`,
  };
}

export default async function AffiliateLoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error }  = await searchParams;

  const sessionId = await getAffiliateSessionId();
  if (sessionId) redirect(`/${locale}/affiliates/dashboard`);

  const t = await getTranslations({ locale, namespace: 'AffiliateDashboard' });

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-purple to-[#3b1c5a] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-brand-orange text-[12px] font-bold tracking-[0.18em] uppercase mb-3">
            {t('loginEyebrow')}
          </p>
          <h1 className="font-heading text-white text-[36px] sm:text-[44px] leading-[0.94] tracking-[-0.04em] mb-3">
            {t('loginTitle')}
          </h1>
          <p className="text-white/70 text-[16px]">
            {t('loginSubtitle')}
          </p>
        </div>
        <AffiliateLoginForm locale={locale} initialError={error ?? null} />
      </div>
    </main>
  );
}
