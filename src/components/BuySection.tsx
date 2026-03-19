import { getTranslations } from "next-intl/server";
import { getPurchasableDipsProduct } from "@/lib/shopify-product";
import ProductPurchaseBox from "@/components/ProductPurchaseBox";
import BuyImageGallery from "@/components/BuyImageGallery";

type BuySectionProps = {
  locale: string;
};

export default async function BuySection({ locale }: BuySectionProps) {
  const t = await getTranslations({ locale, namespace: "BuySection" });
  const product = await getPurchasableDipsProduct();

  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat(
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    {
      style: "currency",
      currency: product.currencyCode,
    }
  ).format(product.priceAmount);

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
    <section id="buy" className="bg-brand-purple py-20 lg:py-28 scroll-mt-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl rounded-[34px] bg-brand-cream p-6 sm:p-8 lg:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="grid items-start gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
            {/* LEFT: gallery */}
            <div className="rounded-[30px] border border-brand-purple/10 bg-white p-5 sm:p-6 lg:p-8 shadow-[0_14px_40px_rgba(86,17,110,0.06)]">
              <BuyImageGallery images={galleryImages} />
            </div>

            {/* RIGHT: copy + price + purchase */}
            <div className="pt-1">
              <p className="text-brand-orange text-[12px] sm:text-[13px] font-bold tracking-[0.18em] uppercase">
                {t("eyebrow")}
              </p>

              <h2 className="mt-3 font-heading text-brand-purple text-[36px] sm:text-[44px] lg:text-[58px] leading-[0.95] tracking-[-0.035em]">
                {t("title")}
              </h2>

              <p className="mt-4 text-brand-charcoal text-[17px] sm:text-[18px] lg:text-[20px] leading-[1.55] font-medium max-w-[560px]">
                {t("subtitle")}
              </p>

              <div className="mt-6 grid gap-2 text-brand-charcoal/85 text-[15px] sm:text-[16px] font-medium">
                <span>✓ {t("benefit1")}</span>
                <span>✓ {t("benefit2")}</span>
                <span>✓ {t("benefit3")}</span>
              </div>

              <div className="mt-8 rounded-[24px] border border-brand-purple/10 bg-white px-6 py-5 shadow-sm">
                <p className="text-brand-charcoal/55 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.12em]">
                  {t("startingAt")}
                </p>

                <div className="mt-2 flex items-end gap-3">
                  <span className="text-brand-purple text-[34px] sm:text-[40px] lg:text-[46px] font-bold tracking-tight leading-none">
                    {formattedPrice}
                  </span>
                  <span className="pb-1 text-brand-charcoal/65 text-[14px] sm:text-[15px] font-medium">
                    {t("perBox")}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <ProductPurchaseBox
                  priceAmount={product.priceAmount}
                  currencyCode={product.currencyCode}
                  buttonClassName="w-full sm:w-auto min-w-[240px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}