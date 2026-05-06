import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPurchasableDipsProduct } from '@/lib/shopify-product';
import ProductPurchaseBox from '@/components/ProductPurchaseBox';
import TrackViewItem from '@/components/TrackViewItem';
import SocialMediaButtons from '@/components/SocialMediaButtons';
import {
  formatLocalizedPrice,
  getLocalizedPricing,
  getWeightLabel,
} from '@/lib/pricing';

type DipsProductPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DipsProductPage({ params }: DipsProductPageProps) {
  const { locale } = await params;
  const product = await getPurchasableDipsProduct();

  if (!product) {
    notFound();
  }

  const localizedPricing = getLocalizedPricing(locale);
  const weightLabel = getWeightLabel(locale, 120);
  const formattedPrice = formatLocalizedPrice(
    locale,
    localizedPricing.price,
    localizedPricing.currency
  );

  return (
    <main className="min-h-screen bg-brand-cream">
      <section className="container mx-auto px-6 py-14 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          <div className="rounded-[28px] bg-brand-cream border border-brand-purple/10 shadow-sm p-6 lg:p-10">
            <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-white">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt || product.title}
                  fill
                  className="object-contain p-6"
                />
              ) : null}
            </div>
          </div>

          <div className="pt-2">
            <h1 className="text-brand-purple text-4xl lg:text-6xl font-bold leading-[1.02] tracking-tight">
              {product.title}
            </h1>

            <p className="mt-5 text-brand-charcoal text-lg lg:text-xl font-medium">
              {formattedPrice}
            </p>
            <p className="mt-1 text-brand-charcoal/60 text-sm lg:text-base">
              {weightLabel}
            </p>

            <p className="mt-6 text-brand-charcoal/85 text-base lg:text-lg leading-[1.8]">
              {product.description}
            </p>

            <div className="mt-8">
              <ProductPurchaseBox
                priceAmount={localizedPricing.price}
                currencyCode={localizedPricing.currency}
                productId={product.productId}
                productName={product.title}
                locale={locale}
              />
            </div>

            <SocialMediaButtons className="mt-6" />

            {/* Fires view_item once on client mount — renders nothing */}
            <TrackViewItem
              id={product.productId}
              name={product.title}
              price={localizedPricing.price}
              quantity={1}
              currency={localizedPricing.currency}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
