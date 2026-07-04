import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getAffiliateSessionId } from '@/lib/affiliate-auth';
import { getAffiliateDashboardData } from '@/lib/affiliates';
import { listCreatives } from '@/lib/creatives';
import CopyLinkButton from './CopyLinkButton';
import LogoutButton from './LogoutButton';
import AffiliateCreativesGallery from './AffiliateCreativesGallery';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AffiliateDashboard' });
  return {
    title: `${t('dashboardTitle')} — Dips Chocolate`,
  };
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatCents(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label:   string;
  value:   string | number;
  accent?: 'orange' | 'green' | 'blue';
}) {
  const valCls =
    accent === 'orange' ? 'text-brand-orange' :
    accent === 'green'  ? 'text-green-400'    :
    accent === 'blue'   ? 'text-blue-300'     :
    'text-white';

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-6 py-5">
      <p className="text-white/50 text-[11px] font-bold tracking-[0.15em] uppercase mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${valCls}`}>{value}</p>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  APPROVED:  'bg-blue-100 text-blue-700',
  PAID:      'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AffiliateDashboardPage({ params }: Props) {
  const { locale } = await params;

  const sessionId = await getAffiliateSessionId();
  if (!sessionId) redirect(`/${locale}/affiliates/login`);

  const data = await getAffiliateDashboardData(sessionId);
  if (!data) redirect(`/${locale}/affiliates/login`);

  const t = await getTranslations({ locale, namespace: 'AffiliateDashboard' });
  const { affiliate, stats, recentCommissions } = data;
  const rate = Math.round(affiliate.commissionRate * 100);

  const creatives = await listCreatives({ activeOnly: true });
  const tCreatives = await getTranslations({ locale, namespace: 'AffiliateCreatives' });

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-purple to-[#3b1c5a] px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-brand-orange text-[11px] font-bold tracking-[0.18em] uppercase mb-1">
              {t('dashboardEyebrow')}
            </p>
            <h1 className="font-heading text-white text-[32px] sm:text-[40px] leading-tight tracking-[-0.03em]">
              {t('dashboardWelcome', { name: affiliate.name })}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {t('commissionRate', { rate })}
            </p>
          </div>
          <LogoutButton locale={locale} />
        </div>

        {/* ── Affiliate link ───────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-6 py-5">
          <p className="text-white/60 text-xs font-bold tracking-[0.15em] uppercase mb-3">
            {t('yourLink')}
          </p>
          <CopyLinkButton link={affiliate.link} />
        </div>

        {/* ── Stats grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label={t('statOrders')}   value={stats.ordersCount} />
          <StatCard label={t('statRevenue')}  value={formatCents(stats.attributedRevenueCents)} accent="blue" />
          <StatCard label={t('statPending')}  value={formatCents(stats.pendingCents)}  accent="orange" />
          <StatCard label={t('statApproved')} value={formatCents(stats.approvedCents)} accent="blue" />
          <StatCard label={t('statPaid')}     value={formatCents(stats.paidCents)}     accent="green" />
        </div>

        {/* ── Commission history ───────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-white font-semibold text-[16px]">{t('commissionsTitle')}</h2>
          </div>

          {recentCommissions.length === 0 ? (
            <p className="px-6 py-10 text-center text-white/40 text-sm">
              {t('noCommissions')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-left text-white/40 text-xs font-semibold uppercase tracking-wider">{t('colDate')}</th>
                    <th className="px-6 py-3 text-left text-white/40 text-xs font-semibold uppercase tracking-wider">{t('colOrder')}</th>
                    <th className="px-6 py-3 text-right text-white/40 text-xs font-semibold uppercase tracking-wider">{t('colSale')}</th>
                    <th className="px-6 py-3 text-right text-white/40 text-xs font-semibold uppercase tracking-wider">{t('colCommission')}</th>
                    <th className="px-6 py-3 text-center text-white/40 text-xs font-semibold uppercase tracking-wider">{t('colStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCommissions.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/70 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                      <td className="px-6 py-4 text-white font-mono text-xs">{c.orderNumber}</td>
                      <td className="px-6 py-4 text-white tabular-nums text-right">{formatCents(c.baseAmount)}</td>
                      <td className="px-6 py-4 text-brand-orange font-semibold tabular-nums text-right">{formatCents(c.amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_STYLES[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {t(`status_${c.status}` as Parameters<typeof t>[0])}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Criativos section ────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-white font-semibold text-[16px]">{tCreatives('sectionTitle')}</h2>
          </div>

          {creatives.length === 0 ? (
            <p className="px-6 py-10 text-center text-white/40 text-sm">
              {tCreatives('noCreatives')}
            </p>
          ) : (
            <div className="p-6">
              <AffiliateCreativesGallery rows={creatives} />
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
