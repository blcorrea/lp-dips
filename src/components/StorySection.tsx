"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ScrollReveal from './animations/ScrollReveal';

const BADGE_KEYS = ["badge1", "badge2", "badge3"] as const;

/*
  Story — matched to the Figma "Ingredients" frame (1440x699, two halves):
  left photo panel 723px / right dark panel 717px (~50/50, was 45/55),
  both with 40px padding.

  Left panel is a justify-between COLUMN: the "10,000+ Happy Couples"
  badge sits at the TOP of the photo, the title/subtitle/badges block at
  the BOTTOM (we previously stacked everything at the bottom). Badges are
  15px-radius rounded rectangles with the 8px orange diamond glyph
  (dips-card-tint-2 tokens for the top badge, dips-card-lavender for the
  bottom row) -- not pills.

  Photo overlay: Figma is a straight top-to-bottom gradient
  rgba(241,90,34,.2) -> rgba(57,22,94,.2) (#F15A22 -> #39165E).

  Right panel: bg #0A0519 (dips-purple-deepest), content top-aligned (the
  Figma column is justify-between with a single child), heading in lilac
  #EBD9FE, body Filson Pro white.

  Font sizes run one step below the Figma spec (64->58, 54->48, 24->21,
  16->14, 14->13), carrying over the Hero's approved "thinner/smaller"
  treatment (user request; browser text renders visually heavier than
  Figma's canvas at equal declared size).
*/

function Diamond() {
    return (
        <span
            aria-hidden="true"
            className="inline-block h-2 w-2 shrink-0 rotate-[43deg] bg-brand-orange"
        />
    );
}

export default function StorySection() {
    const t = useTranslations('Story');

    return (
        <section id="story" className="scroll-mt-[72px] bg-dips-purple-deepest">
            <div className="grid lg:grid-cols-2">
                {/* Left column: photo, badge pinned top, title block pinned bottom */}
                <ScrollReveal direction="left" delay={0.1} duration={0.8}>
                    <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden p-6 lg:min-h-[699px] lg:p-10">
                        <Image
                            src="/images/redesign/story-couple-photo.png"
                            alt=""
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#f15a22]/20 to-[#39165e]/20" />

                        {/* TOP GROUP — badge + title + subtitle bundled together near
                            the top of the photo (Figma's first justify-between child,
                            645x249: badge, then title, then subtitle). User flagged
                            this was wrongly split before -- title/subtitle had drifted
                            down to the bottom group instead of staying with the badge. */}
                        <div className="relative z-10 flex flex-col gap-4">
                            <span className="inline-flex w-fit items-center gap-2 rounded-card border-2 border-dips-card-tint-2-border bg-dips-card-tint-2 px-[15px] py-3 text-[14px] font-bold text-[#eadae4]">
                                <Diamond />
                                {t('socialProof')}
                            </span>

                            {/* Figma authors "Made to be" / "Savoured by Two" as two
                                separate text layers (manual editorial break) -- forced
                                <br/> in en only, es/pt wrap naturally (same approach
                                as the Hero H1). */}
                            <h2 className="font-heading text-[58px] font-bold leading-[1.2] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
                                {t.rich('sideTitle', { br: () => <br /> })}
                            </h2>

                            <p className="font-body text-[21px] italic leading-[1.4] text-dips-text-lavender">
                                {t('subtitle')}
                            </p>
                        </div>

                        {/* BOTTOM GROUP — feature badges only, pushed to the bottom of
                            the photo by the panel's own justify-between (Figma's
                            second child, the 626x49 badge row). */}
                        <div className="relative z-10 flex flex-wrap items-center gap-3 lg:justify-between">
                            {BADGE_KEYS.map((key) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-2 rounded-card border-2 border-dips-card-lavender-border bg-dips-card-lavender px-[15px] py-3 font-card text-[13px] font-bold text-white"
                                >
                                    <Diamond />
                                    {t(key)}
                                </span>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Right column: dark panel, top-aligned, "Our Story" + 3 paragraphs */}
                <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                    <div className="flex h-full flex-col gap-6 bg-dips-purple-deepest p-6 py-12 lg:p-10">
                        <h2 className="font-heading text-[48px] font-bold leading-[1.2] text-dips-text-lavender">
                            {t('ourStoryTitle')}
                        </h2>

                        <div className="space-y-5 text-[21px] leading-[1.35] text-white">
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
