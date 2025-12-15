"use client";

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total?: number;
  locale: string;
  showCheckoutButton?: boolean;
  checkoutUrl?: string;
}

export function CartSummary({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  total,
  locale,
  showCheckoutButton = true,
  checkoutUrl
}: CartSummaryProps) {
  const t = useTranslations('Cart');

  const calculatedTotal = total ?? subtotal + shipping + tax - discount;
  const hasAdditionalCharges = shipping > 0 || tax > 0 || discount > 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
      <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
        {t('orderSummary')}
      </h2>

      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-700">
          <span>{t('subtotal')}</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        {hasAdditionalCharges && (
          <>
            <div className="flex justify-between text-gray-700">
              <span>{t('shipping')}</span>
              <span className="font-semibold">
                {shipping === 0 ? t('free') : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            {/* Tax */}
            {tax > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>{t('tax')}</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
            )}

            {/* Discount */}
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {t('discount')}
                </span>
                <span className="font-semibold">-${discount.toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>{t('total')}</span>
            <span className="text-brand-purple">${calculatedTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {showCheckoutButton && (
        <div className="space-y-3">
          <Link href={checkoutUrl || `/${locale}/checkout`}>
            <Button variant="purple" className="w-full flex items-center justify-center gap-2" size="lg">
              {t('proceedToCheckout')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>

          <Link href={`/${locale}/products`}>
            <Button variant="outline" className="w-full">
              {t('continueShopping')}
            </Button>
          </Link>
        </div>
      )}

      {/* Free Shipping Notice */}
      {shipping === 0 && subtotal > 0 && hasAdditionalCharges && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 text-center font-semibold">
            {t('freeShippingApplied')}
          </p>
        </div>
      )}

      {/* Shipping Threshold */}
      {subtotal > 0 && subtotal < 50 && !hasAdditionalCharges && (
        <div className="mt-4 p-3 bg-brand-orange/10 rounded-lg">
          <p className="text-sm text-brand-orange text-center">
            {t('freeShippingThreshold', { amount: (50 - subtotal).toFixed(2) })}
          </p>
        </div>
      )}
    </div>
  );
}
