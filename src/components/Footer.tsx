"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');
    const [email, setEmail] = useState('');
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
        <footer className="bg-brand-gray-light py-20 border-t border-brand-purple/10">
            <div className="container mx-auto px-4">
                {/* Top: 4 Columns Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                    {/* Orders */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-black uppercase tracking-wider">{t('ordersTitle')}</h4>
                        <ul className="space-y-3 text-gray-600 text-sm font-medium">
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('trackOrder')}</a></li>
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('shippingInfo')}</a></li>
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('refunds')}</a></li>
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('emailUs')}</a></li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-black uppercase tracking-wider">{t('quickLinksTitle')}</h4>
                        <ul className="space-y-3 text-gray-600 text-sm font-medium">
                            <li><a href="#faq" className="hover:text-brand-orange transition-colors">F.A.Q.s</a></li>
                            <li><a href="#ingredients" className="hover:text-brand-orange transition-colors">{t('ingredients')}</a></li>
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('whereToBuy')}</a></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-black uppercase tracking-wider">{t('customerCareTitle')}</h4>
                        <ul className="space-y-3 text-gray-600 text-sm font-medium">
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('terms')}</a></li>
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('privacy')}</a></li>
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('wholesale')}</a></li>
                            <li><a href="#" className="hover:text-brand-orange transition-colors">{t('affiliates')}</a></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-black uppercase tracking-wider">{t('contactUsTitle')}</h4>
                        <ul className="space-y-3 text-gray-600 text-sm font-medium">
                            <li><a href="mailto:info@dipschocolate.com" className="hover:text-brand-orange transition-colors">info@dipschocolate.com</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom: Centered Text & Signup */}
                <div className="text-center space-y-6 max-w-2xl mx-auto">
                    <p className="text-sm text-gray-500 font-medium">
                        © 2025 – Dips Chocolate. {t('rightsReserved')}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                        {t('madeWith')}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                        {t('productDesigned')}
                    </p>

                    <div className="pt-8 space-y-4">
                        <h5 className="font-bold text-black uppercase tracking-wider">{t('cravingMore')}</h5>
                        <p className="text-sm text-gray-600">{t('letYourNights')}</p>

                        <div className="pt-4 max-w-sm mx-auto">
                            {status === 'success' ? (
                                <div className="p-4 bg-brand-orange/10 border border-brand-orange text-brand-orange rounded-lg font-bold animate-in fade-in slide-in-from-bottom-2">
                                    {t('successMsg')}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <label htmlFor="email" className="block text-left text-xs text-gray-500 uppercase font-bold mb-1">
                                        {t('yourEmail')}
                                    </label>
                                    <div className="flex items-end gap-2 border-b border-black pb-1 focus-within:border-brand-orange transition-colors">
                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="text-gray-900 font-medium whitespace-nowrap hover:text-brand-orange disabled:opacity-50 transition-colors"
                                        >
                                            {status === 'loading' ? '...' : t('signUp')}
                                        </button>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-transparent outline-none text-gray-900 placeholder-transparent"
                                        />
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
