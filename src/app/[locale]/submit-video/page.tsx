import { getTranslations } from 'next-intl/server';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { getAffiliateSessionId } from '@/lib/affiliate-auth';
import { getUgcAffiliate } from '@/lib/ugc';
import SubmitVideoForm from './SubmitVideoForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'UgcSubmit' });
  return {
    title: `${t('metaTitle')} — Dips Chocolate`,
    description: t('subtitle'),
  };
}

export default async function SubmitVideoPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'UgcSubmit' });

  // Public page; a logged-in affiliate gets their details pre-filled and the
  // submission is credited to them (decided again server-side in POST /api/ugc).
  const affiliate = await getUgcAffiliate(await getAffiliateSessionId());

  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-gradient-to-b from-dips-purple-hero-start from-0% via-dips-purple-hero-mid via-[57.4%] to-dips-purple-hero-end to-100% py-20 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-brand-orange text-[12px] font-bold tracking-[0.18em] uppercase mb-3">
            {t('eyebrow')}
          </p>
          <h1 className="font-heading text-white text-[42px] sm:text-[56px] lg:text-[68px]
            leading-[0.94] tracking-[-0.04em] mb-5">
            {t('title')}
          </h1>
          <p className="text-white/75 text-[17px] sm:text-[19px] leading-relaxed max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Tips + Form grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12 items-start">

          <div className="space-y-4">
            {(['tip1', 'tip2', 'tip3'] as const).map((key) => (
              <div
                key={key}
                className="flex items-center gap-4 rounded-[20px] bg-white/10 backdrop-blur-sm px-6 py-5"
              >
                <span className="text-brand-orange text-xl font-bold">✓</span>
                <p className="text-white font-medium text-[16px]">{t(key)}</p>
              </div>
            ))}
          </div>

          <SubmitVideoForm
            affiliate={
              affiliate
                ? {
                    name:      affiliate.name,
                    email:     affiliate.email ?? '',
                    instagram: affiliate.instagram ?? '',
                    ref:       affiliate.ref,
                  }
                : null
            }
          />
        </div>

      </div>
      </main>
      <LandingFooter />
    </>
  );
}
