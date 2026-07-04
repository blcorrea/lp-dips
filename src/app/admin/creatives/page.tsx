import { listCreatives } from '@/lib/creatives';
import CreativesGrid from './CreativesGrid';

export default async function AdminCreativesPage() {
  const rows = await listCreatives();

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Creatives</h1>
        <p className="mt-1 text-sm text-gray-500">
          {rows.length} creative{rows.length === 1 ? '' : 's'} total
        </p>
      </div>

      <CreativesGrid rows={rows} />
    </div>
  );
}
