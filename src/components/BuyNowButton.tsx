"use client";

import { useState } from 'react';

type BuyNowButtonProps = {
  quantity?: number;
  label?: string;
  className?: string;
};

export default function BuyNowButton({
  quantity = 1,
  label = 'Buy now',
  className = '',
}: BuyNowButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown checkout error';
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={
        className ||
        'inline-flex items-center justify-center rounded-full bg-brand-orange px-8 py-4 text-base sm:text-lg font-bold text-brand-purple tracking-wide shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90 hover:shadow-[0_14px_34px_rgba(242,117,33,0.34)] disabled:opacity-60'
      }
    >
      {loading ? 'Redirecting...' : label}
    </button>
  );
}