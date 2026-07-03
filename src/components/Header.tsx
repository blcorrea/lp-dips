"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import SocialMediaButtons from "@/components/SocialMediaButtons";

export default function Header() {
  const t = useTranslations("Header");
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [mobileOpen, setMobileOpen] = useState(false);

  const desktopNavLinkClass =
    "text-brand-purple font-semibold text-[14px] lg:text-[16px] tracking-[0.01em] hover:text-brand-orange transition-colors duration-200";

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-cream border-b border-brand-purple/8">
      <div className="container mx-auto px-5 sm:px-6 h-[64px] lg:h-[72px] flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/en" className="flex-shrink-0 flex items-center">
          <Image
            src="/images/logo-header-new.png"
            alt="Dips"
            width={165}
            height={55}
            className="h-10 lg:h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-auto">

          <nav className="flex items-center gap-6 lg:gap-8">
            <Link href={`/${locale}#about`} className={desktopNavLinkClass}>
              {t("about")}
            </Link>

            <Link href={`/${locale}#product`} className={desktopNavLinkClass}>
              {t("product")}
            </Link>

            <Link href={`/${locale}#ingredients`} className={desktopNavLinkClass}>
              {t("ingredients")}
            </Link>

            <Link href={`/${locale}#faq`} className={desktopNavLinkClass}>
              {t("faq")}
            </Link>

            <Link
              href={`/${locale}/product/dips-chocolate`}
              className={desktopNavLinkClass}
            >
              Shop
            </Link>
          </nav>

          {/* Language selector */}
          <div className="flex items-center gap-2 text-brand-purple font-semibold text-[14px] lg:text-[16px]">
            <Link href="/en" className="hover:text-brand-orange transition-colors">
              EN
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/es" className="hover:text-brand-orange transition-colors">
              ES
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/pt" className="hover:text-brand-orange transition-colors">
              PT
            </Link>
          </div>

          {/* Social media (desktop only, to avoid crowding at md breakpoint) */}
          <div className="hidden lg:flex items-center">
            <SocialMediaButtons compact />
          </div>
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-3">
          <button
            className="text-brand-purple"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            type="button"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-purple/8 px-5 py-5 space-y-4">
          <Link
            href={`/${locale}#about`}
            className="block text-brand-purple font-semibold text-base hover:text-brand-orange transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            {t("about")}
          </Link>

          <Link
            href={`/${locale}#product`}
            className="block text-brand-purple font-semibold text-base hover:text-brand-orange transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            {t("product")}
          </Link>

          <Link
            href={`/${locale}#ingredients`}
            className="block text-brand-purple font-semibold text-base hover:text-brand-orange transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            {t("ingredients")}
          </Link>

          <Link
            href={`/${locale}#faq`}
            className="block text-brand-purple font-semibold text-base hover:text-brand-orange transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            {t("faq")}
          </Link>

          <Link
            href={`/${locale}/product/dips-chocolate`}
            className="block text-brand-purple font-semibold text-base hover:text-brand-orange transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Shop
          </Link>

          <div className="flex items-center gap-3 pt-2 text-brand-purple font-semibold text-base border-t border-brand-purple/10">
            <Link href="/en" className="hover:text-brand-orange transition-colors">
              EN
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/es" className="hover:text-brand-orange transition-colors">
              ES
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/pt" className="hover:text-brand-orange transition-colors">
              PT
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}