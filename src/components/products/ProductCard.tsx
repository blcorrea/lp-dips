"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/data/products';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('Products');

  const displayPrice = product.promotionalPrice || product.basePrice;
  const hasDiscount = !!product.promotionalPrice;

  return (
    <Link
      href={`/${locale}/product/${product.slug}`}
      className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full">
              -{Math.round(((product.basePrice - displayPrice) / product.basePrice) * 100)}%
            </span>
          )}
          {product.lowStock && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('lowStock')}
            </span>
          )}
          {!product.inStock && (
            <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('outOfStock')}
            </span>
          )}
        </div>

      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Category */}
        <p className="text-xs text-brand-purple font-semibold uppercase tracking-wide mb-2">
          {product.category}
        </p>

        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-brand-purple transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {product.shortDescription}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900 ml-1">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviewCount} {t('reviews')})
          </span>
        </div>

        {/* Price */}
        <div className="flex flex-col items-start justify-start gap-4 mt-auto">
          <div className="flex items-baseline gap-2 flex-shrink-0">
            <span className="text-2xl font-bold text-brand-purple">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ${product.basePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
