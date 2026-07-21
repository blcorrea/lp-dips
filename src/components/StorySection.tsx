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
                {/* Left column: photo, badge pinned top, title block pinned bottom.
                    Mobile (RESP-02): Figma's 375px mobile frame keeps the same
                    699px photo height as desktop (was min-h-[420px], too
                    short). */}
                <ScrollReveal direction="left" delay={0.1} duration={0.8}>
                    <div className="relative flex min-h-[699px] flex-col justify-between overflow-hidden p-6 lg:p-10">
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
                        {/* Mobile (RESP-02): tighter gap (10px, was 16px) matching
                            the Figma mobile frame's badge/title/subtitle stack. */}
                        <div className="relative z-10 flex flex-col gap-2.5 lg:gap-4">
                            <span className="inline-flex w-fit items-center gap-2 rounded-card border-2 border-dips-card-tint-2-border bg-dips-card-tint-2 p-3 text-[12px] font-bold text-[#eadae4] lg:px-[15px] lg:py-3 lg:text-[14px]">
                                <Diamond />
                                {t('socialProof')}
                            </span>

                            {/* Figma authors "Made to be" / "Savoured by Two" as two
                                separate text layers (manual editorial break) -- forced
                                <br/> in en only, es/pt wrap naturally (same approach
                                as the Hero H1). Mobile (RESP-02): 58px -> 48px, one
                                step below the Figma mobile spec (54px), same
                                convention as desktop. */}
                            <h2 className="font-heading text-[48px] font-bold leading-[1.2] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] lg:text-[58px]">
                                {t.rich('sideTitle', { br: () => <br /> })}
                            </h2>

                            {/* Mobile (RESP-02): 21px -> 14px, one step below the
                                Figma mobile spec (16px). */}
                            <p className="font-body text-[14px] italic leading-[1.4] text-dips-text-lavender lg:text-[21px]">
                                {t('subtitle')}
                            </p>
                        </div>

                        {/* BOTTOM GROUP — feature badges only, pushed to the bottom of
                            the photo by the panel's own justify-between (Figma's
                            second child, the 626x49 badge row).

                            Mobile (RESP-02): Figma's mobile frame stacks these in a
                            column (gap 15), each badge sized to its own content --
                            was a wrapped row, which is the lg-only treatment. */}
                        <div className="relative z-10 flex flex-col items-start gap-[15px] lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
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

                {/* Right column: dark panel, "Our Story" + 3 paragraphs vertically
                    centered against the section's full height (matches the
                    left photo panel's height via the grid's default
                    items-stretch) -- user request, was top-aligned.

                    Mobile (RESP-02): tighter padding/gap matching the Figma
                    mobile frame (25px padding, 10px gap) -- was p-6 py-12
                    (48px vertical) + gap-6, noticeably more open than the
                    mobile spec. lg keeps the existing desktop spacing. */}
                <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                    <div className="flex h-full flex-col justify-center gap-2.5 bg-dips-purple-deepest p-6 lg:gap-6 lg:p-10">
                        {/* Mobile (RESP-02): 48px -> 40px, one step below the
                            Figma mobile spec (44px). */}
                        <h2 className="font-heading text-[40px] font-bold leading-[1.2] text-dips-text-lavender lg:text-[48px]">
                            {t('ourStoryTitle')}
                        </h2>

                        {/* Mobile (RESP-02): 21px -> 13px, one step below the
                            Figma mobile spec (14px). */}
                        <div className="space-y-2.5 text-[13px] leading-[1.3] text-white lg:space-y-5 lg:text-[21px] lg:leading-[1.35]">
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
