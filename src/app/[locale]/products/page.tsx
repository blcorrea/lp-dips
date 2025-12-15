"use client";

import { useState, useMemo } from 'react';
import { products } from '@/data/products';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductSidebar } from '@/components/products/ProductSidebar';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProductsPage() {
  const t = useTranslations('Products');
  const params = useParams();
  const locale = params.locale as string;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by stock
    if (showInStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = a.promotionalPrice || a.basePrice;
          const priceB = b.promotionalPrice || b.basePrice;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = a.promotionalPrice || a.basePrice;
          const priceB = b.promotionalPrice || b.basePrice;
          return priceB - priceA;
        });
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => {
          if (a.featured === b.featured) return 0;
          return a.featured ? -1 : 1;
        });
        break;
    }

    return filtered;
  }, [selectedCategory, sortBy, showInStockOnly]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-brand-beige/20 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <ProductSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              showInStockOnly={showInStockOnly}
              onStockFilterChange={setShowInStockOnly}
            />

            {/* Products Area */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  {t('showing')} <span className="font-bold">{filteredProducts.length}</span> {t('products')}
                  {selectedCategory && (
                    <span> {t('in')} <span className="font-bold">{selectedCategory}</span></span>
                  )}
                </p>
              </div>

              {/* Product Grid */}
              <ProductGrid products={filteredProducts} locale={locale} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
