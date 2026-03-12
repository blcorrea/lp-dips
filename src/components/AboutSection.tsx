"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ScrollReveal from './animations/ScrollReveal';

export default function AboutSection() {
    const t = useTranslations('About');

    return (
        <section id="about" className="bg-brand-cream">
            <div className="py-20 lg:py-28">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start max-w-7xl mx-auto">
                        <ScrollReveal direction="left" delay={0.1} duration={0.8}>
                            <div>
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[72px] font-bold leading-[1.05] tracking-tight text-brand-purple">
                                    {t('titleLine1')}
                                    <br />
                                    {t('titleLine2')}
                                    <br />
                                    {t('titleLine3')}
                                </h2>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                            <div className="space-y-6 text-[16px] lg:text-[17px] leading-[1.9] font-normal text-brand-charcoal">
                                <p>{t('p1')}</p>
                                <p>{t('p2')}</p>
                                <p>{t('p3')}</p>
                                <p>{t('p4')}</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            <div className="pb-12 lg:pb-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-7xl mx-auto">
                        <ScrollReveal direction="up" delay={0.1} duration={0.8}>
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[56px] font-bold leading-[1.15] tracking-tight text-brand-purple italic">
                                {t('poeticLine1')}
                                <br />
                                {t('poeticLine2')}
                            </h3>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            <div className="relative w-full h-[340px] sm:h-[420px] lg:h-[500px]">
                <Image
                    src="/images/couple-banner.png"
                    alt="Couple sharing an intimate moment"
                    fill
                    className="object-cover object-[center_20%]"
                />
            </div>
        </section>
    );
}