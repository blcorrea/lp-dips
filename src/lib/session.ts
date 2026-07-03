import { SignJWT, jwtVerify } from 'jose';

// ─────────────────────────────────────────────────────────────────────────────
// Edge-safe admin session tokens (signed JWTs).
//
// This module is imported by BOTH the Node runtime (Route Handlers, Server
// Components) and the Edge runtime (middleware), so it must only use APIs that
// exist in both. `jose` and TextEncoder are Edge-compatible; do NOT import
// node:crypto, next/headers, or Prisma here.
// ─────────────────────────────────────────────────────────────────────────────

export type AdminRole = 'SUPER_ADMIN' | 'OPERATOR';

export type SessionPayload = {
  /** AdminUser.id */
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
};

const ALG = 'HS256';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours, matches the cookie

/**
 * Signing key derived from ADMIN_SECRET. The same secret also acts as the
 * bootstrap master key in the login route, so a single env var configures both.
 */
function signingKey(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET is not configured on the server.');
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(signingKey());
}

/**
 * Verify a session token's signature and expiry. Returns the payload, or null
 * if the token is missing, tampered, expired, or ADMIN_SECRET is unset.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: [ALG] });
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      (payload.role !== 'SUPER_ADMIN' && payload.role !== 'OPERATOR')
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
