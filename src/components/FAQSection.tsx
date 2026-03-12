"use client";

import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';

export default function FAQSection() {
    const t = useTranslations('FAQ');
    const faqs = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

    return (
        <section id="faq" className="bg-brand-cream py-20 lg:py-28">
            <div className="container mx-auto px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Title */}
                    <ScrollReveal direction="up" delay={0.1} duration={0.8}>
                        <div className="mb-14 lg:mb-16">
                            <div className="bg-brand-purple px-8 py-5 lg:px-12 lg:py-6 rounded-[4px]">
                                <h2 className="text-center text-brand-cream text-3xl sm:text-4xl lg:text-5xl xl:text-[56px] font-bold tracking-tight leading-[1.05]">
                                    {t('title')}
                                </h2>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* FAQ Items */}
                    <div className="space-y-9 lg:space-y-10">
                        {faqs.map((q, index) => (
                            <ScrollReveal
                                key={q}
                                direction="up"
                                delay={0.1 + index * 0.08}
                                duration={0.6}
                            >
                                <div className="border-b border-brand-purple/10 pb-7 last:border-b-0 last:pb-0">
                                    <h3 className="mb-3 text-base lg:text-[19px] font-bold text-brand-purple leading-snug">
                                        {t(q)}
                                    </h3>
                                    <p className="text-brand-charcoal text-[15px] lg:text-[16px] leading-[1.75] font-normal">
                                        {t(q.replace('q', 'a'))}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}