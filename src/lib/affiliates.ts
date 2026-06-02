import { Prisma, AffiliateType, CommissionStatus } from '../generated/prisma/client/client';
import { prisma } from './prisma';

export type { AffiliateType, CommissionStatus };

// ─────────────────────────────────────────────────────────────────────────────
// Public types — Decimals are converted to numbers on the server boundary so
// client components stay free of Prisma runtime types.
// ─────────────────────────────────────────────────────────────────────────────

export type AffiliateRow = {
  id:             string;
  name:           string;
  ref:            string;
  email:          string | null;
  instagram:      string | null;
  type:           AffiliateType;
  /** Stored as Decimal in DB, serialized as number (e.g. 0.15) */
  commissionRate: number;
  active:         boolean;
  createdAt:      string;
  ordersCount:    number;
  attributedRevenueCents: number;
  pendingAmount:  number;
  approvedAmount: number;
  paidAmount:     number;
};

export type AffiliateSummary = {
  totalAffiliates:           number;
  activeAffiliates:          number;
  attributedRevenueCents:    number;
  pendingCommissionCents:    number;
  approvedCommissionCents:   number;
  paidCommissionCents:       number;
};

export type CommissionRow = {
  id:             string;
  createdAt:      string;
  affiliateId:    string;
  affiliateName:  string;
  affiliateRef:   string;
  orderId:        string;
  orderNumber:    string;
  customerEmail:  string;
  baseAmount:     number;
  /** 0–1 fraction */
  rate:           number;
  amount:         number;
  status:         CommissionStatus;
  paidAt:         string | null;
};

export type CommissionSummary = {
  totalCents:     number;
  pendingCents:   number;
  approvedCents:  number;
  paidCents:      number;
  cancelledCents: number;
};

