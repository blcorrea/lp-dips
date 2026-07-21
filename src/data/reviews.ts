// ─────────────────────────────────────────────────────────────────────────────
// Reviews — the 6 reviews from the Figma "Reviews" frame. Translatable fields
// (role, country, relative date, quote) live in messages/*.json under
// Reviews.r{n}_role/_country/_date/_quote; this file holds only what stays
// identical across locales: id, display name, country flag emoji, star
// rating, and an optional avatar photo.
//
// photoUrl: set to a public image path (e.g. '/reviews/marcus.jpg') or leave
// '' to render an initials avatar automatically. Figma's mock uses round
// profile photos we don't have real assets for yet -- initials fallback
// covers this until real photos are provided.
// ─────────────────────────────────────────────────────────────────────────────

export type Review = {
  id:       string;
  name:     string;
  flag:     string;           // country flag emoji
  photoUrl: string;           // profile photo — leave '' for initials avatar
  stars:    1 | 2 | 3 | 4 | 5;
};

export const reviews: Review[] = [
  { id: 'marcus',  name: 'Marcus',    flag: '🇺🇸', photoUrl: '', stars: 5 },
  { id: 'liam',    name: 'Liam',      flag: '🇩🇪', photoUrl: '', stars: 5 },
  { id: 'elena',   name: 'Elena R.',  flag: '🇨🇭', photoUrl: '', stars: 5 },
  { id: 'jessica', name: 'Jessica T.', flag: '🇺🇸', photoUrl: '', stars: 5 },
  { id: 'david',   name: 'David K.',  flag: '🇨🇭', photoUrl: '', stars: 5 },
  { id: 'tyson',   name: 'Tyson W.',  flag: '🇮🇹', photoUrl: '', stars: 5 },
];
