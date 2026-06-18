'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getDownloadUrl } from '@vercel/blob';
import Image from 'next/image';
import { Video } from 'lucide-react';
import type { CreativeRow } from '@/lib/creatives';

// ── Props ─────────────────────────────────────────────────────────────────────

interface AffiliateCreativesGalleryProps {
  rows: CreativeRow[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AffiliateCreativesGallery({ rows }: AffiliateCreativesGalleryProps) {
  const t = useTranslations('AffiliateCreatives');

  // Tracks which card's caption was just copied — only one at a time.
  // String = the row.id of the copied card; null = no card in copied state.
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mirrors CopyLinkButton.tsx: async clipboard write + 2s reset.
  async function handleCopy(id: string, caption: string) {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard API failure — silent per CopyLinkButton convention
    }
  }

  return (
    // D-09: max 3 cols (not admin's up-to-5-col grid)
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {rows.map((row) => (
        // D-10: glassmorphism card — NOT the admin white-card style
        <div
          key={row.id}
          className="rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden flex flex-col"
        >

          {/* ── Media frame ──────────────────────────────────────────────── */}
          <div className="relative aspect-video w-full bg-black/20">

            {row.type === 'IMAGE' ? (
              // IMAGE: render full asset via next/image
              <Image
                src={row.url}
                alt={row.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            ) : row.thumbnailUrl ? (
              // VIDEO with poster: inline playable video, never autoplay (D-01, D-02)
              <video
                src={row.url}
                poster={row.thumbnailUrl}
                controls
                preload="none"
                className="w-full h-full object-cover"
              />
            ) : (
              // VIDEO without poster: centered icon placeholder + hidden video activates on click
              <>
                <div className="flex h-full items-center justify-center">
                  <Video className="w-10 h-10 text-white/40" />
                </div>
                <video
                  src={row.url}
                  controls
                  preload="none"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}

            {/* Type badge — top-left, localized (I18N-01) */}
            <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase bg-black/50 text-white">
              {row.type === 'IMAGE' ? t('photoLabel') : t('videoLabel')}
            </span>

          </div>

          {/* ── Card body ────────────────────────────────────────────────── */}
          <div className="p-4 flex flex-col gap-3 flex-1">

            {/* Title — always shown */}
            <p className="text-white font-semibold text-sm truncate">{row.title}</p>

            {/* Caption text — only when non-empty (D-04). Plain text; never <track> (D-05). */}
            {row.caption && (
              <p className="text-white/60 text-xs line-clamp-3">{row.caption}</p>
            )}

            {/* Action row */}
            <div className="mt-auto flex gap-2 flex-wrap">

              {/* Download — anchor so keyboard nav + right-click "Save link as" work (D-06, D-07).
                  href MUST be getDownloadUrl(row.url); bare row.url ignores cross-origin download attr. */}
              <a
                href={getDownloadUrl(row.url)}
                download={row.fileName}
                className="inline-flex items-center rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-brand-purple transition-all duration-200 hover:bg-brand-orange/90 active:scale-95"
              >
                {t('download')}
              </a>

              {/* Copy caption button — only when caption exists (D-03) */}
              {row.caption && (
                <button
                  type="button"
                  onClick={() => handleCopy(row.id, row.caption!)}
                  className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
                >
                  {copiedId === row.id ? t('copied') : t('copyCaption')}
                </button>
              )}

            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
