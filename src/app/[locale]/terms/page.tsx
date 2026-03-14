import LegalPageLayout from '@/components/LegalPageLayout';
import { getTranslations } from 'next-intl/server';

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Terms' });

  return (
    <LegalPageLayout title={t('title')} locale={locale}>
      <>
        <h2>{t('acceptanceTitle')}</h2>
        <p>{t('acceptanceDesc')}</p>

        <h2>{t('ageRestrictionTitle')}</h2>
        <p>{t('ageRestrictionDesc')}</p>

        <h2>{t('productInfoTitle')}</h2>
        <p>{t('productInfoDesc')}</p>

        <h2>{t('purchaseTitle')}</h2>
        <p>{t('purchaseDesc')}</p>

        <h2>{t('intellectualPropertyTitle')}</h2>
        <p>{t('intellectualPropertyDesc')}</p>

        <h2>{t('limitationTitle')}</h2>
        <p>{t('limitationDesc')}</p>

        <h2>{t('governingLawTitle')}</h2>
        <p>{t('governingLawDesc')}</p>

        <h2>{t('companyInfoTitle')}</h2>
        <p>
          Dips Wellness Corporation
          <br />
          995 NW 165th Ave, Pembroke Pines, FL 33028
          <br />
          EIN: 41-2647662
          <br />
          Registered in Florida
        </p>

        <p>
          <strong>{t('lastUpdated')}:</strong> December 2025
        </p>
      </>
    </LegalPageLayout>
  );
}