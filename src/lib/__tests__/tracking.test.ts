import { describe, expect, it } from 'vitest';
import { shouldReplaceAttribution, type Attribution } from '../tracking';

const NOW = Date.UTC(2026, 9, 14);
const DAY = 24 * 60 * 60 * 1000;

function record(fields: Partial<Attribution>, ageDays = 0): Attribution {
  return { capturedAt: NOW - ageDays * DAY, ...fields };
}

const utmOnly  = (age = 0) => record({ utmSource: 'instagram', utmMedium: 'social', utmCampaign: 'machine' }, age);
const withRef  = (ref: string, age = 0) =>
  record({ ref, utmSource: 'ana', utmMedium: 'affiliate', utmCampaign: 'affiliate_program' }, age);

describe('shouldReplaceAttribution', () => {
  it('stores the first record when nothing is stored', () => {
    expect(shouldReplaceAttribution(null, utmOnly(), NOW)).toBe(true);
    expect(shouldReplaceAttribution(null, withRef('ana'), NOW)).toBe(true);
  });

  it('lets a ref override an earlier UTM-only record', () => {
    expect(shouldReplaceAttribution(utmOnly(3), withRef('ana'), NOW)).toBe(true);
  });

  it('never lets UTM-only traffic override a stored ref', () => {
    expect(shouldReplaceAttribution(withRef('ana', 3), utmOnly(), NOW)).toBe(false);
  });

  it('keeps the first ref when a second affiliate link is clicked', () => {
    expect(shouldReplaceAttribution(withRef('ana', 3), withRef('bia'), NOW)).toBe(false);
  });

  it('keeps the first UTM-only record over a later UTM-only one', () => {
    expect(shouldReplaceAttribution(utmOnly(3), utmOnly(), NOW)).toBe(false);
  });

  it('replaces anything once the stored record is past the 30-day TTL', () => {
    expect(shouldReplaceAttribution(withRef('ana', 31), utmOnly(), NOW)).toBe(true);
    expect(shouldReplaceAttribution(utmOnly(31), utmOnly(), NOW)).toBe(true);
  });

  it('treats a record without a numeric capturedAt as expired', () => {
    const broken = { ref: 'ana' } as unknown as Attribution;
    expect(shouldReplaceAttribution(broken, utmOnly(), NOW)).toBe(true);
  });
});
