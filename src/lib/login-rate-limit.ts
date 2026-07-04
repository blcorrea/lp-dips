import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────────────────────
// DB-backed throttling for POST /api/admin/login.
//
// Every attempt is tracked under TWO keys: `email:<lowercased email>` and
// `ip:<ip>`. Policy:
//   • 5 consecutive failures → 1 minute lockout.
//   • Each subsequent failure doubles the lockout (2min, 4min, …) capped at 15min.
//   • A successful login deletes the email key; the IP key is left to decay
//     naturally (its counter resets after DECAY_WINDOW_MS without failures).
//
// The lockout math lives in pure functions (lockoutDurationMs, nextAttemptState,
// retryAfterSeconds) so it can be unit-tested without a database. Only the
// exported check/record wrappers touch Prisma. Node runtime only — do not
// import from Edge middleware.
// ─────────────────────────────────────────────────────────────────────────────

export const FAILURE_THRESHOLD = 5;
export const BASE_LOCKOUT_MS = 60 * 1000; // 1 minute
export const MAX_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes cap
/** A key with no failures for this long is no longer "consecutive" — reset. */
export const DECAY_WINDOW_MS = 15 * 60 * 1000;

export type AttemptState = {
  failedCount: number;
  lockedUntil: Date | null;
};

export type LoginGate =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

// ── Pure lockout calculation ──────────────────────────────────────────────────

/**
 * Lockout duration (ms) for a given consecutive-failure count, or null when
 * the count is still below the threshold.
 *
 *   5 → 1min, 6 → 2min, 7 → 4min, 8 → 8min, 9+ → 15min (cap)
 */
export function lockoutDurationMs(failedCount: number): number | null {
  if (failedCount < FAILURE_THRESHOLD) return null;
  const doubled = BASE_LOCKOUT_MS * 2 ** (failedCount - FAILURE_THRESHOLD);
  return Math.min(doubled, MAX_LOCKOUT_MS);
}

/**
 * State transition for one key after a failed attempt at time `now`.
 * A stale record (no active lock and no failures within DECAY_WINDOW_MS)
 * restarts the count at 1 — failures must be consecutive to accumulate.
 */
export function nextAttemptState(
  prev: { failedCount: number; lockedUntil: Date | null; updatedAt: Date } | null,
  now: Date
): AttemptState {
  let failedCount: number;

  if (!prev) {
    failedCount = 1;
  } else {
    const lockExpired = !prev.lockedUntil || prev.lockedUntil.getTime() <= now.getTime();
    const stale = now.getTime() - prev.updatedAt.getTime() > DECAY_WINDOW_MS;
    failedCount = lockExpired && stale ? 1 : prev.failedCount + 1;
  }

  const duration = lockoutDurationMs(failedCount);
  return {
    failedCount,
    lockedUntil: duration !== null ? new Date(now.getTime() + duration) : null,
  };
}

/**
 * Whole seconds (rounded up, min 1) until `lockedUntil`, or null when the key
 * is not actively locked at `now`.
 */
export function retryAfterSeconds(lockedUntil: Date | null | undefined, now: Date): number | null {
  if (!lockedUntil) return null;
  const remainingMs = lockedUntil.getTime() - now.getTime();
  if (remainingMs <= 0) return null;
  return Math.max(1, Math.ceil(remainingMs / 1000));
}

// ── Throttle keys ─────────────────────────────────────────────────────────────

export function emailKey(email: string): string {
  return `email:${email.trim().toLowerCase()}`;
}

export function ipKey(ip: string): string {
  return `ip:${ip}`;
}

// ── DB-touching wrappers (used by the login route) ────────────────────────────

/**
 * Returns { allowed: false, retryAfterSeconds } when either the email or the
 * IP key is actively locked (the caller must not reveal which), otherwise
 * { allowed: true }.
 */
export async function checkLoginAllowed(email: string, ip: string): Promise<LoginGate> {
  const now = new Date();
  const records = await prisma.adminLoginAttempt.findMany({
    where: { key: { in: [emailKey(email), ipKey(ip)] } },
  });

  let maxRetryAfter = 0;
  for (const record of records) {
    const retry = retryAfterSeconds(record.lockedUntil, now);
    if (retry !== null && retry > maxRetryAfter) maxRetryAfter = retry;
  }

  return maxRetryAfter > 0
    ? { allowed: false, retryAfterSeconds: maxRetryAfter }
    : { allowed: true };
}

async function bumpKey(key: string, now: Date): Promise<void> {
  const prev = await prisma.adminLoginAttempt.findUnique({ where: { key } });
  const next = nextAttemptState(prev, now);
  await prisma.adminLoginAttempt.upsert({
    where:  { key },
    update: { failedCount: next.failedCount, lockedUntil: next.lockedUntil },
    create: { key, failedCount: next.failedCount, lockedUntil: next.lockedUntil },
  });
}

/** Record a failed credential attempt against BOTH the email and IP keys. */
export async function recordLoginFailure(email: string, ip: string): Promise<void> {
  const now = new Date();
  await Promise.all([bumpKey(emailKey(email), now), bumpKey(ipKey(ip), now)]);
}

/**
 * Reset the email key after a successful login. The IP key is intentionally
 * left alone — it decays naturally via DECAY_WINDOW_MS.
 */
export async function recordLoginSuccess(email: string): Promise<void> {
  await prisma.adminLoginAttempt.deleteMany({ where: { key: emailKey(email) } });
}
