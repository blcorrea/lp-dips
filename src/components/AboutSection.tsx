"use client";

import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';

export default function AboutSection() {
    const t = useTranslations('About');

    return (
        <section id="about" className="bg-brand-cream">
            {/* Main About Content */}
            <div className="py-20 lg:py-28">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-7xl mx-auto">
                        {/* Left: Title */}
                        <ScrollReveal direction="left" delay={0.1} duration={0.8}>
                            <div>
                                <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-bold leading-[1.05] tracking-tight text-brand-purple">
                                    {t('titleLine1')}
                                    <br />
                                    {t('titleLine2')}
                                    <br />
                                    {t('titleLine3')}
                                </h2>
                            </div>
                        </ScrollReveal>

                        {/* Right: Description text */}
                        <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                            <div className="space-y-5 text-[17px] lg:text-lg leading-relaxed font-medium text-brand-charcoal">
                                <p>{t('p1')}</p>
                                <p>{t('p2')}</p>
                                <p>{t('p3')}</p>
                                <p>{t('p4')}</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            {/* Poetic line */}
            <div className="pb-10 lg:pb-14">
                <div className="container mx-auto px-6">
                    <div className="max-w-7xl mx-auto">
                        <ScrollReveal direction="up" delay={0.1} duration={0.8}>
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[60px] font-bold leading-[1.15] tracking-tight text-brand-purple italic">
                                {t('poeticLine1')}
                                <br />
                                {t('poeticLine2')}
                            </h3>
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

                            {/* Soft cinematic overlay */}
                            <div className="absolute inset-0 bg-black/12 pointer-events-none" />

                            {/* Soft vignette */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.18)_100%)] pointer-events-none" />
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}