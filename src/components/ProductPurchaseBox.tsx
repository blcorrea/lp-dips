"use client";

import { useState } from 'react';
import BuyNowButton from './BuyNowButton';

// ── Bundle definitions ────────────────────────────────────────────────────────

const BUNDLES = [
  {
    id:         '1x',
    label:      '1 Box',
    priceId:    'price_1TZZWfGwnxe7ZLlEHKAy4rkm',
    unitPrice:  29.99,
    totalPrice: 29.99,
    quantity:   1,
    badge:      null,
    shipping:   'standard',
  },
  {
    id:         '2x',
    label:      '2 Boxes',
    priceId:    'price_1TZZJnGwnxe7ZLlElHcai2IT',
    unitPrice:  27.89,
    totalPrice: 55.78,
    quantity:   2,
    badge:      'Save 7%',
    shipping:   'standard',
  },
  {
    id:         '3x',
    label:      '3 Boxes',
    priceId:    'price_1TZZLGGwnxe7ZLlEp1x6vZYb',
    unitPrice:  25.19,
    totalPrice: 75.57,
    quantity:   3,
    badge:      'Save 16% + Free Shipping',
    shipping:   'free',
  },
] as const;

// ── Props — external interface unchanged so BuySection.tsx needs no edits ─────

type ProductPurchaseBoxProps = {
  priceAmount:      number;
  currencyCode?:    string;
  buttonLabel?:     string;
  buttonClassName?: string;
  productId?:       string;
  productName?:     string;
  locale?:          string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductPurchaseBox({
  currencyCode  = 'USD',
  buttonLabel   = 'Buy now',
  buttonClassName = '',
  productId,
  productName,
  locale        = 'en',
}: ProductPurchaseBoxProps) {
  // Default selection: 2x (anchoring — middle option)
  const [selectedId, setSelectedId] = useState<'1x' | '2x' | '3x'>('2x');

  const selectedBundle = BUNDLES.find((b) => b.id === selectedId)!;

  return (
    <div className="space-y-4">

      {/* ── Bundle cards ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {BUNDLES.map((bundle) => {
          const isSelected = bundle.id === selectedId;
          return (
            <button
              key={bundle.id}
              type="button"
              onClick={() => setSelectedId(bundle.id)}
              className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-all duration-150
                ${isSelected
                  ? 'border-brand-purple bg-brand-purple/5 shadow-sm'
                  : 'border-brand-purple/15 bg-white hover:border-brand-purple/30'
                }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: radio + label */}
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                    ${isSelected ? 'border-brand-purple' : 'border-brand-purple/30'}`}>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-brand-purple block" />
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-brand-charcoal text-[14px] leading-tight">
                      {bundle.label}
                    </p>
                    <p className="text-brand-charcoal/50 text-[12px]">
                      ${bundle.unitPrice.toFixed(2)} / box
                    </p>
                  </div>
                </div>

                {/* Right: badge + total */}
                <div className="text-right shrink-0">
                  {bundle.badge && (
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mb-0.5
                      ${bundle.shipping === 'free'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-brand-orange/10 text-brand-orange'
                      }`}>
                      {bundle.badge}
                    </span>
                  )}
                  <p className="font-bold text-brand-purple text-[15px]">
                    ${bundle.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Summary panel ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-purple/10 bg-white px-5 py-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-sm text-brand-charcoal/70">
          <span>Unit price</span>
          <span className="font-medium text-brand-charcoal">
            ${selectedBundle.unitPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-brand-charcoal/70">
          <span>Shipping</span>
          {selectedBundle.shipping === 'free' ? (
            <span className="font-semibold text-green-600">Free</span>
          ) : (
            <span className="font-medium text-brand-charcoal">$6.97</span>
          )}
        </div>
        <div className="flex items-center justify-between text-base pt-1 border-t border-brand-purple/10">
          <span className="font-semibold text-brand-purple">Total</span>
          <span className="text-xl font-bold text-brand-purple">
            ${(selectedBundle.totalPrice + (selectedBundle.shipping === 'free' ? 0 : 6.97)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── Buy button ────────────────────────────────────────────────────── */}
      <BuyNowButton
        priceId={selectedBundle.priceId}
        quantity={selectedBundle.quantity}
        label={buttonLabel}
        className={`inline-flex items-center justify-center rounded-full bg-brand-orange px-10 py-4 text-base sm:text-lg font-bold text-brand-purple tracking-wide shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90 hover:shadow-[0_14px_34px_rgba(242,117,33,0.34)] disabled:opacity-60 ${buttonClassName}`}
        productId={productId}
        productName={productName}
        productPrice={selectedBundle.totalPrice}
        currency={currencyCode}
        locale={locale}
      />
    </div>
  );
}
