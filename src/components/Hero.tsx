"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative w-full overflow-x-hidden bg-brand-cream">
      <div className="relative w-full h-[620px] sm:h-[580px] lg:h-[660px] overflow-hidden">
        <Image
          src="/images/fundo-hero-dips-edit.jpg"
          alt="Dips Chocolate Experience"
          fill
          priority
          className="object-cover object-[center_42%]"
        />

        <div className="absolute inset-0 bg-black/28" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/42 via-transparent to-black/42" />

        <div className="absolute inset-0 flex items-start justify-center px-4 sm:px-6 pt-6 sm:pt-8 lg:pt-10">
          <div className="w-full max-w-[980px] text-center flex flex-col items-center">
            {/* HEADLINE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="w-full"
            >
              {/* Mobile / tablet */}
              <h1 className="font-heading text-white text-[52px] sm:text-[64px] font-bold leading-[0.92] tracking-[-0.05em] drop-shadow-[0_4px_18px_rgba(0,0,0,0.18)] lg:hidden">
                {t("headlinePart1")}
                <br />
                {t("headlinePart2")}
                <br />
                {t("headlinePart3")}
              </h1>

              {/* Desktop */}
              <h1 className="hidden lg:block font-heading whitespace-nowrap text-white text-[72px] xl:text-[82px] font-bold leading-[0.95] tracking-[-0.04em] drop-shadow-[0_4px_18px_rgba(0,0,0,0.18)]">
                {t("headlinePart1")} {t("headlinePart2")} {t("headlinePart3")}
              </h1>
            </motion.div>

            {/* SUBTITLE */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-3"
            >
              <span className="font-body text-brand-orange text-[15px] sm:text-[20px] lg:text-[22px] italic font-semibold tracking-[-0.01em]">
                {t("subtitle")}
              </span>
            </motion.div>

            {/* HOOK */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.5 }}
              className="mt-[172px] sm:mt-[210px] lg:mt-[238px]"
            >
              <span className="font-heading text-brand-orange text-[28px] sm:text-[34px] lg:text-[46px] font-bold tracking-[-0.03em]">
                {t("sub")}
              </span>
            </motion.div>

            {/* SHORT DESCRIPTION */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.7 }}
              className="mt-4 max-w-[620px] px-2"
            >
              <p className="font-body text-white/95 text-[15px] sm:text-[16px] lg:text-[20px] font-semibold leading-[1.45] text-center">
                Crafted with natural aphrodisiac ingredients to awaken the senses.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.95 }}
              className="mt-7"
            >
              <Link
                href="/product/dips-chocolate"
                className="inline-flex items-center justify-center rounded-[20px] bg-brand-orange px-8 sm:px-8 py-3.5 sm:py-3.5 min-h-[56px] min-w-[210px] max-w-[280px] text-center font-body text-[15px] sm:text-[15px] font-bold text-brand-purple leading-[1.1] whitespace-nowrap shadow-[0_10px_24px_rgba(242,117,33,0.22)] transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90"
              >
                {t("cta")}
              </Link>
            </motion.div>

            {/* TRUST LINE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-4"
            >
              <p className="font-body text-white/80 text-[12px] sm:text-[13px] lg:text-[14px] font-medium tracking-[0.01em]">
                Natural ingredients · Secure checkout
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}