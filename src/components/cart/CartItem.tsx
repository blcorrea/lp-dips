"use client";

import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { useTranslations } from 'next-intl';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  locale: string;
  showRemove?: boolean;
  readonly?: boolean;
}

export function CartItem({ item, locale, showRemove = true, readonly = false }: CartItemProps) {
  const t = useTranslations('Cart');
  const { updateQuantity, removeItem } = useCart();

  const itemTotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 last:border-0">
      {/* Product Image */}
      <Link
        href={`/${locale}/product/${item.productSlug}`}
        className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
      >
        {item.image && (
          <Image
            src={item.image}
            alt={item.productName}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        )}
      </Link>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/${locale}/product/${item.productSlug}`}
          className="font-bold text-gray-900 hover:text-brand-purple transition-colors line-clamp-1"
        >
          {item.productName}
        </Link>

        <p className="text-sm text-gray-600 mt-1">{item.variantName}</p>
        <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>

        {/* Quantity Selector */}
        {!readonly && (
          <div className="mt-3">
            <QuantitySelector
              quantity={item.quantity}
              onQuantityChange={(qty) => updateQuantity(item.variantId, qty)}
              max={item.maxStock}
              min={1}
            />
          </div>
        )}

        {readonly && (
          <p className="text-sm text-gray-600 mt-2">
            {t('quantity')}: {item.quantity}
          </p>
        )}
      </div>

      {/* Price and Remove */}
      <div className="flex flex-col items-end justify-between">
        <div className="text-right">
          <p className="font-bold text-lg text-brand-purple">
            ${itemTotal.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            ${item.price.toFixed(2)} {t('each')}
          </p>
        </div>

        {showRemove && !readonly && (
          <button
            onClick={() => removeItem(item.variantId)}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
            aria-label={t('remove')}
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('remove')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
