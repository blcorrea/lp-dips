"use client";

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  max?: number;
  min?: number;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  max = 99,
  min = 1
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(max, value));
    onQuantityChange(clampedValue);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-brand-purple hover:bg-brand-purple/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg font-bold text-gray-900 focus:border-brand-purple focus:outline-none"
      />

      <button
        onClick={handleIncrease}
        disabled={quantity >= max}
        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-brand-purple hover:bg-brand-purple/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
