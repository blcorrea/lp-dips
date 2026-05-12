import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getCommissions, isValidCommissionStatus } from '@/lib/affiliates';

// ── CSV helpers (RFC 4180) ────────────────────────────────────────────────────

function csvField(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function cents(n: number): string {
  return (n / 100).toFixed(2);
}

function parseDate(s: string | null, opts: { endOfDay?: boolean } = {}): Date | undefined {
  if (!s) return undefined;
  const d = new Date(`${s}T00:00:00.000Z`);
  if (isNaN(d.getTime())) return undefined;
  return opts.endOfDay ? new Date(d.getTime() + 86_400_000) : d;
}

const HEADERS = [
  'id',
  'createdAt',
  'affiliateName',
  'affiliateRef',
  'orderNumber',
  'customerEmail',
  'baseAmount',
  'rate',
  'amount',
  'status',
  'paidAt',
];

// ── GET /api/admin/commissions/export ─────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const sp        = request.nextUrl.searchParams;
  const search    = (sp.get('search') ?? '').trim();
  const statusRaw = sp.get('status') ?? '';
  const status    = isValidCommissionStatus(statusRaw) ? statusRaw : undefined;

  const rows = await getCommissions({
    limit:         10_000,
    search:        search || undefined,
    status,
    createdAfter:  parseDate(sp.get('from')),
    createdBefore: parseDate(sp.get('to'), { endOfDay: true }),
  });

  const out: string[] = [HEADERS.map(csvField).join(',')];
  for (const c of rows) {
    out.push([
      csvField(c.id),
      csvField(c.createdAt),
      csvField(c.affiliateName),
      csvField(c.affiliateRef),
      csvField(c.orderNumber),
      csvField(c.customerEmail),
      csvField(cents(c.baseAmount)),
      csvField(c.rate.toString()),
      csvField(cents(c.amount)),
      csvField(c.status),
      csvField(c.paidAt ?? ''),
    ].join(','));
  }

  const csv      = out.join('\r\n');
  const today    = new Date().toISOString().slice(0, 10);
  const filename = `commissions-export-${today}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store',
    },
  });
}
