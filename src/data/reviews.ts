// ─────────────────────────────────────────────────────────────────────────────
// Reviews — the 6 reviews from the Figma "Reviews" frame. Translatable fields
// (role, country, relative date, quote) live in messages/*.json under
// Reviews.r{n}_role/_country/_date/_quote; this file holds only what stays
// identical across locales: id, display name, country flag emoji, star
// rating, and an optional avatar photo.
//
// photoUrl: set to a public image path or leave '' to render an initials
// avatar automatically. Figma's mock uses round profile photos; the user
// provided review-avatar-1..6.png (public/images/redesign), mapped
// sequentially to the 6 reviews in their established order.
// ─────────────────────────────────────────────────────────────────────────────

export type Review = {
  id:       string;
  name:     string;
  flag:     string;           // country flag emoji
  photoUrl: string;           // profile photo — leave '' for initials avatar
  stars:    1 | 2 | 3 | 4 | 5;
};

export const reviews: Review[] = [
  { id: 'marcus',  name: 'Marcus',    flag: '🇺🇸', photoUrl: '/images/redesign/review-avatar-1.png', stars: 5 },
  { id: 'liam',    name: 'Liam',      flag: '🇩🇪', photoUrl: '/images/redesign/review-avatar-2.png', stars: 5 },
  { id: 'elena',   name: 'Elena R.',  flag: '🇨🇭', photoUrl: '/images/redesign/review-avatar-3.png', stars: 5 },
  { id: 'jessica', name: 'Jessica T.', flag: '🇺🇸', photoUrl: '/images/redesign/review-avatar-4.png', stars: 5 },
  { id: 'david',   name: 'David K.',  flag: '🇨🇭', photoUrl: '/images/redesign/review-avatar-5.png', stars: 5 },
  { id: 'tyson',   name: 'Tyson W.',  flag: '🇮🇹', photoUrl: '/images/redesign/review-avatar-6.png', stars: 5 },
];
