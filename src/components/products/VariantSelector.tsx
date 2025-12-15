"use client";

import { ProductVariant } from '@/data/products';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange
}: VariantSelectorProps) {
  const t = useTranslations('Products');

  if (variants.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
        {t('selectSize')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariant.id;
          const isOutOfStock = variant.stock === 0;
          const isLowStock = variant.stock > 0 && variant.stock < 10;
          const price = variant.promotionalPrice || variant.price;

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onVariantChange(variant)}
              disabled={isOutOfStock}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-brand-purple bg-brand-purple/5'
                  : isOutOfStock
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  : 'border-gray-200 hover:border-brand-purple/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-brand-purple rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="text-left">
                <p className="font-bold text-gray-900 mb-1">{variant.name}</p>
                <p className="text-lg font-bold text-brand-purple">
                  ${price.toFixed(2)}
                </p>
                {variant.promotionalPrice && (
                  <p className="text-sm text-gray-400 line-through">
                    ${variant.price.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  SKU: {variant.sku}
                </p>
                {isOutOfStock && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    {t('outOfStock')}
                  </p>
                )}
                {isLowStock && !isOutOfStock && (
                  <p className="text-xs text-orange-500 font-semibold mt-1">
                    {t('onlyXLeft', { count: variant.stock })}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
