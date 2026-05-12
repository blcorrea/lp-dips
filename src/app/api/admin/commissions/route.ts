import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  getCommissions,
  getCommissionSummary,
  isValidCommissionStatus,
} from '@/lib/affiliates';

// ── helpers ──────────────────────────────────────────────────────────────────

function parseDate(s: string | null, opts: { endOfDay?: boolean } = {}): Date | undefined {
  if (!s) return undefined;
  // Accept YYYY-MM-DD; for endOfDay shift by +1 day so the filter is inclusive of `to`
  const d = new Date(`${s}T00:00:00.000Z`);
  if (isNaN(d.getTime())) return undefined;
  return opts.endOfDay ? new Date(d.getTime() + 86_400_000) : d;
}

// ── GET /api/admin/commissions ────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp     = request.nextUrl.searchParams;
  const search = (sp.get('search') ?? '').trim();
  const statusRaw = sp.get('status') ?? '';
  const status = isValidCommissionStatus(statusRaw) ? statusRaw : undefined;

  const filters = {
    search:        search || undefined,
    status,
    createdAfter:  parseDate(sp.get('from')),
    createdBefore: parseDate(sp.get('to'), { endOfDay: true }),
  };

  const [rows, summary] = await Promise.all([
    getCommissions(filters),
    getCommissionSummary(filters),
  ]);

  return NextResponse.json({ rows, summary });
}
