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
  quantity = 1,
}: BuyNowButtonProps) {
  const [loading, setLoading]           = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ quantity }),
      });

      const data: { ok: boolean; url?: string; error?: string } =
        await response.json();

      if (!data.ok || !data.url) {
        throw new Error(data.error ?? "Failed to start checkout. Please try again.");
      }

      // Keep loading=true while navigating — page is leaving
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Checkout failed. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <>
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
      {errorMessage && (
        <p className="text-sm text-red-600 mt-2 text-center">{errorMessage}</p>
      )}
    </>
  );
}
