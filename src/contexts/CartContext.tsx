"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductVariant } from '@/data/products';

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
  maxStock: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (variantId: string) => boolean;
  getItemQuantity: (variantId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dpis-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items, isInitialized]);

  const addItem = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.variantId === variant.id);

      if (existingItem) {
        // Update quantity if item already exists
        return currentItems.map(item =>
          item.variantId === variant.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, variant.stock)
              }
            : item
        );
      }

      // Add new item
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantId: variant.id,
        variantName: variant.name,
        sku: variant.sku,
        price: variant.promotionalPrice || variant.price,
        quantity: Math.min(quantity, variant.stock),
        image: product.images[0],
        maxStock: variant.stock
      };

      return [...currentItems, newItem];
    });
  };

  const removeItem = (variantId: string) => {
    setItems(currentItems => currentItems.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.variantId === variantId
          ? {
              ...item,
              quantity: Math.min(quantity, item.maxStock)
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (variantId: string): boolean => {
    return items.some(item => item.variantId === variantId);
  };

  const getItemQuantity = (variantId: string): number => {
    const item = items.find(item => item.variantId === variantId);
    return item ? item.quantity : 0;
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
