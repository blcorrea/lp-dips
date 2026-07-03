import { describe, it, expect } from 'vitest';
import {
  LOCALIZED_PRICING,
  isSupportedLocale,
  getLocalizedPricing,
  formatLocalizedPrice,
  getWeightLabel,
} from '@/lib/pricing';

describe('isSupportedLocale', () => {
  it('accepts the three supported locales', () => {
    expect(isSupportedLocale('en')).toBe(true);
    expect(isSupportedLocale('pt')).toBe(true);
    expect(isSupportedLocale('es')).toBe(true);
  });

  it('rejects unsupported or malformed values', () => {
    expect(isSupportedLocale('fr')).toBe(false);
    expect(isSupportedLocale('EN')).toBe(false);
    expect(isSupportedLocale('pt-BR')).toBe(false);
    expect(isSupportedLocale('')).toBe(false);
  });
});

describe('getLocalizedPricing', () => {
  it('returns locale-specific pricing for supported locales', () => {
    expect(getLocalizedPricing('en')).toEqual({ price: 29.99, currency: 'USD' });
    expect(getLocalizedPricing('pt')).toEqual({ price: 89.99, currency: 'BRL' });
    expect(getLocalizedPricing('es')).toEqual({ price: 24.99, currency: 'EUR' });
  });

  it('falls back to English pricing for unknown locales', () => {
    expect(getLocalizedPricing('fr')).toEqual(LOCALIZED_PRICING.en);
    expect(getLocalizedPricing('')).toEqual(LOCALIZED_PRICING.en);
    expect(getLocalizedPricing('pt-BR')).toEqual(LOCALIZED_PRICING.en);
  });
});

describe('formatLocalizedPrice', () => {
  it('formats USD for English', () => {
    expect(formatLocalizedPrice('en', 29.99, 'USD')).toBe('$29.99');
  });

  it('formats BRL for Portuguese with pt-BR conventions', () => {
    const formatted = formatLocalizedPrice('pt', 89.99, 'BRL');
    // Intl uses a non-breaking space between symbol and value in pt-BR
    expect(formatted.replace(/ /g, ' ')).toBe('R$ 89,99');
  });

  it('formats EUR for Spanish with es-ES conventions', () => {
    const formatted = formatLocalizedPrice('es', 24.99, 'EUR');
    expect(formatted.replace(/ /g, ' ')).toBe('24,99 €');
  });

  it('falls back to en-US formatting for unknown locales', () => {
    expect(formatLocalizedPrice('de', 10, 'USD')).toBe('$10.00');
  });

  it('always renders exactly two fraction digits', () => {
    expect(formatLocalizedPrice('en', 5, 'USD')).toBe('$5.00');
    expect(formatLocalizedPrice('en', 5.5, 'USD')).toBe('$5.50');
    // maximumFractionDigits: 2 rounds half-up-ish per Intl default
    expect(formatLocalizedPrice('en', 5.999, 'USD')).toBe('$6.00');
  });

  it('formats zero', () => {
    expect(formatLocalizedPrice('en', 0, 'USD')).toBe('$0.00');
  });
});

describe('getWeightLabel', () => {
  it('returns locale-specific weight labels', () => {
    expect(getWeightLabel('en', 250)).toBe('Net weight: 250g');
    expect(getWeightLabel('pt', 250)).toBe('Peso líquido: 250g');
    expect(getWeightLabel('es', 250)).toBe('Peso neto: 250g');
  });

  it('falls back to English for unknown locales', () => {
    expect(getWeightLabel('fr', 100)).toBe('Net weight: 100g');
  });
});
