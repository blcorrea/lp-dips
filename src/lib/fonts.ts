import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google';

/**
 * Card titles/body (ingredient cards, bundle cards, review cards).
 * Satoshi substitute per the Phase 4 UI-SPEC — 400 for card body, 700 for card titles.
 * Feeds --font-card in globals.css via the CSS variable below.
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

/**
 * CTA buttons — 700 only per the Phase 4 UI-SPEC.
 * Feeds --font-cta in globals.css via the CSS variable below.
 */
export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-dm-sans',
});
