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

  function handleNewsletterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend this phase (T-05: newsletter form is client-only, no new
    // network write) — this mirrors the confirmation-only behavior carried
    // forward from Footer.tsx's copy keys.
    setSubmitted(true);
  }

  return (
    <footer className="bg-dips-purple-deepest pt-16 pb-12">
      <div className="container mx-auto px-6">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
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
        </div>

        {/* Newsletter */}
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h3 className="mb-2 text-[28px] font-bold text-dips-text-lavender">
            {t("neverSatisfied")}
          </h3>
          <p className="mx-auto mb-4 max-w-[420px] text-sm text-dips-text-lavender-muted">
            {t("letYourNights")}
          </p>

          {submitted ? (
            <p className="text-sm text-dips-text-lavender">{t("successMsg")}</p>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="mx-auto flex max-w-[520px] items-center gap-2"
            >
              <input
                type="email"
                required
                placeholder={t("yourEmail")}
                className="h-[46px] w-[362px] max-w-full rounded-full border border-dips-text-lavender-muted/30 bg-transparent px-4 text-sm text-dips-text-lavender outline-none placeholder:text-dips-text-lavender-muted"
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

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {/* ORDERS */}
          <div>
            <h3 className="mb-4 text-footer-fine font-bold uppercase text-dips-text-lavender">
              {t("ordersTitle")}
            </h3>

            <ul className="space-y-2 text-sm text-dips-text-footer">
              <li>
                <Link href={`/${locale}/shipping-policy`}>
                  {t("shippingInfo")}
                </Link>
              </li>

              <li>
                <Link href={`/${locale}/return-policy`}>{t("refunds")}</Link>
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
                <a href={`/${locale}#faq`}>F.A.Q.</a>
              </li>

              <li>
                <a href={`/${locale}#ingredients`}>{t("ingredients")}</a>
              </li>

              <li>
                <Link href={`/${locale}/product/dips-chocolate`}>
                  {t("whereToBuy")}
                </Link>
              </li>

              <li>
                <Link href={`/${locale}/privacy`}>{t("privacy")}</Link>
              </li>

              <li>
                <Link href={`/${locale}/terms`}>{t("terms")}</Link>
              </li>

              <li>
                <Link href={`/${locale}/affiliates/join`}>
                  {t("affiliates")}
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
                <a href="mailto:info@dipschocolate.com">
                  info@dipschocolate.com
                </a>
              </li>

              <li>
                <a href="tel:7544576844">754-457-6844</a>
              </li>

              <li className="text-dips-text-footer-secondary">
                {t("supportHours")}
              </li>
            </ul>
          </div>
        </div>

        {/* LEGAL TEXT */}
        <div className="mx-auto mt-12 max-w-xl text-center text-footer-fine text-dips-text-footer-fine">
          <p>© 2025 – Dips Chocolate. {t("rightsReserved")}</p>

          <p>{t("madeWith")}</p>

          <p>{t("productDesigned")}</p>

          <div className="mt-3">
            <p className="font-semibold">Dips Wellness Corporation</p>
            <p>8211 NW 64th Street Unit 4, Miami, FL 33166</p>
            <p>{t("registeredIn")} Florida</p>
            <p>{t("ageRestriction")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
