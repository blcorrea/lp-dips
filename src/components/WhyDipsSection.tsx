"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function WhyDipsSection() {
  const t = useTranslations("Hero");

  return (
    <section className="bg-brand-cream py-20 sm:py-24 lg:py-28">
      <div className="max-w-[760px] mx-auto px-6 text-center">

        {/* TITLE */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-brand-purple text-[30px] sm:text-[36px] lg:text-[42px] font-bold tracking-[-0.03em]"
        >
          Why Dips
        </motion.h2>

        {/* TEXT */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 font-body text-brand-charcoal text-[17px] sm:text-[18px] lg:text-[20px] leading-[1.6]"
        >
          {t("description")}
        </motion.p>

      </div>
    </section>
  );
}