"use client";

import { useParams } from 'next/navigation';
import { useCustomer } from '@/contexts/CustomerContext';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, Mail, Phone, MapPin, Calendar, ShoppingBag, Heart } from 'lucide-react';

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const params = useParams();
  const locale = params.locale as string;
  const { customer } = useCustomer();

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-brand-beige/20 pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <p className="text-gray-600">{t('notLoggedIn')}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // const orders = getOrdersByCustomerId(customer.id);
  // const defaultAddress = customer.addresses.find(a => a.isDefault);

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
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
                  {t('personalInfo')}
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-purple/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-brand-purple" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{t('name')}</p>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{t('email')}</p>
                      <p className="font-semibold text-gray-900">{customer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{t('phone')}</p>
                      <p className="font-semibold text-gray-900">{customer.phone}</p>
                    </div>
                  </div>

                  {customer.birthDate && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">{t('birthDate')}</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(customer.birthDate).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
                  {t('addresses')}
                </h2>

                <div className="space-y-4">
                  {customer.addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 rounded-lg border-2 ${
                        address.isDefault
                          ? 'border-brand-purple bg-brand-purple/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-brand-purple" />
                          <p className="font-bold text-gray-900">{address.name}</p>
                        </div>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-brand-purple text-white text-xs font-bold rounded">
                            {t('default')}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-700 ml-7">
                        <p>{address.street}, {address.number}</p>
                        {address.complement && <p>{address.complement}</p>}
                        <p>{address.neighborhood}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              {/* Account Stats */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-heading font-bold text-gray-900 mb-4">
                  {t('accountStats')}
                </h2>

                <div className="space-y-4">
                  <div className="text-center p-4 bg-brand-purple/5 rounded-lg">
                    <div className="w-12 h-12 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ShoppingBag className="w-6 h-6 text-brand-purple" />
                    </div>
                    <p className="text-2xl font-bold text-brand-purple">{customer.totalOrders}</p>
                    <p className="text-sm text-gray-600">{t('totalOrders')}</p>
                  </div>

                  <div className="text-center p-4 bg-brand-orange/5 rounded-lg">
                    <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-brand-orange">
                      ${customer.totalSpent.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{t('totalSpent')}</p>
                  </div>

                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-500">{customer.wishlist.length}</p>
                    <p className="text-sm text-gray-600">{t('wishlistItems')}</p>
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <Calendar className="w-8 h-8 text-brand-purple mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">{t('memberSince')}</p>
                <p className="font-bold text-gray-900">
                  {new Date(customer.createdAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>

              {/* Last Purchase */}
              {customer.lastPurchase && (
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <ShoppingBag className="w-8 h-8 text-brand-orange mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">{t('lastPurchase')}</p>
                  <p className="font-bold text-gray-900">
                    {new Date(customer.lastPurchase).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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
