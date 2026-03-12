import { getDipsProduct } from './shopify';

export type PurchasableProduct = {
  productId: string;
  variantId: string;
  title: string;
  description: string;
  priceAmount: number;
  currencyCode: string;
  imageUrl: string | null;
  imageAlt: string | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
  handle: string;
};

export async function getPurchasableDipsProduct(): Promise<PurchasableProduct | null> {
  const product = await getDipsProduct();

  if (!product || !product.variant) {
    return null;
  }

  const image = product.variant.image || product.featuredImage || product.images[0] || null;

  return {
    productId: product.id,
    variantId: product.variant.id,
    title: product.title,
    description: product.description,
    priceAmount: product.variant.priceAmount,
    currencyCode: product.variant.currencyCode,
    imageUrl: image?.url ?? null,
    imageAlt: image?.altText ?? null,
    availableForSale: product.availableForSale && product.variant.availableForSale,
    quantityAvailable: product.variant.quantityAvailable,
    handle: product.handle,
  };
}