"use client";

import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';

export default function AboutSection() {
    const t = useTranslations('About');

    return (
        <section id="about" className="bg-brand-cream">
            <div className="py-20 lg:py-28">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-20 items-start max-w-7xl mx-auto">
                        {/* Left column */}
                        <div className="flex flex-col">
                            <ScrollReveal direction="left" delay={0.1} duration={0.8}>
                                <div>
                                    <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold leading-[0.98] tracking-[-0.04em] text-brand-purple">
                                        {t('titleLine1')}
                                        <br />
                                        {t('titleLine2')}
                                        <br />
                                        {t('titleLine3')}
                                    </h2>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal direction="up" delay={0.2} duration={0.8}>
                                <div className="mt-12 lg:mt-14">
                                    <p className="font-heading text-brand-purple italic font-semibold text-2xl sm:text-3xl lg:text-[42px] leading-[1.02] tracking-[-0.03em]">
                                        {t('poeticLine1')}
                                        <br />
                                        {t('poeticLine2')}
                                    </p>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Right column */}
                        <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                            <div className="space-y-5 text-[16px] sm:text-[17px] lg:text-[18px] leading-[1.65] font-body font-medium text-brand-charcoal max-w-[620px]">
                                <p>{t('p1')}</p>
                                <p>{t('p2')}</p>
                                <p>{t('p3')}</p>
                                <p>{t('p4')}</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            {/* Couple Video Banner */}
            <div className="pb-4">
                <div className="max-w-[1800px] mx-auto px-0 sm:px-4 lg:px-6">
                    <ScrollReveal direction="up" delay={0.15} duration={0.9}>
                        <div className="relative w-full h-[280px] sm:h-[350px] lg:h-[420px] overflow-hidden rounded-none sm:rounded-[28px] bg-black">
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                className="
                                    w-full h-full
                                    object-cover
                                    sm:object-contain
                                    scale-[1.02]
                                    hover:scale-[1.05]
                                    transition-transform
                                    duration-[2000ms]
                                "
                            >
                                <source src="/videos/couple-dips.mp4" type="video/mp4" />
                            </video>

                            <div className="absolute inset-0 bg-black/12 pointer-events-none" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.18)_100%)] pointer-events-none" />
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}