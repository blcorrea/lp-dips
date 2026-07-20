import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google';

/**
 * Fallback for the card font. The real card font is now Satoshi (self-hosted
 * via @font-face in globals.css, matching Figma); Plus Jakarta Sans stays
 * wired as the next-in-line fallback in --font-card while Satoshi loads.
 * 400 for card body, 700 for card titles.
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
