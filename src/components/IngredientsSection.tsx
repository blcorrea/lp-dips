"use client";

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

export default function IngredientsSection() {
  const t = useTranslations('Ingredients');

  const ingredients: Ingredient[] = [
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

  // Cocoa is always the first entry and is the one expanded on the right column.
  const cocoa = ingredients[0];

  return (
    <section
      id="ingredients"
      className="bg-dips-purple-section py-20 lg:py-28 scroll-mt-[72px]"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-7xl mx-auto">
          {/* LEFT: header + 6 ingredient cards */}
          <div>
            <ScrollReveal direction="up" delay={0.1} duration={0.8}>
              <h2 className="text-heading-md font-heading text-dips-text-lavender mb-8 lg:mb-10">
                {t('sectionTitle')}
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ingredients.map((ingredient) => {
                const isCocoa = ingredient.nameKey === 'cocoa_name';

                return (
                  <ScrollReveal
                    key={ingredient.nameKey}
                    direction="up"
                    delay={0.15}
                    duration={0.6}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-4 rounded-card border p-card-padding',
                        isCocoa
                          ? 'bg-dips-card-ingredient-hl border-dips-card-ingredient-hl-border'
                          : 'bg-dips-card-ingredient border-dips-card-ingredient-border'
                      )}
                    >
                      <div className="relative h-11 w-11 shrink-0">
                        <Image
                          src={ingredient.image}
                          alt={t(ingredient.nameKey)}
                          fill
                          sizes="44px"
                          className="object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-card-title-sm font-card text-dips-text-lavender truncate">
                          {t(ingredient.nameKey)}
                        </h3>
                        <span className="mt-1 inline-block rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {t(ingredient.keywordKey)}
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>

          {/* RIGHT: intro copy + expanded cocoa card */}
          <div>
            <ScrollReveal direction="up" delay={0.1} duration={0.8}>
              <p className="text-[24px] leading-relaxed text-dips-text-lavender-muted mb-8">
                {t('subtitle')}
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2} duration={0.7}>
              <div className="rounded-card-lg border bg-dips-card-ingredient-hl border-dips-card-ingredient-hl-border p-card-padding">
                <h3 className="text-card-title-lg font-card text-dips-text-lavender mb-3">
                  {t(cocoa.nameKey)}
                </h3>
                <p className="text-dips-text-lavender-muted leading-relaxed mb-6">
                  {t(cocoa.descKey)}
                </p>

                <div className="rounded-card border bg-dips-card-ingredient border-dips-card-ingredient-border p-card-padding">
                  <h4 className="text-card-title-sm font-card text-dips-text-lavender mb-2">
                    {t(cocoa.originsTitleKey)}
                  </h4>
                  <p className="text-dips-text-lavender-muted leading-relaxed">
                    {t(cocoa.originsKey)}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
