import Image from 'next/image';
import { reviews, type Review } from '@/data/reviews';

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(/[\s&]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-[#c97d2f]',
  'bg-[#8b2fc9]',
  'bg-[#c92f6e]',
  'bg-[#2f7dc9]',
  'bg-[#2fc97d]',
  'bg-brand-orange',
];

function avatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  tiktok:    'TikTok',
  google:    'Google',
};

// ── Stars ─────────────────────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? 'text-brand-orange' : 'text-white/15'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Media block (product photo or video) ─────────────────────────────────────

function MediaBlock({ url, type }: { url: string; type: 'image' | 'video' }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
      <Image
        src={url}
        alt="Product"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      {type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-brand-purple ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="break-inside-avoid mb-3 rounded-2xl bg-white/[0.07] border border-white/10
      hover:bg-white/[0.11] transition-colors duration-300 p-5 flex flex-col gap-4">

      {/* Product media (photo or video) */}
      {review.mediaUrl && review.mediaType && (
        <MediaBlock url={review.mediaUrl} type={review.mediaType} />
      )}

      {/* Stars + platform */}
      <div className="flex items-center justify-between">
        <Stars count={review.stars} />
        {review.platform && (
          <span className="text-[10px] font-semibold text-white/30 tracking-wider uppercase">
            {PLATFORM_LABEL[review.platform]}
          </span>
        )}
      </div>

      {/* Quote */}
      <p className="text-white/90 text-[14px] sm:text-[15px] leading-relaxed flex-1">
        &ldquo;{review.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-1 border-t border-white/10">
        <div className="shrink-0 relative w-10 h-10">
          {review.photoUrl ? (
            <Image
              src={review.photoUrl}
              alt={review.name}
              fill
              className="rounded-full object-cover"
              sizes="40px"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              text-white text-xs font-bold ${avatarColor(review.id)}`}>
              {initials(review.name)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-[13px] truncate">{review.name}</p>
          {review.handle && (
            <p className="text-white/35 text-[11px] truncate">{review.handle}</p>
          )}
        </div>
      </div>

    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function ReviewsSection() {
  return (
    <section className="bg-gradient-to-b from-[#3b1c5a] to-brand-purple px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-brand-orange text-[11px] font-bold tracking-[0.22em] uppercase mb-4">
            Real people. Real results.
          </p>
          <h2 className="font-heading text-white text-[38px] sm:text-[52px] lg:text-[62px]
            leading-[0.93] tracking-[-0.03em]">
            What people are saying
          </h2>
        </div>

        {/* Masonry grid — 2 cols on mobile, 3 on md, 4 on lg */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

      </div>
    </section>
  );
}
