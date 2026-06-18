'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getDownloadUrl } from '@vercel/blob';
import Image from 'next/image';
import { Video } from 'lucide-react';
import type { CreativeRow } from '@/lib/creatives';

// ── Props ─────────────────────────────────────────────────────────────────────

interface AffiliateCreativesGalleryProps {
  rows: CreativeRow[];
}

type T = ReturnType<typeof useTranslations<'AffiliateCreatives'>>;

// ── Single card ───────────────────────────────────────────────────────────────
// Extracted so each card owns its own `copied` state and `<video>` ref (a ref
// cannot be created per-iteration inside a .map()).

function CreativeCard({ row, t }: { row: CreativeRow; t: T }) {
  const [copied, setCopied] = useState(false);
  // For a video WITHOUT a poster: the icon overlay is shown until the affiliate
  // presses play, then it hides so the playing video is visible.
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mirrors CopyLinkButton.tsx: async clipboard write + 2s reset, with a prompt
  // fallback so non-secure contexts / WebViews (no clipboard API) still work.
  async function handleCopy(caption: string) {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t('copyCaption'), caption);
    }
  }

  const caption = row.caption;

  return (
    // D-10: glassmorphism card — NOT the admin white-card style
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden flex flex-col">

      {/* ── Media frame ──────────────────────────────────────────────── */}
      {row.type === 'IMAGE' ? (
        // IMAGE: fixed-aspect media region. object-contain shows the whole image
        // (never cropped) and centers it within the region, so an image whose
        // aspect doesn't fill the box is letterboxed evenly top/bottom (centered)
        // rather than pinned to the top.
        <div className="relative w-full aspect-[4/5] bg-black/20 overflow-hidden">
          <Image
            src={row.url}
            alt={row.title}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 80vw, 180px"
          />
          {/* Type badge — top-left, localized (I18N-01) */}
          <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase bg-black/50 text-white">
            {t('photoLabel')}
          </span>
        </div>
      ) : (
        // VIDEO: inline playable, never autoplay (D-01, D-02). Same fixed-aspect
        // region as images; object-contain centers the frame within the box.
        // preload="metadata" + #t=0.001 fragment paints the first frame as the
        // default poster when no explicit thumbnailUrl is set.
        <div className="relative w-full aspect-[4/5] bg-black/20 overflow-hidden">
          <video
            ref={videoRef}
            src={row.thumbnailUrl ? row.url : `${row.url}#t=0.001`}
            poster={row.thumbnailUrl ?? undefined}
            controls
            preload="metadata"
            aria-label={row.title}
            className="w-full h-full object-contain"
          />
          {!row.thumbnailUrl && showVideoOverlay && (
            <button
              type="button"
              aria-label={`${t('videoLabel')} — ${row.title}`}
              onClick={() => {
                setShowVideoOverlay(false);
                videoRef.current?.play();
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
            >
              <Video className="w-10 h-10 text-white/70" />
            </button>
          )}
          {/* Type badge — top-left, localized (I18N-01) */}
          <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase bg-black/50 text-white">
            {t('videoLabel')}
          </span>
        </div>
      )}

      {/* ── Card body ────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Title — always shown */}
        <p className="text-white font-semibold text-sm truncate">{row.title}</p>

        {/* Caption text — only when non-empty (D-04). Plain text; never <track> (D-05). */}
        {caption && (
          <p className="text-white/60 text-xs line-clamp-3">{caption}</p>
        )}

        {/* Action row */}
        <div className="mt-auto flex gap-2 flex-wrap">

          {/* Download — anchor so keyboard nav + right-click "Save link as" work (D-06, D-07).
              href MUST be getDownloadUrl(row.url); bare row.url ignores cross-origin download attr. */}
          <a
            href={getDownloadUrl(row.url)}
            download={row.fileName}
            aria-label={`${t('download')} — ${row.title}`}
            className="inline-flex items-center rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-brand-purple transition-all duration-200 hover:bg-brand-orange/90 active:scale-95"
          >
            {t('download')}
          </a>

          {/* Copy caption button — only when caption exists (D-03) */}
          {caption && (
            <button
              type="button"
              aria-label={`${t('copyCaption')} — ${row.title}`}
              onClick={() => handleCopy(caption)}
              className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
            >
              {copied ? t('copied') : t('copyCaption')}
            </button>
          )}

        </div>
      </div>

    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AffiliateCreativesGallery({ rows }: AffiliateCreativesGalleryProps) {
  const t = useTranslations('AffiliateCreatives');

  return (
    // D-09: dense thumbnail grid. The dashboard container is capped at max-w-4xl
    // (~850px usable), so fixed viewport breakpoints (lg/2xl) never trigger and
    // leave huge cards. auto-fill + a small min column width packs as many small
    // previews as fit the available width instead — ~4 cols on narrow, ~5 on wide.
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
      {rows.map((row) => (
        <CreativeCard key={row.id} row={row} t={t} />
      ))}
    </div>
  );
}
