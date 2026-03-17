"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollReveal from './animations/ScrollReveal';

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
  const [activeIndex, setActiveIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const ingredients: Ingredient[] = [
    {
      nameKey: 'cocoa_name',
      keywordKey: 'cocoa_keyword',
      image: '/images/cocoa.png',
      descKey: 'cocoa_desc',
      originsTitleKey: 'cocoa_originsTitle',
      originsKey: 'cocoa_origins',
    },
    {
      nameKey: 'maca_name',
      keywordKey: 'maca_keyword',
      image: '/images/maca.png',
      descKey: 'maca_desc',
      originsTitleKey: 'maca_originsTitle',
      originsKey: 'maca_origins',
    },
    {
      nameKey: 'ginger_name',
      keywordKey: 'ginger_keyword',
      image: '/images/ginger.png',
      descKey: 'ginger_desc',
      originsTitleKey: 'ginger_originsTitle',
      originsKey: 'ginger_origins',
    },
    {
      nameKey: 'theanine_name',
      keywordKey: 'theanine_keyword',
      image: '/images/theanine.png',
      descKey: 'theanine_desc',
      originsTitleKey: 'theanine_originsTitle',
      originsKey: 'theanine_origins',
    },
    {
      nameKey: 'blend_name',
      keywordKey: 'blend_keyword',
      image: '/images/aphrodisiac_blend.png',
      descKey: 'blend_desc',
      originsTitleKey: 'blend_originsTitle',
      originsKey: 'blend_origins',
    },
    {
      nameKey: 'fenugreek_name',
      keywordKey: 'fenugreek_keyword',
      image: '/images/fenugreek.png',
      descKey: 'fenugreek_desc',
      originsTitleKey: 'fenugreek_originsTitle',
      originsKey: 'fenugreek_origins',
    },
  ];

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ingredients.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ingredients.length]);

  const goNext = () => setActiveIndex((prev) => (prev + 1) % ingredients.length);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + ingredients.length) % ingredients.length);

  const getRelativePosition = (index: number) => {
    const total = ingredients.length;
    let diff = index - activeIndex;

    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    return diff;
  };

  const getCardStyle = (index: number) => {
    const diff = getRelativePosition(index);

    if (diff === 0) {
      return {
        transform: 'translateX(0) scale(1.06) translateY(-8px)',
        zIndex: 30,
        opacity: 1,
        filter: 'blur(0px)',
        pointerEvents: 'auto' as const,
      };
    }

    if (diff === -1) {
      return {
        transform: isMobile
          ? 'translateX(-43%) scale(0.9)'
          : 'translateX(-56%) scale(0.9)',
        zIndex: 20,
        opacity: 0.42,
        filter: 'blur(1.6px)',
        pointerEvents: 'auto' as const,
      };
    }

    if (diff === 1) {
      return {
        transform: isMobile
          ? 'translateX(43%) scale(0.9)'
          : 'translateX(56%) scale(0.9)',
        zIndex: 20,
        opacity: 0.42,
        filter: 'blur(1.6px)',
        pointerEvents: 'auto' as const,
      };
    }

    return {
      transform: 'translateX(0) scale(0.84)',
      zIndex: 0,
      opacity: 0,
      filter: 'blur(3px)',
      pointerEvents: 'none' as const,
    };
  };

  return (
    <section id="ingredients" className="bg-white py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" delay={0.1} duration={0.8}>
            <div className="text-center mb-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[72px] font-bold tracking-tight text-brand-purple">
                {t('sectionTitle')}
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.18} duration={0.7}>
            <p className="text-center text-brand-purple text-[18px] sm:text-[20px] lg:text-[24px] font-semibold mb-3 max-w-3xl mx-auto leading-relaxed">
              The ingredients behind the experience.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.25} duration={0.7}>
            <p className="text-center text-brand-charcoal text-sm sm:text-base lg:text-[17px] font-medium mb-14 lg:mb-16 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </ScrollReveal>

          <div className="relative h-[560px] sm:h-[640px] lg:h-[700px] touch-pan-y">
            {ingredients.map((ingredient, index) => {
              const style = getCardStyle(index);
              const isActive = index === activeIndex;

              return (
                <button
                  key={`${ingredient.nameKey}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group absolute left-1/2 top-0 w-[255px] sm:w-[320px] lg:w-[370px] -ml-[127.5px] sm:-ml-[160px] lg:-ml-[185px] overflow-hidden rounded-[32px] border text-left transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] flex flex-col bg-white ${
                    isActive
                      ? 'border-brand-purple/20 shadow-[0_18px_45px_rgba(86,17,110,0.12)]'
                      : 'border-brand-purple/10 shadow-[0_8px_28px_rgba(86,17,110,0.06)]'
                  }`}
                  style={style}
                >
                  <div className="relative w-full h-[220px] sm:h-[260px] lg:h-[300px] bg-transparent overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={ingredient.image}
                      alt={t(ingredient.nameKey)}
                      fill
                      sizes="(max-width: 639px) 255px, (max-width: 1023px) 320px, 370px"
                      className={`object-contain object-center transition-transform duration-500 ${
                        isActive
                          ? 'p-1 scale-100 group-hover:scale-[1.03]'
                          : 'p-2 scale-[0.96]'
                      }`}
                    />
                  </div>

                  <div className="px-6 pb-6 pt-3 flex flex-col flex-1 text-center">
                    {/* NAME */}
                    <h3 className="text-[22px] sm:text-[26px] lg:text-[30px] font-bold text-brand-purple mb-3 leading-[0.95] tracking-[-0.03em]">
                      {t(ingredient.nameKey)}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-brand-charcoal/85 text-[15px] sm:text-[16px] lg:text-[17px] leading-[1.45] mb-4">
                      {t(ingredient.descKey)}
                    </p>

                    {/* KEYWORD */}
                    <div className="mb-4">
                      <span className="text-brand-orange text-[12px] lg:text-[13px] font-bold tracking-[0.18em] uppercase">
                        {t(ingredient.keywordKey)}
                      </span>
                    </div>

                    {/* ORIGINS */}
                    <div className="mt-auto">
                      <h4 className="text-[15px] lg:text-[16px] font-bold text-brand-purple mb-2 leading-tight">
                        {t(ingredient.originsTitleKey)}
                      </h4>

                      <p className="text-brand-charcoal/75 text-[14px] lg:text-[15px] leading-[1.55] line-clamp-4">
                        {t(ingredient.originsKey)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-center">
            <p className="text-brand-charcoal/65 text-[13px] sm:text-[14px] font-medium">
              Explore each ingredient
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={goPrev}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-purple text-brand-cream transition-colors hover:bg-brand-purple-light"
              aria-label="Previous ingredient"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {ingredients.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to ingredient ${index + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    index === activeIndex
                      ? 'bg-brand-purple scale-110'
                      : 'bg-brand-purple/25 hover:bg-brand-purple/40'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-purple text-brand-cream transition-colors hover:bg-brand-purple-light"
              aria-label="Next ingredient"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}