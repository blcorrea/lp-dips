import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ReturnPolicyPage() {
    const t = useTranslations('ReturnPolicy');

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
                        <h2 className="text-2xl font-bold text-black mb-4">{t('initiatingTitle')}</h2>
                        <p>{t('initiatingDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('damagedTitle')}</h2>
                        <p>{t('damagedDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('chocolatePiecesTitle')}</h2>
                        <p>{t('chocolatePiecesDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('shippingLabelsTitle')}</h2>
                        <p>{t('shippingLabelsDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('helpingImproveTitle')}</h2>
                        <p>{t('helpingImproveDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('refundsTitle')}</h2>
                        <p>{t('refundsDesc')}</p>
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
