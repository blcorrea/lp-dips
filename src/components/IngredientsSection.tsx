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
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreen = () => setIsMobile(window.innerWidth < 640);
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const ingredients: Ingredient[] = [
        {
            nameKey: 'cocoa_name',
            keywordKey: 'cocoa_keyword',
            image: '/images/ingredient-cocoa.png',
            descKey: 'cocoa_desc',
            originsTitleKey: 'cocoa_originsTitle',
            originsKey: 'cocoa_origins',
        },
        {
            nameKey: 'maca_name',
            keywordKey: 'maca_keyword',
            image: '/images/ingredient-maca.png',
            descKey: 'maca_desc',
            originsTitleKey: 'maca_originsTitle',
            originsKey: 'maca_origins',
        },
        {
            nameKey: 'ginger_name',
            keywordKey: 'ginger_keyword',
            image: '/images/ingredient-ginger.png',
            descKey: 'ginger_desc',
            originsTitleKey: 'ginger_originsTitle',
            originsKey: 'ginger_origins',
        },
        {
            nameKey: 'theanine_name',
            keywordKey: 'theanine_keyword',
            image: '/images/ingredient-theanine.png',
            descKey: 'theanine_desc',
            originsTitleKey: 'theanine_originsTitle',
            originsKey: 'theanine_origins',
        },
        {
            nameKey: 'blend_name',
            keywordKey: 'blend_keyword',
            image: '/images/ingredient-blend.png',
            descKey: 'blend_desc',
            originsTitleKey: 'blend_originsTitle',
            originsKey: 'blend_origins',
        },
        {
            nameKey: 'fenugreek_name',
            keywordKey: 'fenugreek_keyword',
            image: '/images/ingredient-fenugreek.png',
            descKey: 'fenugreek_desc',
            originsTitleKey: 'fenugreek_originsTitle',
            originsKey: 'fenugreek_origins',
        },
    ];

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
                transform: 'translateX(0) scale(1.03) translateY(-8px)',
                zIndex: 30,
                opacity: 1,
                pointerEvents: 'auto' as const,
            };
        }

        if (diff === -1) {
            return {
                transform: isMobile
                    ? 'translateX(-46%) scale(0.9)'
                    : 'translateX(-58%) scale(0.88)',
                zIndex: 20,
                opacity: 0.68,
                pointerEvents: 'auto' as const,
            };
        }

        if (diff === 1) {
            return {
                transform: isMobile
                    ? 'translateX(46%) scale(0.9)'
                    : 'translateX(58%) scale(0.88)',
                zIndex: 20,
                opacity: 0.68,
                pointerEvents: 'auto' as const,
            };
        }

        return {
            transform: 'translateX(0) scale(0.88)',
            zIndex: 0,
            opacity: 0,
            pointerEvents: 'none' as const,
        };
    };

    return (
        <section id="ingredients" className="bg-brand-cream py-20 lg:py-28">
            <div className="container mx-auto px-6">
                <div className="max-w-7xl mx-auto">
                    <ScrollReveal direction="up" delay={0.1} duration={0.8}>
                        <div className="text-center mb-4">
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[72px] font-bold tracking-tight text-brand-purple">
                                {t('sectionTitle')}
                            </h2>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal direction="up" delay={0.2} duration={0.7}>
                        <p className="text-center text-brand-charcoal text-sm sm:text-base lg:text-[17px] font-medium mb-14 lg:mb-16 max-w-3xl mx-auto leading-relaxed">
                            {t('subtitle')}
                        </p>
                    </ScrollReveal>

                    <div className="relative h-[500px] sm:h-[580px] lg:h-[640px] touch-pan-y">
                        {ingredients.map((ingredient, index) => {
                            const style = getCardStyle(index);
                            const isActive = index === activeIndex;

                            return (
                                <button
                                    key={`${ingredient.nameKey}-${index}`}
                                    onClick={() => setActiveIndex(index)}
                                    className={`group absolute left-1/2 top-0 w-[250px] sm:w-[320px] lg:w-[360px] -ml-[125px] sm:-ml-[160px] lg:-ml-[180px] overflow-hidden rounded-[32px] border bg-brand-cream text-left transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] flex flex-col shadow-lg hover:shadow-xl ${
                                        isActive ? 'border-brand-purple/15' : 'border-brand-purple/10'
                                    }`}
                                    style={style}
                                >
                                    <div className="relative w-full h-[185px] sm:h-[225px] lg:h-[250px] bg-transparent overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        <Image
                                            src={ingredient.image}
                                            alt={t(ingredient.nameKey)}
                                            fill
                                            className="object-contain object-center p-4 transition-transform duration-300 group-hover:scale-110"
                                        />
                                    </div>

                                    <div className="p-5 lg:p-6 flex flex-col flex-1 text-center">
                                        <h3 className="text-lg lg:text-xl font-bold text-brand-purple mb-2 leading-tight">
                                            {t(ingredient.nameKey)}
                                        </h3>

                                        <p className="text-brand-charcoal/80 text-sm lg:text-[15px] leading-[1.65] mb-4">
                                            {t(ingredient.descKey)}
                                        </p>

                                        <div className="mb-4">
                                            <span className="text-brand-purple text-xs lg:text-sm font-bold tracking-[0.35em] uppercase">
                                                {t(ingredient.keywordKey)}
                                            </span>
                                        </div>

                                        <div className="mt-auto">
                                            <h4 className="text-sm lg:text-base font-bold text-brand-purple mb-2">
                                                {t(ingredient.originsTitleKey)}
                                            </h4>
                                            <p className="text-brand-charcoal/70 text-sm leading-[1.65]">
                                                {t(ingredient.originsKey)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={goPrev}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-purple text-brand-cream transition-colors hover:bg-brand-purple-light"
                            aria-label="Previous ingredient"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
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