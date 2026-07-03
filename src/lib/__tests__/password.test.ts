import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/password';

describe('hashPassword', () => {
  it('returns a self-describing scrypt hash string', async () => {
    const hash = await hashPassword('hunter2');
    // Format: scrypt$<32 hex chars salt>$<128 hex chars hash>
    expect(hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  });

  it('produces different hashes for the same password (random salt)', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a).not.toBe(b);

    const [, saltA] = a.split('$');
    const [, saltB] = b.split('$');
    expect(saltA).not.toBe(saltB);
  });
});

describe('verifyPassword', () => {
  it('verifies a correct password against its hash (roundtrip)', async () => {
    const hash = await hashPassword('correct horse battery staple');
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('right-password');
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('rejects an empty password against a real hash', async () => {
    const hash = await hashPassword('non-empty');
    await expect(verifyPassword('', hash)).resolves.toBe(false);
  });

  it('handles empty-string passwords consistently (roundtrip)', async () => {
    const hash = await hashPassword('');
    await expect(verifyPassword('', hash)).resolves.toBe(true);
    await expect(verifyPassword('x', hash)).resolves.toBe(false);
  });

  it('returns false (does not throw) for malformed stored values', async () => {
    await expect(verifyPassword('pw', '')).resolves.toBe(false);
    await expect(verifyPassword('pw', 'not-a-hash')).resolves.toBe(false);
    await expect(verifyPassword('pw', 'bcrypt$salt$hash')).resolves.toBe(false);
    await expect(verifyPassword('pw', 'scrypt$onlytwo')).resolves.toBe(false);
    await expect(verifyPassword('pw', 'scrypt$a$b$c$d')).resolves.toBe(false);
  });

  it('returns false when the stored hash has the wrong length', async () => {
    // Valid prefix and salt, but truncated digest (hex-decodable, wrong byte length)
    await expect(
      verifyPassword('pw', 'scrypt$00112233445566778899aabbccddeeff$abcdef')
    ).resolves.toBe(false);
  });

  it('returns false when the digest is corrupted but the right length', async () => {
    const hash = await hashPassword('pw');
    const [prefix, salt, digest] = hash.split('$');
    // Flip the first hex character of the digest
    const flipped = (digest[0] === '0' ? '1' : '0') + digest.slice(1);
    await expect(verifyPassword('pw', `${prefix}$${salt}$${flipped}`)).resolves.toBe(false);
  });
});
