"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const TRUST_BAR_KEYS = [
  "trustBar1",
  "trustBar2",
  "trustBar3",
  "trustBar4",
  "trustBar5",
  "trustBar6",
] as const;

function TrustBarDiamond() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-[6px] w-[6px] shrink-0 rotate-[43deg] bg-brand-orange"
    />
  );
}

export default function LandingHeader() {
  const t = useTranslations("LandingHeader");
  const params = useParams();
  const locale = (params.locale as string) || "en";

  // TODO(Phase 6): mobile drawer for LandingHeader nav (RESP-01/02).
  // Toggle button is kept present so the component isn't architecturally
  // locked out of a mobile nav pattern later — no drawer is implemented yet.
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass =
    "text-nav-link text-dips-text-lavender-muted transition-colors duration-200 hover:text-brand-orange";

  return (
    <>
      {/* Trust bar — solid backdrop using --color-dips-purple-hero-start (#18012d),
          the EXACT color at the 0% stop of Hero's own gradient, not the darker
          dips-purple-deepest (#0a0519). LandingHeader renders as a sibling
          BEFORE <Hero> in page.tsx (not overlapping Hero's own gradient box),
          so "matching Figma's no-fill nav" literally (fully transparent) shows
          <main>'s bg-brand-cream through it instead -- a light "pearl" strip
          sandwiched between two dark bars. Using the Hero gradient's own start
          color here makes the boundary between header and Hero seamless (same
          color meets same color) while staying opaque/legible once scrolled
          past Hero into later sections. See 05-VISUAL-GAPS.md GAP-23/GAP-27. */}
      <div className="w-full bg-dips-purple-hero-start">
        {/* justify-between across full width (px-[25px] pad) matches the Figma
            Dev Mode dump exactly (Frame 10: justify-content:space-between,
            width:1390px, left:25px inside the 1440px bar) -- was justify-center
            with a fixed gap, which clustered the items instead of spreading them
            edge to edge. See 05-VISUAL-GAPS.md GAP-22. */}
        <div className="flex h-[45px] w-full items-center justify-between gap-4 bg-[rgba(45,26,105,0.4)] px-[25px]">
          {TRUST_BAR_KEYS.map((key) => (
            <span
              key={key}
              className="flex shrink-0 items-center gap-2 text-trust-bar text-dips-text-lavender-muted"
            >
              <TrustBarDiamond />
              {t(key)}
            </span>
          ))}
        </div>
      </div>

      {/* Nav — bg-dips-purple-hero-start (same reasoning as the trust bar above):
          Figma's nav "Frame 4" itself has no fill because it's drawn directly on
          top of the Hero gradient in the same design frame. Our header is a
          separate component sitting before Hero in the DOM, so true
          transparency exposed the page's cream background instead. Matching
          the gradient's exact start color reproduces the seamless look without
          that architecture mismatch. See 05-VISUAL-GAPS.md GAP-23/GAP-27. */}
      <header className="sticky top-0 z-50 w-full bg-dips-purple-hero-start">
        <div className="flex h-[72px] w-full items-center justify-between px-5 md:px-[40px]">
          {/* Logo — two SVG layers, each preserveAspectRatio="none" and sized/
              positioned to their OWN sub-region of the 59x36 logo box (per Figma
              Dev Mode: purple layer left:0 top:9.47% w:100% h:90.53%; orange layer
              left:32.87% top:0 w:36.4% h:93.31%). The previous `fill +
              object-contain` forced BOTH layers to fill the full 59x36 box
              independently, stretching the orange layer (native ratio ~21x34,
              portrait) into a landscape box -- the deformed logo. See
              05-VISUAL-GAPS.md GAP-24. */}
          <Link href={`/${locale}#hero`} className="flex flex-shrink-0 items-center gap-2">
            <span className="relative inline-block h-[36px] w-[59px]">
              <Image
                src="/images/redesign/logo-purple-part.svg"
                alt=""
                aria-hidden="true"
                width={59}
                height={33}
                className="absolute left-0 top-[3px]"
              />
              <Image
                src="/images/redesign/logo-orange-part.svg"
                alt="Dips"
                width={21}
                height={34}
                className="absolute left-[19px] top-0"
              />
            </span>
            <span className="text-nav-link text-dips-text-lavender-muted">
              {t("tagline")}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            <Link href={`/${locale}#hero`} className={navLinkClass}>
              {t("menu")}
            </Link>
            <Link href={`/${locale}#story`} className={navLinkClass}>
              {t("ourStory")}
            </Link>
            <Link href={`/${locale}#bundle`} className={navLinkClass}>
              {t("order")}
            </Link>
            <Link href={`/${locale}#footer-contact`} className={navLinkClass}>
              {t("contact")}
            </Link>
          </nav>

          {/* Shop Now CTA (desktop) */}
          <Link
            href={`/${locale}#bundle`}
            className="hidden h-[50px] items-center justify-center rounded-full bg-brand-orange px-6 text-cta-button text-white transition-opacity duration-200 hover:opacity-90 md:flex"
          >
            {t("shopNow")}
          </Link>

          {/* Mobile toggle (scaffold only, no drawer yet — see TODO above) */}
          <button
            className="flex text-dips-text-lavender-muted md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            type="button"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>
    </>
  );
}
