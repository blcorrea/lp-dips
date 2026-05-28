import crypto from 'crypto';
import { prisma } from './prisma';

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ─────────────────────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds an affiliate by email (case-insensitive) for magic-link dispatch.
 * Returns null when not found or inactive — callers should not reveal which.
 */
export async function findActiveAffiliateByEmail(
  email: string
): Promise<{ id: string; name: string; email: string } | null> {
  const affiliate = await prisma.affiliate.findFirst({
    where: {
      email:  { equals: email, mode: 'insensitive' },
      active: true,
    },
    select: { id: true, name: true, email: true },
  });
  return affiliate as { id: string; name: string; email: string } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a one-time login token for the given affiliate.
 * Returns the raw token string (64 hex chars) to embed in the magic link.
 * Any previous unused tokens for this affiliate are deleted first (one active
 * token at a time per affiliate).
 */
export async function createLoginToken(affiliateId: string): Promise<string> {
  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  // Clean up previous tokens for this affiliate before creating a new one
  await prisma.affiliateLoginToken.deleteMany({
    where: { affiliateId, usedAt: null },
  });

  await prisma.affiliateLoginToken.create({
    data: { affiliateId, token, expiresAt },
  });

  return token;
}

/**
 * Validates a magic-link token and marks it as used.
 * Returns the affiliate ID on success, or null when the token is invalid,
 * expired, or already consumed.
 */
export async function consumeLoginToken(token: string): Promise<string | null> {
  const record = await prisma.affiliateLoginToken.findUnique({
    where: { token },
  });

  if (!record)           return null; // not found
  if (record.usedAt)     return null; // already used
  if (record.expiresAt < new Date()) return null; // expired

  await prisma.affiliateLoginToken.update({
    where: { token },
    data:  { usedAt: new Date() },
  });

  return record.affiliateId;
}
