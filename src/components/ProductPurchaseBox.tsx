"use client";

import { useMemo, useState } from 'react';
import BuyNowButton from './BuyNowButton';
import { formatLocalizedPrice } from '@/lib/pricing';

type ProductPurchaseBoxProps = {
  priceAmount:      number;
  currencyCode?:    string;
  buttonLabel?:     string;
  buttonClassName?: string;
  // Optional — passed through to BuyNowButton for tracking
  productId?:       string;
  productName?:     string;
  // Locale drives currency formatting and is forwarded to the checkout API
  locale?:          string;
};

export default function ProductPurchaseBox({
  priceAmount,
  currencyCode = 'USD',
  buttonLabel = 'Buy now',
  buttonClassName = '',
  productId,
  productName,
  locale = 'en',
}: ProductPurchaseBoxProps) {
  const [quantity, setQuantity] = useState(1);

  function decrease() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function increase() {
    setQuantity((prev) => Math.min(10, prev + 1));
  }

  const formattedUnitPrice = useMemo(
    () => formatLocalizedPrice(locale, priceAmount, currencyCode),
    [priceAmount, currencyCode, locale]
  );

  const formattedTotal = useMemo(
    () => formatLocalizedPrice(locale, priceAmount * quantity, currencyCode),
    [priceAmount, quantity, currencyCode, locale]
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm text-brand-charcoal/70">Quantity</p>

        <div className="inline-flex items-center overflow-hidden rounded-full border border-brand-purple/15 bg-white shadow-sm">
          <button
            type="button"
            onClick={decrease}
            className="flex h-12 w-12 items-center justify-center text-xl font-bold text-brand-purple transition-colors hover:bg-brand-cream"
            aria-label="Decrease quantity"
          >
            −
          </button>

          <div className="min-w-[58px] text-center text-base font-semibold text-brand-charcoal">
            {quantity}
          </div>

          <button
            type="button"
            onClick={increase}
            className="flex h-12 w-12 items-center justify-center text-xl font-bold text-brand-purple transition-colors hover:bg-brand-cream"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-purple/10 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-brand-charcoal/70">
          <span>Unit price</span>
          <span className="font-medium text-brand-charcoal">{formattedUnitPrice}</span>
        </div>

        <div className="mt-2 flex items-center justify-between text-base">
          <span className="font-semibold text-brand-purple">Total</span>
          <span className="text-xl font-bold text-brand-purple">{formattedTotal}</span>
        </div>
      </div>

      <BuyNowButton
        quantity={quantity}
        label={buttonLabel}
        className={`inline-flex items-center justify-center rounded-full bg-brand-orange px-10 py-4 text-base sm:text-lg font-bold text-brand-purple tracking-wide shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90 hover:shadow-[0_14px_34px_rgba(242,117,33,0.34)] disabled:opacity-60 ${buttonClassName}`}
        productId={productId}
        productName={productName}
        productPrice={priceAmount}
        currency={currencyCode}
        locale={locale}
      />
    </div>
  );
}