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
      {/* Decorative blobs */}
      <Image
        src="/images/redesign/blob-vector-1.svg"
        alt=""
        aria-hidden="true"
        width={420}
        height={420}
        className="pointer-events-none absolute -left-24 top-10 opacity-70"
      />
      <Image
        src="/images/redesign/blob-vector-2.svg"
        alt=""
        aria-hidden="true"
        width={380}
        height={380}
        className="pointer-events-none absolute -right-20 bottom-10 opacity-70"
      />

      {/*
        Two-column composition at lg+ (Figma 1440px: text left, product right).
        DOM order is [image, text] so the product image appears FIRST on mobile
        (matches the Figma mobile frame, 281:22), then lg:order-* flips the
        image to the right column / second position at desktop. Previously this
        was a single flex-col stack at every breakpoint with the image below
        the text (05-VISUAL-GAPS.md RC-3) -- that was wrong at ANY width, not
        just narrow viewports.
      */}
      <div className="container relative z-10 mx-auto grid grid-cols-1 items-center gap-10 px-6 text-center lg:grid-cols-2 lg:gap-16 lg:text-left">
        {/* PRODUCT IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="relative order-1 mx-auto w-full max-w-[420px] lg:order-2 lg:max-w-[822px]"
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
        <div className="order-2 flex flex-col items-center lg:order-1 lg:items-start">
          {/* HEADLINE (two-tone via next-intl rich text) */}
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
              <span key={key} className="text-trust-bar text-dips-text-lavender-muted">
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
              className="inline-flex h-[50px] items-center justify-center rounded-full border border-[#58477e] bg-transparent px-8 text-cta-button font-bold text-white transition-colors duration-200 hover:bg-white/5"
            >
              {t("ctaSecondary")}
            </a>
          </motion.div>
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
              <div className="h-full rounded-card border border-dips-card-tint-border bg-dips-card-tint p-card-padding text-white">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-[6px] w-[6px] shrink-0 rotate-[43deg] bg-brand-orange"
                  />
                  <span className="text-[15px] font-bold lg:text-base">
                    {t(feature.titleKey)}
                  </span>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-white/85 lg:text-[15px]">
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
