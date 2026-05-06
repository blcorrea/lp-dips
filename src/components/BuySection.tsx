import { getTranslations } from "next-intl/server";
import { getPurchasableDipsProduct } from "@/lib/shopify-product";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
import BuyImageGallery from "@/components/BuyImageGallery";
import TrackViewItem from "@/components/TrackViewItem";
import SocialMediaButtons from "@/components/SocialMediaButtons";
import {
  formatLocalizedPrice,
  getLocalizedPricing,
  getWeightLabel,
} from "@/lib/pricing";

type BuySectionProps = {
  locale: string;
};

export default async function BuySection({ locale }: BuySectionProps) {
  const t = await getTranslations({ locale, namespace: "BuySection" });
  const product = await getPurchasableDipsProduct();

  if (!product) return null;

  const localizedPricing = getLocalizedPricing(locale);
  const weightLabel = getWeightLabel(locale, 120);
  const formattedPrice = formatLocalizedPrice(
    locale,
    localizedPricing.price,
    localizedPricing.currency
  );

  const galleryImages = [
    {
      src: "/images/buy-main.png",
      alt: "Dips premium chocolate box",
    },
    {
      src: "/images/buy-open-box.png",
      alt: "Dips box partially opened",
    },
    {
      src: "/images/buy-detail.png",
      alt: "Close-up detail of Dips chocolate",
    },
  ];

  return (
    <section
      id="buy"
      className="bg-gradient-to-br from-brand-purple to-[#3b1c5a] py-20 lg:py-28 scroll-mt-28"
    >
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl rounded-[36px] bg-brand-cream p-6 sm:p-8 lg:p-12 shadow-[0_28px_90px_rgba(0,0,0,0.24)]">
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            {/* LEFT: gallery */}
            <div className="rounded-[30px] border border-white/30 bg-white/70 p-5 sm:p-6 lg:p-8 backdrop-blur-md shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
              <BuyImageGallery images={galleryImages} />
            </div>

            {/* RIGHT: copy + purchase */}
            <div className="pt-1">
              <p className="text-brand-orange text-[12px] sm:text-[13px] font-bold tracking-[0.18em] uppercase">
                {t("eyebrow")}
              </p>

              <h2 className="mt-3 font-heading text-brand-purple text-[38px] sm:text-[46px] lg:text-[62px] leading-[0.94] tracking-[-0.04em]">
                {t("title")}
              </h2>

              <p className="mt-4 text-brand-charcoal text-[17px] sm:text-[18px] lg:text-[20px] leading-[1.55] font-medium max-w-[560px]">
                {t("subtitle")}
              </p>

              <div className="mt-7 grid gap-3 text-brand-charcoal/85 text-[15px] sm:text-[16px] font-medium">
                <span>✓ {t("benefit1")}</span>
                <span>✓ {t("benefit2")}</span>
                <span>✓ {t("benefit3")}</span>
              </div>

              <div className="mt-8 rounded-[24px] border border-brand-purple/10 bg-white px-6 py-5 shadow-[0_10px_24px_rgba(86,17,110,0.06)]">
                <p className="text-brand-charcoal/55 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.12em]">
                  {t("startingAt")}
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-brand-purple text-[38px] sm:text-[44px] lg:text-[50px] font-bold tracking-tight leading-none">
                    {formattedPrice}
                  </span>
                  <span className="pb-1 text-brand-charcoal/60 text-[14px] sm:text-[15px] font-medium">
                    / {t("perBox")}
                  </span>
                </div>

                <p className="mt-2 text-brand-charcoal/60 text-[13px] sm:text-[14px] font-medium">
                  {weightLabel}
                </p>
              </div>

              <div className="mt-9">
                <ProductPurchaseBox
                  priceAmount={localizedPricing.price}
                  currencyCode={localizedPricing.currency}
                  buttonClassName="w-full min-w-0 sm:min-w-[240px]"
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

                <SocialMediaButtons className="mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}