import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// NOTE: importing orders.ts transitively loads src/lib/prisma.ts, which
// instantiates a Prisma client at module load. A dummy DATABASE_URL is set in
// vitest.config.ts; Prisma connects lazily so no database is ever touched.
// Only the pure helpers (resolvePeriod, generateOrderNumber) are tested here.
import { resolvePeriod, generateOrderNumber } from '@/lib/orders';

const DAY = 86_400_000;

describe('resolvePeriod', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Wednesday, 2024-05-15 (UTC)
  const WEDNESDAY = new Date('2024-05-15T12:34:56.000Z');

  it('returns an empty range for an empty period', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('', '', '')).toEqual({});
  });

  it('returns an empty range for an unknown period', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('bogus', '', '')).toEqual({});
  });

  it('today → [00:00 UTC today, 00:00 UTC tomorrow)', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('today', '', '')).toEqual({
      createdAfter: new Date('2024-05-15T00:00:00.000Z'),
      createdBefore: new Date('2024-05-16T00:00:00.000Z'),
    });
  });

  it('yesterday → [00:00 UTC yesterday, 00:00 UTC today)', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('yesterday', '', '')).toEqual({
      createdAfter: new Date('2024-05-14T00:00:00.000Z'),
      createdBefore: new Date('2024-05-15T00:00:00.000Z'),
    });
  });

  it('this_week starts on Monday (ISO week) and ends tomorrow', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('this_week', '', '')).toEqual({
      createdAfter: new Date('2024-05-13T00:00:00.000Z'), // Monday
      createdBefore: new Date('2024-05-16T00:00:00.000Z'),
    });
  });

  it('this_week on a Sunday still uses the preceding Monday', () => {
    vi.setSystemTime(new Date('2024-05-19T08:00:00.000Z')); // Sunday
    expect(resolvePeriod('this_week', '', '')).toEqual({
      createdAfter: new Date('2024-05-13T00:00:00.000Z'),
      createdBefore: new Date('2024-05-20T00:00:00.000Z'),
    });
  });

  it('this_week on a Monday starts that same day', () => {
    vi.setSystemTime(new Date('2024-05-13T00:00:00.000Z')); // Monday
    expect(resolvePeriod('this_week', '', '')).toEqual({
      createdAfter: new Date('2024-05-13T00:00:00.000Z'),
      createdBefore: new Date('2024-05-14T00:00:00.000Z'),
    });
  });

  it('last_week → the full previous Monday-to-Monday range', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('last_week', '', '')).toEqual({
      createdAfter: new Date('2024-05-06T00:00:00.000Z'),
      createdBefore: new Date('2024-05-13T00:00:00.000Z'),
    });
  });

  it('this_month → [1st of month, tomorrow)', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('this_month', '', '')).toEqual({
      createdAfter: new Date('2024-05-01T00:00:00.000Z'),
      createdBefore: new Date('2024-05-16T00:00:00.000Z'),
    });
  });

  it('last_month → the full previous calendar month', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('last_month', '', '')).toEqual({
      createdAfter: new Date('2024-04-01T00:00:00.000Z'),
      createdBefore: new Date('2024-05-01T00:00:00.000Z'),
    });
  });

  it('last_month rolls back to December across a year boundary', () => {
    vi.setSystemTime(new Date('2024-01-10T12:00:00.000Z'));
    expect(resolvePeriod('last_month', '', '')).toEqual({
      createdAfter: new Date('2023-12-01T00:00:00.000Z'),
      createdBefore: new Date('2024-01-01T00:00:00.000Z'),
    });
  });

  it('custom → full-day inclusive range (to + 1 day, exclusive)', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('custom', '2024-05-01', '2024-05-10')).toEqual({
      createdAfter: new Date('2024-05-01T00:00:00.000Z'),
      createdBefore: new Date(new Date('2024-05-10T00:00:00.000Z').getTime() + DAY),
    });
  });

  it('custom with only a from date sets only createdAfter', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('custom', '2024-05-01', '')).toEqual({
      createdAfter: new Date('2024-05-01T00:00:00.000Z'),
    });
  });

  it('custom with only a to date sets only createdBefore', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('custom', '', '2024-05-10')).toEqual({
      createdBefore: new Date('2024-05-11T00:00:00.000Z'),
    });
  });

  it('custom with neither date returns an empty range', () => {
    vi.setSystemTime(WEDNESDAY);
    expect(resolvePeriod('custom', '', '')).toEqual({});
  });
});

describe('generateOrderNumber', () => {
  it('matches the DIPS-YYYYMMDD-XXXXXX format', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15T12:00:00.000Z'));
    try {
      const orderNumber = generateOrderNumber();
      // Random suffix comes from Math.random().toString(36) and can rarely be
      // shorter than 6 chars, hence {1,6}.
      expect(orderNumber).toMatch(/^DIPS-20240515-[0-9A-Z]{1,6}$/);
    } finally {
      vi.useRealTimers();
    }
  });

  it('embeds the current UTC date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-12-31T23:59:59.000Z'));
    try {
      expect(generateOrderNumber()).toMatch(/^DIPS-20231231-/);
    } finally {
      vi.useRealTimers();
    }
  });

  it('generates distinct numbers across calls', () => {
    const numbers = new Set(Array.from({ length: 50 }, () => generateOrderNumber()));
    expect(numbers.size).toBe(50);
  });
});
