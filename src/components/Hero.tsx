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
      {/* Decorative blobs — Figma Dev-Mode percentages (Hero frame 1440×1054),
          applied as CSS percentages (not fixed px) so they scale correctly
          regardless of the section's actual rendered width, which is fluid
          here and was NOT exactly 1440px -- the earlier fixed-px version drifted
          more visibly on the larger blob because it sits closer to an edge and
          covers more area, so any width mismatch compounds. blob-vector-2.svg
          is the SMALL 193×308 vector (upper-left, rotate -167.8°); blob-vector-1
          .svg is the LARGE 341×511 vector (lower-right, rotate 53.34°). Both
          SVGs are preserveAspectRatio="none", so each gets its own wrapper box
          sized exactly by left/right/top/bottom (width/height auto-resolve),
          with `fill` + object-fill stretching the SVG to that box. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-3.73%] right-[90.29%] top-[11.52%] bottom-[59.26%] rotate-[-167.8deg]"
      >
        <Image src="/images/redesign/blob-vector-2.svg" alt="" fill className="object-fill" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[71.81%] right-[4.49%] top-[62.52%] bottom-[-11.01%] rotate-[53.34deg]"
      >
        <Image src="/images/redesign/blob-vector-1.svg" alt="" fill className="object-fill" />
      </div>

      {/*
        Desktop composition matches Figma's actual overlap: the product image
        is an absolutely-positioned overlay pinned to the right (not a 50/50
        grid column), so the text block gets nearly the full container width
        -- a real CSS grid-cols-2 split (previous RC-3 fix) made the text
        column too narrow, wrapping the H1 to 3 lines instead of Figma's 2.
        On mobile the image stays in normal flow, first (order-1), matching
        the Figma mobile frame (281:22); at lg+ it becomes `lg:absolute` and
        vertically centers against the text block's own height via
        inset-y-0 + my-auto (parent height is driven by the text column,
        the only lg+ in-flow child).
      */}
      <div className="container relative z-10 mx-auto px-6">
        <div className="relative flex flex-col items-center gap-10 text-center lg:block lg:text-left">
          {/* PRODUCT IMAGE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="relative order-1 mx-auto w-full max-w-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:order-none lg:my-auto lg:h-fit lg:w-[40%] lg:max-w-[580px]"
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

          {/* TEXT COLUMN */}
          <div className="order-2 flex flex-col items-center lg:order-none lg:w-[54%] lg:items-start">
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
