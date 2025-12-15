"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Heart, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCustomer } from '@/contexts/CustomerContext';

export default function Header() {
    const t = useTranslations('Header');
    const params = useParams();
    const locale = params.locale as string || 'en';
    const { itemCount } = useCart();
    const { customer } = useCustomer();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-brand-purple border-b border-white/10 shadow-md">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href={`/${locale}`} className="flex-shrink-0">
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
                <nav className="hidden md:flex items-center gap-8">
                    <Link href={`/${locale}#about`} className="text-white font-bold text-base hover:text-brand-orange transition-colors">
                        {t('about')}
                    </Link>
                    <Link href={`/${locale}#product`} className="text-white font-bold text-base hover:text-brand-orange transition-colors">
                        {t('product')}
                    </Link>
                    <Link href={`/${locale}/products`} className="text-white font-bold text-base hover:text-brand-orange transition-colors">
                        Shop
                    </Link>
                    <Link href={`/${locale}#faq`} className="text-white font-bold text-base hover:text-brand-orange transition-colors">
                        {t('faq')}
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Language Selector */}
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Link href={`/en`} className="hover:text-brand-orange transition-colors">EN</Link>
                        <span className="opacity-50">|</span>
                        <Link href={`/es`} className="hover:text-brand-orange transition-colors">ES</Link>
                        <span className="opacity-50">|</span>
                        <Link href={`/pt`} className="hover:text-brand-orange transition-colors">PT</Link>
                    </div>

                    {/* User Menu */}
                    {customer && (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 text-white hover:text-brand-orange transition-colors"
                                aria-label="User menu"
                            >
                                <User className="w-5 h-5" />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                                        <Link
                                            href={`/${locale}/profile`}
                                            className="block px-4 py-2 text-gray-900 hover:bg-brand-purple/10 transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                My Profile
                                            </div>
                                        </Link>
                                        <Link
                                            href={`/${locale}/orders`}
                                            className="block px-4 py-2 text-gray-900 hover:bg-brand-purple/10 transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                My Orders
                                            </div>
                                        </Link>
                                        <Link
                                            href={`/${locale}/wishlist`}
                                            className="block px-4 py-2 text-gray-900 hover:bg-brand-purple/10 transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Heart className="w-4 h-4" />
                                                Wishlist
                                            </div>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Cart */}
                    <Link
                        href={`/${locale}/cart`}
                        className="relative flex items-center gap-2 text-white hover:text-brand-orange transition-colors"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
