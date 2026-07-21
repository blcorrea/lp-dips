"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

/*
  LandingFooter — matched to the Figma frame (1440x490, bg #0A0519 =
  dips-purple-deepest, already correct, padding 50px). Left column (569px,
  justify-between): logo+address on top, newsletter block at the bottom.
  Right zone (713px): row 1 = 3 link columns (Orders/Quick Links/Customer
  Care), row 2 = Contact Us block right-aligned under Customer Care. Legal
  strip at the bottom, no divider, 2 lines.

  Real links/email/address win over Figma's placeholders (help@dips.co,
  fake Miami address, Wholesale/Accessibility pages that don't exist) --
  see 05-VISUAL-GAPS.md GAP-40 for the full list of overrides.

  Font sizes one step below the Figma spec (28->25 newsletter title,
  22->20 column headings, 18->16 links/address/email, 14->13 placeholder/
  legal, 16->14 Sign Up), carrying over the treatment from every other
  section in this phase.
*/

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
    <footer className="bg-dips-purple-deepest">
      <div className="mx-auto max-w-[1440px] p-6 lg:p-[50px]">
        <div className="grid gap-12 lg:grid-cols-[569fr_713fr] lg:gap-16">
          {/* LEFT: logo + address (top) / newsletter (bottom), justify-between */}
          <div className="flex flex-col justify-between gap-10">
            <div>
              {/* Logo — same two-layer fix as the header (GAP-24): each SVG is
                  preserveAspectRatio="none" covering its OWN sub-region of the
                  logo box, not the whole thing. Scaled up from the header's
                  59x36 reference to the footer's 94x58 (~1.6x). */}
              <span className="relative inline-block h-[58px] w-[94px]">
                <Image
                  src="/images/redesign/logo-purple-part.svg"
                  alt=""
                  aria-hidden="true"
                  width={94}
                  height={53}
                  className="absolute left-0 top-[5px]"
                />
                <Image
                  src="/images/redesign/logo-orange-part.svg"
                  alt="Dips"
                  width={34}
                  height={54}
                  className="absolute left-[31px] top-0"
                />
              </span>

              <address className="mt-[25px] text-[16px] italic leading-[1.2] text-dips-text-footer">
                Dips Wellness Corporation | 8211 NW 64th Street Unit 4 | Miami, FL 33166
              </address>
            </div>

            <div className="max-w-md">
              <h3 className="text-[25px] font-bold leading-[1.2] text-white font-heading">
                {t("neverSatisfied")}
              </h3>
              <p className="mt-[2px] mb-4 text-[16px] italic leading-[1.2] text-dips-text-footer">
                {t("letYourNights")}
              </p>

              {submitted ? (
                <p className="text-[16px] text-dips-text-lavender">{t("successMsg")}</p>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex max-w-[495px] items-center gap-[10px]"
                >
                  <input
                    type="email"
                    required
                    placeholder={t("yourEmail")}
                    className="h-[46px] min-w-0 flex-1 rounded-full border border-[#322e3f] bg-[#1b1728] px-5 text-[13px] text-white outline-none placeholder:text-dips-text-footer-tertiary"
                  />

                  <button
                    type="submit"
                    className="h-[46px] w-[123px] shrink-0 rounded-full bg-brand-orange font-heading text-[14px] font-bold text-white transition hover:opacity-90"
                  >
                    {t("signUp")}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: link columns (row 1) + Contact Us (row 2, right-aligned) */}
          <div className="flex flex-col items-end gap-[50px]">
            <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-3">
              {/* ORDERS */}
              <div>
                <h3 className="mb-[10px] text-[20px] font-bold text-white font-heading">
                  {t("ordersTitle")}
                </h3>

                <ul className="space-y-[5px] text-[16px] text-dips-text-footer-secondary">
                  <li>
                    <Link href={`/${locale}/orders`} className={linkClass}>
                      {t("trackOrder")}
                    </Link>
                  </li>

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

                  <li>
                    <a href="mailto:info@dipschocolate.com" className={linkClass}>
                      {t("emailUs")}
                    </a>
                  </li>
                </ul>
              </div>

              {/* QUICK LINKS */}
              <div>
                <h3 className="mb-[10px] text-[20px] font-bold text-white font-heading">
                  {t("quickLinksTitle")}
                </h3>

                <ul className="space-y-[5px] text-[16px] text-dips-text-footer-secondary">
                  <li>
                    <a href={`/${locale}#faq`} className={linkClass}>
                      {t("faqs")}
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

              {/* CUSTOMER CARE */}
              <div>
                <h3 className="mb-[10px] text-[20px] font-bold text-white font-heading">
                  {t("customerCareTitle")}
                </h3>

                <ul className="space-y-[5px] text-[16px] text-dips-text-footer-secondary">
                  <li>
                    <Link href={`/${locale}/terms`} className={linkClass}>
                      {t("terms")}
                    </Link>
                  </li>

                  <li>
                    <Link href={`/${locale}/privacy`} className={linkClass}>
                      {t("privacy")}
                    </Link>
                  </li>

                  <li>
                    <Link href={`/${locale}/affiliates/join`} className={linkClass}>
                      {t("affiliates")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* CONTACT US — right-aligned, under Customer Care. Nav anchor
                (#footer-contact) lives here now, not on Customer Care. */}
            <div id="footer-contact" className="scroll-mt-[72px] text-right">
              <h3 className="mb-[10px] text-[20px] font-bold text-white font-heading">
                {t("contactUsTitle")}
              </h3>

              <a
                href="mailto:info@dipschocolate.com"
                className="text-[16px] italic text-brand-orange underline"
              >
                info@dipschocolate.com
              </a>
            </div>
          </div>
        </div>

        {/* LEGAL TEXT — full-width strip, no divider (Figma) */}
        <div className="mt-14 text-[13px] italic leading-[1.2] text-dips-text-footer-fine">
          <p>© {currentYear} – Dips Chocolate. {t("rightsReserved")}</p>
          <p>{t("fdaDisclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
