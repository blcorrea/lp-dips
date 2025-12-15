"use client";

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const t = useTranslations('CheckoutSuccess');
  const params = useParams();
  const locale = params.locale as string;

  // Mock order number
  const orderNumber = `DPIS-2025-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-brand-beige/20 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t('title')}
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              {t('subtitle')}
            </p>

            {/* Order Number */}
            <div className="bg-brand-purple/5 border-2 border-brand-purple/20 rounded-xl p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">{t('orderNumber')}</p>
              <p className="text-2xl font-bold text-brand-purple font-mono">
                {orderNumber}
              </p>
            </div>

            {/* What's Next */}
            <div className="text-left mb-8">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                {t('whatsNext')}
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-orange font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('step1Title')}</p>
                    <p className="text-sm text-gray-600">{t('step1Desc')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-orange font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('step2Title')}</p>
                    <p className="text-sm text-gray-600">{t('step2Desc')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-orange font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('step3Title')}</p>
                    <p className="text-sm text-gray-600">{t('step3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link href={`/${locale}/orders`}>
                <Button variant="purple" size="lg" className="w-full flex items-center justify-center gap-2">
                  <Package className="w-5 h-5" />
                  {t('viewOrder')}
                </Button>
              </Link>
              <Link href={`/${locale}/products`}>
                <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2">
                  {t('continueShopping')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {t('needHelp')}{' '}
                <a href="mailto:support@dpis.com" className="text-brand-purple hover:underline font-semibold">
                  support@dpis.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
