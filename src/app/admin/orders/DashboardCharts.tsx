// Plain React Server Component — no 'use client' needed (pure SVG/HTML rendering).
import type { DashboardData, DayBucket } from '@/lib/orders';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCents(cents: number): string {
  const d = cents / 100;
  if (d >= 10_000) return `$${(d / 1_000).toFixed(1)}k`;
  if (d >= 1_000)  return `$${(d / 1_000).toFixed(2)}k`;
  return `$${d.toFixed(0)}`;
}

function fmtDay(ymd: string): string {
  const [, mm, dd] = ymd.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;
}

// ── Week aggregation (for spans > 60 days) ────────────────────────────────────

function byWeek(series: DayBucket[]): DayBucket[] {
  const map = new Map<string, DayBucket>();
  for (const b of series) {
    const d   = new Date(`${b.day}T00:00:00Z`);
    const dow = d.getUTCDay();
    const mon = new Date(d.getTime() - ((dow + 6) % 7) * 86_400_000);
    const key = mon.toISOString().slice(0, 10);
    const w   = map.get(key) ?? { day: key, count: 0, revenueCents: 0 };
    w.count        += b.count;
    w.revenueCents += b.revenueCents;
    map.set(key, w);
  }
  return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
}

// ── SVG bar chart ─────────────────────────────────────────────────────────────

const W = 560, VH = 120, PAD_T = 20, PAD_B = 26;
const CHART_H = VH - PAD_T - PAD_B; // 74

function BarChart({
  buckets,
  getValue,
  fmtVal,
  color,
  emptyLabel,
}: {
  buckets:    DayBucket[];
  getValue:   (b: DayBucket) => number;
  fmtVal:     (n: number) => string;
  color:      string;
  emptyLabel: string;
}) {
  if (buckets.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-gray-400"
           style={{ height: `${VH}px` }}>
        {emptyLabel}
      </div>
    );
  }

  const vals   = buckets.map(getValue);
  const maxVal = Math.max(...vals, 1);
  const n      = buckets.length;
  const gap    = W / n;
  const barW   = Math.max(1, gap * 0.7);

  // Show at most 8 x-axis labels, always including first and last
  const step = Math.max(1, Math.ceil(n / 8));

  return (
    <svg
      viewBox={`0 0 ${W} ${VH}`}
      width="100%"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* Gridlines at 50% and 100% */}
      {[0.5, 1].map((r) => (
        <line key={r}
          x1={0} x2={W}
          y1={PAD_T + CHART_H * (1 - r)}
          y2={PAD_T + CHART_H * (1 - r)}
          stroke="#f3f4f6" strokeWidth="1"
        />
      ))}

      {/* Y-axis max label */}
      <text x={2} y={PAD_T - 5} fontSize="9" fill="#9ca3af">{fmtVal(maxVal)}</text>

      {/* Bars + x labels */}
      {buckets.map((b, i) => {
        const val  = getValue(b);
        const barH = val > 0 ? Math.max(2, (val / maxVal) * CHART_H) : 0;
        const x    = i * gap + (gap - barW) / 2;
        const y    = PAD_T + CHART_H - barH;
        const showLabel = i === 0 || i === n - 1 || i % step === 0;

        return (
          <g key={b.day}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx="1">
              <title>{`${fmtDay(b.day)}: ${fmtVal(val)}`}</title>
            </rect>
            {showLabel && (
              <text
                x={x + barW / 2}
                y={VH - 4}
                textAnchor="middle"
                fontSize="8"
                fill="#9ca3af"
              >
                {b.day.slice(5).replace('-', '/')}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Horizontal breakdown bars ─────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PAID:                '#22c55e',
  PENDING:             '#f59e0b',
  FAILED:              '#ef4444',
  REFUNDED:            '#3b82f6',
  PARTIALLY_REFUNDED:  '#6366f1',
  FULFILLED:           '#22c55e',
  UNFULFILLED:         '#f59e0b',
  PARTIALLY_FULFILLED: '#3b82f6',
  RETURNED:            '#8b5cf6',
  CANCELLED:           '#ef4444',
};

function BreakdownBars({
  items,
  total,
}: {
  items:  { status: string; count: number }[];
  total:  number;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-gray-400 py-2">No data</p>;
  }
  return (
    <div className="space-y-2.5">
      {items.map(({ status, count }) => {
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        const color = STATUS_COLORS[status] ?? '#9ca3af';
        return (
          <div key={status}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-medium text-gray-600">
                {status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs tabular-nums text-gray-500">
                {count}
                <span className="text-gray-400 ml-1">({pct}%)</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(pct, pct > 0 ? 1 : 0)}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DashboardCharts({
  data,
  totalOrders,
}: {
  data:        DashboardData;
  totalOrders: number;
}) {
  const raw   = data.dailySeries;
  const weekly = raw.length > 60;
  const buckets = weekly ? byWeek(raw) : raw;
  const spanLabel = raw.length > 0
    ? `${raw.length} day${raw.length !== 1 ? 's' : ''} · ${weekly ? 'grouped by week' : 'daily'}`
    : '';

  return (
    <div className="space-y-4">

      {/* ── Time-series charts ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Orders over time</h3>
            {spanLabel && (
              <span className="text-xs text-gray-400">{spanLabel}</span>
            )}
          </div>
          <BarChart
            buckets={buckets}
            getValue={(b) => b.count}
            fmtVal={(n) => String(n)}
            color="#3b82f6"
            emptyLabel="No orders in this range"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Revenue over time</h3>
            {spanLabel && (
              <span className="text-xs text-gray-400">{spanLabel}</span>
            )}
          </div>
          <BarChart
            buckets={buckets}
            getValue={(b) => b.revenueCents}
            fmtVal={fmtCents}
            color="#22c55e"
            emptyLabel="No paid orders in this range"
          />
        </div>

      </div>

      {/* ── Status breakdown ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Status</h3>
          <BreakdownBars items={data.paymentBreakdown} total={totalOrders} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Fulfillment Status</h3>
          <BreakdownBars items={data.fulfillmentBreakdown} total={totalOrders} />
        </div>

      </div>

    </div>
  );
}
