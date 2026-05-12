/**
 * Idempotent seed for production rollout.
 *
 * Creates the 3 initial Affiliates if they don't already exist, leaves
 * existing rows untouched (no overwrite of name/type/rate/active), and
 * prints the affiliate referral link for each one.
 *
 * Run with:
 *   npx tsx scripts/seed-affiliates.ts
 *
 * Requires DATABASE_URL (and optionally NEXT_PUBLIC_SITE_URL) in the env.
 */
import { prisma } from '../src/lib/prisma';
import { buildAffiliateLink, type AffiliateType } from '../src/lib/affiliates';

type SeedRow = {
  name:           string;
  ref:            string;
  type:           AffiliateType;
  commissionRate: number;
};

const SEED: SeedRow[] = [
  { name: 'Ana',   ref: 'ana',   type: 'INFLUENCER',  commissionRate: 0.15 },
  { name: 'Lucas', ref: 'lucas', type: 'MEDIA_BUYER', commissionRate: 0.20 },
  { name: 'Maria', ref: 'maria', type: 'PARTNER',     commissionRate: 0.10 },
];

async function main() {
  console.log('Seeding affiliates…');

  for (const row of SEED) {
    const existing = await prisma.affiliate.findUnique({ where: { ref: row.ref } });

    if (existing) {
      console.log(`  ↺ ${row.ref.padEnd(6)} already exists — left untouched (id=${existing.id})`);
    } else {
      const created = await prisma.affiliate.create({
        data: {
          name:           row.name,
          ref:            row.ref,
          type:           row.type,
          commissionRate: row.commissionRate,
          active:         true,
        },
      });
      console.log(`  + ${row.ref.padEnd(6)} created (id=${created.id})`);
    }
  }

  // ── Re-read and print links ───────────────────────────────────────────────
  const refs = SEED.map((s) => s.ref);
  const all  = await prisma.affiliate.findMany({ where: { ref: { in: refs } } });

  console.log('\nAffiliate links:');
  console.log('─'.repeat(80));
  for (const a of all) {
    const link = buildAffiliateLink({
      ref:       a.ref,
      type:      a.type,
      instagram: a.instagram,
    });
    const pct = `${(Number(a.commissionRate) * 100).toFixed(0)}%`;
    console.log(`  ${a.name.padEnd(8)} ${a.type.padEnd(12)} ${pct.padStart(4)}  active=${a.active}`);
    console.log(`    ${link}`);
  }
  console.log('─'.repeat(80));
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
