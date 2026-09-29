// ─────────────────────────────────────────────────────────────────────────────
// Reviews — real customer reviews copied verbatim from the product's Amazon
// listing (they replaced the 6 Figma mock reviews). Title and quote are kept
// in their original language on every locale (Amazon shows them the same
// way) and are not edited, typos included, so they stay faithful to the
// source. Only the surrounding labels (verified badge, country, "Reviewed on
// Amazon") are translated, under Reviews.* in messages/*.json.
//
// date: ISO date (YYYY-MM-DD) of the Amazon review, formatted per locale.
// verified: Amazon's "Verified Purchase" badge was shown on the review.
// ─────────────────────────────────────────────────────────────────────────────

export type Review = {
  id:       string;
  name:     string;
  flag:     string;           // country flag emoji
  country:  'us';             // Reviews.country_{country} translation key
  stars:    1 | 2 | 3 | 4 | 5;
  title:    string;
  quote:    string;
  date:     string;
  verified: boolean;
};

export const reviews: Review[] = [
  {
    id: 'heliane', name: 'Heliane Stabel', flag: '🇺🇸', country: 'us', stars: 5,
    title: 'Dips Sensual Chocolate',
    quote: 'Really enjoyed this chocolate! It has a rich, smooth flavor and just the right amount of sweetness. Definitely would buy again!',
    date: '2026-08-24', verified: true,
  },
  {
    id: 'paola', name: 'Paola', flag: '🇺🇸', country: 'us', stars: 5,
    title: 'works!!',
    quote: 'Really good chocolate if youre into dark chocolate and I was actually surprised that it worked. Great flavor and a fun concept. Definitely worth trying on date night ;)',
    date: '2026-08-13', verified: true,
  },
  {
    id: 'tbd', name: 'tbd', flag: '🇺🇸', country: 'us', stars: 5,
    title: 'Delicious. Great for eating alone or serving at a party',
    quote: 'Delicious.',
    date: '2026-08-29', verified: true,
  },
  {
    id: 'maria', name: 'Maria A camargo', flag: '🇺🇸', country: 'us', stars: 5,
    title: 'Están muy deliciosas!!!',
    quote: 'Me gustaron, llegaron a tiempo, el empaque muy elegante y el sabor delicioso 😋. Las recomiendo 100%. Disfrútelas!!!!',
    date: '2026-09-27', verified: true,
  },
  {
    id: 'paulo', name: 'Paulo F.', flag: '🇺🇸', country: 'us', stars: 5,
    title: 'Love it.',
    quote: 'Love it, nice detail for a gift.',
    date: '2026-08-08', verified: true,
  },
  {
    id: 'anthony', name: 'AnthonyC', flag: '🇺🇸', country: 'us', stars: 5,
    title: 'Amazing',
    quote: 'Love the flavor, amazing gift, definitely I will buy it again',
    date: '2026-09-23', verified: false,
  },
  {
    id: 'ljshopsnow', name: 'ljshopsnow', flag: '🇺🇸', country: 'us', stars: 5,
    title: 'Amazing work',
    quote: 'Tasted delicious and the effects were amazing.',
    date: '2026-08-07', verified: false,
  },
];
