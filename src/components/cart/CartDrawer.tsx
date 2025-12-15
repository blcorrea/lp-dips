"use client";

import { useCart } from '@/contexts/CartContext';
import { useTranslations } from 'next-intl';
import { X, ShoppingBag } from 'lucide-react';
import { CartItem } from './CartItem';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function CartDrawer({ isOpen, onClose, locale }: CartDrawerProps) {
  const t = useTranslations('Cart');
  const { items, itemCount, subtotal } = useCart();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-purple" />
            <h2 className="text-xl font-heading font-bold text-gray-900">
              {t('shoppingCart')}
            </h2>
            <span className="bg-brand-purple text-white text-sm font-bold px-2 py-1 rounded-full">
              {itemCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label={t('close')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">{t('emptyCart')}</p>
              <p className="text-sm text-gray-400">{t('addItemsToCart')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.variantId} item={item} locale={locale} showRemove={true} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
              <span>{t('subtotal')}</span>
              <span className="text-brand-purple">${subtotal.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Link href={`/${locale}/cart`} onClick={onClose}>
                <Button variant="purple" className="w-full" size="lg">
                  {t('viewCart')}
                </Button>
              </Link>
              <Link href={`/${locale}/checkout`} onClick={onClose}>
                <Button variant="outline" className="w-full">
                  {t('checkout')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
