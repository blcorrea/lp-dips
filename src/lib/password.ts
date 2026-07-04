import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEYLEN = 64;
const SALT_BYTES = 16;

/**
 * Hash a plaintext password using scrypt (no external dependency).
 * Returns a self-describing string: `scrypt$<saltHex>$<hashHex>`.
 *
 * Node runtime only (uses node:crypto) — safe to call from Route Handlers,
 * never from Edge middleware.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

/**
 * Constant-time verification of a plaintext password against a stored hash.
 * Returns false for malformed stored values rather than throwing.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const [, salt, hashHex] = parts;
  const expected = Buffer.from(hashHex, 'hex');
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;

  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}
