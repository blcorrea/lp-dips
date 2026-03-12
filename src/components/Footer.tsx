"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { getShopifyShopUrl, isShopifyConfigured } from '@/lib/shopify';

export default function Footer() {
    const t = useTranslations('Footer');
    const [email, setEmail] = useState('');
    const shopUrl = getShopifyShopUrl('#');
    const isExternal = isShopifyConfigured();
    const externalProps = isExternal ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {};
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <footer className="bg-brand-cream pt-16 lg:pt-20">
            <div className="container mx-auto px-6">
                {/* Top: 4 Columns */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16 max-w-7xl mx-auto">
                    {/* Orders */}
                    <div className="space-y-5">
                        <h4 className="font-bold text-brand-purple uppercase tracking-wider text-sm">
                            {t('ordersTitle')}
                        </h4>
                        <ul className="space-y-3 text-brand-charcoal text-[15px] font-medium">
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('trackOrder')}</a></li>
                            <li><Link href="/shipping-policy" className="hover:text-brand-orange transition-colors">{t('shippingInfo')}</Link></li>
                            <li><Link href="/return-policy" className="hover:text-brand-orange transition-colors">{t('refunds')}</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-5">
                        <h4 className="font-bold text-brand-purple uppercase tracking-wider text-sm">
                            {t('quickLinksTitle')}
                        </h4>
                        <ul className="space-y-3 text-brand-charcoal text-[15px] font-medium">
                            <li><a href="#faq" className="hover:text-brand-orange transition-colors">F.A.Q.</a></li>
                            <li><a href="#ingredients" className="hover:text-brand-orange transition-colors">Our Ingredients</a></li>
                            <li><a href={shopUrl} {...externalProps} className="hover:text-brand-orange transition-colors">{t('whereToBuy')}</a></li>
                            <li><Link href="/privacy" className="hover:text-brand-orange transition-colors">{t('privacy')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="space-y-5">
                        <h4 className="font-bold text-brand-purple uppercase tracking-wider text-sm">
                            {t('contactUsTitle')}
                        </h4>
                        <ul className="space-y-3 text-brand-charcoal text-[15px] font-medium">
                            <li><a href="mailto:info@dipschocolate.com" className="hover:text-brand-orange transition-colors">info@dipschocolate.com</a></li>
                            <li><a href="tel:754-457-6844" className="hover:text-brand-orange transition-colors">754-457-6844</a></li>
                        </ul>
                    </div>

                    {/* Craving More? + Newsletter */}
                    <div className="space-y-5">
                        <h4 className="font-bold text-brand-purple uppercase tracking-wider text-sm">
                            {t('cravingMore')}
                        </h4>
                        <p className="text-brand-charcoal text-[15px] font-medium leading-relaxed">
                            {t('letYourNights')}
                        </p>

                        {/* Email signup */}
                        <div className="pt-2">
                            {status === 'success' ? (
                                <div className="p-3 bg-brand-orange/10 border border-brand-orange text-brand-orange rounded-sm text-sm font-bold animate-in fade-in slide-in-from-bottom-2">
                                    {t('successMsg')}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex">
                                    <div className="flex-1 border border-brand-purple rounded-l-sm overflow-hidden">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={t('yourEmail')}
                                            required
                                            className="w-full bg-white px-4 py-3 text-sm text-brand-charcoal placeholder-gray-400 outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="bg-brand-purple text-white text-sm font-bold px-5 py-3 rounded-r-sm hover:bg-brand-purple-light disabled:opacity-50 transition-colors whitespace-nowrap"
                                    >
                                        {status === 'loading' ? '...' : 'SIGN UP'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Logo centered */}
                <div className="flex justify-center py-8 border-t border-brand-purple/10">
                    <Image
                        src="/images/logo-dips.png"
                        alt="Dips"
                        width={120}
                        height={72}
                        className="h-16 w-auto opacity-90"
                    />
                </div>
            </div>

            {/* Bottom bar */}
            <div className="bg-brand-charcoal py-8">
                <div className="container mx-auto px-6 text-center space-y-2">
                    <p className="text-white/70 text-sm font-medium">
                        &copy; 2025 &ndash; Dips Chocolate. {t('rightsReserved')}
                    </p>
                    <p className="text-white/60 text-sm">
                        {t('madeWith')}
                    </p>
                    <p className="text-white/60 text-sm">
                        {t('productDesigned')}
                    </p>
                    <div className="pt-3 text-white/50 text-xs space-y-1">
                        <p className="font-semibold text-white/60">Dips Wellness Corporation</p>
                        <p>995 NW 165th Ave, Pembroke Pines, FL 33028</p>
                        <p>EIN: 41-2647662 | {t('registeredIn')} Florida</p>
                        <p className="pt-1">{t('ageRestriction')}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
