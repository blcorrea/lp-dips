import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPurchasableDipsProduct } from '@/lib/shopify-product';
import BuyNowButton from '@/components/BuyNowButton';

export default async function DipsProductPage() {
  const product = await getPurchasableDipsProduct();

  if (!product) {
    notFound();
  }

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
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: product.currencyCode,
              }).format(product.priceAmount)}
            </p>

            <p className="mt-6 text-brand-charcoal/85 text-base lg:text-lg leading-[1.8]">
              {product.description}
            </p>

            <div className="mt-8">
              <BuyNowButton />
            </div>

            <div className="mt-8 text-sm text-brand-charcoal/70 space-y-2">
              <p>
                Availability:{' '}
                <span className="font-semibold text-brand-purple">
                  {product.availableForSale ? 'In stock' : 'Unavailable'}
                </span>
              </p>
              <p>
                Currency:{' '}
                <span className="font-semibold text-brand-purple">
                  {product.currencyCode}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}