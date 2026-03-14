import LegalPageLayout from '@/components/LegalPageLayout';
import { getTranslations } from 'next-intl/server';

export default async function ShippingPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ShippingPolicy' });

  return (
    <LegalPageLayout title={t('title')} locale={locale}>
      <>
        <h2>{t('temperatureTitle')}</h2>
        <p>{t('temperatureDesc')}</p>

        <h2>{t('fulfillmentTitle')}</h2>
        <p>{t('fulfillmentDesc')}</p>

        <h2>{t('shippingOptionsTitle')}</h2>
        <p>{t('shippingOptionsDesc1')}</p>
        <p>{t('shippingOptionsDesc2')}</p>

        <h2>{t('internationalTitle')}</h2>
        <p>{t('internationalDesc')}</p>

        <h2>{t('damagedTitle')}</h2>
        <p>{t('damagedDesc')}</p>

        <h2>{t('cancellationsTitle')}</h2>
        <p>{t('cancellationsDesc')}</p>

        <h2>{t('lostPackagesTitle')}</h2>
        <p>{t('lostPackagesDesc1')}</p>
        <p>{t('lostPackagesDesc2')}</p>

        <h2>{t('delaysTitle')}</h2>
        <p>{t('delaysDesc')}</p>

        <p>
          <strong>{t('lastUpdated')}:</strong> December 2025
        </p>
      </>
    </LegalPageLayout>
  );
}