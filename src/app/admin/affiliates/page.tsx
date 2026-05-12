import { getAffiliatesWithStats, buildAffiliateLink } from '@/lib/affiliates';
import AffiliatesTable, { type AffiliateTableRow } from './AffiliatesTable';

// ── Formatting ────────────────────────────────────────────────────────────────

function formatRevenue(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// ── Summary card (matches /admin/orders StatCard) ─────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label:   string;
  value:   string | number;
  accent?: 'green' | 'amber' | 'blue';
}) {
  const valCls =
    accent === 'green' ? 'text-green-700' :
    accent === 'amber' ? 'text-amber-600' :
    accent === 'blue'  ? 'text-blue-700'  :
    'text-gray-900';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${valCls}`}>{value}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminAffiliatesPage() {
  const { rows, summary } = await getAffiliatesWithStats();

  const tableRows: AffiliateTableRow[] = rows.map((a) => ({
    ...a,
    link: buildAffiliateLink({ ref: a.ref, type: a.type, instagram: a.instagram }),
  }));

  return (
    <div className="space-y-6">
      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total Affiliates"     value={summary.totalAffiliates} />
          <StatCard label="Active"               value={summary.activeAffiliates}           accent="green" />
          <StatCard label="Attributed Revenue"   value={formatRevenue(summary.attributedRevenueCents)} accent="blue" />
          <StatCard label="Pending Commissions"  value={formatRevenue(summary.pendingCommissionCents)} accent="amber" />
          <StatCard label="Approved Commissions" value={formatRevenue(summary.approvedCommissionCents)} accent="blue" />
          <StatCard label="Paid Commissions"     value={formatRevenue(summary.paidCommissionCents)}    accent="green" />
        </div>
      </div>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {rows.length} affiliate{rows.length === 1 ? '' : 's'} total
        </p>
      </div>

      <AffiliatesTable rows={tableRows} />
    </div>
  );
}
