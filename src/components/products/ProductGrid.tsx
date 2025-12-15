"use client";

import { Product } from '@/data/products';
import { ProductCard } from './ProductCard';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
  locale: string;
}

export function ProductGrid({ products, locale }: ProductGridProps) {
  const t = useTranslations('Products');

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-500">{t('noProducts')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <ProductCard product={product} locale={locale} />
        </motion.div>
      ))}
    </div>
  );
}
