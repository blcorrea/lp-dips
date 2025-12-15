"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCustomer } from '@/contexts/CustomerContext';
import { useTranslations } from 'next-intl';
import { products } from '@/data/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const t = useTranslations('Wishlist');
  const params = useParams();
  const locale = params.locale as string;
  const { customer } = useCustomer();

  const wishlistProducts = customer
    ? products.filter(p => customer.wishlist.includes(p.id))
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-brand-beige/20 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
              {t('title')}
            </h1>
            <p className="text-gray-600">
              {wishlistProducts.length === 0
                ? t('emptyWishlist')
                : wishlistProducts.length === 1
                ? t('oneItem')
                : t('multipleItems', { count: wishlistProducts.length })}
            </p>
          </div>

          {wishlistProducts.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                {t('emptyWishlistTitle')}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {t('emptyWishlistDesc')}
              </p>
              <Link href={`/${locale}/products`}>
                <Button variant="purple" size="lg" className="flex items-center gap-2 mx-auto">
                  <ShoppingBag className="w-5 h-5" />
                  {t('browseProd ucts')}
                </Button>
              </Link>
            </div>
          ) : (
            /* Wishlist Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          )}

          {/* Tips */}
          {wishlistProducts.length > 0 && (
            <div className="mt-12 bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-purple/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-brand-purple" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-gray-900 mb-2">
                    {t('tipTitle')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('tipDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
