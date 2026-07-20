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

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section
      id="hero"
      className="relative w-full scroll-mt-[72px] overflow-hidden bg-gradient-to-b from-dips-purple-hero-start from-0% via-dips-purple-hero-mid via-[57.4%] to-dips-purple-hero-end to-100% pb-16 pt-14 sm:pt-16 lg:pt-20"
    >
      {/* Both blobs' Figma coordinates are measured from the top of the FULL
          1054px Hero frame, which in Figma's own composition starts at the
          NAV, not at the gradient -- nav (72px) + trust bar (45px) = 117px
          sit inside that same frame, on top of the gradient. Our LandingHeader
          renders as a separate component BEFORE this section, so this
          section's own top already corresponds to Figma-frame-y:117, not
          y:0. Every top offset pulled from the frame dump must subtract that
          117px, or everything renders 117px lower (and proportionally
          farther from the nav) than intended. See 05-VISUAL-GAPS.md GAP-29. */}
      <Image
        src="/images/redesign/blob-vector-2.svg"
        alt=""
        aria-hidden="true"
        width={193}
        height={308}
        className="pointer-events-none absolute left-[-3.73%] top-[4px] rotate-[-167.8deg]"
      />

      {/* Large blob -- the previous clip-window (341x395, matching the
          UNROTATED box) was the wrong shape: rotating a 341x511 box by
          53.34deg produces a rotated bounding box of ~614x579 (a rotated
          rectangle's bounding box is always bigger than the rectangle
          itself), and that ROTATED silhouette is what Figma's 1440x1054
          frame actually clips -- on BOTH the bottom AND the right edge, not
          just the bottom. The old window was clipping the rotated shape
          along the wrong lines entirely, producing the kite/arrow artifact.

          Recomputed from the exact box CSS (left:71.81% right:4.49%
          top:62.52% bottom:-11.01% of a 1440x1054 frame -> box at
          x:[1034,1375] y:[659,1170], center 1204.7/914.6) rotated 53.34deg
          around its own center: rotated corners span x:[897.9,1511.5]
          y:[625.2,1203.9]. Intersecting that with the frame's own
          0..1440/0..1054 clip rectangle gives the actually-visible slice:
          x:[897.9,1440] y:[625.2,1054] -- i.e. flush with the frame's right
          edge, 542x429px, top-left coinciding exactly with the rotated
          bounding box's own top-left (only the bottom/right get cut, not
          top/left). frame-y:625.2 nav-corrected (-117, see comment above)
          -> 508px.

          Implementation: an outer clip window sized to that visible slice
          (542x429, right:0/top:508px so it's flush with the section's own
          right edge), containing an INNER unclipped div sized to the FULL
          rotated bounding box (614x579, same top-left as the window, so no
          extra offset needed), with the actual 341x511 box centered inside
          it (left:136px top:34px = (614-341)/2, (579-511)/2) and rotated in
          place -- reproducing Figma's rotate-then-clip pipeline exactly
          instead of guessing a clip shape. See 05-VISUAL-GAPS.md GAP-29
          (2nd refinement). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[508px] h-[429px] w-[542px] overflow-hidden"
      >
        <div className="relative h-[579px] w-[614px]">
          <Image
            src="/images/redesign/blob-vector-1.svg"
            alt=""
            width={341}
            height={511}
            className="absolute left-[136px] top-[34px] rotate-[53.34deg]"
          />
        </div>
      </div>

      {/*
        Desktop composition matches Figma's actual overlap: the product image
        is an absolutely-positioned overlay pinned to the right (not a 50/50
        grid column), so the text block gets nearly the full container width
        -- a real CSS grid-cols-2 split (previous RC-3 fix) made the text
        column too narrow, wrapping the H1 to 3 lines instead of Figma's 2.
        On mobile the image stays in normal flow, first (order-1), matching
        the Figma mobile frame (281:22).

        At lg+, the image is pinned near the TOP (not vertically centered
        against the text -- that was a placeholder approximation) and the
        text column gets a top margin, reproducing Figma's actual vertical
        rhythm: the product image starts at frame-y:200 while the headline
        starts at frame-y:384 -- both nav-offset corrected (-117px, see the
        blob comment above) to y:83 and y:267 relative to this section's own
        top -- an 184px gap where only the blob + top of the product image
        are visible before any text appears. Exact box CSS (width:821.74px,
        left:585.63px in a 1440-wide frame) gives width:57.06% / right:2.27%
        -- the previous 52%/780px/2% figures were an earlier eyeballed
        approximation from before the individual-layer CSS was available,
        noticeably smaller than the real 57%/822px. The image no longer
        needs to be small to make room for the H1 (that's handled separately
        via max-width on the text column). The image's own fade-in delay was
        0.85s (vs. 0.15s for the
        H1) -- long enough that the image was still invisible while every
        text element had already appeared, reading as "the box never shows up
        beside the H1". Dropped to 0.1s so it appears first, alongside/before
        the text. See 05-VISUAL-GAPS.md GAP-28/GAP-29.
      */}
      <div className="container relative z-10 mx-auto px-6">
        <div className="relative flex flex-col items-center gap-10 text-center lg:block lg:text-left">
          {/* PRODUCT IMAGE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative order-1 mx-auto w-full max-w-[420px] lg:absolute lg:top-[84px] lg:right-[2.27%] lg:order-none lg:w-[57.06%] lg:max-w-[822px]"
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

          {/* TEXT COLUMN — max-w-[1040px] (not a % split) because "that changes
              the night." at the 64px AllRoundGothic Bold display size needs
              roughly 750-850px on its own to fit on one line; a percentage
              split (54%) still left it too narrow at typical desktop widths,
              wrapping to a 2nd sub-line (3 lines total instead of Figma's 2).
              Matches Figma's own headline box width (1062px) closely. The
              lg:mt-[187px] (267 target - 80px section padding-top) creates
              the "breathing room" gap described above -- text starts
              noticeably below the image instead of at the same height,
              matching Figma's own vertical offset between the two. */}
          <div className="order-2 flex flex-col items-center lg:order-none lg:mt-[187px] lg:max-w-[1040px] lg:items-start">
            {/* HEADLINE (two-tone via next-intl rich text). Figma authors "The
                Chocolate" and "that changes the night." as two separately
                positioned text layers (a manual editorial line break, not
                organic width-driven wrap) -- forcing the same <br/> here
                guarantees the Figma-exact 2-line split at desktop width
                regardless of exact column width, while leaving mobile
                unaffected (it already wraps to the same first line
                naturally at 375px, confirmed by the Figma mobile frame). */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="max-w-xl lg:max-w-none"
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
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-4"
          >
            <p className="font-body text-subtitle-italic-lg italic text-dips-text-lavender">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* SOCIAL PROOF BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-dips-card-tint-2-border bg-dips-card-tint-2 px-5 py-2.5">
              <HeroStars />
              <span className="text-card-body font-medium text-dips-text-lavender">
                {t("socialProof")}
              </span>
            </div>
          </motion.div>

          {/* MINI TRUST ITEMS */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start"
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
            transition={{ duration: 0.65, delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <a
              href="#bundle"
              className="inline-flex h-[50px] items-center justify-center rounded-full bg-brand-orange px-8 text-cta-button font-bold text-white transition-opacity duration-200 hover:opacity-90"
            >
              {t("ctaPrimary")}
            </a>
            <a
              href="#ingredients"
              className="inline-flex h-[50px] items-center justify-center rounded-full border border-[#58477e] bg-dips-card-tint px-8 text-cta-button font-bold text-white transition-colors duration-200 hover:bg-white/5"
            >
              {t("ctaSecondary")}
            </a>
          </motion.div>
          </div>
        </div>
      </div>

      {/* FEATURE CARDS (own Hero.feature1..4_title/_desc copy, matching the Figma
          diamond+title / description card format -- see 05-VISUAL-GAPS.md GAP-05) */}
      <div className="container relative z-10 mx-auto mt-12 px-6 lg:mt-16">
        <div className="mx-auto grid max-w-7xl gap-[25px] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <ScrollReveal
              key={feature.titleKey}
              direction="up"
              delay={0.1 + index * 0.1}
              duration={0.6}
            >
              {/* Feature card — the full nested section dump settles the
                  structure (an isolated-layer dump had misled me into a
                  diamond-beside-the-whole-block layout). The card (Frame 8,
                  301x127, padding 25, bg rgba(49,34,89,.25), 2px #392A61,
                  radius 15) wraps a SINGLE text stack (Frame 5, 251px). Inside
                  that stack: a title row (Frame 10, flex-row gap:8px) holding
                  [diamond 8px][title], sitting ABOVE the description (251px,
                  full width, 2 lines) with a 5px gap. So the diamond is beside
                  the TITLE only, and the description spans the full card width
                  below it -- NOT the diamond beside the entire title+desc
                  block. Diamond #F16B16 8px rotate43; title Satoshi 700 18/24
                  #FFF; desc Satoshi 400 18/24 #EBD9FE. min-h (not hard h) so
                  longer es/pt copy doesn't clip. See 05-VISUAL-GAPS.md GAP-29
                  (3rd refinement). */}
              <div className="flex min-h-[127px] flex-col justify-center gap-[5px] rounded-card border-2 border-dips-card-tint-border bg-dips-card-tint p-card-padding">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 shrink-0 rotate-[43deg] bg-brand-orange"
                  />
                  <span className="font-card text-[18px] font-bold leading-6 text-white">
                    {t(feature.titleKey)}
                  </span>
                </div>
                <p className="font-card text-[18px] font-normal leading-6 text-dips-text-lavender">
                  {t(feature.descKey)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
