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
      {/* Small blob -- position confirmed correct by the user. */}
      <Image
        src="/images/redesign/blob-vector-2.svg"
        alt=""
        aria-hidden="true"
        width={193}
        height={308}
        className="pointer-events-none absolute left-[-3.73%] top-[121px] rotate-[-167.8deg]"
      />

      {/* Large blob -- the user's annotated screenshot confirmed the ROUNDED
          BODY renders in the right place; the bug is the POINTED TAIL, which
          Figma never shows because its Hero frame is a FIXED 1054px-tall box
          that crops the shape via overflow-hidden at an exact point (the box
          is at top:659px, 511px tall, so only the top 395px of it -- 1054-659
          -- falls inside the frame; the rest is clipped). Our Hero section is
          fluid and much taller than 1054px, so the section's own
          overflow-hidden never reaches far enough up to crop this tail.
          Fix: give the blob its OWN fixed-size overflow-hidden clip window
          (395px tall, matching Figma's exact crop math) positioned/sized
          independently of the page's actual height below it, then rotate the
          image inside at the same relative position it would have in Figma.
          This reproduces the identical crop regardless of how tall our
          section grows. See 05-VISUAL-GAPS.md GAP-26 (3rd refinement). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[4.49%] top-[659px] h-[395px] w-[341px] overflow-hidden"
      >
        <Image
          src="/images/redesign/blob-vector-1.svg"
          alt=""
          width={341}
          height={511}
          className="absolute left-0 top-0 rotate-[53.34deg]"
        />
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
        rhythm: the product image starts at y:200 while the headline starts
        at y:384 (both measured from the Hero frame's own top) -- a 184px gap
        where only the blob + top of the product image are visible before any
        text appears. Also sized the image much closer to Figma's true
        57%-of-1440/822px reference (was shrunk to 34%/480px while I was still
        fighting the H1 wrap issue -- fixed separately now via max-width, so
        the image no longer needs to be small to make room). See
        05-VISUAL-GAPS.md GAP-28.
      */}
      <div className="container relative z-10 mx-auto px-6">
        <div className="relative flex flex-col items-center gap-10 text-center lg:block lg:text-left">
          {/* PRODUCT IMAGE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="relative order-1 mx-auto w-full max-w-[420px] lg:absolute lg:top-[60px] lg:right-[2%] lg:order-none lg:w-[52%] lg:max-w-[780px]"
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
              lg:mt-[180px] creates the "breathing room" gap described above
              -- text starts noticeably below the image instead of at the same
              height, matching Figma's own vertical offset between the two. */}
          <div className="order-2 flex flex-col items-center lg:order-none lg:mt-[180px] lg:max-w-[1040px] lg:items-start">
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
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <ScrollReveal
              key={feature.titleKey}
              direction="up"
              delay={0.1 + index * 0.1}
              duration={0.6}
            >
              {/* Feature card — Figma: bg rgba(49,34,89,.25), 2px #392A61 border,
                  15px radius, 25px padding; diamond 8px; title Satoshi 700 18px
                  white; desc Satoshi 400 18px #EBD9FE; 5px title→desc gap. */}
              <div className="flex h-full flex-col justify-center gap-[5px] rounded-card border-2 border-dips-card-tint-border bg-dips-card-tint p-card-padding">
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
