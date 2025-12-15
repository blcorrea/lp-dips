"use client";

import { useCart } from '@/contexts/CartContext';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const t = useTranslations('Cart');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { items, itemCount, subtotal } = useCart();

  // Calculate shipping (free over $50)
  const shipping = subtotal >= 50 ? 0 : 12;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-brand-beige/20 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-brand-purple transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('continueShopping')}</span>
          </button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
              {t('shoppingCart')}
            </h1>
            <p className="text-gray-600">
              {itemCount === 0
                ? t('emptyCart')
                : itemCount === 1
                ? t('oneItem')
                : t('multipleItems', { count: itemCount })}
            </p>
          </div>

          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                {t('emptyCartTitle')}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {t('emptyCartDesc')}
              </p>
              <Link href={`/${locale}/products`}>
                <Button variant="purple" size="lg" className="flex items-center gap-2 mx-auto">
                  <ShoppingBag className="w-5 h-5" />
                  {t('startShopping')}
                </Button>
              </Link>
            </div>
          ) : (
            /* Cart with Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
                    {t('items')}
                  </h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItem key={item.variantId} item={item} locale={locale} />
                    ))}
                  </div>

                  {/* Continue Shopping */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Link href={`/${locale}/products`}>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        {t('continueShopping')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <CartSummary
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                  locale={locale}
                  showCheckoutButton={true}
                />
              </div>
            </div>
          )}

          {/* Trust Badges */}
          {items.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-brand-purple" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{t('securePayment')}</h3>
                <p className="text-sm text-gray-600">{t('securePaymentDesc')}</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{t('qualityGuarantee')}</h3>
                <p className="text-sm text-gray-600">{t('qualityGuaranteeDesc')}</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{t('easyReturns')}</h3>
                <p className="text-sm text-gray-600">{t('easyReturnsDesc')}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
