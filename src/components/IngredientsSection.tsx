"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';
import { cn } from '@/lib/utils';

interface Ingredient {
  nameKey: string;
  keywordKey: string;
  image: string;
  descKey: string;
  originsTitleKey: string;
  originsKey: string;
}

const INGREDIENTS: Ingredient[] = [
  {
    nameKey: 'cocoa_name',
    keywordKey: 'cocoa_keyword',
    image: '/images/redesign/ing-icon-cocoa.png',
    descKey: 'cocoa_desc',
    originsTitleKey: 'cocoa_originsTitle',
    originsKey: 'cocoa_origins',
  },
  {
    nameKey: 'maca_name',
    keywordKey: 'maca_keyword',
    image: '/images/redesign/ing-icon-maca.png',
    descKey: 'maca_desc',
    originsTitleKey: 'maca_originsTitle',
    originsKey: 'maca_origins',
  },
  {
    nameKey: 'ginger_name',
    keywordKey: 'ginger_keyword',
    image: '/images/redesign/ing-icon-ginger.png',
    descKey: 'ginger_desc',
    originsTitleKey: 'ginger_originsTitle',
    originsKey: 'ginger_origins',
  },
  {
    nameKey: 'theanine_name',
    keywordKey: 'theanine_keyword',
    image: '/images/redesign/ing-icon-theanine.png',
    descKey: 'theanine_desc',
    originsTitleKey: 'theanine_originsTitle',
    originsKey: 'theanine_origins',
  },
  {
    nameKey: 'blend_name',
    keywordKey: 'blend_keyword',
    image: '/images/redesign/ing-icon-herbal.png',
    descKey: 'blend_desc',
    originsTitleKey: 'blend_originsTitle',
    originsKey: 'blend_origins',
  },
  {
    nameKey: 'fenugreek_name',
    keywordKey: 'fenugreek_keyword',
    image: '/images/redesign/ing-icon-fenugreek.png',
    descKey: 'fenugreek_desc',
    originsTitleKey: 'fenugreek_originsTitle',
    originsKey: 'fenugreek_origins',
  },
];

/*
  Ingredients — matched to the Figma frame (1440x839, two 723/717 panels,
  both bg #1A0A2E = dips-purple-section, 40px padding).

  The Figma is a static mock showing "Premium Arriba Cocoa Nibs" selected;
  per the user, the section is INTERACTIVE: clicking a row on the left
  selects that ingredient -- the selected row expands (warm highlight
  colors + a one-line description under the name, exactly the Figma
  selected-state anatomy) and the right detail card (icon, name, tag,
  description, Origins & Curiosities) switches to it. Copy comes from the
  existing i18n keys migrated from the old site's ingredient carousel.

  Figma anatomy per row: [icon 44/35px] [name Satoshi 700 + keyword pill
  (rounded-full, 2px #5B2F2D border, rgba(55,22,41,.15) bg, 5px diamond,
  Satoshi 700 10px uppercase)] and, selected only, desc Satoshi 400
  #96838F. Selected row: bg #371629 border #5B2F2D (ingredient-hl tokens);
  unselected: bg #231435 border #39294C (ingredient tokens).

  Right panel: intro Satoshi 24px #AE9BDA (lavender-muted token), detail
  card bg rgba(49,34,89,.15) border rgba(57,41,76,.5), inner curiosities
  card bg rgba(55,22,41,.4) border rgba(91,47,45,.4).

  Font sizes run one step below the Figma spec (48->44, 24->21, 20->18,
  16->14/15, 14->13), carrying over the Hero/Story approved treatment.
*/

function Diamond({ size = 8 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="inline-block shrink-0 rotate-[43deg] bg-brand-orange"
    />
  );
}

function KeywordPill({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-[5px] rounded-full border-2 border-dips-card-ingredient-hl-border bg-[rgba(55,22,41,0.15)] px-[15px] py-[6px] font-card text-[10px] font-bold uppercase leading-[14px] text-white">
      <Diamond size={5} />
      {label}
    </span>
  );
}

