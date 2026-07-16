import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getPurchasableDipsProduct } from "@/lib/shopify-product";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
import TrackViewItem from "@/components/TrackViewItem";
import SocialMediaButtons from "@/components/SocialMediaButtons";
import { getLocalizedPricing } from "@/lib/pricing";

type BuySectionProps = {
  locale: string;
};

export default async function BuySection({ locale }: BuySectionProps) {
  const t = await getTranslations({ locale, namespace: "BuySection" });
  const product = await getPurchasableDipsProduct();

  if (!product) return null;

  const localizedPricing = getLocalizedPricing(locale);

  return (
    <section
      id="bundle"
      className="scroll-mt-[72px] bg-dips-purple-section py-20 lg:py-28"
    >
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] shadow-[0_28px_90px_rgba(0,0,0,0.24)]">
          <div className="grid lg:grid-cols-[1.2fr_1fr]">

            {/* LEFT: dips-cream panel — bundle cards */}
            <div className="bg-dips-cream p-6 sm:p-8 lg:p-12">
              <p className="text-brand-orange text-[12px] sm:text-[13px] font-bold tracking-[0.18em] uppercase">
                {t("eyebrow")}
              </p>

              <p className="mt-3 text-dips-text-purple-deep/80 text-[16px] sm:text-[17px] leading-[1.55] font-medium max-w-[520px]">
                {t("subtitle")}
              </p>

              <div className="mt-7">
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

                <SocialMediaButtons className="mt-6" compact />
              </div>
            </div>

            {/* RIGHT: photo panel — heading-side + mini badges */}
            <div className="relative min-h-[360px] lg:min-h-full">
              <Image
                src="/images/redesign/experience-couple-photo.png"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-end justify-end gap-6 p-8 text-right lg:p-12">
                <h3 className="font-heading text-heading-side text-white max-w-[420px]">
                  {t("title")}
                </h3>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full border border-dips-card-lavender-border bg-dips-card-lavender px-4 py-1.5 text-[12px] font-semibold text-white">
                    {t("benefit1")}
                  </span>
                  <span className="rounded-full border border-dips-card-lavender-border bg-dips-card-lavender px-4 py-1.5 text-[12px] font-semibold text-white">
                    {t("benefit2")}
                  </span>
                  <span className="rounded-full border border-dips-card-lavender-border bg-dips-card-lavender px-4 py-1.5 text-[12px] font-semibold text-white">
                    {t("benefit3")}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}