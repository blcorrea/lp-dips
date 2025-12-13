"use client";

import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';

export default function AboutSection() {
    const t = useTranslations('About');

    return (
        <section id="about" className="bg-brand-orange py-24 lg:py-32">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto space-y-16">
                    {/* Centered Title */}
                    <ScrollReveal direction="up" delay={0.1} duration={0.8}>
                        <h2 className="text-6xl lg:text-8xl font-bold text-brand-purple text-center tracking-tight leading-none mb-12">
                            {t('title')}
                        </h2>
                    </ScrollReveal>

                    {/* Two Column Text */}
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-24 text-left">
                        <ScrollReveal direction="left" delay={0.2} duration={0.8}>
                            <div className="space-y-6">
                                <p className="text-white text-lg lg:text-xl leading-relaxed font-medium">
                                    {t('col1_p1')}
                                </p>
                                <p className="text-white text-lg lg:text-xl leading-relaxed font-medium">
                                    {t('col1_p2')}
                                </p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                            <div className="space-y-6">
                                <p className="text-white text-lg lg:text-xl leading-relaxed font-medium">
                                    {t('col2_p1')}
                                </p>
                                <p className="text-white text-lg lg:text-xl leading-relaxed font-medium">
                                    {t('col2_p2')}
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
