"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, mockCustomer } from '@/data/customers';

interface CustomerContextType {
  customer: Customer | null;
  isLoggedIn: boolean;
  login: (customer: Customer) => void;
  logout: () => void;
  updateCustomer: (updates: Partial<Customer>) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const CUSTOMER_STORAGE_KEY = 'dpis-customer';
const AUTH_STORAGE_KEY = 'dpis-authenticated';

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load customer from localStorage on mount (simulate session)
  useEffect(() => {
    try {
      const isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
      const stored = localStorage.getItem(CUSTOMER_STORAGE_KEY);

      if (isAuthenticated && stored) {
        setCustomer(JSON.parse(stored));
      } else if (isAuthenticated) {
        // If authenticated but no stored data, use mock customer
        setCustomer(mockCustomer);
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(mockCustomer));
      }
    } catch (error) {
      console.error('Error loading customer from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Auto-login mock customer for POC (simulating logged-in state)
  useEffect(() => {
    if (isInitialized && !customer) {
      // Auto-login for demo purposes
      const autoLogin = false; // disabled for production launch — see CONCERNS.md
      if (autoLogin) {
        login(mockCustomer);
      }
    }
  }, [isInitialized]);

  // Save customer to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && customer) {
      try {
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
      } catch (error) {
        console.error('Error saving customer to localStorage:', error);
      }
    }
  }, [customer, isInitialized]);

  const login = (customerData: Customer) => {
    setCustomer(customerData);
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerData));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  };

  const updateCustomer = (updates: Partial<Customer>) => {
    if (customer) {
      const updatedCustomer = { ...customer, ...updates };
      setCustomer(updatedCustomer);
    }
  };

  const addToWishlist = (productId: string) => {
    if (customer && !customer.wishlist.includes(productId)) {
      const updatedWishlist = [...customer.wishlist, productId];
      updateCustomer({ wishlist: updatedWishlist });
    }
  };

  const removeFromWishlist = (productId: string) => {
    if (customer) {
      const updatedWishlist = customer.wishlist.filter(id => id !== productId);
      updateCustomer({ wishlist: updatedWishlist });
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return customer ? customer.wishlist.includes(productId) : false;
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        login,
        logout,
        updateCustomer,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
