import LegalPageLayout from '@/components/LegalPageLayout';
import { getTranslations } from 'next-intl/server';

export default async function ReturnPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ReturnPolicy' });

  return (
    <LegalPageLayout title={t('title')} locale={locale}>
      <>
        <h2>{t('initiatingTitle')}</h2>
        <p>{t('initiatingDesc')}</p>

        <h2>{t('damagedTitle')}</h2>
        <p>{t('damagedDesc')}</p>

        <h2>{t('chocolatePiecesTitle')}</h2>
        <p>{t('chocolatePiecesDesc')}</p>

        <h2>{t('shippingLabelsTitle')}</h2>
        <p>{t('shippingLabelsDesc')}</p>

        <h2>{t('helpingImproveTitle')}</h2>
        <p>{t('helpingImproveDesc')}</p>

        <h2>{t('refundsTitle')}</h2>
        <p>{t('refundsDesc')}</p>

        <h2>{t('delaysTitle')}</h2>
        <p>{t('delaysDesc')}</p>

        <p>
          <strong>{t('lastUpdated')}:</strong> December 2025
        </p>
      </>
    </LegalPageLayout>
  );
}