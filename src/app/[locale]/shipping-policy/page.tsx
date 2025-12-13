import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ShippingPolicyPage() {
    const t = useTranslations('ShippingPolicy');

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
                        <h2 className="text-2xl font-bold text-black mb-4">{t('temperatureTitle')}</h2>
                        <p>{t('temperatureDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('fulfillmentTitle')}</h2>
                        <p>{t('fulfillmentDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('shippingOptionsTitle')}</h2>
                        <p>{t('shippingOptionsDesc1')}</p>
                        <p className="mt-4">{t('shippingOptionsDesc2')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('internationalTitle')}</h2>
                        <p>{t('internationalDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('damagedTitle')}</h2>
                        <p>{t('damagedDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('cancellationsTitle')}</h2>
                        <p>{t('cancellationsDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('lostPackagesTitle')}</h2>
                        <p>{t('lostPackagesDesc1')}</p>
                        <p className="mt-4 font-semibold">{t('lostPackagesDesc2')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('delaysTitle')}</h2>
                        <p>{t('delaysDesc')}</p>
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
