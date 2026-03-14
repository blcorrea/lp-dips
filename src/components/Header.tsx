"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
    const t = useTranslations('Header');
    const params = useParams();
    const locale = (params.locale as string) || 'en';

    const { itemCount } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-brand-cream border-b border-brand-purple/8">
            <div className="container mx-auto px-5 sm:px-6 h-[58px] lg:h-[64px] flex items-center justify-between">
                {/* Left: Logo */}
                <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">
                    <Image
                        src="/images/logo-header-new.png"
                        alt="Dips"
                        width={120}
                        height={40}
                        className="h-8 lg:h-9 w-auto"
                        priority
                    />
                </Link>

                {/* Right side: desktop nav + actions */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-auto">
                    {/* Navigation */}
                    <nav className="flex items-center gap-5 lg:gap-7">
                        <Link
                            href={`/${locale}#about`}
                            className="text-brand-purple font-semibold text-[11px] lg:text-[12px] tracking-[0.01em] hover:text-brand-orange transition-colors duration-200"
                        >
                            {t('about')}
                        </Link>

                        <Link
                            href={`/${locale}#product`}
                            className="text-brand-purple font-semibold text-[11px] lg:text-[12px] tracking-[0.01em] hover:text-brand-orange transition-colors duration-200"
                        >
                            {t('product')}
                        </Link>

                        <Link
                            href={`/${locale}#ingredients`}
                            className="text-brand-purple font-semibold text-[11px] lg:text-[12px] tracking-[0.01em] hover:text-brand-orange transition-colors duration-200"
                        >
                            {t('ingredients')}
                        </Link>

                        <Link
                            href={`/${locale}#faq`}
                            className="text-brand-purple font-semibold text-[11px] lg:text-[12px] tracking-[0.01em] hover:text-brand-orange transition-colors duration-200"
                        >
                            {t('faq')}
                        </Link>

                        <Link
                            href={`/${locale}/product/dips-chocolate`}
                            className="text-brand-purple font-semibold text-[11px] lg:text-[12px] tracking-[0.01em] hover:text-brand-orange transition-colors duration-200"
                        >
                            Shop
                        </Link>
                    </nav>

                    {/* Language Selector */}
                    <div className="flex items-center gap-2 text-brand-purple font-semibold text-[11px] lg:text-[12px]">
                        <Link href="/en" className="hover:text-brand-orange transition-colors">EN</Link>
                        <span className="opacity-30">|</span>
                        <Link href="/es" className="hover:text-brand-orange transition-colors">ES</Link>
                        <span className="opacity-30">|</span>
                        <Link href="/pt" className="hover:text-brand-orange transition-colors">PT</Link>
                    </div>

                    {/* Cart */}
                    <Link
                        href={`/${locale}/product/dips-chocolate`}
                        className="relative flex items-center text-brand-purple hover:text-brand-orange transition-colors"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="w-[17px] h-[17px]" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Mobile actions */}
                <div className="flex md:hidden items-center gap-3">
                    <Link
                        href={`/${locale}/product/dips-chocolate`}
                        className="relative text-brand-purple hover:text-brand-orange transition-colors"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="w-[18px] h-[18px]" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    <button
                        className="text-brand-purple"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                        type="button"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileOpen && (
                <div className="md:hidden bg-brand-cream border-t border-brand-purple/8 px-5 py-5 space-y-4">
                    <Link
                        href={`/${locale}#about`}
                        className="block text-brand-purple font-semibold text-sm hover:text-brand-orange transition-colors"
                        onClick={() => setMobileOpen(false)}
                    >
                        {t('about')}
                    </Link>

                    <Link
                        href={`/${locale}#product`}
                        className="block text-brand-purple font-semibold text-sm hover:text-brand-orange transition-colors"
                        onClick={() => setMobileOpen(false)}
                    >
                        {t('product')}
                    </Link>

                    <Link
                        href={`/${locale}#ingredients`}
                        className="block text-brand-purple font-semibold text-sm hover:text-brand-orange transition-colors"
                        onClick={() => setMobileOpen(false)}
                    >
                        {t('ingredients')}
                    </Link>

                    <Link
                        href={`/${locale}#faq`}
                        className="block text-brand-purple font-semibold text-sm hover:text-brand-orange transition-colors"
                        onClick={() => setMobileOpen(false)}
                    >
                        {t('faq')}
                    </Link>

                    <Link
                        href={`/${locale}/product/dips-chocolate`}
                        className="block text-brand-purple font-semibold text-sm hover:text-brand-orange transition-colors"
                        onClick={() => setMobileOpen(false)}
                    >
                        Shop
                    </Link>

                    <div className="flex items-center gap-3 pt-2 text-brand-purple font-semibold text-sm border-t border-brand-purple/10">
                        <Link href="/en" className="hover:text-brand-orange transition-colors">EN</Link>
                        <span className="opacity-30">|</span>
                        <Link href="/es" className="hover:text-brand-orange transition-colors">ES</Link>
                        <span className="opacity-30">|</span>
                        <Link href="/pt" className="hover:text-brand-orange transition-colors">PT</Link>
                    </div>
                </div>
            )}
        </header>
    );
}