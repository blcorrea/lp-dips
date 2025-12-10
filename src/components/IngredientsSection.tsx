"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

export default function IngredientsSection() {
    const t = useTranslations('Ingredients');

    return (
        <section id="ingredients" className="bg-brand-purple py-24 lg:py-32">
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Orange Title */}
                    <h2 className="text-5xl lg:text-7xl font-bold text-center lg:text-left text-brand-orange leading-tight tracking-tight mb-16 lg:mb-24">
                        {t('title')}
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
                        {/* Left Column: Intro + Image */}
                        <div className="space-y-12">
                            <div className="space-y-6 text-white text-lg lg:text-xl font-medium leading-relaxed">
                                <p>{t('intro1')}</p>
                                <p>{t('intro2')}</p>
                            </div>

                            {/* Circular Image with Orange Background */}
                            <div className="relative w-64 h-64 lg:w-96 lg:h-96 mx-auto lg:mx-0">
                                <div className="absolute inset-0 bg-brand-orange rounded-full"></div>
                                <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                    {/* Placeholder for Hand Image */}
                                    <Image
                                        src="/images/hero-1.png"
                                        alt="Dips Experience"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Ingredients List */}
                        <div className="space-y-10">
                            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-8">
                                {t('listTitle')}
                            </h3>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-brand-orange">{t('macaTitle')}</h4>
                                    <p className="text-white/90 text-lg leading-relaxed">{t('macaDesc')}</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-brand-orange">{t('theanineTitle')}</h4>
                                    <p className="text-white/90 text-lg leading-relaxed">{t('theanineDesc')}</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-brand-orange">{t('gingerTitle')}</h4>
                                    <p className="text-white/90 text-lg leading-relaxed">{t('gingerDesc')}</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-brand-orange">{t('fenugreekTitle')}</h4>
                                    <p className="text-white/90 text-lg leading-relaxed">{t('fenugreekDesc')}</p>
                                </div>
                            </div>

                            <div className="pt-8">
                                <Link
                                    href="/ingredients-pdf"
                                    className="inline-block bg-brand-orange text-white text-lg font-bold px-8 py-3 rounded-full hover:bg-white hover:text-brand-orange transition-colors shadow-lg"
                                >
                                    {t('viewPdf')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