export default function IngredientsSection() {
  const t = useTranslations('Ingredients');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = INGREDIENTS[selectedIndex];

  return (
    <section
      id="ingredients"
      className="scroll-mt-[72px] bg-dips-purple-section"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-2">
        {/* LEFT PANEL: badge + eyebrow + title + interactive ingredient list.
            Mobile (RESP-03): p-6 (was p-6 py-12, the extra py-12 doubled the
            Figma mobile spec's ~25px breathing room); lg keeps py-12. */}
        <div className="flex flex-col justify-center p-6 lg:py-12 lg:p-10">
          {/* className="flex flex-col" here so order-* below (title before
              eyebrow on mobile, per RESP-03) actually applies -- order only
              works between flex/grid siblings, and ScrollReveal's own
              wrapper div has no display set otherwise. */}
          <ScrollReveal direction="up" delay={0.1} duration={0.8} className="flex flex-col">
            {/* Mobile (RESP-03): p-3/12px, was px-[15px] py-3/14px. */}
            <span className="order-0 inline-flex w-fit items-center gap-2 rounded-card border-2 border-dips-card-tint-2-border bg-dips-card-tint-2 p-3 text-[12px] font-bold text-[#eadae4] lg:px-[15px] lg:py-3 lg:text-[14px]">
              <Diamond />
              {t('socialProof')}
            </span>

            {/* Mobile (RESP-03): Figma's mobile frame shows the TITLE first
                and the eyebrow AFTER it (inverted vs. desktop) -- order-*
                swaps them without duplicating markup. Sizes: title 44->40px,
                eyebrow 18->14px (one step below the Figma mobile spec). */}
            <h2 className="order-1 mt-6 font-heading text-[40px] font-bold leading-[1.2] text-white lg:order-2 lg:mb-8 lg:mt-0 lg:text-[44px]">
              {t('sectionTitle')}
            </h2>
            <p className="order-2 mb-6 mt-1 font-body text-[14px] italic leading-[1.2] text-dips-text-lavender lg:order-1 lg:mb-1 lg:mt-6 lg:text-[18px]">
              {t('eyebrow')}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.15} duration={0.6}>
            <div className="flex flex-col gap-[10px]">
              {INGREDIENTS.map((ingredient, index) => {
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={ingredient.nameKey}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-pressed={isSelected}
                    className={cn(
                      // Hover = a pure visual "lift" (scale + upward
                      // translate + glow), same on every card regardless of
                      // selection -- the highlight COLOR only ever changes on
                      // click (isSelected below), never on hover, per user
                      // request. hover:z-10 keeps the lifted card above its
                      // neighbors instead of being clipped underneath them
                      // while scaled up. Shadow uses a warm glow (not black)
                      // because a black shadow is invisible against this
                      // section's own near-black background -- a plain
                      // scale-only version read as "no animation" to the user.
                      // Mobile (RESP-03): tighter padding/radius matching the
                      // Figma mobile spec (15px padding, 12px/10px radius
                      // selected/unselected) -- lg keeps the existing
                      // desktop values (25px padding, 15px radius both).
                      'relative flex w-full items-center gap-[10px] border-2 text-left transition-all duration-200 ease-out hover:z-10 hover:-translate-y-1 hover:scale-[1.05] hover:shadow-[0_16px_36px_rgba(242,117,33,0.25)]',
                      isSelected
                        ? 'rounded-[12px] border-dips-card-ingredient-hl-border bg-dips-card-ingredient-hl p-[15px] lg:rounded-card lg:p-card-padding'
                        : 'rounded-[10px] border-dips-card-ingredient-border bg-dips-card-ingredient p-[15px] hover:border-dips-card-ingredient-hl-border/60 lg:rounded-card lg:px-card-padding lg:py-5'
                    )}
                  >
                    <div
                      className={cn(
                        'relative shrink-0',
                        isSelected ? 'h-11 w-11' : 'h-8 w-9'
                      )}
                    >
                      <Image
                        src={ingredient.image}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-contain"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col gap-[5px]">
                      <span className="flex flex-wrap items-center gap-[10px]">
                        {/* Mobile (RESP-03): 12px matches the Figma mobile
                            spec literally -- text this small doesn't get the
                            "one step below" treatment (would hurt
                            legibility for no visual gain). lg keeps 14px. */}
                        <span className="font-card text-[12px] font-bold leading-[22px] text-white lg:text-[14px]">
                          {t(ingredient.nameKey)}
                        </span>
                        <KeywordPill label={t(ingredient.keywordKey)} />
                      </span>

                      {/* Short description — selected row only (Figma keeps it
                          display:none on the others). Mobile (RESP-03): 12px
                          (Figma mobile spec literal), lg keeps 13px. */}
                      {isSelected && (
                        <span className="font-card text-[12px] font-normal leading-[19px] text-[#96838f] lg:text-[13px]">
                          {t(ingredient.descKey)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollReveal>
        </div>

        {/* RIGHT PANEL: intro + detail card for the selected ingredient.
            Mobile (RESP-03): gap-6/p-6 (was gap-12/p-6 py-12 -- matches the
            Figma mobile spec's tighter 25px rhythm); lg keeps the existing
            desktop spacing. */}
        <div className="flex flex-col gap-6 p-6 lg:gap-12 lg:py-12 lg:p-10">
          <ScrollReveal direction="up" delay={0.1} duration={0.8}>
            {/* Mobile (RESP-03): 18->16px, one step below the Figma mobile
                spec (18px). */}
            <p className="font-card text-[16px] font-normal leading-[1.35] text-dips-text-lavender-muted lg:text-[21px]">
              {t('subtitle')}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2} duration={0.7}>
            {/* Detail card — re-renders from the selection state; icon is the
                same asset as the selected left-hand row. Mobile (RESP-03):
                p-5 (was p-card-padding/25px, Figma mobile spec is 20px). */}
            <div className="flex flex-col gap-[25px] rounded-card border-2 border-[rgba(57,41,76,0.5)] bg-[rgba(49,34,89,0.15)] p-5 lg:p-card-padding">
              <div className="flex items-center gap-[10px]">
                {/* Mobile (RESP-03): h-10 w-10 (40px, Figma mobile spec),
                    lg keeps 44px. */}
                <div className="relative h-10 w-10 shrink-0 lg:h-11 lg:w-11">
                  <Image
                    src={selected.image}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-contain"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-[5px]">
                  <span className="flex flex-wrap items-center gap-[10px]">
                    {/* Mobile (RESP-03): 12px (Figma mobile spec literal --
                        text this small doesn't get the "one step below"
                        treatment), lg keeps 21px. */}
                    <h3 className="font-card text-[12px] font-bold leading-[1.35] text-white lg:text-[21px]">
                      {t(selected.nameKey)}
                    </h3>
                    <KeywordPill label={t(selected.keywordKey)} />
                  </span>
                  {/* Mobile (RESP-03): 10px/14px leading (Figma mobile spec
                      literal), lg keeps 13px/19px. */}
                  <p className="font-card text-[10px] font-normal leading-[14px] text-[#96838f] lg:text-[13px] lg:leading-[19px]">
                    {t(selected.descKey)}
                  </p>
                </div>
              </div>

              {/* Origins & Curiosities inner card. Mobile (RESP-03): p-[15px]
                  (Figma mobile spec), lg keeps p-card-padding/25px. */}
              <div className="flex flex-col gap-[10px] rounded-card border-2 border-[rgba(91,47,45,0.4)] bg-[rgba(55,22,41,0.4)] p-[15px] lg:p-card-padding">
                <span className="flex items-center gap-[10px]">
                  <Diamond />
                  {/* Mobile (RESP-03): 12px (Figma mobile spec literal), lg
                      keeps 14px. */}
                  <h4 className="font-card text-[12px] font-bold leading-[22px] text-white lg:text-[14px]">
                    {t(selected.originsTitleKey)}
                  </h4>
                </span>
                {/* Mobile (RESP-03): 10px/14px leading (Figma mobile spec
                    literal), lg keeps 13px/19px. */}
                <p className="font-card text-[10px] font-normal leading-[14px] text-[#96838f] lg:text-[13px] lg:leading-[19px]">
                  {t(selected.originsKey)}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
