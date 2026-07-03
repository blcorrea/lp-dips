"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug } from '@/data/products';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BuyNowButton from '@/components/BuyNowButton';
import { VariantSelector } from '@/components/products/VariantSelector';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { Star, Package, Truck, Shield, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = (params.locale as string) || 'en';
  const router = useRouter();

  const t = useTranslations('ProductDetail');

  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const displayPrice = selectedVariant.promotionalPrice || selectedVariant.price;
  const hasDiscount = !!selectedVariant.promotionalPrice;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-brand-beige/20 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-brand-purple transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('backToProducts')}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {hasDiscount && (
                  <div className="absolute top-4 left-4 bg-brand-orange text-white text-sm font-bold px-4 py-2 rounded-full">
                    SAVE {Math.round(((selectedVariant.price - displayPrice) / selectedVariant.price) * 100)}%
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-brand-purple'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-purple font-bold uppercase tracking-wide">
                  {product.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">{product.rating.toFixed(1)}</span>
                <span className="text-gray-500">
                  ({product.reviewCount} {t('reviews')})
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 py-4">
                <span className="text-4xl font-bold text-brand-purple">
                  ${displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-2xl text-gray-400 line-through">
                    ${selectedVariant.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Variant Selector */}
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
              />

              {/* Quantity */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  {t('quantity')}
                </h3>
                <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  max={selectedVariant.stock}
                  min={1}
                />
                <p className="text-sm text-gray-500">
                  {selectedVariant.stock} {t('inStock')}
                </p>
              </div>

              {/* Buy Now — real Stripe checkout */}
              <BuyNowButton
                label="Buy now"
                quantity={quantity}
                locale={locale}
                productId={product.id}
                productName={product.name}
                productPrice={displayPrice}
                className="w-full"
              />

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-brand-purple" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t('freeShipping')}</p>
                    <p className="text-xs text-gray-500">{t('freeShippingDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-brand-purple" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t('fastDelivery')}</p>
                    <p className="text-xs text-gray-500">{t('fastDeliveryDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-brand-purple" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t('secureCheckout')}</p>
                    <p className="text-xs text-gray-500">{t('secureCheckoutDesc')}</p>
                  </div>
                </div>
              </div>

              {/* Product Features */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <h3 className="font-heading font-bold text-lg text-gray-900">
                  {t('productFeatures')}
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-brand-purple rounded-full mt-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ingredients */}
              {product.ingredients.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <h3 className="font-heading font-bold text-lg text-gray-900">
                    {t('ingredients')}
                  </h3>
                  <p className="text-gray-700">
                    {product.ingredients.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
