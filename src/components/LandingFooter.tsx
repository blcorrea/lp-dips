"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function LandingFooter() {
  const t = useTranslations("LandingFooter");
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [submitted, setSubmitted] = useState(false);
  const currentYear = new Date().getFullYear();

  function handleNewsletterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend this phase (T-05: newsletter form is client-only, no new
    // network write) — this mirrors the confirmation-only behavior carried
    // forward from Footer.tsx's copy keys.
    setSubmitted(true);
  }

  const linkClass = "transition-colors duration-200 hover:text-brand-orange";

  return (
    <footer className="bg-dips-purple-deepest pt-16 pb-10">
      <div className="container mx-auto px-6">
        {/*
          Figma two-zone footer: brand + address + newsletter on the LEFT,
          the three link columns on the RIGHT, on the same row at lg+
          (05-VISUAL-GAPS.md GAP-19). Real links / email / address are kept
          per the documented override — Figma's help@dips.co, "Track Order",
          "Wholesale", "Accessibility" etc. are placeholder/nonexistent.
        */}
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {/* LEFT: logo + address + newsletter */}
          <div>
            <span className="relative inline-block h-[58px] w-[94px]">
              <Image
                src="/images/redesign/footer-logo-purple.svg"
                alt=""
                fill
                aria-hidden="true"
                className="object-contain"
              />
              <Image
                src="/images/redesign/footer-logo-orange.svg"
                alt="Dips"
                fill
                className="object-contain"
              />
            </span>

            <address className="mt-5 text-sm not-italic leading-relaxed text-dips-text-footer">
              <span className="font-semibold text-dips-text-lavender-muted">
                Dips Wellness Corporation
              </span>
              <br />
              8211 NW 64th Street Unit 4, Miami, FL 33166
            </address>

            <div className="mt-8 max-w-md">
              <h3 className="mb-2 text-[28px] font-bold text-dips-text-lavender">
                {t("neverSatisfied")}
              </h3>
              <p className="mb-4 text-sm text-dips-text-lavender-muted">
                {t("letYourNights")}
              </p>

              {submitted ? (
                <p className="text-sm text-dips-text-lavender">{t("successMsg")}</p>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex max-w-[520px] items-center gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder={t("yourEmail")}
                    className="h-[46px] min-w-0 flex-1 rounded-full border border-dips-text-lavender-muted/30 bg-transparent px-4 text-sm text-dips-text-lavender outline-none placeholder:text-dips-text-lavender-muted"
                  />

                  <button
                    type="submit"
                    className="h-[46px] w-[123px] shrink-0 rounded-full bg-brand-orange text-xs font-bold text-white transition hover:opacity-90"
                  >
                    {t("signUp")}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {/* ORDERS */}
            <div>
              <h3 className="mb-4 text-footer-fine font-bold uppercase text-dips-text-lavender">
                {t("ordersTitle")}
              </h3>

              <ul className="space-y-2 text-sm text-dips-text-footer">
                <li>
                  <Link href={`/${locale}/shipping-policy`} className={linkClass}>
                    {t("shippingInfo")}
                  </Link>
                </li>

                <li>
                  <Link href={`/${locale}/return-policy`} className={linkClass}>
                    {t("refunds")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h3 className="mb-4 text-footer-fine font-bold uppercase text-dips-text-lavender">
                {t("quickLinksTitle")}
              </h3>

              <ul className="space-y-2 text-sm text-dips-text-footer">
                <li>
                  <a href={`/${locale}#faq`} className={linkClass}>
                    FAQs
                  </a>
                </li>

                <li>
                  <a href={`/${locale}#ingredients`} className={linkClass}>
                    {t("ingredients")}
                  </a>
                </li>

                <li>
                  <Link
                    href={`/${locale}/product/dips-chocolate`}
                    className={linkClass}
                  >
                    {t("whereToBuy")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* CUSTOMER CARE / CONTACT */}
            <div id="footer-contact" className="scroll-mt-[72px]">
              <h3 className="mb-4 text-footer-fine font-bold uppercase text-dips-text-lavender">
                {t("contactUsTitle")}
              </h3>

              <ul className="space-y-2 text-sm text-dips-text-footer">
                <li>
                  <Link href={`/${locale}/privacy`} className={linkClass}>
                    {t("privacy")}
                  </Link>
                </li>

                <li>
                  <Link href={`/${locale}/terms`} className={linkClass}>
                    {t("terms")}
                  </Link>
                </li>

                <li>
                  <Link href={`/${locale}/affiliates/join`} className={linkClass}>
                    {t("affiliates")}
                  </Link>
                </li>

                <li className="pt-2">
                  <a href="mailto:info@dipschocolate.com" className={linkClass}>
                    info@dipschocolate.com
                  </a>
                </li>

                <li>
                  <a href="tel:7544576844" className={linkClass}>
                    754-457-6844
                  </a>
                </li>

                <li className="text-dips-text-footer-secondary">
                  {t("supportHours")}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* LEGAL TEXT — full-width strip */}
        <div className="mt-14 border-t border-white/10 pt-8 text-footer-fine text-dips-text-footer-fine">
          <p>© {currentYear} – Dips Chocolate. {t("rightsReserved")}</p>
          <p>{t("madeWith")}</p>
          <p>{t("productDesigned")}</p>
          <p className="mt-2">
            {t("registeredIn")} Florida · {t("ageRestriction")}
          </p>
        </div>
      </div>
    </footer>
  );
}
