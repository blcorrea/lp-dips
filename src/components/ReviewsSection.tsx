"use client";

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { reviews, type Review } from '@/data/reviews';

/*
  Reviews — matched to the Figma frame (1440x1368, bg #2D1A69 =
  dips-purple-reviews, already correct). Card anatomy was inverted from
  Figma's: author goes at the TOP (avatar + name/role left, stars/country
  right), quote in the middle, relative date at the bottom-right -- not
  author-in-footer + media block (no card in the Figma mock has product
  media). Grid is 3 explicit columns of 2 stacked cards (Figma pairs:
  [Marcus,Liam] [Elena,Jessica] [David,Tyson]), not CSS `columns` (which
  fills unpredictably once card heights vary).

  Content: the 12 placeholder reviews were replaced with the Figma's 6 real
  reviews (data/reviews.ts docs itself as placeholder content -- Figma wins
  here per the project's Figma-is-source-of-truth default). Figma uses
  round profile photos we don't have assets for; falls back to initials
  (photoUrl ready for real photos later).

  Font sizes one step below the Figma spec (54->48, 24->21 subtitle, 24->21
  name, 18->16 quote, 14->13 role/country/date), carrying over the
  Hero/Story/Ingredients/BuySection approved treatment. Stars are Figma's
  yellow (#FFCD00), not the brand-orange used in the Hero's own star spec.
*/

const COLUMNS: readonly (readonly string[])[] = [
  ['marcus', 'liam'],
  ['elena', 'jessica'],
  ['david', 'tyson'],
];

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

// ── Stars (Figma: 5x 18px squares, #FFCD00) ───────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          // Mobile (RESP-05): 16px (Figma mobile spec), was 18px.
          className="h-4 w-4 lg:h-[18px] lg:w-[18px]"
          style={{ color: i < count ? '#ffcd00' : 'rgba(255,255,255,0.15)' }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  role,
  country,
  date,
  quote,
}: {
  review: Review;
  role: string;
  country: string;
  date: string;
  quote: string;
}) {
  return (
    // Mobile (RESP-05): gap-[15px] (Figma mobile spec), was 25px -- lg keeps 25px.
    <div className="flex flex-col gap-[15px] rounded-card-lg border-2 border-dips-card-review-border bg-dips-card-review p-card-padding transition-colors duration-300 hover:bg-white/[0.06] lg:gap-[25px]">
      {/* Header — avatar + name/role (left), stars + country (right).
          Mobile (RESP-05): avatar 44px (was 60px), gap-[10px] (was 15px). */}
      <div className="flex items-center gap-[10px] lg:gap-[15px]">
        <div className="relative h-11 w-11 shrink-0 lg:h-[60px] lg:w-[60px]">
          {review.photoUrl ? (
            <Image
              src={review.photoUrl}
              alt={review.name}
              fill
              className="rounded-full object-cover"
              sizes="60px"
            />
          ) : (
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full text-[18px] font-bold text-white lg:h-[60px] lg:w-[60px] ${avatarColor(review.id)}`}
            >
              {initials(review.name)}
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-between gap-[10px]">
          {/* Mobile (RESP-05): name 21->16px, one step below the Figma
              mobile spec (18px); role stays literal at 12/13px. */}
          <div className="flex flex-col gap-[5px]">
            <span className="font-heading text-[16px] font-bold leading-[1.2] text-white lg:text-[21px]">
              {review.name}
            </span>
            <span className="text-[12px] text-[#9499a9] lg:text-[13px]">{role}</span>
          </div>

          {/* Mobile (RESP-05): stars 16px (was 18px); country 10px (Figma
              mobile spec literal, was 13px). */}
          <div className="flex flex-col items-end gap-[10px]">
            <Stars count={review.stars} />
            <span className="flex items-center gap-[5px] text-[10px] text-white lg:text-[13px]">
              <span aria-hidden="true">{review.flag}</span>
              {country}
            </span>
          </div>
        </div>
      </div>

      {/* Quote. Mobile (RESP-05): 12px/14 leading (Figma mobile spec
          literal), was 16px/1.25. */}
      <p className="font-body text-[12px] leading-[14px] text-[#9499a9] lg:text-[16px] lg:leading-[1.25]">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Date. Mobile (RESP-05): 10px (Figma mobile spec literal), was 13px. */}
      <p className="text-right text-[10px] text-dips-text-lavender lg:text-[13px]">{date}</p>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function ReviewsSection() {
  const t = useTranslations('Reviews');

  // Mobile (RESP-05): py-10 (Figma mobile spec is ~40px vertical), was
  // py-20 -- sm:py-28 (tablet/desktop, unchanged) already takes over from
  // 640px up, so no lg: prefix is needed here.
  return (
    <section id="reviews" className="scroll-mt-[72px] bg-dips-purple-reviews px-6 py-10 sm:py-28">
      <div className="mx-auto max-w-7xl">

        {/* Header. Mobile (RESP-05): title 48->40px, subtitle 21->16px, one
            step below the Figma mobile spec (44px/18px). */}
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <h2 className="font-heading text-[40px] font-bold leading-[1.2] text-white lg:text-[48px]">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.35] text-dips-text-lavender lg:text-[21px]">
            {t('subtitle')}
          </p>
        </div>

        {/* 3 explicit columns (Figma pairs), top-aligned, natural heights */}
        <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-3">
          {COLUMNS.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-[15px]">
              {column.map((key) => {
                const review = reviews.find((r) => r.id === key)!;
                return (
                  <ReviewCard
                    key={key}
                    review={review}
                    role={t(`${key}_role`)}
                    country={t(`${key}_country`)}
                    date={t(`${key}_date`)}
                    quote={t(`${key}_quote`)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Carousel arrows — Figma: bottom-right, prev dark (#2B1543), next
            brand-orange (#F16B16 normalized per DSGN-03). Disabled for now --
            all 6 reviews already render at once, so there's nothing to page
            to yet; wire up real pagination once there are enough reviews to
            need it, instead of carrying dead state today. */}
        {/* Mobile (RESP-05): arrows spread across the full width
            (justify-between) at 50px each, matching the Figma mobile spec --
            was already justify-end/60px, which is the lg-only treatment now. */}
        <div className="mt-8 flex w-full items-center justify-between lg:w-auto lg:justify-end lg:gap-[14px]">
          <button
            type="button"
            disabled
            aria-label={t('prev')}
            className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#2b1543] opacity-50 lg:h-[60px] lg:w-[60px]"
          >
            <svg className="h-5 w-5 lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="none">
              <path d="M15 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            disabled
            aria-label={t('next')}
            className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-brand-orange opacity-50 lg:h-[60px] lg:w-[60px]"
          >
            <svg className="h-5 w-5 lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}