export type CommissionFilters = {
  search?:        string;          // matches affiliate name / ref
  status?:        CommissionStatus;
  createdAfter?:  Date;
  createdBefore?: Date;
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────────────

export const REF_REGEX = /^[a-z0-9_-]+$/;

const VALID_AFFILIATE_TYPES: AffiliateType[] = [
  'INFLUENCER', 'MEDIA_BUYER', 'PARTNER', 'ORGANIC', 'OTHER',
];

export function isValidAffiliateType(v: unknown): v is AffiliateType {
  return typeof v === 'string' && (VALID_AFFILIATE_TYPES as string[]).includes(v);
}

export const VALID_COMMISSION_STATUSES: CommissionStatus[] = [
  'PENDING', 'APPROVED', 'PAID', 'CANCELLED',
];

export function isValidCommissionStatus(v: unknown): v is CommissionStatus {
  return typeof v === 'string' && (VALID_COMMISSION_STATUSES as string[]).includes(v);
}

// ─────────────────────────────────────────────────────────────────────────────
// Affiliate link generator
// ─────────────────────────────────────────────────────────────────────────────

function affiliateLinkBase(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return env && env.length > 0 ? env.replace(/\/$/, '') : 'https://www.dipschocolate.com';
}

export function buildAffiliateLink(args: {
  ref:       string;
  type:      AffiliateType;
  instagram: string | null;
}): string {
  const utmSource = args.instagram?.trim() || args.type.toLowerCase();
  const params    = new URLSearchParams({
    ref:          args.ref,
    utm_source:   utmSource,
    utm_medium:   'affiliate',
    utm_campaign: 'affiliate_program',
  });
  return `${affiliateLinkBase()}/en?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Single round-trip dashboard: affiliates joined with aggregated commission
 * and order stats. Affiliate counts are global; per-row stats include all
 * orders/commissions ever attributed (no date filter — keeps the MVP simple).
 */
export async function getAffiliatesWithStats(): Promise<{
  rows:    AffiliateRow[];
  summary: AffiliateSummary;
}> {
  const [affiliates, commissionGroups, orderGroups, paidOrderAgg] = await Promise.all([
    prisma.affiliate.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.commission.groupBy({
      by:    ['affiliateId', 'status'],
      _sum:  { amount: true },
    }),
    // Attribution counts/revenue are derived from Orders via influencerRef so
    // they include orders that never produced a Commission row (defensive).
    prisma.order.groupBy({
      by:    ['influencerRef'],
      where: { influencerRef: { not: null }, paymentStatus: 'PAID' },
      _sum:  { total: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { influencerRef: { not: null }, paymentStatus: 'PAID' },
      _sum:  { total: true },
    }),
  ]);

  // Pivot commission stats by affiliateId
  const byAffiliate = new Map<string, { pending: number; approved: number; paid: number; cancelled: number }>();
  for (const g of commissionGroups) {
    const cur = byAffiliate.get(g.affiliateId) ?? { pending: 0, approved: 0, paid: 0, cancelled: 0 };
    const sum = g._sum.amount ?? 0;
    if      (g.status === 'PENDING')   cur.pending  = sum;
    else if (g.status === 'APPROVED')  cur.approved = sum;
    else if (g.status === 'PAID')      cur.paid     = sum;
    else if (g.status === 'CANCELLED') cur.cancelled = sum;
    byAffiliate.set(g.affiliateId, cur);
  }

  // Pivot order attribution by ref (case-insensitive match against affiliate.ref)
  const byRef = new Map<string, { count: number; revenue: number }>();
  for (const g of orderGroups) {
    if (!g.influencerRef) continue;
    byRef.set(g.influencerRef.toLowerCase(), {
      count:   g._count._all,
      revenue: g._sum.total ?? 0,
    });
  }

  const rows: AffiliateRow[] = affiliates.map((a) => {
    const c = byAffiliate.get(a.id)         ?? { pending: 0, approved: 0, paid: 0, cancelled: 0 };
    const o = byRef.get(a.ref.toLowerCase()) ?? { count: 0, revenue: 0 };
    return {
      id:             a.id,
      name:           a.name,
      ref:            a.ref,
      email:          a.email,
      instagram:      a.instagram,
      type:           a.type,
      commissionRate: Number(a.commissionRate),
      active:         a.active,
      createdAt:      a.createdAt.toISOString(),
      ordersCount:    o.count,
      attributedRevenueCents: o.revenue,
      pendingAmount:  c.pending,
      approvedAmount: c.approved,
      paidAmount:     c.paid,
    };
  });

  let pendingTotal = 0, approvedTotal = 0, paidTotal = 0;
  for (const c of byAffiliate.values()) {
    pendingTotal  += c.pending;
    approvedTotal += c.approved;
    paidTotal     += c.paid;
  }

  return {
    rows,
    summary: {
      totalAffiliates:         affiliates.length,
      activeAffiliates:        affiliates.filter((a) => a.active).length,
      attributedRevenueCents:  paidOrderAgg._sum.total ?? 0,
      pendingCommissionCents:  pendingTotal,
      approvedCommissionCents: approvedTotal,
      paidCommissionCents:     paidTotal,
    },
  };
}

function buildCommissionWhere(f: CommissionFilters): Prisma.CommissionWhereInput {
  const { search, status, createdAfter, createdBefore } = f;
  return {
    ...(status && { status }),
    ...(search && {
      affiliate: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { ref:  { contains: search, mode: 'insensitive' } },
        ],
      },
    }),
    ...((createdAfter || createdBefore) && {
      createdAt: {
        ...(createdAfter  && { gte: createdAfter }),
        ...(createdBefore && { lt:  createdBefore }),
      },
    }),
  };
}

export async function getCommissions(
  filters: CommissionFilters & { limit?: number } = {}
): Promise<CommissionRow[]> {
  const { limit = 500, ...f } = filters;
  const rows = await prisma.commission.findMany({
    where:   buildCommissionWhere(f),
    orderBy: { createdAt: 'desc' },
    take:    limit,
    include: {
      affiliate: { select: { name: true, ref: true } },
      order:     { select: { orderNumber: true, customerEmail: true } },
    },
  });

  return rows.map((c) => ({
    id:            c.id,
    createdAt:     c.createdAt.toISOString(),
    affiliateId:   c.affiliateId,
    affiliateName: c.affiliate.name,
    affiliateRef:  c.affiliate.ref,
    orderId:       c.orderId,
    orderNumber:   c.order.orderNumber,
    customerEmail: c.order.customerEmail,
    baseAmount:    c.baseAmount,
    rate:          Number(c.rate),
    amount:        c.amount,
    status:        c.status,
    paidAt:        c.paidAt ? c.paidAt.toISOString() : null,
  }));
}

export async function getCommissionSummary(
  filters: CommissionFilters = {}
): Promise<CommissionSummary> {
  const groups = await prisma.commission.groupBy({
    by:    ['status'],
    where: buildCommissionWhere(filters),
    _sum:  { amount: true },
  });

  let pending = 0, approved = 0, paid = 0, cancelled = 0;
  for (const g of groups) {
    const sum = g._sum.amount ?? 0;
    if      (g.status === 'PENDING')   pending   = sum;
    else if (g.status === 'APPROVED')  approved  = sum;
    else if (g.status === 'PAID')      paid      = sum;
    else if (g.status === 'CANCELLED') cancelled = sum;
  }

  return {
    totalCents:     pending + approved + paid + cancelled,
    pendingCents:   pending,
    approvedCents:  approved,
    paidCents:      paid,
    cancelledCents: cancelled,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Affiliate self-service dashboard
// ─────────────────────────────────────────────────────────────────────────────

export type AffiliateDashboardCommission = {
  id:          string;
  createdAt:   string;
  orderNumber: string;
  baseAmount:  number;
  rate:        number;
  amount:      number;
  status:      CommissionStatus;
  paidAt:      string | null;
};

export type AffiliateDashboardData = {
  affiliate: {
    id:             string;
    name:           string;
    ref:            string;
    email:          string | null;
    instagram:      string | null;
    type:           AffiliateType;
    commissionRate: number;
    link:           string;
  };
  stats: {
    ordersCount:            number;
    attributedRevenueCents: number;
    pendingCents:           number;
    approvedCents:          number;
    paidCents:              number;
  };
  recentCommissions: AffiliateDashboardCommission[];
};

/**
 * Looks up an affiliate by email + ref for login verification.
 * Returns null when no matching active affiliate is found.
 */
export async function getAffiliateByEmailAndRef(
  email: string,
  ref:   string
): Promise<{ id: string; name: string } | null> {
  const affiliate = await prisma.affiliate.findFirst({
    where: {
      email:  { equals: email, mode: 'insensitive' },
      ref:    { equals: ref,   mode: 'insensitive' },
      active: true,
    },
    select: { id: true, name: true },
  });
  return affiliate;
}

/**
 * Returns all data needed to render the affiliate's self-service dashboard.
 * Returns null when the affiliate ID does not exist or is inactive.
 */
export async function getAffiliateDashboardData(
  affiliateId: string
): Promise<AffiliateDashboardData | null> {
  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
  });
  if (!affiliate || !affiliate.active) return null;

  const [commissionGroups, orderGroup, recentRows] = await Promise.all([
    prisma.commission.groupBy({
      by:    ['status'],
      where: { affiliateId },
      _sum:  { amount: true },
    }),
    prisma.order.aggregate({
      where: {
        influencerRef: { equals: affiliate.ref, mode: 'insensitive' },
        paymentStatus: 'PAID',
      },
      _sum:   { total: true },
      _count: { _all: true },
    }),
    prisma.commission.findMany({
      where:   { affiliateId },
      orderBy: { createdAt: 'desc' },
      take:    50,
      include: { order: { select: { orderNumber: true } } },
    }),
  ]);

  let pending = 0, approved = 0, paid = 0;
  for (const g of commissionGroups) {
    const sum = g._sum.amount ?? 0;
    if      (g.status === 'PENDING')  pending  = sum;
    else if (g.status === 'APPROVED') approved = sum;
    else if (g.status === 'PAID')     paid     = sum;
  }

  return {
    affiliate: {
      id:             affiliate.id,
      name:           affiliate.name,
      ref:            affiliate.ref,
      email:          affiliate.email,
      instagram:      affiliate.instagram,
      type:           affiliate.type,
      commissionRate: Number(affiliate.commissionRate),
      link:           buildAffiliateLink({
        ref:       affiliate.ref,
        type:      affiliate.type,
        instagram: affiliate.instagram,
      }),
    },
    stats: {
      ordersCount:            orderGroup._count._all,
      attributedRevenueCents: orderGroup._sum.total ?? 0,
      pendingCents:           pending,
      approvedCents:          approved,
      paidCents:              paid,
    },
    recentCommissions: recentRows.map((c) => ({
      id:          c.id,
      createdAt:   c.createdAt.toISOString(),
      orderNumber: c.order.orderNumber,
      baseAmount:  c.baseAmount,
      rate:        Number(c.rate),
      amount:      c.amount,
      status:      c.status,
      paidAt:      c.paidAt ? c.paidAt.toISOString() : null,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────────────────────

export type CreateAffiliateInput = {
  name:           string;
  ref:            string;
  email?:         string | null;
  instagram?:     string | null;
  type?:          AffiliateType;
  commissionRate?: number;
  active?:        boolean;
};

export async function createAffiliate(input: CreateAffiliateInput) {
  return prisma.affiliate.create({
    data: {
      name:           input.name,
      ref:            input.ref,
      email:          input.email ?? null,
      instagram:      input.instagram ?? null,
      type:           input.type ?? 'INFLUENCER',
      commissionRate: new Prisma.Decimal(input.commissionRate ?? 0.15),
      active:         input.active ?? true,
    },
  });
}

export type UpdateAffiliateInput = {
  name?:           string;
  email?:          string | null;
  instagram?:      string | null;
  type?:           AffiliateType;
  commissionRate?: number;
  active?:         boolean;
};

export async function updateAffiliate(id: string, input: UpdateAffiliateInput) {
  const data: Prisma.AffiliateUpdateInput = {};
  if (input.name           !== undefined) data.name      = input.name;
  if (input.email          !== undefined) data.email     = input.email;
  if (input.instagram      !== undefined) data.instagram = input.instagram;
  if (input.type           !== undefined) data.type      = input.type;
  if (input.commissionRate !== undefined) data.commissionRate = new Prisma.Decimal(input.commissionRate);
  if (input.active         !== undefined) data.active    = input.active;
  return prisma.affiliate.update({ where: { id }, data });
}

/**
 * Apply a commission status transition. Returns null when the requested
 * transition is not allowed (caller maps to 4xx). Throws on missing row.
 *
 *   PENDING  → APPROVED        (sets approvedAt)
 *   APPROVED → PAID            (sets paidAt)
 *   PENDING  → CANCELLED
 *   APPROVED → CANCELLED
 *   PAID, CANCELLED            → terminal in this MVP
 */
export async function transitionCommission(
  id: string,
  target: CommissionStatus
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const current = await prisma.commission.findUnique({
    where:  { id },
    select: { status: true },
  });
  if (!current) return { ok: false, reason: 'not_found' };

  const from = current.status;
  const data: Prisma.CommissionUpdateInput = {};

  if (target === 'APPROVED') {
    if (from !== 'PENDING')  return { ok: false, reason: `Cannot approve from ${from}` };
    data.status     = 'APPROVED';
    data.approvedAt = new Date();
  } else if (target === 'PAID') {
    if (from !== 'APPROVED') return { ok: false, reason: `Cannot mark paid from ${from}` };
    data.status = 'PAID';
    data.paidAt = new Date();
  } else if (target === 'CANCELLED') {
    if (from !== 'PENDING' && from !== 'APPROVED') {
      return { ok: false, reason: `Cannot cancel from ${from}` };
    }
    data.status = 'CANCELLED';
  } else {
    return { ok: false, reason: `Unsupported target status ${target}` };
  }

  await prisma.commission.update({ where: { id }, data });
  return { ok: true };
}
