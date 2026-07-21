"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import ScrollReveal from "./animations/ScrollReveal";

// ── Social-proof stars (visual reference: ReviewsSection.tsx `Stars`) ────────

function HeroStars() {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-3.5 w-3.5 text-brand-orange"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Feature cards (own copy, Hero namespace -- Figma has dedicated title+desc
//    per card, distinct from the old ProductSection.tsx / Product namespace copy) ─

const FEATURES = [
  { titleKey: "feature1_title", descKey: "feature1_desc" },
  { titleKey: "feature2_title", descKey: "feature2_desc" },
  { titleKey: "feature3_title", descKey: "feature3_desc" },
  { titleKey: "feature4_title", descKey: "feature4_desc" },
] as const;

const TRUST_KEYS = ["trust1", "trust2", "trust3"] as const;

/*
  Hero — the desktop (lg+) layout is a FAITHFUL reproduction of Figma's fixed
  1440x1054 frame, not a fluid approximation. Every earlier round failed
  because the design is an absolutely-positioned pixel frame and we kept trying
  to re-derive it as flowing/percentage layout, which drifts as the viewport
  widens past 1440.

  How the two coordinate systems line up:
  - Figma's frame is 1440 wide x 1054 tall and INCLUDES the nav (top:67, h:72)
    and trust bar (top:0, h:45) drawn on top of the gradient.
  - In our app those two live in <LandingHeader>, a sibling rendered BEFORE
    this <section>. LandingHeader is 45 + 72 = 117px tall, so this section's
    own top corresponds to Figma frame-y:117.
  - Therefore the desktop canvas is 1054 - 117 = 937px tall, and any element's
    canvas-y = its Figma frame-y minus 117. (small blob 121->4, image
    200->84, text block 384->267, large blob 659->542, cards 860->743.)

  The canvas is capped at max-w-[1440px] and centered so it renders 1:1 with
  the design; on viewports wider than 1440 the extra width is plain gradient
  gutter instead of stretched/drifted content. Below lg the whole thing
  collapses to a normal fluid stack (image, then text, then cards, in flow).
*/

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section
      id="hero"
      className="relative w-full scroll-mt-[72px] overflow-hidden bg-gradient-to-b from-dips-purple-hero-start from-0% via-dips-purple-hero-mid via-[57.4%] to-dips-purple-hero-end to-100% pb-16 pt-10 sm:pt-12 lg:p-0"
    >
      {/* Small blob -- top-left, bleeds off the left edge. Its rotation
          (-167.8deg, almost a half-turn) barely tilts its bounding box, and
          it's clipped on the LEFT edge, which our page shares with Figma
          (equal widths) -- so simple viewport-relative absolute positioning +
          the section's overflow-hidden reproduces it for free. Confirmed
          correct by the user; kept full-bleed (section-relative). */}
      <Image
        src="/images/redesign/blob-vector-2.svg"
        alt=""
        aria-hidden="true"
        width={193}
        height={308}
        className="pointer-events-none absolute left-[-3.73%] top-[4px] z-0 rotate-[-167.8deg]"
      />

      {/* 1440 canvas (see file header). Fluid stack below lg; fixed 937px
          absolute canvas at lg+. */}
      <div className="relative mx-auto w-full max-w-[1440px] px-6 lg:h-[937px] lg:px-0">
        {/* Large blob -- SAME clip idea as the small blob, but it lives INSIDE
            this canvas (not the section) so its right edge stays aligned with
            the cards' right edge at any width, since the cards share the
            canvas. Figma clips it with the fixed 1054px frame on the
            bottom/right; we recreate that frame as a full-canvas-width band
            ending at the frame bottom (canvas-y 937), with the blob near its
            Figma box (top 659-117=542; rotate 53.34deg). The browser then
            trims the rotated shape along the band's straight right/bottom
            edges exactly the way Figma's frame does. Desktop only.

            right: Figma-exact was 4.49% (~65px); the user then asked (with a
            marked screenshot) for the right-side cut to land ~150px further
            into the shape, i.e. the vector pushed ~150px rightward past the
            clip edge -- hence right:-90px (65-155). See 05-VISUAL-GAPS.md
            GAP-30 + user-requested refinement. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[937px] overflow-hidden lg:block">
          <Image
            src="/images/redesign/blob-vector-1.svg"
            alt=""
            aria-hidden="true"
            width={341}
            height={511}
            className="absolute right-[-90px] top-[542px] rotate-[53.34deg]"
          />
        </div>

        {/* PRODUCT IMAGE -- Figma 821.74x547.83 at left:585.63 top:200.77 in the
            1440 frame => right 2.27%, width 57.07%, canvas-y 84. It overlaps the
            end of the headline on purpose (text is z-10 above, image z-[5]
            below), matching Figma where "night." sits in front of the podium.
            Mobile: normal flow, first, centered. Fade-in leads the text (delay
            0.1s) so the box is present from the start beside the H1.

            Sized down slightly from the Figma-exact 57.07%/822px to
            52%/750px per user request. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-[5] mx-auto mt-4 w-full max-w-[420px] lg:absolute lg:right-[2.27%] lg:top-[84px] lg:mt-0 lg:w-[52%] lg:max-w-[750px]"
        >
          <Image
            src="/images/redesign/hero-product.png"
            alt="Dips Chocolate"
            width={822}
            height={548}
            priority
            className="w-full rotate-[-0.85deg] object-contain"
          />
        </motion.div>

        {/* TEXT BLOCK -- Figma order (top to bottom): badge, headline, subtitle,
            [gap], trust items, CTAs. Figma frame left:78 top:384 => canvas
            left:78 top:267; width up to 1062. Mobile: normal flow, centered. */}
        <div className="relative z-10 mt-8 flex flex-col items-center text-center lg:absolute lg:left-[78px] lg:top-[267px] lg:mt-0 lg:max-w-[1062px] lg:items-start lg:text-left">
          {/* SOCIAL PROOF BADGE -- Figma places this ABOVE the headline (first
              child of the text block), not after the subtitle. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-dips-card-tint-2-border bg-dips-card-tint-2 px-5 py-2.5">
              <HeroStars />
              {/* font-medium (500) -> font-normal (400): thinner, same
                  treatment as the card description -- FilsonPro Regular is
                  the lightest weight we have self-hosted for this family. */}
              {/* text-[13px], not the shared text-card-body (14px) token --
                  overridden locally so StorySection's own badge (same token)
                  isn't affected. */}
              <span className="text-[13px] font-normal leading-[1.5] text-dips-text-lavender">
                {t("socialProof")}
              </span>
            </div>
          </motion.div>

          {/* HEADLINE (two-tone via next-intl rich text). Figma authors "The
              Chocolate" and "that changes the night." as two separate text
              layers -- a manual editorial break -- so we force the same <br/>
              (en only; es/pt wrap naturally). */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 max-w-xl lg:max-w-none"
          >
            <h1 className="font-heading text-display-hero font-bold leading-[1.05] text-white">
              {t.rich("h1", {
                hl: (chunks) => (
                  <span className="text-dips-text-headline-lilac">{chunks}</span>
                ),
                br: () => <br />,
              })}
            </h1>
          </motion.div>

          {/* SUBTITLE */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-4"
          >
            {/* text-[21px], not the shared text-subtitle-italic-lg (24px)
                token -- overridden locally so StorySection's own subtitle
                (same token) isn't affected. */}
            <p className="font-body text-[21px] italic leading-[1.4] text-dips-text-lavender">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* MINI TRUST ITEMS (Figma: a 50px gap separates these + the CTAs from
              the headline group -- hence the larger mt here). */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start"
          >
            {TRUST_KEYS.map((key) => (
              <span
                key={key}
                className="flex items-center gap-2 text-trust-bar text-dips-text-lavender-muted"
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-[6px] w-[6px] shrink-0 rotate-[43deg] bg-brand-orange"
                />
                {t(key)}
              </span>
            ))}
          </motion.div>

          {/* DUAL CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.55 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            {/* font-cta (DM Sans) was missing on both buttons -- they were
                silently inheriting the body's FilsonPro instead of the
                Figma-specified DM Sans. font-semibold (600), not the spec's
                700: same "thinner" treatment as the card description, per
                user request, using DM Sans's own lighter weight (Google Font,
                no extra file needed) instead of the Bold cut. */}
            {/* Buy Now only (not How It Works?, not the header's Shop Now):
                h-[44px] + explicit text-[14px], smaller than the shared
                text-cta-button (16px)/h-[50px] used elsewhere, per user
                request scoped specifically to this button. */}
            <a
              href="#bundle"
              className="inline-flex h-[44px] items-center justify-center rounded-full bg-brand-orange px-7 text-[14px] font-cta font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              {t("ctaPrimary")}
            </a>
            <a
              href="#ingredients"
              className="inline-flex h-[50px] items-center justify-center rounded-full border border-[#58477e] bg-dips-card-tint px-8 text-cta-button font-cta font-semibold text-white transition-colors duration-200 hover:bg-white/5"
            >
              {t("ctaSecondary")}
            </a>
          </motion.div>
        </div>

        {/* FEATURE CARDS -- Figma row at frame top:860 => canvas top:743, spanning
            left:78 to right:78. Sharing the canvas with the large blob is what
            keeps the blob tucked behind the 4th card. Mobile: normal flow below
            the text. */}
        <div className="relative z-10 mt-16 lg:absolute lg:inset-x-[78px] lg:top-[743px] lg:mt-0">
          {/* gap-[15px], not the spec's 25px -- user asked to widen the cards
              slightly so the 2-word-longer descriptions ("Crafted to deepen
              connection and shared pleasure", 258px needed) fit Figma's 2
              lines instead of 3. Narrowing the gap between cards gives each
              one more width without touching the section's own side insets
              or the card's internal padding. See 05-VISUAL-GAPS.md GAP-34
              (4th refinement). */}
          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <ScrollReveal
                key={feature.titleKey}
                direction="up"
                delay={0.1 + index * 0.1}
                duration={0.6}
                className="h-full"
              >
                {/* Card (Frame 8, 301x127, padding 25, bg rgba(49,34,89,.25),
                    2px #392A61, radius 15) wraps a single text stack: a title
                    row (diamond 8px + title, 8px gap) ABOVE the description
                    (full width, 2 lines in Figma's own render), 5px gap.
                    Diamond beside the TITLE only.

                    h-full (not a fixed px height) -- user clarified "never
                    different heights from each other" means relative equality
                    achieved dynamically (every card inherits whichever card's
                    content is tallest), not a hardcoded magic number that
                    leaves excess empty space on shorter cards. CSS Grid's
                    default align-items:stretch already does exactly this for
                    items sharing a row: the ScrollReveal wrapper (a direct
                    grid item, no height of its own) stretches to the row's
                    tallest member automatically, and h-full here makes the
                    card fill that stretched height. At lg:grid-cols-4 all 4
                    cards share one row, so this holds regardless of which
                    card's own translation wraps to 2 vs 3 lines. (At
                    sm:grid-cols-2 the 4 split into two independent rows that
                    only stretch within their own pair -- true cross-row
                    equality at that breakpoint would need JS measurement;
                    mobile/tablet fidelity is explicitly Phase 6 scope, see
                    RESP-01/02.) justify-start keeps every title pinned to the
                    same y regardless of how tall the stretched card ends up.
                    See 05-VISUAL-GAPS.md GAP-34 (5th refinement). */}
                <div className="flex h-full flex-col justify-start gap-[5px] rounded-card border-2 border-dips-card-tint-border bg-dips-card-tint p-card-padding">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 shrink-0 rotate-[43deg] bg-brand-orange"
                    />
                    <span className="font-card text-[16px] font-bold leading-6 text-white">
                      {t(feature.titleKey)}
                    </span>
                  </div>
                  {/* 16px (not the spec's 18px) + Satoshi Light (300, not the
                      spec's 400) -- user preference: size/weight down over
                      tracking-tight, which read as cramped. Confirmed via a
                      Figma screenshot that Figma's own text engine wraps this
                      exact string more compactly than any browser does at
                      18px/400 Satoshi, even at an identical box width, so the
                      declared spec values reliably wrap to 3 lines instead of
                      Figma's 2. See 05-VISUAL-GAPS.md GAP-34. */}
                  <p className="font-card text-[16px] font-light leading-6 text-dips-text-lavender">
                    {t(feature.descKey)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
