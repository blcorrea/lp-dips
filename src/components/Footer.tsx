"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function Footer() {
  const t = useTranslations("Footer");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <footer className="bg-brand-cream pt-16 pb-12">
      <div className="container mx-auto px-6">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">

          {/* ORDERS */}
          <div>
            <h3 className="text-brand-purple text-xs font-bold uppercase mb-4">
              {t("ordersTitle")}
            </h3>

            <ul className="space-y-2 text-sm text-brand-charcoal">
              <li>
                <Link href={`/${locale}/orders`}>
                  {t("trackOrder")}
                </Link>
              </li>

              <li>
                <Link href={`/${locale}/shipping-policy`}>
                  {t("shippingInfo")}
                </Link>
              </li>

              <li>
                <Link href={`/${locale}/return-policy`}>
                  {t("refunds")}
                </Link>
              </li>
            </ul>
          </div>


          {/* QUICK LINKS */}
          <div>
            <h3 className="text-brand-purple text-xs font-bold uppercase mb-4">
              {t("quickLinksTitle")}
            </h3>

            <ul className="space-y-2 text-sm text-brand-charcoal">

              <li>
                <a href={`/${locale}#faq`}>
                  F.A.Q.
                </a>
              </li>

              <li>
                <a href={`/${locale}#ingredients`}>
                  {t("ingredients")}
                </a>
              </li>

              <li>
                <Link href={`/${locale}/product/dips-chocolate`}>
                  {t("whereToBuy")}
                </Link>
              </li>

              <li>
                <Link href={`/${locale}/privacy`}>
                  {t("privacy")}
                </Link>
              </li>

            </ul>
          </div>


          {/* CONTACT */}
          <div>
            <h3 className="text-brand-purple text-xs font-bold uppercase mb-4">
              {t("contactUsTitle")}
            </h3>

            <ul className="space-y-2 text-sm text-brand-charcoal">

              <li>
                <a href="mailto:info@dipschocolate.com">
                  info@dipschocolate.com
                </a>
              </li>

              <li>
                <a href="tel:7544576844">
                  754-457-6844
                </a>
              </li>

            </ul>
          </div>


          {/* NEWSLETTER */}
          <div>

            <h3 className="text-brand-purple text-xs font-bold uppercase mb-4">
              {t("cravingMore")}
            </h3>

            <p className="text-sm text-brand-charcoal mb-4 max-w-[250px]">
              {t("letYourNights")}
            </p>

            <form className="flex items-center gap-2">

              <input
                type="email"
                placeholder={t("yourEmail")}
                className="h-[40px] w-[180px] rounded-full border border-brand-purple/40 px-4 text-sm outline-none"
              />

              <button
                type="submit"
                className="h-[40px] px-5 rounded-full bg-brand-purple text-white text-xs font-bold whitespace-nowrap hover:bg-brand-purple/90 transition"
              >
                {t("signUp")}
              </button>

            </form>

          </div>

        </div>


        {/* LOGO */}
        <div className="flex justify-center mt-12 mb-4">

          <Image
            src="/images/logo-header-new.png"
            alt="Dips"
            width={90}
            height={40}
            className="h-10 w-auto"
          />

        </div>


        {/* LEGAL TEXT */}
        <div className="text-center text-xs text-brand-charcoal leading-relaxed max-w-xl mx-auto">

          <p>
            © 2025 – Dips Chocolate. {t("rightsReserved")}
          </p>

          <p>
            {t("madeWith")}
          </p>

          <p>
            {t("productDesigned")}
          </p>

          <div className="mt-3">

            <p className="font-semibold">
              Dips Wellness Corporation
            </p>

            <p>
              995 NW 165th Ave, Pembroke Pines, FL 33028
            </p>

            <p>
              EIN: 41-2647662 | {t("registeredIn")} Florida
            </p>

            <p>
              {t("ageRestriction")}
            </p>

          </div>

        </div>

      </div>
    </footer>
  );
}