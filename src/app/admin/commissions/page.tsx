import Link from 'next/link';
import {
  getCommissions,
  getCommissionSummary,
  isValidCommissionStatus,
  type CommissionFilters,
  type CommissionStatus,
} from '@/lib/affiliates';
import CommissionsTable from './CommissionsTable';

// ── Formatting ────────────────────────────────────────────────────────────────

function formatRevenue(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// ── Summary card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label:   string;
  value:   string | number;
  accent?: 'green' | 'amber' | 'blue' | 'red';
}) {
  const valCls =
    accent === 'green' ? 'text-green-700' :
    accent === 'amber' ? 'text-amber-600' :
    accent === 'blue'  ? 'text-blue-700'  :
    accent === 'red'   ? 'text-red-600'   :
    'text-gray-900';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${valCls}`}>{value}</p>
    </div>
  );
}

// ── Date parsing (YYYY-MM-DD, UTC) ────────────────────────────────────────────

function parseDate(s: string, opts: { endOfDay?: boolean } = {}): Date | undefined {
  if (!s) return undefined;
  const d = new Date(`${s}T00:00:00.000Z`);
  if (isNaN(d.getTime())) return undefined;
  return opts.endOfDay ? new Date(d.getTime() + 86_400_000) : d;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp        = await searchParams;
  const search    = typeof sp.search === 'string' ? sp.search.trim() : '';
  const statusRaw = typeof sp.status === 'string' ? sp.status        : '';
  const from      = typeof sp.from   === 'string' ? sp.from          : '';
  const to        = typeof sp.to     === 'string' ? sp.to            : '';

  const status: CommissionStatus | undefined =
    isValidCommissionStatus(statusRaw) ? statusRaw : undefined;

  const filters: CommissionFilters = {
    search:        search || undefined,
    status,
    createdAfter:  parseDate(from),
    createdBefore: parseDate(to, { endOfDay: true }),
  };

  const [rows, summary] = await Promise.all([
    getCommissions({ ...filters, limit: 500 }),
    getCommissionSummary(filters),
  ]);

  // Build export URL preserving current filters
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  if (status) qs.set('status', status);
  if (from)   qs.set('from', from);
  if (to)     qs.set('to', to);
  const exportUrl = `/api/admin/commissions/export${qs.toString() ? `?${qs}` : ''}`;

  return (
    <div className="space-y-6">

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total"     value={formatRevenue(summary.totalCents)} />
        <StatCard label="Pending"   value={formatRevenue(summary.pendingCents)}   accent="amber" />
        <StatCard label="Approved"  value={formatRevenue(summary.approvedCents)}  accent="blue" />
        <StatCard label="Paid"      value={formatRevenue(summary.paidCents)}      accent="green" />
        <StatCard label="Cancelled" value={formatRevenue(summary.cancelledCents)} accent="red" />
      </div>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {rows.length} commission{rows.length === 1 ? '' : 's'}
            {(search || status || from || to) ? ' matching filters' : ' total'}
          </p>
        </div>
        <Link
          href={exportUrl}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white
                     px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50
                     transition-colors"
        >
          ↓ Export CSV
        </Link>
      </div>

      <CommissionsTable
        rows={rows}
        initialSearch={search}
        initialStatus={statusRaw}
        initialFrom={from}
        initialTo={to}
      />
    </div>
  );
}
