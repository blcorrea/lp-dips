"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function AgeVerificationModal() {
    const t = useTranslations('AgeVerification');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has already verified their age
        const hasVerified = localStorage.getItem('ageVerified');
        if (!hasVerified) {
            setIsOpen(true);
        }
    }, []);

    const handleVerify = (isOfAge: boolean) => {
        if (isOfAge) {
            localStorage.setItem('ageVerified', 'true');
            setIsOpen(false);
        } else {
            // Redirect to a different page or show a message
            window.location.href = 'https://www.google.com';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-8 text-center space-y-6">
                {/* Logo or Icon */}
                <div className="w-20 h-20 mx-auto bg-brand-orange/10 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🍫</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-black">
                    {t('title')}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-lg">
                    {t('description')}
                </p>

                {/* Warning */}
                <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg p-4">
                    <p className="text-sm text-gray-700 font-medium">
                        {t('warning')}
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={() => handleVerify(false)}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {t('no')}
                    </button>
                    <button
                        onClick={() => handleVerify(true)}
                        className="flex-1 px-6 py-3 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange/90 transition-colors shadow-lg"
                    >
                        {t('yes')}
                    </button>
                </div>

                {/* Legal Notice */}
                <p className="text-xs text-gray-500 pt-2">
                    {t('legalNotice')}
                </p>
            </div>
        </div>
    );
}
