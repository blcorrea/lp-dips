"use client";

import { useState } from "react";

type BuyNowButtonProps = {
  label?: string;
  className?: string;
  quantity?: number;
};

export default function BuyNowButton({
  label = "Buy now",
  className,
}: BuyNowButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // ⬇️ Mantenha aqui a lógica de checkout que já existia no seu arquivo original
      // Exemplo:
      // const response = await fetch("/api/stripe/create-checkout-session", { ... })
      // const data = await response.json()
      // window.location.href = data.url

    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-full bg-brand-orange px-10 py-4 text-base sm:text-lg font-bold text-brand-purple tracking-wide shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300 hover:scale-[1.04] hover:bg-brand-orange/90 hover:shadow-[0_18px_40px_rgba(242,117,33,0.38)] active:scale-[0.98] disabled:opacity-60 relative overflow-hidden ${className || ""}`}
    >
      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full" />
      <span className="relative z-10">
        {loading ? "Redirecting..." : label}
      </span>
    </button>
  );
}