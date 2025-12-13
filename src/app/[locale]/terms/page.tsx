import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function TermsPage() {
    const t = useTranslations('Terms');

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
                        <h2 className="text-2xl font-bold text-black mb-4">{t('acceptanceTitle')}</h2>
                        <p>{t('acceptanceDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('ageRestrictionTitle')}</h2>
                        <p>{t('ageRestrictionDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('productInfoTitle')}</h2>
                        <p>{t('productInfoDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('purchaseTitle')}</h2>
                        <p>{t('purchaseDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('intellectualPropertyTitle')}</h2>
                        <p>{t('intellectualPropertyDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('limitationTitle')}</h2>
                        <p>{t('limitationDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('governingLawTitle')}</h2>
                        <p>{t('governingLawDesc')}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-black mb-4">{t('companyInfoTitle')}</h2>
                        <div className="space-y-2">
                            <p><strong>Legal Entity:</strong> Dips Wellness Corporation</p>
                            <p><strong>EIN:</strong> 41-2647662</p>
                            <p><strong>State of Registration:</strong> Florida</p>
                            <p><strong>Address:</strong> 995 NW 165th Ave, Pembroke Pines, FL 33028</p>
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
