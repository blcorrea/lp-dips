"use client";

import Image from 'next/image';
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
  const total = selectedBundle.totalPrice + (selectedBundle.shipping === 'free' ? 0 : 6.97);

  return (
    <div className="space-y-4">

      {/* ── Bundle cards ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {BUNDLES.map((bundle) => {
          const isSelected = bundle.id === selectedId;
          return (
            <button
              key={bundle.id}
              type="button"
              onClick={() => setSelectedId(bundle.id)}
              className={`relative w-full text-left rounded-card border-2 px-4 py-3.5 transition-all duration-150
                ${isSelected
                  ? 'bg-dips-card-ingredient-hl border-brand-orange shadow-sm'
                  : 'bg-dips-bundle-light border-dips-bundle-light-border hover:border-brand-orange/40'
                }`}
            >
              {/* Floating "Most Popular" badge — selected (2x default) card only */}
              {isSelected && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/90">
                  <Image
                    src="/images/redesign/product-box-small.png"
                    alt=""
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>

                {/* Label + unit price */}
                <div className="flex-1">
                  <p className={`font-semibold text-[14px] leading-tight
                    ${isSelected ? 'text-white' : 'text-dips-text-purple-deep'}`}>
                    {bundle.label}
                  </p>
                  <p className={`text-[12px] ${isSelected ? 'text-white/70' : 'text-dips-text-purple-deep/60'}`}>
                    ${bundle.unitPrice.toFixed(2)} / box
                  </p>
                </div>

                {/* Right: discount badge + total */}
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
                  <p className={`font-bold text-[15px] ${isSelected ? 'text-white' : 'text-dips-text-purple-deep'}`}>
                    ${bundle.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Summary panel ─────────────────────────────────────────────────── */}
      <div className="rounded-card border border-dips-bundle-light-border bg-dips-bundle-summary px-5 py-4 space-y-2">
        <div className="flex items-center justify-between text-sm text-dips-text-purple-deep/70">
          <span>Unit Price</span>
          <span className="font-medium text-dips-text-purple-deep">
            ${selectedBundle.unitPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-dips-text-purple-deep/70">
          <span>Shipping</span>
          {selectedBundle.shipping === 'free' ? (
            <span className="font-semibold text-green-600">Free</span>
          ) : (
            <span className="font-medium text-dips-text-purple-deep">$6.97</span>
          )}
        </div>
      </div>

      {/* ── Buy button — total folded into the same pill (right-aligned overlay,
            keeps BuyNowButton.tsx itself byte-for-byte untouched) ──────────── */}
      <div className="relative">
        <BuyNowButton
          priceId={selectedBundle.priceId}
          quantity={selectedBundle.quantity}
          label={buttonLabel}
          className={`w-full justify-between pl-10 pr-28 ${buttonClassName}`}
          productId={productId}
          productName={productName}
          productPrice={selectedBundle.totalPrice}
          currency={currencyCode}
          locale={locale}
        />
        <span className="pointer-events-none absolute inset-y-0 right-10 flex items-center text-lg font-bold text-brand-purple">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
