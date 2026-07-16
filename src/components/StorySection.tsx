"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ScrollReveal from './animations/ScrollReveal';

const BADGE_KEYS = ["badge1", "badge2", "badge3"] as const;

export default function StorySection() {
    const t = useTranslations('Story');

    return (
        <section id="story" className="scroll-mt-[72px] bg-dips-purple-deepest">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                {/* Left column: photo + overlay heading + badges */}
                <ScrollReveal direction="left" delay={0.1} duration={0.8}>
                    <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden lg:min-h-[699px]">
                        <Image
                            src="/images/redesign/story-couple-photo.png"
                            alt=""
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-dips-purple-deepest/20" />

                        <div className="relative z-10 flex flex-col gap-6 p-card-padding pb-10 lg:p-12">
                            <h2 className="font-heading text-heading-side font-bold leading-[1.05] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
                                {t('sideTitle')}
                            </h2>

                            <div className="flex flex-wrap gap-3">
                                {BADGE_KEYS.map((key) => (
                                    <span
                                        key={key}
                                        className="rounded-full border border-dips-card-lavender-border bg-dips-card-lavender px-4 py-2 text-card-body font-medium text-white"
                                    >
                                        {t(key)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Right column: dark panel, "Our Story" + 3 merged paragraphs */}
                <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                    <div className="flex h-full flex-col justify-center gap-6 bg-dips-purple-deepest p-card-padding py-16 lg:p-16">
                        <h2 className="font-heading text-heading-lg font-bold leading-[1.15] text-dips-text-lavender">
                            {t('ourStoryTitle')}
                        </h2>

                        <div className="space-y-5 text-body-lg leading-[1.5] text-white">
                            <p>{t('p1')}</p>
                            <p>{t('p2')}</p>
                            <p>{t('p3')}</p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
