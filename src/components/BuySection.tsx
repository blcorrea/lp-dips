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
        <div className="mx-auto max-w-6xl rounded-[32px] bg-brand-cream p-6 sm:p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="grid items-start gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
            {/* Gallery */}
            <div className="rounded-[28px] border border-brand-purple/10 bg-white p-5 sm:p-6 lg:p-8 shadow-sm">
              <BuyImageGallery images={galleryImages} />
            </div>

            {/* Copy + Purchase */}
            <div className="pt-1">
              <p className="text-brand-orange text-[12px] sm:text-[13px] font-bold tracking-[0.18em] uppercase">
                {t("eyebrow")}
              </p>

              <h2 className="mt-3 font-heading text-brand-purple text-[34px] sm:text-[42px] lg:text-[54px] leading-[0.95] tracking-[-0.03em]">
                {t("title")}
              </h2>

              <p className="mt-4 text-brand-charcoal text-[16px] sm:text-[17px] lg:text-[19px] leading-[1.55] font-medium max-w-[560px]">
                {t("subtitle")}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-brand-charcoal/80 text-[14px] sm:text-[15px] font-medium">
                <span>✓ {t("benefit1")}</span>
                <span>✓ {t("benefit2")}</span>
                <span>✓ {t("benefit3")}</span>
              </div>

              <div className="mt-7 rounded-2xl border border-brand-purple/10 bg-white px-5 py-4 shadow-sm">
                <p className="text-brand-charcoal/65 text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.08em]">
                  {t("startingAt")}
                </p>
                <p className="mt-1 text-brand-purple text-[28px] sm:text-[32px] font-bold tracking-tight">
                  {formattedPrice}
                </p>
              </div>

              <div className="mt-8">
                <ProductPurchaseBox
                  priceAmount={product.priceAmount}
                  currencyCode={product.currencyCode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}