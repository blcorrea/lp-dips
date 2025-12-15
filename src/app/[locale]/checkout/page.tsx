"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CartItem } from '@/components/cart/CartItem';
import { PaymentMethodType } from '@/lib/stripe';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { items, clearCart } = useCart();
  const { customer } = useCustomer();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/cart`);
    }
  }, [items.length, router, locale]);

  const handleCheckoutSubmit = (paymentMethod: PaymentMethodType) => {
    console.log('Payment method:', paymentMethod);
    console.log('Processing order with items:', items);
    console.log('Customer:', customer);

    // Clear cart after successful checkout
    clearCart();

    // Redirect to success page
    router.push(`/${locale}/checkout/success`);
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-brand-beige/20 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
              {t('title')}
            </h1>
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div>
              <CheckoutForm onSubmit={handleCheckoutSubmit} />
            </div>

            {/* Order Items */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
                  {t('orderItems')} ({items.length})
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <CartItem
                      key={item.variantId}
                      item={item}
                      locale={locale}
                      showRemove={false}
                      readonly={true}
                    />
                  ))}
                </div>

                {/* Edit Cart Link */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link href={`/${locale}/cart`}>
                    <Button variant="outline" className="w-full">
                      {t('editCart')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 bg-white rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{t('sslEncryption')}</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{t('securePayment')}</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{t('moneyBackGuarantee')}</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{t('customerSupport')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
