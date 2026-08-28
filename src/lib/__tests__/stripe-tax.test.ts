import { describe, expect, it } from 'vitest';
import { isAutomaticTaxEnabled } from '../stripe-tax';

describe('isAutomaticTaxEnabled', () => {
  it('is enabled only for the literal string "true"', () => {
    expect(isAutomaticTaxEnabled({ STRIPE_AUTOMATIC_TAX_ENABLED: 'true' })).toBe(true);
  });

  it('is disabled when the variable is unset', () => {
    expect(isAutomaticTaxEnabled({})).toBe(false);
  });

  it('is disabled for empty, "false" and truthy-looking values', () => {
    expect(isAutomaticTaxEnabled({ STRIPE_AUTOMATIC_TAX_ENABLED: '' })).toBe(false);
    expect(isAutomaticTaxEnabled({ STRIPE_AUTOMATIC_TAX_ENABLED: 'false' })).toBe(false);
    expect(isAutomaticTaxEnabled({ STRIPE_AUTOMATIC_TAX_ENABLED: '1' })).toBe(false);
    expect(isAutomaticTaxEnabled({ STRIPE_AUTOMATIC_TAX_ENABLED: 'TRUE' })).toBe(false);
  });
});
