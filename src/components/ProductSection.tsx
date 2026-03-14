"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ScrollReveal from './animations/ScrollReveal';

export default function ProductSection() {
    const t = useTranslations('Product');
   
    

    const features = [
        { titleKey: 'feature1_title', descKey: 'feature1_desc' },
        { titleKey: 'feature2_title', descKey: 'feature2_desc' },
        { titleKey: 'feature3_title', descKey: 'feature3_desc' },
        { titleKey: 'feature4_title', descKey: 'feature4_desc' },
    ];

    return (
        <section id="product" className="bg-brand-purple py-10 lg:py-14">
            <div className="container mx-auto px-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <ScrollReveal
                            key={feature.titleKey}
                            direction="up"
                            delay={0.1 + index * 0.1}
                            duration={0.6}
                        >
                            <div className="text-white">
                                <p className="text-[15px] lg:text-base leading-relaxed">
                                    <span className="font-bold">{t(feature.titleKey)}</span>{' '}
                                    <span className="font-normal text-white/90">{t(feature.descKey)}</span>
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                <ScrollReveal direction="up" delay={0.5} duration={0.6}>
                    <div className="flex justify-center mt-10 lg:mt-12">
                        <Link
                            href="/product/dips-chocolate"
                            className="inline-flex items-center justify-center rounded-full bg-brand-orange px-10 py-4 text-base sm:text-lg font-bold text-brand-purple tracking-wide shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90 hover:shadow-[0_14px_34px_rgba(242,117,33,0.34)]"
                        >
                            {t('cta')}
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}