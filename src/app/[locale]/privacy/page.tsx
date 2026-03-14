import LegalPageLayout from '@/components/LegalPageLayout';
import { getTranslations } from 'next-intl/server';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Privacy' });

  return (
    <LegalPageLayout title={t('title')} locale={locale}>
      <>
        <h2>{t('introTitle')}</h2>
        <p>{t('introDesc')}</p>

        <h2>{t('collectionTitle')}</h2>
        <p>{t('collectionDesc')}</p>
        <ul>
          <li>{t('collectionItem1')}</li>
          <li>{t('collectionItem2')}</li>
          <li>{t('collectionItem3')}</li>
          <li>{t('collectionItem4')}</li>
        </ul>

        <h2>{t('useTitle')}</h2>
        <p>{t('useDesc')}</p>

        <h2>{t('sharingTitle')}</h2>
        <p>{t('sharingDesc')}</p>

        <h2>{t('cookiesTitle')}</h2>
        <p>{t('cookiesDesc')}</p>

        <h2>{t('securityTitle')}</h2>
        <p>{t('securityDesc')}</p>

        <h2>{t('rightsTitle')}</h2>
        <p>{t('rightsDesc')}</p>

        <h2>{t('contactTitle')}</h2>
        <p>
          Dips Wellness Corporation
          <br />
          995 NW 165th Ave, Pembroke Pines, FL 33028
          <br />
          Email: info@dipschocolate.com
          <br />
          Phone: 754-457-6844
        </p>
      </>
    </LegalPageLayout>
  );
}