import { getPurchasableDipsProduct } from '@/lib/shopify-product';
import BuyNowButton from './BuyNowButton';

type LiveProductPurchaseProps = {
  showTitle?: boolean;
  showDescription?: boolean;
  showPrice?: boolean;
  showAvailability?: boolean;
  buttonLabel?: string;
  buttonClassName?: string;
};

export default async function LiveProductPurchase({
  showTitle = false,
  showDescription = false,
  showPrice = true,
  showAvailability = false,
  buttonLabel = 'Buy now',
  buttonClassName = '',
}: LiveProductPurchaseProps) {
  const product = await getPurchasableDipsProduct();

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <h2 className="text-brand-purple text-3xl lg:text-5xl font-bold tracking-tight">
          {product.title}
        </h2>
      )}

      {showPrice && (
        <p className="text-brand-charcoal text-lg lg:text-xl font-semibold">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: product.currencyCode,
          }).format(product.priceAmount)}
        </p>
      )}

      {showDescription && (
        <p className="text-brand-charcoal/85 text-base lg:text-lg leading-[1.8]">
          {product.description}
        </p>
      )}

      <BuyNowButton label={buttonLabel} className={buttonClassName} />

      {showAvailability && (
        <p className="text-sm text-brand-charcoal/70">
          Availability:{' '}
          <span className="font-semibold text-brand-purple">
            {product.availableForSale ? 'In stock' : 'Unavailable'}
          </span>
        </p>
      )}
    </div>
  );
}