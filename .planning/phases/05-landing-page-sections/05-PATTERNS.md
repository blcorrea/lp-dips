# Phase 5: Landing Page Sections - Pattern Map

**Mapped:** 2026-07-16
**Files analyzed:** 13 (3 new, 4 full/near-full rewrites, 3 reskins, 3 deletions, page.tsx/layout.tsx rewires, 3 i18n files)
**Analogs found:** 13 / 13 (all files have an in-repo analog — this phase is 100% reskin/restructure of existing patterns, no new architectural surface)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/LandingHeader.tsx` | component | request-response (client nav) | `src/components/Header.tsx` | role-match (same role, new copy/nav set) |
| `src/components/LandingFooter.tsx` | component | request-response (client form) | `src/components/Footer.tsx` | role-match |
| `src/components/StorySection.tsx` | component | transform (i18n copy → split layout) | `src/components/AboutSection.tsx` | role-match (content source + layout family) |
| `src/components/Hero.tsx` (full rewrite) | component | transform | itself (pre-rewrite) + `src/components/ProductSection.tsx` (feature-card row absorbed) | exact (path/export) + role-match (absorbed content) |
| `src/components/IngredientsSection.tsx` (reskin) | component | transform | itself (pre-reskin) | exact — restructure carousel → split layout, same file |
| `src/components/ReviewsSection.tsx` (reskin) | component | CRUD-read (static data) | itself (pre-reskin) | exact — background/column change only, `Stars`/`ReviewCard`/avatar logic untouched |
| `src/components/FAQSection.tsx` (reskin) | component | request-response (accordion UI state) | itself (pre-reskin) + `src/components/ui/accordion.tsx` | exact + exact (shadcn primitive already installed) |
| `src/components/BuySection.tsx` (reskin wrapper) | component | request-response | itself (pre-reskin) + `src/components/ProductPurchaseBox.tsx` | exact (wrapper) + exact (pricing/checkout logic, untouched) |
| `src/components/WhyDipsSection.tsx` (delete) | component | n/a | — | deletion, no analog needed |
| `src/components/ProductSection.tsx` (delete after Hero absorbs it) | component | n/a | — | deletion, no analog needed |
| `src/components/AboutSection.tsx` (delete after StorySection replaces it) | component | n/a | — | deletion, no analog needed |
| `src/app/[locale]/page.tsx` (rewire) | route (server component) | request-response | itself (pre-rewire) | exact |
| `src/app/[locale]/layout.tsx` (add `scroll-smooth`) | layout | request-response | itself (pre-edit) | exact |
| `messages/{en,es,pt}.json` (new namespaces) | config (i18n) | transform | existing `Header`/`Footer`/`About`/`Product` namespace blocks in same files | exact (structural convention) |

## Pattern Assignments

### `src/components/LandingHeader.tsx` (component, request-response)

**Analog:** `src/components/Header.tsx` (full file, 178 lines)

**Imports pattern** (lines 1-9):
```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import SocialMediaButtons from "@/components/SocialMediaButtons";
```
For `LandingHeader.tsx`: drop the `SocialMediaButtons` import (explicitly dropped per UI-SPEC), keep the rest of the shape. Add `useTranslations("LandingHeader")` instead of `"Header"`.

**Locale + sticky container pattern** (lines 11-23):
```tsx
export default function Header() {
  const t = useTranslations("Header");
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [mobileOpen, setMobileOpen] = useState(false);
  ...
  return (
    <header className="sticky top-0 z-50 w-full bg-brand-cream border-b border-brand-purple/8">
      <div className="container mx-auto px-5 sm:px-6 h-[64px] lg:h-[72px] flex items-center justify-between">
```
Reuse `sticky top-0 z-50` verbatim (per CONTEXT.md: "reference pattern only, not a shared import"). Swap `bg-brand-cream`/`px-5 sm:px-6` for the UI-SPEC's `h-[72px]`, `px-[40px]` (desktop), and `--color-dips-*` dark surfaces — this is a new dark-themed header, not a `Header.tsx` restyle.

**Nav link pattern** (lines 40-70, anchors to sections):
```tsx
<Link href={`/${locale}#about`} className={desktopNavLinkClass}>
  {t("about")}
</Link>
```
Reuse this `Link href={`/${locale}#anchor`}` shape for the 4 new anchors (`#hero`, `#story`, `#bundle`, `#footer-contact`), with `desktopNavLinkClass` restyled to `text-nav-link` token / `--color-dips-text-lavender-muted` / hover `--color-brand-orange` per UI-SPEC.

**Mobile toggle pattern** (lines 94-107): reuse the `Menu`/`X` + `useState` toggle shell verbatim as the TODO-comment placeholder for future mobile nav (CONTEXT.md requires the component not be architecturally locked out of mobile later) — do not fully implement the mobile drawer this phase (Phase 6 scope), but the toggle scaffold from `Header.tsx` is the reference to leave a hook for it.

**i18n:** new `LandingHeader` namespace — `menu`, `ourStory`, `order`, `contact`, `shopNow`, `tagline`, `trustBar1..6`. Do NOT reuse `Header.about`/`.product`/etc.

---

### `src/components/LandingFooter.tsx` (component, request-response)

**Analog:** `src/components/Footer.tsx` (full file, 164 lines)

**Imports pattern** (lines 1-6):
```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
```
Identical import shape for `LandingFooter.tsx`, with `useTranslations("LandingFooter")`.

**Column/link pattern** (lines 38-81, Quick Links column — must include Affiliates):
```tsx
<div>
  <h3 className="mb-4 text-xs font-bold uppercase text-brand-purple">
    {t("quickLinksTitle")}
  </h3>
  <ul className="space-y-2 text-sm text-brand-charcoal">
    <li><a href={`/${locale}#faq`}>F.A.Q.</a></li>
    <li><a href={`/${locale}#ingredients`}>{t("ingredients")}</a></li>
    <li><Link href={`/${locale}/product/dips-chocolate`}>{t("whereToBuy")}</Link></li>
    <li><Link href={`/${locale}/privacy`}>{t("privacy")}</Link></li>
    <li><Link href={`/${locale}/terms`}>{t("terms")}</Link></li>
    <li><Link href={`/${locale}/affiliates/join`}>{t("affiliates")}</Link></li>
  </ul>
</div>
```
Carry the `Link href={`/${locale}/affiliates/join`}` line forward verbatim into `LandingFooter`'s Quick Links column (per UI-SPEC: header no longer carries Affiliates, footer must).

**Newsletter form pattern** (lines 104-128):
```tsx
<form className="flex items-center gap-2">
  <input type="email" placeholder={t("yourEmail")}
    className="h-[40px] w-[180px] rounded-full border border-brand-purple/40 px-4 text-sm outline-none" />
  <button type="submit"
    className="h-[40px] rounded-full bg-brand-purple px-6 text-xs font-bold text-white whitespace-nowrap transition hover:bg-brand-purple/90">
    {t("signUp")}
  </button>
</form>
```
Reuse this form shape/keys (`cravingMore`, `letYourNights`, `yourEmail`, `signUp`, `successMsg` — carry client behavior forward), restyle to UI-SPEC's pill input (362px) + orange `bg-brand-orange` "Sign Up" button (123px), new heading key `LandingFooter.neverSatisfied` replacing `cravingMore`'s copy role.

**Legal/address block** (lines 142-160): reuse verbatim content (`rightsReserved`, `madeWith`, `productDesigned`, real address "8211 NW 64th Street Unit 4, Miami, FL 33166", `registeredIn`, `ageRestriction`) — UI-SPEC explicitly says do not substitute Figma's placeholder address.

**Contact pattern** (lines 90-101): reuse `mailto:info@dipschocolate.com` / `tel:7544576844` verbatim — this is the FUNC-04 correct-email source of truth, target `id="footer-contact"` on this specific column per UI-SPEC.

---

### `src/components/StorySection.tsx` (new component, transform)

**Analog:** `src/components/AboutSection.tsx` (full file, 84 lines)

**Imports pattern** (lines 1-4):
```tsx
"use client";

import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';
```
Keep `ScrollReveal` usage pattern (used throughout the codebase for section entrance animation) unless UI-SPEC's split-layout conflicts — reuse the `direction`/`delay`/`duration` prop shape.

**Split-column layout pattern** (lines 9-48):
```tsx
<section id="about" className="bg-brand-cream">
  <div className="py-20 lg:py-28">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-20 items-start max-w-7xl mx-auto">
        {/* Left column */}
        <div className="flex flex-col">
          <ScrollReveal direction="left" delay={0.1} duration={0.8}>
            <div>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold leading-[0.98] tracking-[-0.04em] text-brand-purple">
                {t('titleLine1')}<br />{t('titleLine2')}<br />{t('titleLine3')}
              </h2>
            </div>
          </ScrollReveal>
          ...
        </div>
        {/* Right column */}
        <ScrollReveal direction="right" delay={0.2} duration={0.8}>
          <div className="space-y-5 ...">
            <p>{t('p1')}</p><p>{t('p2')}</p><p>{t('p3')}</p><p>{t('p4')}</p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </div>
</section>
```
`StorySection.tsx` inverts this — photo on left (`story-couple-photo.png`, `heading-side` token overlaid), dark panel on right (`--color-dips-purple-deepest`, `heading-lg` heading, `body-lg` paragraphs). Reuse the `grid lg:grid-cols-[...] gap-10 lg:gap-20` split-container shape and `ScrollReveal` wrapper pattern; map `About.p1..p4` (4 paragraphs) into the new 3-paragraph slot per CONTEXT.md's fold instructions (new hand-written namespace `Story`, not runtime concatenation).

**i18n:** new `Story` namespace, hand-merged copy — do NOT reuse `About.*` keys directly in code (source content only, not live keys).

---

### `src/components/Hero.tsx` (full rewrite, transform)

**Analog A (structure/animation conventions):** itself pre-rewrite (`src/components/Hero.tsx`, 115 lines) — reuse the `"use client"` + `framer-motion` `motion.div` stagger pattern:
```tsx
"use client";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
...
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
```
Keep this stagger-entrance convention for H1/subtitle/badge/CTAs even though background/copy structure changes entirely (gradient bg, two-tone H1, dual CTA, feature-card row).

**Analog B (absorbed feature-card row):** `src/components/ProductSection.tsx` (full file, 50 lines):
```tsx
const features = [
  { titleKey: 'feature1_title', descKey: 'feature1_desc' },
  { titleKey: 'feature2_title', descKey: 'feature2_desc' },
  { titleKey: 'feature3_title', descKey: 'feature3_desc' },
  { titleKey: 'feature4_title', descKey: 'feature4_desc' },
];
...
{features.map((feature, index) => (
  <ScrollReveal key={feature.titleKey} direction="up" delay={0.1 + index * 0.1} duration={0.6}>
    <div className="text-brand-purple">
      <p className="text-[15px] lg:text-base leading-relaxed">
        <span className="font-bold">{t(feature.titleKey)}</span>{' '}
        <span className="font-normal text-brand-charcoal/85">{t(feature.descKey)}</span>
      </p>
    </div>
  </ScrollReveal>
))}
```
Carry the `features` array + `t('Product.feature1..4_title'/'_desc')` key reuse verbatim into Hero's new 4-card row at the base — reuse existing `Product` namespace translations, per CONTEXT.md ("keep OLD namespace names — renaming is pure churn").

**CTA anchor pattern** (both Hero.tsx line 91-96 and ProductSection.tsx line 39-44, identical):
```tsx
<a href="#buy" className="inline-flex items-center justify-center rounded-[20px] bg-brand-orange px-8 ...">
  {t("cta")}
</a>
```
Reuse this anchor-link CTA shape for the new "Buy Now"/"How It Works?" CTAs, retargeting `href` to `#bundle` / `#ingredients` per UI-SPEC (note: section id renamed `buy` → `bundle` this phase).

**i18n:** `Hero` namespace gets new headline/subtitle/CTA keys per UI-SPEC's two-tone copy; feature cards keep `Product.feature1..4_*` verbatim.

---

### `src/components/IngredientsSection.tsx` (reskin — carousel → split layout)

**Analog:** itself pre-reskin (full file, 282 lines). This is a structural rebuild in the same file/export, so treat the *ingredient data array* and *i18n key mapping* as the reusable core, discarding the carousel mechanics.

**Data array pattern to keep** (lines 23-72):
```tsx
interface Ingredient {
  nameKey: string;
  keywordKey: string;
  image: string;
  descKey: string;
  originsTitleKey: string;
  originsKey: string;
}
const ingredients: Ingredient[] = [
  { nameKey: 'cocoa_name', keywordKey: 'cocoa_keyword', image: '/images/cocoa.png', descKey: 'cocoa_desc', originsTitleKey: 'cocoa_originsTitle', originsKey: 'cocoa_origins' },
  // ...maca, ginger, theanine, blend (Aphrodisiac), fenugreek
];
```
Reuse this array shape verbatim (swap `image` paths to `ing-icon-*.png` per UI-SPEC), reuse all `t(ingredient.*Key)` calls unchanged — this is the FUNC-04 "Aphrodisiac" typo-fix touchpoint (`blend_name`/`blend_desc` keys).

**Discard:** `useEffect` autoplay/carousel state (`activeIndex`, `getCardStyle`, `getRelativePosition`, prev/next buttons, dot indicators — lines 74-146, 243-277) — not needed in a static split layout.

**Section id + container shape to keep** (lines 149-150):
```tsx
<section id="ingredients" className="bg-white py-20 lg:py-28">
  <div className="container mx-auto px-6">
```
Reuse `id="ingredients"` (Hero's "How It Works?" target) and outer `container mx-auto px-6` wrapper; swap `bg-white` for `--color-dips-purple-section` dark bg per UI-SPEC.

---

### `src/components/ReviewsSection.tsx` (reskin — background + column count only)

**Analog:** itself pre-reskin (full file, 151 lines) — this file's `Stars`, `ReviewCard`, `MediaBlock`, `initials`/`avatarColor` helpers (lines 4-120) are explicitly **unchanged** per UI-SPEC; only two lines change.

**Line to change (background)** (line 126):
```tsx
<section className="bg-gradient-to-b from-[#3b1c5a] to-brand-purple px-6 py-20 sm:py-28">
```
→ `bg-[var(--color-dips-purple-reviews)]` (`#2d1a69`).

**Line to change (masonry columns)** (line 141):
```tsx
<div className="columns-2 md:columns-3 lg:columns-4 gap-3">
```
→ `columns-2 md:columns-3 gap-3` (drop `lg:columns-4` per UI-SPEC/CONTEXT.md locked decision).

**Card styling to update** (line 76): `bg-white/[0.07] border border-white/10` → `--color-dips-card-review` (`rgba(35,20,53,0.4)`) fill / `--color-dips-card-review-border` border, `--radius-card-lg` (18px), `--spacing-card-padding` (25px) per UI-SPEC — everything else in `ReviewCard` (Stars import, avatar logic, quote/author markup) stays untouched.

**Data source (unchanged, locked):** `import { reviews, type Review } from '@/data/reviews';` (line 2) — never replace with Figma's 6 placeholder reviews.

---

### `src/components/FAQSection.tsx` (reskin — rebuild on shadcn Accordion)

**Analog A (structure/i18n):** itself pre-reskin (full file, 49 lines):
```tsx
"use client";
import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';

export default function FAQSection() {
    const t = useTranslations('FAQ');
    const faqs = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
    ...
    {faqs.map((q, index) => (
      <ScrollReveal key={q} direction="up" delay={0.1 + index * 0.08} duration={0.6}>
        ...
        <h3>{t(q)}</h3>
        <p>{t(q.replace('q', 'a'))}</p>
```
Reuse the `faqs` array + `t(q)`/`t(q.replace('q','a'))` key-mapping trick verbatim — `FAQ.q1..q6`/`a1..a6` copy is locked unchanged per UI-SPEC/CONTEXT.md.

**Analog B (accordion primitive, already installed, do not reinstall):** `src/components/ui/accordion.tsx` (full file, 59 lines):
```tsx
import * as AccordionPrimitive from "@radix-ui/react-accordion"
const Accordion = AccordionPrimitive.Root
...
className={cn(
  "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
  className
)}
...
<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
```
Wire `faqs.map` into `<Accordion type="single" collapsible>` + `<AccordionItem value={q}><AccordionTrigger>{t(q)}</AccordionTrigger><AccordionContent>{t(q.replace('q','a'))}</AccordionContent></AccordionItem>` per UI-SPEC — reuse the existing `[&[data-state=open]>svg]:rotate-180` chevron behavior as-is (do not reimplement), add left-border `--color-brand-orange` on open item via `data-[state=open]:border-l-*` styling on `AccordionItem`.

**Section id (unchanged):** `id="faq"` (line 11) — no change, already the Header's/new LandingHeader's target.

---

### `src/components/BuySection.tsx` (reskin wrapper around `ProductPurchaseBox.tsx`)

**Analog A:** itself pre-reskin (full file, 123 lines) — server component pattern to preserve:
```tsx
import { getTranslations } from "next-intl/server";
import { getPurchasableDipsProduct } from "@/lib/shopify-product";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
...
export default async function BuySection({ locale }: BuySectionProps) {
  const t = await getTranslations({ locale, namespace: "BuySection" });
  const product = await getPurchasableDipsProduct();
  if (!product) return null;
  ...
  <ProductPurchaseBox
    priceAmount={localizedPricing.price}
    currencyCode={localizedPricing.currency}
    buttonClassName="w-full min-w-0 sm:min-w-[240px]"
    productId={product.productId}
    productName={product.title}
    locale={locale}
  />
```
Preserve this server-component + prop-passing shape untouched — only the surrounding visual wrapper (split layout, `#bundle` id instead of `#buy`, cream/photo panel) changes.

**Analog B (pricing/checkout — locked, do not touch pricing logic, only the summary-row/button visual wrapper):** `src/components/ProductPurchaseBox.tsx` (full file, 165 lines):
```tsx
const BUNDLES = [
  { id: '1x', label: '1 Box', priceId: 'price_1TZZWfGwnxe7ZLlEHKAy4rkm', unitPrice: 29.99, totalPrice: 29.99, quantity: 1, badge: null, shipping: 'standard' },
  { id: '2x', label: '2 Boxes', priceId: 'price_1TZZJnGwnxe7ZLlElHcai2IT', unitPrice: 27.89, totalPrice: 55.78, quantity: 2, badge: 'Save 7%', shipping: 'standard' },
  { id: '3x', label: '3 Boxes', priceId: 'price_1TZZLGGwnxe7ZLlEp1x6vZYb', unitPrice: 25.19, totalPrice: 75.57, quantity: 3, badge: 'Save 16% + Free Shipping', shipping: 'free' },
] as const;
...
const [selectedId, setSelectedId] = useState<'1x' | '2x' | '3x'>('2x'); // default 2x, pre-selected
...
<BuyNowButton
  priceId={selectedBundle.priceId}
  quantity={selectedBundle.quantity}
  label={buttonLabel}
  className="... rounded-full bg-brand-orange ..."
  productId={productId}
  productName={productName}
  productPrice={selectedBundle.totalPrice}
  currency={currencyCode}
  locale={locale}
/>
```
**Locked — do not change:** `BUNDLES` array, `priceId`s, `selectedId` default `'2x'`, `BuyNowButton` props/onClick. **Visual-only changes allowed:** card fill/border colors (unselected → `--color-dips-bundle-light`/`-border`; selected 2x → `--color-dips-card-ingredient-hl`/`--color-brand-orange` 2px border), summary-row fill → `--color-dips-bundle-summary`, and folding the Total into the Buy Now button row (`justify-between`, label left/total right in one pill) instead of a separate summary panel above a centered button — this is a layout/JSX restructure of the render, not the state/pricing logic.

---

## Shared Patterns

### i18n namespace convention
**Source:** `messages/en.json` top-level keys (`Header`, `Footer`, `About`, `Product`, `Ingredients`, `FAQ`, `BuySection`) — one namespace per component.
**Apply to:** `LandingHeader`, `LandingFooter`, `Story` (new namespaces, additive at the top level of all 3 locale files); `Hero`, `Ingredients`, `FAQ` keep their pre-existing namespace names since they reuse verbatim/near-verbatim copy.

### Design tokens (from `src/app/globals.css`, Phase 4 — read-only this phase)
```css
--color-dips-purple-hero-start: #18012d;
--color-dips-purple-hero-mid: #200635;
--color-dips-purple-hero-end: #250246;
--color-dips-purple-deepest: #0a0519;
--color-dips-purple-section: #1a0a2e;
--color-dips-purple-reviews: #2d1a69;
--color-dips-cream: #fff8f0;
--color-dips-card-ingredient: #231435;
--color-dips-card-ingredient-border: #39294c;
--color-dips-card-ingredient-hl: #371629;
--color-dips-card-ingredient-hl-border: #5b2f2d;
--color-dips-card-review: rgba(35,20,53,0.4);
--color-dips-card-review-border: rgba(57,41,76,0.4);
--color-dips-bundle-light: #ffffff;
--color-dips-bundle-light-border: #eee6df;
--color-dips-bundle-summary: #f6efe9;
--color-dips-text-lavender: #ebd9fe;
--color-dips-text-lavender-muted: #ae9bda;
--color-dips-text-headline-lilac: #cfa9f6;
--spacing-card-padding: 25px;
--radius-card: 0.9375rem;    /* 15px */
--radius-card-lg: 1.125rem;  /* 18px */
--text-display-hero: 64px / 1.05;
--text-heading-lg: 54px / 1.15;
--text-subtitle-italic-lg: 24px / 1.4;
--text-subtitle-italic-sm: 20px / 1.4;
--text-body-lg: 24px / 1.5;
--text-card-title-sm: 18px / 1.2;
--text-cta-button: 16px / 1.1;
--text-nav-link: 14px / 1.2;
--text-trust-bar: 12px / 1.2;
--text-footer-fine: 14px / 1.5;
```
**Apply to:** all 8 redesigned sections, `LandingHeader`, `LandingFooter` — never `Header.tsx`/`Footer.tsx` (those stay on `--color-brand-*`).

### ScrollReveal entrance-animation convention
**Source:** `src/components/animations/ScrollReveal.tsx` (used across `AboutSection`, `IngredientsSection`, `ProductSection`, `FAQSection`).
**Apply to:** `StorySection.tsx`, reskinned `IngredientsSection.tsx`/`FAQSection.tsx`/`ReviewsSection.tsx`/`BuySection.tsx` — keep the `<ScrollReveal direction="up" delay={N} duration={0.6-0.8}>` wrapping convention for new/rebuilt blocks unless it conflicts with the new layout's stagger needs (Hero already uses `framer-motion` `motion.div` directly instead — either convention is acceptable per file, don't mix both in one component).

### Anchor/section-id convention
**Source:** `id="faq"` (`FAQSection.tsx` line 11), `id="buy"` (`BuySection.tsx` line 48, renamed `#bundle` this phase), `id="ingredients"` (`IngredientsSection.tsx` line 149), `id="about"` (`AboutSection.tsx` line 10, replaced by `id="story"`).
**Apply to:** all anchor-target sections get `scroll-mt-[72px]` added (per CONTEXT.md) to offset the new sticky 72px `LandingHeader`; `src/app/[locale]/layout.tsx`'s root `<html className={...}>` (line 78-82) gets `scroll-smooth` appended to the existing template-literal className.

### Server vs. client component boundary
**Source:** `BuySection.tsx` (`async function` server component, fetches `getPurchasableDipsProduct()`/`getTranslations`) vs. `Hero.tsx`/`FAQSection.tsx`/`ReviewsSection.tsx` (`"use client"`, `useTranslations`).
**Apply to:** `StorySection.tsx` and reskinned sections should follow whichever boundary their pre-existing analog used (`AboutSection.tsx` is `"use client"`, so `StorySection.tsx` should be too) — `BuySection.tsx`'s server-component shape must NOT change (it depends on `getPurchasableDipsProduct()`).

## No Analog Found

None — every file this phase touches has a direct pre-existing analog (mostly itself, pre-rewrite/reskin) since this phase is a redesign of existing sections plus 3 new components that closely mirror existing sibling components (`Header`→`LandingHeader`, `Footer`→`LandingFooter`, `AboutSection`→`StorySection`).

## Metadata

**Analog search scope:** `src/components/`, `src/components/ui/`, `src/app/[locale]/`, `src/app/globals.css`, `messages/en.json` (namespace convention check)
**Files scanned:** `Header.tsx`, `Footer.tsx`, `Hero.tsx`, `AboutSection.tsx`, `ProductSection.tsx`, `IngredientsSection.tsx`, `ReviewsSection.tsx`, `FAQSection.tsx`, `BuySection.tsx`, `ProductPurchaseBox.tsx`, `ui/accordion.tsx`, `[locale]/page.tsx`, `[locale]/layout.tsx`
**Pattern extraction date:** 2026-07-16
