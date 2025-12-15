"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getOrderById, getOrderStatusDisplay } from '@/data/orders';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, MapPin, Check } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function OrderDetailPage() {
  const params = useParams();
  const locale = params.locale as string;
  const orderId = params.id as string;

  const t = useTranslations('OrderDetail');

  const order = getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const statusDisplay = getOrderStatusDisplay(order.status);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-brand-beige/20 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Link href={`/${locale}/orders`}>
            <Button variant="outline" className="mb-6 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('backToOrders')}
            </Button>
          </Link>

          {/* Order Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">
                  {t('order')} #{order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  {t('placedOn')} {new Date(order.createdAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  statusDisplay.color === 'green'
                    ? 'bg-green-100 text-green-700'
                    : statusDisplay.color === 'purple'
                    ? 'bg-brand-purple/10 text-brand-purple'
                    : statusDisplay.color === 'orange'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {statusDisplay.label}
              </span>
            </div>
          </div>

          {/* Order Tracking */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
              {t('trackingHistory')}
            </h2>

            <div className="space-y-6">
              {order.tracking.map((tracking, index) => {
                const isLatest = index === order.tracking.length - 1;
                const isFirst = index === 0;

                return (
                  <div key={index} className="relative">
                    {/* Vertical Line */}
                    {!isFirst && (
                      <div className="absolute left-5 top-0 w-0.5 h-6 bg-gray-200 -translate-y-full" />
                    )}

                    <div className="flex gap-4">
                      {/* Status Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isLatest
                            ? 'bg-brand-purple text-white'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {isLatest ? (
                          <Package className="w-5 h-5" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </div>

                      {/* Tracking Info */}
                      <div className="flex-1 pb-6">
                        <p
                          className={`font-bold ${
                            isLatest ? 'text-brand-purple' : 'text-gray-900'
                          }`}
                        >
                          {tracking.description}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(tracking.date).toLocaleString(locale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {tracking.location && (
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {tracking.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {order.estimatedDelivery && order.status !== 'delivered' && (
              <div className="mt-6 p-4 bg-brand-purple/5 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('estimatedDelivery')}:</span>{' '}
                  {new Date(order.estimatedDelivery).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
                {t('orderItems')}
              </h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.sku} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    {item.image && (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">{item.variantName}</p>
                      <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-700 mt-2">
                        {t('quantity')}: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-purple">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Address */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                  {t('orderSummary')}
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>{t('subtotal')}</span>
                    <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{t('shipping')}</span>
                    <span className="font-semibold">
                      {order.shippingCost === 0 ? t('free') : `$${order.shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{t('tax')}</span>
                    <span className="font-semibold">${order.tax.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t('discount')}</span>
                      <span className="font-semibold">-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>{t('total')}</span>
                      <span className="text-brand-purple">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                  {t('shippingAddress')}
                </h2>
                <div className="text-gray-700">
                  <p className="font-semibold">{order.customerName}</p>
                  <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                  {order.shippingAddress.complement && <p>{order.shippingAddress.complement}</p>}
                  <p>{order.shippingAddress.neighborhood}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                  {t('paymentMethod')}
                </h2>
                <p className="text-gray-700 capitalize">
                  {order.paymentMethod.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {t('paymentStatus')}: <span className="font-semibold capitalize">{order.paymentStatus}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
