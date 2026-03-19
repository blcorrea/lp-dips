"use client";

import { useTranslations } from 'next-intl';
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
        <section id="product" className="bg-brand-orange/5 py-10 lg:py-14">
            <div className="container mx-auto px-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <ScrollReveal
                            key={feature.titleKey}
                            direction="up"
                            delay={0.1 + index * 0.1}
                            duration={0.6}
                        >
                            <div className="text-brand-purple">
                                <p className="text-[15px] lg:text-base leading-relaxed">
                                    <span className="font-bold">{t(feature.titleKey)}</span>{' '}
                                    <span className="font-normal text-brand-charcoal/85">{t(feature.descKey)}</span>
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                <ScrollReveal direction="up" delay={0.5} duration={0.6}>
                    <div className="flex justify-center mt-10 lg:mt-12">
                    <a
                        href="#buy"
                        className="inline-flex items-center justify-center rounded-[20px] bg-brand-orange px-8 sm:px-8 py-3.5 sm:py-3.5 min-h-[56px] min-w-[210px] max-w-[280px] text-center font-body text-[15px] sm:text-[15px] font-bold text-brand-purple leading-[1.1] whitespace-nowrap shadow-[0_10px_24px_rgba(242,117,33,0.22)] transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90"
                    >
                        {t('cta')}
                    </a>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}