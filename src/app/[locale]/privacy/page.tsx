import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PrivacyPage() {
    const t = useTranslations('Privacy');

    return (
        <main className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <Link
                    href="/"
                    className="inline-block mb-8 text-brand-orange hover:text-brand-purple transition-colors font-medium"
                >
                    ← {t('backToHome')}
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold text-black mb-8">
                    {t('title')}
                </h1>

                <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('introTitle')}</h2>
                        <p>{t('introDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('collectionTitle')}</h2>
                        <p>{t('collectionDesc')}</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>{t('collectionItem1')}</li>
                            <li>{t('collectionItem2')}</li>
                            <li>{t('collectionItem3')}</li>
                            <li>{t('collectionItem4')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('useTitle')}</h2>
                        <p>{t('useDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('sharingTitle')}</h2>
                        <p>{t('sharingDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('cookiesTitle')}</h2>
                        <p>{t('cookiesDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('securityTitle')}</h2>
                        <p>{t('securityDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('rightsTitle')}</h2>
                        <p>{t('rightsDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('contactTitle')}</h2>
                        <div className="space-y-2">
                            <p><strong>Dips Wellness Corporation</strong></p>
                            <p>995 NW 165th Ave, Pembroke Pines, FL 33028</p>
                            <p>Email: <a href="mailto:info@dipschocolate.com" className="text-brand-orange hover:underline">info@dipschocolate.com</a></p>
                            <p>Phone: <a href="tel:754-457-6844" className="text-brand-orange hover:underline">754-457-6844</a></p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 p-6 bg-brand-gray-light rounded-lg">
                    <p className="text-sm text-gray-600">
                        {t('lastUpdated')}: December 2025
                    </p>
                </div>
            </div>
        </main>
    );
}
