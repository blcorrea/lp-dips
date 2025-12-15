"use client";

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import FadeIn from './animations/FadeIn';
import SlideIn from './animations/SlideIn';
import ScaleIn from './animations/ScaleIn';
import { motion } from 'framer-motion';

export default function Hero() {
    const t = useTranslations('Hero');
    const params = useParams();
    const locale = params.locale as string;

    return (
        <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-visible">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">

                    {/* Content Left */}
                    <div className="space-y-6 lg:space-y-8 z-20 relative">
                        <h1 className="flex flex-col text-7xl lg:text-9xl font-bold text-brand-purple leading-[0.85] tracking-tight">
                            <SlideIn direction="left" delay={0.1} duration={0.8}>
                                <span>{t('headlinePart1')}</span>
                            </SlideIn>
                            <SlideIn direction="left" delay={0.3} duration={0.8}>
                                <span className="pl-12 lg:pl-24">{t('headlinePart2')}</span>
                            </SlideIn>
                            <SlideIn direction="left" delay={0.5} duration={0.8}>
                                <span className="pl-24 lg:pl-48">{t('headlinePart3')}</span>
                            </SlideIn>
                        </h1>

                        <FadeIn delay={0.8} duration={0.8}>
                            <div className="space-y-4 pl-12 lg:pl-24 w-full">
                                <h2 className="text-2xl font-bold text-brand-purple">
                                    {t('sub')}
                                </h2>
                                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                                    {t('description')}
                                </p>
                            </div>
                        </FadeIn>

                        <SlideIn direction="up" delay={1.1} duration={0.8}>
                            <div className="pt-8 pl-0 lg:pl-24 w-full flex justify-center lg:block">
                                <Link href={`/${locale}/shop`}>
                                    <Button size="lg" className="w-full lg:w-auto px-12 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-full py-8 text-2xl lg:text-3xl font-bold shadow-lg transition-transform hover:scale-105">
                                        {t('cta')} <ShoppingCart className="ml-4 w-6 h-6 lg:w-8 lg:h-8" />
                                    </Button>
                                </Link>
                            </div>
                        </SlideIn>
                    </div>

                    {/* Image Right Area */}
                    <div className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center lg:justify-end">
                        {/* Top Orange Circle Blob */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="absolute top-10 left-10 lg:left-20 w-24 h-24 lg:w-48 lg:h-48 bg-brand-orange rounded-full z-10"
                        />

                        {/* Main Circular Image */}
                        <ScaleIn delay={0.6} duration={1} initialScale={0.9}>
                            <div className="relative w-[300px] h-[300px] lg:w-[550px] lg:h-[550px] rounded-full overflow-hidden shadow-2xl z-5">
                                <Image
                                    src="/images/hero-1.png"
                                    alt="Couple sharing chocolate"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </ScaleIn>

                        {/* Bottom Orange Circle Blob */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                            className="absolute bottom-10 right-10 lg:bottom-20 lg:-right-10 w-32 h-32 lg:w-56 lg:h-56 bg-brand-orange rounded-full z-10"
                        />



                        {/* Product Box - Positioned in the right column, below the circle
                        <div className="absolute -bottom-20 left-0 lg:-left-20 z-30 w-72 lg:w-96">
                            <Image
                                src="/images/hero-2.png"
                                alt="Dips Box"
                                width={400}
                                height={200}
                                className="w-full h-auto drop-shadow-2xl rotate-[-10deg] hover:rotate-0 transition-transform duration-500"
                            />
                        </div> */}
                    </div>
                </div>
            </div>


        </section>
    );
}
