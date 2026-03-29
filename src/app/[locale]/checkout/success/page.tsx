"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { trackPurchase, popPendingCheckout } from '@/lib/tracking';

export default function CheckoutSuccessPage() {
  const t = useTranslations('CheckoutSuccess');
  const searchParams = useSearchParams();

  const sessionId = searchParams.get('session_id');

  // Fire purchase event once, using the checkout context saved by BuyNowButton.
  useEffect(() => {
    if (!sessionId) return;
    const pending = popPendingCheckout();
    if (!pending) return;

    trackPurchase({
      transactionId: sessionId,
      value:         pending.price * pending.quantity,
      currency:      pending.currency,
      items: [{
        id:       pending.productId,
        name:     pending.productName,
        price:    pending.price,
        quantity: pending.quantity,
        currency: pending.currency,
      }],
    });
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-brand-purple mb-4">
              {t('title')}
            </h1>

            <p className="text-lg text-brand-charcoal/80 mb-8">
              {t('subtitle')}
            </p>

            <div className="text-left mb-8">
              <h2 className="text-xl font-bold text-brand-purple mb-4">
                {t('whatsNext')}
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-orange font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-charcoal">{t('step1Title')}</p>
                    <p className="text-sm text-brand-charcoal/70">{t('step1Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-orange font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-charcoal">{t('step2Title')}</p>
                    <p className="text-sm text-brand-charcoal/70">{t('step2Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-orange font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-charcoal">{t('step3Title')}</p>
                    <p className="text-sm text-brand-charcoal/70">{t('step3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="https://www.dipschocolate.com/en#buy">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  {t('continueShopping')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {t('needHelp')}{' '}
                <a
                  href="mailto:orders@dipschocolate.com"
                  className="text-brand-purple hover:underline font-semibold"
                >
                  orders@dipschocolate.com
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