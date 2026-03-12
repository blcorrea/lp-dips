"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Heart, Package, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { getShopifyShopUrl, getShopifyCartUrl, isShopifyConfigured } from '@/lib/shopify';

export default function Header() {
    const t = useTranslations('Header');
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const { itemCount } = useCart();
    const { customer } = useCustomer();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const shopUrl = getShopifyShopUrl(`/${locale}/products`);
    const cartUrl = getShopifyCartUrl(`/${locale}/cart`);
    const isExternal = isShopifyConfigured();

    const externalProps = isExternal ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {};

    return (
        <header className="sticky top-0 z-50 w-full border-b border-brand-purple/8 bg-brand-cream/95 backdrop-blur-md">
            <div className="container mx-auto flex h-[76px] items-center justify-between px-6 lg:px-8">
                {/* Logo */}
                <Link href={`/${locale}`} className="flex-shrink-0">
                    <Image
                        src="/images/logo-header.png"
                        alt="Dips"
                        width={112}
                        height={34}
                        className="h-8 w-auto lg:h-9"
                        priority
                    />
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden md:flex items-center gap-8 lg:gap-10">
                    <Link
                        href={`/${locale}#about`}
                        className="text-brand-purple text-[14px] lg:text-[15px] font-semibold tracking-[0.02em] hover:text-brand-orange transition-colors duration-200"
                    >
                        {t('about')}
                    </Link>
                    <Link
                        href={`/${locale}#product`}
                        className="text-brand-purple text-[14px] lg:text-[15px] font-semibold tracking-[0.02em] hover:text-brand-orange transition-colors duration-200"
                    >
                        {t('product')}
                    </Link>
                    <Link
                        href={`/${locale}#ingredients`}
                        className="text-brand-purple text-[14px] lg:text-[15px] font-semibold tracking-[0.02em] hover:text-brand-orange transition-colors duration-200"
                    >
                        {t('ingredients')}
                    </Link>
                    <Link
                        href={`/${locale}#faq`}
                        className="text-brand-purple text-[14px] lg:text-[15px] font-semibold tracking-[0.02em] hover:text-brand-orange transition-colors duration-200"
                    >
                        {t('faq')}
                    </Link>
                    <a
                        href={shopUrl}
                        {...externalProps}
                        className="text-brand-purple text-[14px] lg:text-[15px] font-semibold tracking-[0.02em] hover:text-brand-orange transition-colors duration-200"
                    >
                        Shop
                    </a>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Language Selector */}
                    <div className="hidden md:flex items-center gap-2 text-brand-purple text-[13px] font-semibold tracking-[0.04em]">
                        <Link href="/en" className="hover:text-brand-orange transition-colors">EN</Link>
                        <span className="opacity-30">|</span>
                        <Link href="/es" className="hover:text-brand-orange transition-colors">ES</Link>
                        <span className="opacity-30">|</span>
                        <Link href="/pt" className="hover:text-brand-orange transition-colors">PT</Link>
                    </div>

                    {/* User Menu */}
                    {customer && (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 text-brand-purple hover:text-brand-orange transition-colors"
                                aria-label="User menu"
                            >
                                <User className="w-[18px] h-[18px]" />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-3 w-52 rounded-2xl border border-brand-purple/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.10)] py-2 z-50">
                                        <Link
                                            href={`/${locale}/profile`}
                                            className="block px-4 py-3 text-brand-charcoal hover:bg-brand-cream transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <User className="w-4 h-4 text-brand-purple" />
                                                My Profile
                                            </div>
                                        </Link>
                                        <Link
                                            href={`/${locale}/orders`}
                                            className="block px-4 py-3 text-brand-charcoal hover:bg-brand-cream transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Package className="w-4 h-4 text-brand-purple" />
                                                My Orders
                                            </div>
                                        </Link>
                                        <Link
                                            href={`/${locale}/wishlist`}
                                            className="block px-4 py-3 text-brand-charcoal hover:bg-brand-cream transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Heart className="w-4 h-4 text-brand-purple" />
                                                Wishlist
                                            </div>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Cart */}
                    <a
                        href={cartUrl}
                        {...externalProps}
                        className="relative flex items-center text-brand-purple hover:text-brand-orange transition-colors"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="w-[18px] h-[18px]" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[11px] font-bold text-white shadow-sm">
                                {itemCount}
                            </span>
                        )}
                    </a>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-brand-purple hover:text-brand-orange transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileOpen && (
                <div className="md:hidden border-t border-brand-purple/8 bg-brand-cream/98 backdrop-blur-md px-6 py-6">
                    <nav className="space-y-4">
                        <Link
                            href={`/${locale}#about`}
                            className="block text-brand-purple text-base font-semibold hover:text-brand-orange transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            {t('about')}
                        </Link>
                        <Link
                            href={`/${locale}#product`}
                            className="block text-brand-purple text-base font-semibold hover:text-brand-orange transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            {t('product')}
                        </Link>
                        <Link
                            href={`/${locale}#ingredients`}
                            className="block text-brand-purple text-base font-semibold hover:text-brand-orange transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            {t('ingredients')}
                        </Link>
                        <Link
                            href={`/${locale}#faq`}
                            className="block text-brand-purple text-base font-semibold hover:text-brand-orange transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            {t('faq')}
                        </Link>
                        <a
                            href={shopUrl}
                            {...externalProps}
                            className="block text-brand-purple text-base font-semibold hover:text-brand-orange transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Shop
                        </a>
                    </nav>

                    <div className="mt-5 flex items-center gap-3 border-t border-brand-purple/10 pt-4 text-brand-purple text-sm font-semibold tracking-[0.04em]">
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