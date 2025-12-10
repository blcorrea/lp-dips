"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShoppingCart } from 'lucide-react';

import Image from 'next/image';

export default function Header() {
    const t = useTranslations('Header');

    return (
        <header className="sticky top-0 z-50 w-full bg-brand-purple border-b border-white/10 shadow-md">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                    <Image
                        src="/images/logo-header.png"
                        alt="Dips"
                        width={150}
                        height={40}
                        className="h-10 w-auto"
                        priority
                    />
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden md:flex items-center gap-10">
                    <Link href="#about" className="text-white font-bold text-lg hover:text-brand-orange transition-colors">
                        {t('about')}
                    </Link>
                    <Link href="#product" className="text-white font-bold text-lg hover:text-brand-orange transition-colors">
                        {t('product')}
                    </Link>
                    <Link href="#ingredients" className="text-white font-bold text-lg hover:text-brand-orange transition-colors">
                        {t('ingredients')}
                    </Link>
                    <Link href="#faq" className="text-white font-bold text-lg hover:text-brand-orange transition-colors">
                        {t('faq')}
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {/* Language Selector */}
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Link href="/" locale="en" className="hover:text-brand-orange transition-colors">EN</Link>
                        <span className="opacity-50">|</span>
                        <Link href="/" locale="es" className="hover:text-brand-orange transition-colors">ES</Link>
                        <span className="opacity-50">|</span>
                        <Link href="/" locale="pt" className="hover:text-brand-orange transition-colors">PT</Link>
                    </div>

                    <Link href="#cart" className="flex items-center gap-2 text-white hover:text-brand-orange transition-colors font-bold text-lg">
                        {t('cart')} <ShoppingCart className="w-6 h-6" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
