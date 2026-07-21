import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getPurchasableDipsProduct } from "@/lib/shopify-product";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
import TrackViewItem from "@/components/TrackViewItem";
import { getLocalizedPricing } from "@/lib/pricing";

type BuySectionProps = {
  locale: string;
};

/*
  BuySection — matched to the Figma frame (1440x699, two 717/723 panels,
  full-bleed, no rounded card/shadow wrapper): compra à esquerda (bg
  dips-cream = #FFF8F0), foto à direita (flat black/20 overlay, column
  justify-between: badge+title+subtitle pinned to the top-right, the 3
  benefit badges pinned to the bottom-right). Same structural pattern as
  Story/Ingredients (full-bleed 50/50, 40px-ish panel padding).

  Font sizes one step below the Figma spec (64->58, 16->14, 24->21),
  carrying over the Hero/Story/Ingredients approved treatment.
*/

function Diamond() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2 w-2 shrink-0 rotate-[43deg] bg-brand-orange"
    />
  );
}

export default async function BuySection({ locale }: BuySectionProps) {
  const t = await getTranslations({ locale, namespace: "BuySection" });
  const product = await getPurchasableDipsProduct();

  if (!product) return null;

  const localizedPricing = getLocalizedPricing(locale);
  const benefitKeys = ["benefit1", "benefit2", "benefit3"] as const;

  return (
    <section
      id="bundle"
      className="scroll-mt-[72px] bg-dips-cream"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-2">
        {/* LEFT: dips-cream panel — bundle cards only, per Figma (05-VISUAL-GAPS.md GAP-14) */}
        <div className="flex flex-col justify-center p-6 py-12 lg:p-10">
          <ProductPurchaseBox
            priceAmount={localizedPricing.price}
            currencyCode={localizedPricing.currency}
            buttonClassName="w-full"
            productId={product.productId}
            productName={product.title}
            locale={locale}
          />
          <TrackViewItem
            id={product.productId}
            name={product.title}
            price={localizedPricing.price}
            quantity={1}
            currency={localizedPricing.currency}
          />
        </div>

        {/* RIGHT: photo panel — justify-between column, content pinned right */}
        <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden p-6 lg:min-h-[699px] lg:p-10">
          <Image
            src="/images/redesign/experience-couple-photo.png"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Flat 20% black overlay (Figma: linear-gradient(0deg, rgba(0,0,0,.2), rgba(0,0,0,.2)) -- not the previous bottom-heavy fade */}
          <div className="absolute inset-0 bg-black/20" />

          {/* TOP GROUP — badge + title + subtitle, right-aligned */}
          <div className="relative z-10 flex flex-col items-end gap-4 text-right">
            <span className="inline-flex w-fit items-center gap-2 rounded-card border-2 border-dips-card-tint-2-border bg-dips-card-tint-2 px-[15px] py-3 text-[14px] font-bold text-[#eadae4]">
              <Diamond />
              {t("eyebrow")}
            </span>

            {/* Figma authors "Bring the" / "Experience home." as two separate
                text layers (manual editorial break) -- same <br/> rich-text
                approach as Hero/Story (en only; es/pt wrap naturally). */}
            <h3 className="font-heading text-[58px] font-bold leading-[1.2] text-white">
              {t.rich("title", { br: () => <br /> })}
            </h3>

            <p className="font-body text-[21px] italic leading-[1.4] text-dips-text-lavender">
              {t("subtitle")}
            </p>
          </div>

          {/* BOTTOM GROUP — 3 benefit badges */}
          <div className="relative z-10 flex flex-wrap items-center justify-end gap-3 lg:justify-between">
            {benefitKeys.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 rounded-card border-2 border-[rgba(146,122,210,0.25)] bg-dips-card-lavender px-[15px] py-3 font-card text-[13px] font-bold text-white"
              >
                <Diamond />
                {t(key)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
