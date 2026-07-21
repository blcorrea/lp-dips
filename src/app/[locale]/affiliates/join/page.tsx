import { getTranslations } from 'next-intl/server';
import AffiliateJoinForm from './AffiliateJoinForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AffiliateJoin' });
  return {
    title: `${t('title')} — Dips Chocolate`,
    description: t('subtitle'),
  };
}

export default async function AffiliateJoinPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AffiliateJoin' });

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-purple to-[#3b1c5a] py-20 px-6">
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

        {/* Benefits + Form grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12 items-start">

          {/* Benefits */}
          <div className="space-y-4">
            {(['benefit1', 'benefit2', 'benefit3'] as const).map((key) => (
              <div
                key={key}
                className="flex items-center gap-4 rounded-[20px] bg-white/10 backdrop-blur-sm px-6 py-5"
              >
                <span className="text-brand-orange text-xl font-bold">✓</span>
                <p className="text-white font-medium text-[16px]">{t(key)}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <AffiliateJoinForm />
        </div>

      </div>
    </main>
  );
}
