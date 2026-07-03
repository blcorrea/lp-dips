import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SignJWT } from 'jose';
import {
  createSessionToken,
  verifySessionToken,
  SESSION_MAX_AGE,
  type SessionPayload,
} from '@/lib/session';

// ADMIN_SECRET is provided by vitest.config.ts (test.env). Keep a copy so
// individual tests can unset/restore it.
const TEST_SECRET = process.env.ADMIN_SECRET!;

const PAYLOAD: SessionPayload = {
  sub: 'admin-user-id-123',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'SUPER_ADMIN',
};

function keyFor(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

beforeEach(() => {
  process.env.ADMIN_SECRET = TEST_SECRET;
});

afterEach(() => {
  process.env.ADMIN_SECRET = TEST_SECRET;
});

describe('createSessionToken / verifySessionToken roundtrip', () => {
  it('signs a token that verifies back to the same payload', async () => {
    const token = await createSessionToken(PAYLOAD);
    expect(token.split('.')).toHaveLength(3); // compact JWS

    const verified = await verifySessionToken(token);
    expect(verified).toEqual(PAYLOAD);
  });

  it('roundtrips the OPERATOR role', async () => {
    const token = await createSessionToken({ ...PAYLOAD, role: 'OPERATOR' });
    const verified = await verifySessionToken(token);
    expect(verified?.role).toBe('OPERATOR');
  });

  it('exports an 8 hour max age matching the cookie', () => {
    expect(SESSION_MAX_AGE).toBe(60 * 60 * 8);
  });
});

describe('verifySessionToken rejection cases', () => {
  it('returns null for a tampered token', async () => {
    const token = await createSessionToken(PAYLOAD);
    const [header, payload, signature] = token.split('.');

    // Forge the payload segment (change the email) while keeping the signature
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    decoded.email = 'attacker@example.com';
    const forged = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    await expect(verifySessionToken(`${header}.${forged}.${signature}`)).resolves.toBeNull();
  });

  it('returns null for a token signed with a different secret', async () => {
    const foreign = await new SignJWT({
      email: PAYLOAD.email,
      name: PAYLOAD.name,
      role: PAYLOAD.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(PAYLOAD.sub)
      .setIssuedAt()
      .setExpirationTime(`${SESSION_MAX_AGE}s`)
      .sign(keyFor('some-other-secret'));

    await expect(verifySessionToken(foreign)).resolves.toBeNull();
  });

  it('returns null for an expired token', async () => {
    const now = Math.floor(Date.now() / 1000);
    const expired = await new SignJWT({
      email: PAYLOAD.email,
      name: PAYLOAD.name,
      role: PAYLOAD.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(PAYLOAD.sub)
      .setIssuedAt(now - SESSION_MAX_AGE - 60)
      .setExpirationTime(now - 60) // expired one minute ago
      .sign(keyFor(TEST_SECRET));

    await expect(verifySessionToken(expired)).resolves.toBeNull();
  });

  it('returns null for garbage input', async () => {
    await expect(verifySessionToken('')).resolves.toBeNull();
    await expect(verifySessionToken('not.a.jwt')).resolves.toBeNull();
    await expect(verifySessionToken('garbage')).resolves.toBeNull();
  });

  it('returns null for a validly-signed token with an unknown role claim', async () => {
    const badRole = await new SignJWT({
      email: PAYLOAD.email,
      name: PAYLOAD.name,
      role: 'GOD_MODE',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(PAYLOAD.sub)
      .setIssuedAt()
      .setExpirationTime(`${SESSION_MAX_AGE}s`)
      .sign(keyFor(TEST_SECRET));

    await expect(verifySessionToken(badRole)).resolves.toBeNull();
  });

  it('returns null for a validly-signed token missing required claims', async () => {
    const missingEmail = await new SignJWT({ name: PAYLOAD.name, role: PAYLOAD.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(PAYLOAD.sub)
      .setIssuedAt()
      .setExpirationTime(`${SESSION_MAX_AGE}s`)
      .sign(keyFor(TEST_SECRET));

    await expect(verifySessionToken(missingEmail)).resolves.toBeNull();
  });
});

describe('ADMIN_SECRET handling', () => {
  it('createSessionToken throws when ADMIN_SECRET is unset', async () => {
    delete process.env.ADMIN_SECRET;
    await expect(createSessionToken(PAYLOAD)).rejects.toThrow(/ADMIN_SECRET/);
  });

  it('verifySessionToken returns null (does not throw) when ADMIN_SECRET is unset', async () => {
    const token = await createSessionToken(PAYLOAD);
    delete process.env.ADMIN_SECRET;
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });
});
