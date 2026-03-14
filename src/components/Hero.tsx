"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative w-full overflow-hidden bg-brand-cream">
      <div className="relative w-full min-h-[560px] h-[78vh] max-h-[820px]">

        <Image
          src="/images/fundo-hero-dips-edit.jpg"
          alt="Dips Chocolate Experience"
          fill
          priority
          className="object-cover object-center"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.18)_100%)]" />

        <div className="absolute inset-0 flex items-center justify-center px-6 pt-14 pb-14">

          <div className="w-full max-w-5xl text-center flex flex-col items-center">

            {/* HEADLINE */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl xl:text-[74px] font-bold leading-[0.98] tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.18)]">
                {t("headlinePart1")}
                <br className="hidden sm:block" />
                {t("headlinePart2")}
                <br className="hidden sm:block" />
                {t("headlinePart3")}
              </h1>
            </motion.div>

            {/* SUBTITLE */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-4"
            >
              <span className="text-brand-orange/95 text-base sm:text-xl lg:text-2xl italic font-medium tracking-[0.02em]">
                {t("subtitle")}
              </span>
            </motion.div>

            {/* HIGHLIGHT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.55 }}
              className="mt-8 sm:mt-10 lg:mt-14"
            >
              <span className="text-brand-orange text-2xl sm:text-3xl lg:text-[38px] font-bold tracking-tight">
                {t("sub")}
              </span>
            </motion.div>

            {/* DESCRIPTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.75 }}
              className="mt-4 max-w-2xl"
            >
              <p className="text-white/92 text-sm sm:text-base lg:text-[17px] font-medium leading-[1.7] text-center">
                {t("description")}
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 1.0 }}
              className="mt-7 flex justify-center w-full px-3"
            >
              <Link
                href="/product/dips-chocolate"
                className="
                flex
                items-center
                justify-center
                text-center
                bg-brand-orange
                text-brand-purple
                font-bold
                text-sm sm:text-base lg:text-lg
                leading-tight
                px-6 sm:px-8
                py-3.5 sm:py-4
                rounded-2xl
                max-w-[300px]
                sm:max-w-[340px]
                w-full
                shadow-[0_10px_30px_rgba(242,117,33,0.28)]
                transition-all
                duration-300
                hover:scale-[1.02]
                hover:bg-brand-orange/90
                hover:shadow-[0_14px_34px_rgba(242,117,33,0.34)]
              "
              >
                <span className="whitespace-normal">
                  {t("cta")}
                </span>
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}