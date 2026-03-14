"use client";

import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';

export default function FeaturesStrip() {
    const t = useTranslations('Product');

    const features = [
        { key: 'feature1' },
        { key: 'feature2' },
        { key: 'feature3' },
        { key: 'feature4' },
    ];

    return (
        <section className="bg-brand-purple py-10 lg:py-14">
            <div className="container mx-auto px-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <ScrollReveal key={feature.key} direction="up" delay={0.1 + index * 0.1} duration={0.6}>
                            <div className="bg-brand-cream rounded-sm px-5 py-5 h-full">
                                <p className="text-brand-charcoal text-[15px] lg:text-base font-medium leading-relaxed">
                                    {t(feature.key)}
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
