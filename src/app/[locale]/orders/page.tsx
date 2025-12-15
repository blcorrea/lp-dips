"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCustomer } from '@/contexts/CustomerContext';
import { useTranslations } from 'next-intl';
import { getOrdersByCustomerId, getOrderStatusDisplay, getLatestTracking } from '@/data/orders';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Package, Eye, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const t = useTranslations('Orders');
  const params = useParams();
  const locale = params.locale as string;
  const { customer } = useCustomer();

  const orders = customer ? getOrdersByCustomerId(customer.id) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-brand-beige/20 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
              {t('title')}
            </h1>
            <p className="text-gray-600">
              {orders.length === 0
                ? t('noOrders')
                : orders.length === 1
                ? t('oneOrder')
                : t('multipleOrders', { count: orders.length })}
            </p>
          </div>

          {orders.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                {t('noOrdersTitle')}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {t('noOrdersDesc')}
              </p>
              <Link href={`/${locale}/products`}>
                <Button variant="purple" size="lg" className="flex items-center gap-2 mx-auto">
                  <ShoppingBag className="w-5 h-5" />
                  {t('startShopping')}
                </Button>
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-6">
              {orders.map((order) => {
                const statusDisplay = getOrderStatusDisplay(order.status);
                const latestTracking = getLatestTracking(order);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {t('order')} #{order.orderNumber}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              statusDisplay.color === 'green'
                                ? 'bg-green-100 text-green-700'
                                : statusDisplay.color === 'purple'
                                ? 'bg-brand-purple/10 text-brand-purple'
                                : statusDisplay.color === 'orange'
                                ? 'bg-orange-100 text-orange-700'
                                : statusDisplay.color === 'red'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {statusDisplay.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {t('placedOn')} {new Date(order.createdAt).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/${locale}/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {t('viewDetails')}
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.sku} className="flex-shrink-0">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {item.image && (
                              <div className="w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.quantity}x ${item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex-shrink-0 flex items-center">
                          <div className="px-4 py-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              +{order.items.length - 3} {t('moreItems')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Latest Tracking Info */}
                    {latestTracking && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-brand-purple mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {latestTracking.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(latestTracking.date).toLocaleString(locale, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {latestTracking.location && ` · ${latestTracking.location}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-brand-purple">
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
