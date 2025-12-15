"use client";

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { PaymentMethodType } from '@/lib/stripe';

interface CheckoutFormProps {
  onSubmit: (paymentMethod: PaymentMethodType) => void;
}

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const t = useTranslations('Checkout');
  const { customer } = useCustomer();
  const { subtotal } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);

  const shipping = subtotal >= 50 ? 0 : 12;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      onSubmit('credit_card');
      setIsProcessing(false);
    }, 2000);
  };

  const defaultAddress = customer?.addresses.find(a => a.isDefault);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
          {t('shippingAddress')}
        </h2>
        {defaultAddress ? (
          <div className="text-gray-700">
            <p className="font-semibold">{customer?.name}</p>
            <p>{defaultAddress.street}, {defaultAddress.number}</p>
            {defaultAddress.complement && <p>{defaultAddress.complement}</p>}
            <p>{defaultAddress.neighborhood}</p>
            <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipCode}</p>
            <p>{defaultAddress.country}</p>
          </div>
        ) : (
          <p className="text-gray-500">{t('noAddress')}</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
          {t('paymentMethod')}
        </h2>

        {/* Card Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('cardNumber')}
            </label>
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              defaultValue="4242 4242 4242 4242"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('expiryDate')}
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                defaultValue="12/25"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('cvv')}
              </label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                defaultValue="123"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="w-4 h-4" />
            <span>{t('testMode')}</span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
          {t('orderSummary')}
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>{t('subtotal')}</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>{t('shipping')}</span>
            <span className="font-semibold">
              {shipping === 0 ? t('free') : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>{t('tax')}</span>
            <span className="font-semibold">${tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>{t('total')}</span>
              <span className="text-brand-purple">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <Button
        type="submit"
        variant="purple"
        size="lg"
        className="w-full flex items-center justify-center gap-2 text-lg py-6"
        disabled={isProcessing || !defaultAddress}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('processing')}
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            {t('placeOrder')} - ${total.toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Lock className="w-4 h-4" />
        <span>{t('secureCheckout')}</span>
      </div>
    </form>
  );
}
