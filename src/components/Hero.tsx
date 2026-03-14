"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function Hero() {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const isLongLocale = locale === "pt" || locale === "es";

  return (
    <section className="relative w-full overflow-hidden bg-brand-cream">
      <div className="relative w-full h-[470px] sm:h-[560px] lg:h-[640px]">
        <Image
          src="/images/fundo-hero-dips-edit.jpg"
          alt="Dips Chocolate Experience"
          fill
          priority
          className="object-cover object-[center_42%]"
        />

        {/* overlays para aproximar o contraste do figma */}
        <div className="absolute inset-0 bg-black/28" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/42 via-transparent to-black/42" />

        <div className="absolute inset-0 flex items-start justify-center px-4 sm:px-6 pt-5 sm:pt-8 lg:pt-10">
          <div className="w-full max-w-[980px] text-center flex flex-col items-center">
            {/* HEADLINE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <h1 className="font-heading whitespace-nowrap text-white text-[42px] sm:text-[52px] lg:text-[72px] xl:text-[82px] font-bold leading-[0.95] tracking-[-0.04em] drop-shadow-[0_4px_18px_rgba(0,0,0,0.18)]">
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
              className="mt-[160px] sm:mt-[205px] lg:mt-[225px]"
            >
              <span className="font-heading text-brand-orange text-[24px] sm:text-[34px] lg:text-[46px] font-bold tracking-[-0.03em]">
                {t("sub")}
              </span>
            </motion.div>

            {/* DESCRIPTION */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.7 }}
              className={`mt-3 ${isLongLocale ? "max-w-[700px]" : "max-w-[640px]"}`}
            >
              <p className="font-body text-white/92 text-[10.5px] sm:text-[13px] lg:text-[15px] font-semibold leading-[1.42] text-center">
                {t("description")}
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.95 }}
              className="mt-5 sm:mt-6"
            >
              <Link
                href="/product/dips-chocolate"
                className="inline-flex items-center justify-center rounded-[20px] bg-brand-orange px-6 sm:px-8 py-3 sm:py-3.5 min-h-[54px] min-w-[165px] sm:min-w-[195px] max-w-[230px] sm:max-w-[280px] text-center font-body text-[12px] sm:text-[14px] font-bold text-brand-purple leading-[1.1] whitespace-normal shadow-[0_10px_24px_rgba(242,117,33,0.22)] transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90"
              >
                {t("cta")}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}