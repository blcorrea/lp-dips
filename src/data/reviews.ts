// ─────────────────────────────────────────────────────────────────────────────
// Reviews — static data. Replace placeholder content with real reviews.
// photoUrl: set to a public image path (e.g. '/reviews/jane.jpg') or leave
// empty to render an initials avatar automatically.
// ─────────────────────────────────────────────────────────────────────────────

export type Review = {
  id:        string;
  quote:     string;
  name:      string;
  handle?:   string;
  photoUrl:  string;          // profile photo — leave '' for initials avatar
  mediaUrl?: string;          // product photo or video thumbnail
  mediaType?: 'image' | 'video';
  stars:     1 | 2 | 3 | 4 | 5;
};

export const reviews: Review[] = [
  {
    id:       '1',
    quote:    'I gave this to my partner as a surprise and it completely changed our night. The chocolate is rich, smooth, and the energy shift is real. We made it a whole ritual — candles, music, no phones. We\'re already on our third order and I don\'t see that stopping anytime soon.',
    name:     'Sophia R.',
    handle:   '@sophiar',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '2',
    quote:    'Best Valentine\'s gift I\'ve ever given.',
    name:     'Marcus T.',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '3',
    quote:    'The packaging alone made it feel like a luxury experience. The chocolate? Even better. Sent one to my sister and she called me the same night to say thank you.',
    name:     'Camille D.',
    handle:   '@camilledupont',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '4',
    quote:    'Honestly didn\'t expect much — I was skeptical. Two boxes later, I\'m a believer.',
    name:     'Jordan K.',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '5',
    quote:    'Pure indulgence. We made it a ritual — one piece each, lights low, phones off. Dips turned a regular Tuesday into something we still talk about weeks later. The maca and ginger combo hits different.',
    name:     'Isabelle M.',
    handle:   '@isabelle.m',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '6',
    quote:    'Quality is on another level.',
    name:     'Daniel F.',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '7',
    quote:    'We ordered this on a whim and ended up completely hooked. The ingredients are legit — you can feel the difference. It\'s become our go-to for date nights.',
    name:     'Priya & Ravi',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '8',
    quote:    'Absolutely obsessed. The flavour is incredible.',
    name:     'Léa B.',
    handle:   '@leab_',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '9',
    quote:    'I bought this as a joke for my boyfriend and now I buy it every month. The chocolate melts perfectly and you actually feel the warmth building up. 10/10 would recommend to any couple.',
    name:     'Natalie W.',
    handle:   '@natalieworks',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '10',
    quote:    'Turned a regular night into something unforgettable.',
    name:     'Tom & Sarah',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '11',
    quote:    'I\'ve tried a lot of "wellness" chocolates and most are just hype. Dips is the real deal. You can taste the quality in every bite, and the effect is genuinely noticeable. My partner was impressed and that says a lot.',
    name:     'Chris A.',
    photoUrl: '',
    stars:    5,
  },
  {
    id:       '12',
    quote:    'Ships fast, tastes amazing, works as advertised. Reordered twice.',
    name:     'Emily R.',
    handle:   '@emilyr',
    photoUrl: '',
    stars:    5,
  },
];
