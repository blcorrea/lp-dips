"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ScrollReveal from './animations/ScrollReveal';
import ScaleIn from './animations/ScaleIn';

export default function ProductSection() {
    const t = useTranslations('Product');

    return (
        <section id="product" className="py-20 lg:py-32 overflow-hidden bg-white">
            <div className="container mx-auto px-4">

                {/* Top Block: Image & Text */}
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                    {/* Left: Image with Blobs */}
                    <ScaleIn delay={0.2} duration={0.8}>
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative w-[300px] h-[300px] lg:w-[500px] lg:h-[500px]">
                                {/* Main Circle Image */}
                                <div className="relative w-full h-full rounded-full overflow-hidden z-10 border-4 border-white shadow-xl">
                                    <Image
                                        src="/images/hero-1.png"
                                        alt="Couple Moment"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Decor Blobs */}
                                <div className="absolute -top-6 -right-6 w-24 h-24 lg:-top-10 lg:-right-10 lg:w-32 lg:h-32 bg-brand-orange rounded-full z-20"></div>
                                <div className="absolute -bottom-6 -left-6 w-28 h-28 lg:-bottom-10 lg:-left-10 lg:w-40 lg:h-40 bg-brand-orange rounded-full z-20"></div>
                            </div>
                        </div>
                    </ScaleIn>

                    {/* Right: Text Content */}
                    <ScrollReveal direction="right" delay={0.1} duration={0.8}>
                        <div className="space-y-8 max-w-xl">
                            <h2 className="text-3xl lg:text-7xl font-bold text-brand-purple leading-tight tracking-tight break-words">
                                {t('title')}
                            </h2>

                            <div className="space-y-6 text-lg text-gray-700 font-medium leading-relaxed">
                                <p>{t('desc1')}</p>
                                <p>
                                    {t.rich('desc2', {
                                        bold: (chunks) => <strong className="text-black font-bold">{chunks}</strong>
                                    })}
                                </p>
                                <p>{t('desc3')}</p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Bottom Block: 4 Circular Features */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Circle 1 - Purple */}
                    <ScaleIn delay={0.1} duration={0.6} initialScale={0.7}>
                        <div className="bg-brand-purple rounded-full aspect-square flex items-center justify-center p-8 text-center shadow-lg transition-transform hover:scale-105">
                            <p className="text-white text-lg font-medium leading-snug">
                                {t('feature1')}
                            </p>
                        </div>
                    </ScaleIn>

                    {/* Circle 2 - Orange */}
                    <ScaleIn delay={0.2} duration={0.6} initialScale={0.7}>
                        <div className="bg-brand-orange rounded-full aspect-square flex items-center justify-center p-8 text-center shadow-lg transition-transform hover:scale-105">
                            <p className="text-white text-lg font-medium leading-snug">
                                {t('feature2')}
                            </p>
                        </div>
                    </ScaleIn>

                    {/* Circle 3 - Purple */}
                    <ScaleIn delay={0.3} duration={0.6} initialScale={0.7}>
                        <div className="bg-brand-purple rounded-full aspect-square flex items-center justify-center p-8 text-center shadow-lg transition-transform hover:scale-105">
                            <p className="text-white text-lg font-medium leading-snug">
                                {t('feature3')}
                            </p>
                        </div>
                    </ScaleIn>

                    {/* Circle 4 - Orange */}
                    <ScaleIn delay={0.4} duration={0.6} initialScale={0.7}>
                        <div className="bg-brand-orange rounded-full aspect-square flex items-center justify-center p-8 text-center shadow-lg transition-transform hover:scale-105">
                            <p className="text-white text-lg font-medium leading-snug">
                                {t('feature4')}
                            </p>
                        </div>
                    </ScaleIn>
                </div>

            </div>
        </section>
    );
}
