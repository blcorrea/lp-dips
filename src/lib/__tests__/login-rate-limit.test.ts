import { describe, it, expect } from 'vitest';
import {
  FAILURE_THRESHOLD,
  BASE_LOCKOUT_MS,
  MAX_LOCKOUT_MS,
  DECAY_WINDOW_MS,
  lockoutDurationMs,
  nextAttemptState,
  retryAfterSeconds,
  emailKey,
  ipKey,
} from '@/lib/login-rate-limit';

// These tests exercise ONLY the pure lockout-calculation functions. The
// DB-touching wrappers (checkLoginAllowed / recordLoginFailure / …) are thin
// Prisma calls around this logic and are not tested against a database.

const NOW = new Date('2026-07-03T12:00:00.000Z');
const MIN = 60 * 1000;

function record(failedCount: number, lockedUntil: Date | null, updatedAt: Date) {
  return { failedCount, lockedUntil, updatedAt };
}

describe('lockoutDurationMs', () => {
  it('returns null below the failure threshold', () => {
    for (let n = 0; n < FAILURE_THRESHOLD; n++) {
      expect(lockoutDurationMs(n)).toBeNull();
    }
  });

  it('locks for 1 minute at exactly the threshold (5 failures)', () => {
    expect(FAILURE_THRESHOLD).toBe(5);
    expect(lockoutDurationMs(5)).toBe(BASE_LOCKOUT_MS);
    expect(BASE_LOCKOUT_MS).toBe(1 * MIN);
  });

  it('doubles on each subsequent failure', () => {
    expect(lockoutDurationMs(6)).toBe(2 * MIN);
    expect(lockoutDurationMs(7)).toBe(4 * MIN);
    expect(lockoutDurationMs(8)).toBe(8 * MIN);
  });

  it('caps at 15 minutes', () => {
    expect(MAX_LOCKOUT_MS).toBe(15 * MIN);
    expect(lockoutDurationMs(9)).toBe(15 * MIN); // would be 16min uncapped
    expect(lockoutDurationMs(10)).toBe(15 * MIN);
    expect(lockoutDurationMs(50)).toBe(15 * MIN);
  });
});

describe('nextAttemptState', () => {
  it('starts a new key at failedCount 1 with no lock', () => {
    expect(nextAttemptState(null, NOW)).toEqual({ failedCount: 1, lockedUntil: null });
  });

  it('increments consecutive failures without locking below the threshold', () => {
    const next = nextAttemptState(record(3, null, NOW), NOW);
    expect(next).toEqual({ failedCount: 4, lockedUntil: null });
  });

  it('locks for 1 minute on the 5th consecutive failure', () => {
    const next = nextAttemptState(record(4, null, NOW), NOW);
    expect(next.failedCount).toBe(5);
    expect(next.lockedUntil).toEqual(new Date(NOW.getTime() + 1 * MIN));
  });

  it('doubles the lockout on failures past the threshold', () => {
    const sixth = nextAttemptState(record(5, new Date(NOW.getTime() - 1), NOW), NOW);
    expect(sixth.failedCount).toBe(6);
    expect(sixth.lockedUntil).toEqual(new Date(NOW.getTime() + 2 * MIN));

    const seventh = nextAttemptState(record(6, new Date(NOW.getTime() - 1), NOW), NOW);
    expect(seventh.failedCount).toBe(7);
    expect(seventh.lockedUntil).toEqual(new Date(NOW.getTime() + 4 * MIN));
  });

  it('caps the lockout at 15 minutes no matter how many failures', () => {
    const next = nextAttemptState(record(40, new Date(NOW.getTime() - 1), NOW), NOW);
    expect(next.failedCount).toBe(41);
    expect(next.lockedUntil).toEqual(new Date(NOW.getTime() + 15 * MIN));
  });

  it('resets the count to 1 for a stale unlocked record (natural decay)', () => {
    const staleTime = new Date(NOW.getTime() - DECAY_WINDOW_MS - 1);
    const next = nextAttemptState(record(4, null, staleTime), NOW);
    expect(next).toEqual({ failedCount: 1, lockedUntil: null });
  });

  it('does NOT decay a record updated within the decay window', () => {
    const recentTime = new Date(NOW.getTime() - DECAY_WINDOW_MS + 1000);
    const next = nextAttemptState(record(4, null, recentTime), NOW);
    expect(next.failedCount).toBe(5);
    expect(next.lockedUntil).toEqual(new Date(NOW.getTime() + 1 * MIN));
  });

  it('does NOT decay while a lock is still active, even if updatedAt is old', () => {
    const staleTime = new Date(NOW.getTime() - DECAY_WINDOW_MS - 1);
    const stillLocked = new Date(NOW.getTime() + 5 * MIN);
    const next = nextAttemptState(record(8, stillLocked, staleTime), NOW);
    expect(next.failedCount).toBe(9);
  });

  it('supports the reset flow: decay then re-accumulate from scratch', () => {
    // After a success (record deleted) the next failure starts a fresh streak
    let state = nextAttemptState(null, NOW);
    for (let i = 0; i < 3; i++) {
      state = nextAttemptState({ ...state, updatedAt: NOW }, NOW);
    }
    expect(state.failedCount).toBe(4);
    expect(state.lockedUntil).toBeNull();
  });
});

describe('retryAfterSeconds', () => {
  it('returns null when there is no lock', () => {
    expect(retryAfterSeconds(null, NOW)).toBeNull();
    expect(retryAfterSeconds(undefined, NOW)).toBeNull();
  });

  it('returns null when the lock has already expired', () => {
    expect(retryAfterSeconds(new Date(NOW.getTime() - 1), NOW)).toBeNull();
    expect(retryAfterSeconds(new Date(NOW.getTime()), NOW)).toBeNull();
  });

  it('rounds partial seconds up', () => {
    expect(retryAfterSeconds(new Date(NOW.getTime() + 1500), NOW)).toBe(2);
    expect(retryAfterSeconds(new Date(NOW.getTime() + 60_000), NOW)).toBe(60);
  });

  it('returns at least 1 second for a lock expiring imminently', () => {
    expect(retryAfterSeconds(new Date(NOW.getTime() + 1), NOW)).toBe(1);
  });
});

describe('throttle keys', () => {
  it('lowercases and trims the email key', () => {
    expect(emailKey('  Admin@Example.COM ')).toBe('email:admin@example.com');
  });

  it('prefixes the ip key', () => {
    expect(ipKey('203.0.113.7')).toBe('ip:203.0.113.7');
    expect(ipKey('unknown')).toBe('ip:unknown');
  });
});
