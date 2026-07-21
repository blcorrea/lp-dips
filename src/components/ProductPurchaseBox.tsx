"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import BuyNowButton from './BuyNowButton';
import { cn } from '@/lib/utils';

// ── Bundle definitions ────────────────────────────────────────────────────────
// Prices are the REAL Stripe-backed values -- NOT the Figma mock's
// placeholder $29.99/$59.99/$89.99 (all "$29.99/box"). Copying those would
// misrepresent what the customer is actually charged. discountKey/shipping
// drive the pill copy and the summary math; labelKey drives the visible
// bundle name (Figma format: "1x Box"/"2x Boxes"/"3x Boxes").

const BUNDLES = [
  {
    id:          '1x',
    labelKey:    'box1',
    priceId:     'price_1TZZWfGwnxe7ZLlEHKAy4rkm',
    unitPrice:   29.99,
    totalPrice:  29.99,
    quantity:    1,
    discountKey: 'discount0',
    shipping:    'standard',
    image:       '/images/redesign/buy-1.png',
  },
  {
    id:          '2x',
    labelKey:    'box2',
    priceId:     'price_1TZZJnGwnxe7ZLlElHcai2IT',
    unitPrice:   27.89,
    totalPrice:  55.78,
    quantity:    2,
    discountKey: 'discount2',
    shipping:    'standard',
    image:       '/images/redesign/buy-2.png',
  },
  {
    id:          '3x',
    labelKey:    'box3',
    priceId:     'price_1TZZLGGwnxe7ZLlEp1x6vZYb',
    unitPrice:   25.19,
    totalPrice:  75.57,
    quantity:    3,
    discountKey: 'discount3',
    shipping:    'free',
    image:       '/images/redesign/buy-3.png',
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

function Diamond() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-[5px] w-[5px] shrink-0 rotate-[43deg] bg-brand-orange"
    />
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductPurchaseBox({
  currencyCode  = 'USD',
  buttonClassName = '',
  productId,
  productName,
  locale        = 'en',
}: ProductPurchaseBoxProps) {
  const t = useTranslations('BuySection');

  // Default selection: 2x (anchoring — middle option)
  const [selectedId, setSelectedId] = useState<'1x' | '2x' | '3x'>('2x');

  const selectedBundle = BUNDLES.find((b) => b.id === selectedId)!;
  const total = selectedBundle.totalPrice + (selectedBundle.shipping === 'free' ? 0 : 6.97);

  return (
    <div className="space-y-[25px]">

      {/* ── Bundle cards (Figma: Frame 13, gap 10) ───────────────────────── */}
      <div className="flex flex-col gap-[10px]">
        {BUNDLES.map((bundle) => {
          const isSelected = bundle.id === selectedId;
          // "Most Popular" is a fixed attribute of the 2x bundle in Figma,
          // not tied to which card is currently selected.
          const isMostPopular = bundle.id === '2x';

          return (
            <button
              key={bundle.id}
              type="button"
              onClick={() => setSelectedId(bundle.id)}
              className={cn(
                // Mobile (RESP-04): a 2-row column (image+name/price on top,
                // pill+total below, full width) instead of the desktop's
                // single row -- matches the Figma mobile card anatomy. p-5
                // (was px-[25px] py-5, Figma mobile spec is 20px).
                'relative flex w-full flex-col gap-[10px] rounded-card border-2 p-5 text-left transition-colors duration-150 lg:flex-row lg:items-center lg:px-[25px] lg:py-5',
                isSelected
                  ? 'border-brand-orange bg-dips-card-ingredient-hl'
                  : 'border-dips-bundle-light-border bg-dips-bundle-light hover:border-brand-orange/40',
                // "Most Popular" sits on the TOP edge of the 2x card (user
                // request) -- the pill overlaps ~17px above the card's own
                // border, so this card needs extra clearance ABOVE it (not
                // below, now that the pill moved) to keep the gap between
                // all 3 cards visually even.
                isMostPopular && 'mt-[14px]'
              )}
            >
              {/* Row 1 (mobile) / left group (desktop): thumbnail + name +
                  unit price. Thumbnail — dedicated per-bundle photo
                  (buy-1/2/3.png, user-provided, bg removed). Already
                  composed in the correct orientation -- no mirror needed
                  (unlike the earlier single reused hero-product.png, which
                  was mirrored to match Figma's flip). */}
              <div className="flex items-center gap-[10px] lg:flex-1">
                <div className="relative h-[74px] w-[110px] shrink-0">
                  <Image
                    src={bundle.image}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="110px"
                  />
                </div>

                {/* Label + unit price. Mobile (RESP-04): name 18->14px,
                    one step below the Figma mobile spec (16px). */}
                <div className="flex flex-col gap-[5px]">
                  <span
                    className={cn(
                      'font-card text-[14px] font-bold leading-[1.2] lg:text-[18px]',
                      isSelected ? 'text-white' : 'text-dips-text-purple-deep'
                    )}
                  >
                    {t(bundle.labelKey)}
                  </span>
                  <span className="font-card text-[13px] text-[#96838f]">
                    ${bundle.unitPrice.toFixed(2)} / {t('perBox')}
                  </span>
                </div>
              </div>

              {/* Row 2 (mobile) / right group (desktop): discount pill +
                  total. Mobile (RESP-04): full-width row with the pill at
                  the left and the total at the right (Figma mobile spec),
                  was always a right-aligned column -- lg reverts to that. */}
              <div className="flex w-full items-center justify-between gap-[10px] lg:w-auto lg:flex-col lg:items-end">
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-[5px] rounded-full border-2 px-[15px] py-2 font-card text-[9px] font-bold',
                    isSelected
                      ? 'border-dips-card-ingredient-hl-border bg-[rgba(55,22,41,0.15)] text-white'
                      : 'border-dips-bundle-light-border bg-white text-dips-text-purple-deep'
                  )}
                >
                  <Diamond />
                  {t(bundle.discountKey)}
                </span>
                {/* Mobile (RESP-04): total 18->16px. */}
                <span
                  className={cn(
                    'font-card text-[16px] font-bold leading-[1.2] lg:text-[18px]',
                    isSelected ? 'text-white' : 'text-dips-text-purple-deep'
                  )}
                >
                  ${bundle.totalPrice.toFixed(2)}
                </span>
              </div>

              {isMostPopular && (
                <span className="absolute -top-[17px] left-1/2 -translate-x-1/2 rounded-full bg-brand-orange px-[15px] py-2.5 font-body text-[12px] font-bold text-white">
                  {t('mostPopular')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Summary panel — 2 columns (Figma: unit price | shipping).
            Mobile (RESP-04): p-5 (was px-[25px] py-5, Figma mobile spec is
            20px), labels 12px (Figma mobile spec literal), values 16px
            (18->16, one step below). ──────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-card border-2 border-dips-bundle-light-border bg-dips-bundle-summary p-5 lg:px-[25px] lg:py-5">
        <div className="flex flex-col gap-[5px]">
          <span className="font-card text-[12px] text-[#96838f] lg:text-[13px]">{t('unitPrice')}</span>
          <span className="font-card text-[16px] font-bold text-dips-text-purple-deep lg:text-[18px]">
            ${selectedBundle.unitPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-[5px]">
          <span className="font-card text-[12px] text-[#96838f] lg:text-[13px]">{t('shipping')}</span>
          {selectedBundle.shipping === 'free' ? (
            <span className="font-card text-[16px] font-bold text-green-600 lg:text-[18px]">
              {t('freeShipping')}
            </span>
          ) : (
            <span className="font-card text-[16px] font-bold text-dips-text-purple-deep lg:text-[18px]">
              $6.97
            </span>
          )}
        </div>
      </div>

      {/* ── Buy button — total folded into the same pill (right-aligned
            overlay); label + total both white per Figma. ─────────────────── */}
      <div className="relative">
        <BuyNowButton
          priceId={selectedBundle.priceId}
          quantity={selectedBundle.quantity}
          label={t('buyNow')}
          className={cn('h-[50px] w-full justify-between pl-10 pr-28 font-cta text-[14px] font-semibold text-white', buttonClassName)}
          productId={productId}
          productName={productName}
          productPrice={selectedBundle.totalPrice}
          currency={currencyCode}
          locale={locale}
        />
        <span className="pointer-events-none absolute inset-y-0 right-10 flex items-center font-cta text-[14px] font-semibold text-white">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
