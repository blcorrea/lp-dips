import { shopifyFetch } from './shopify-client';
import { GET_PRODUCT_BY_HANDLE_QUERY } from './shopify-queries';

export const SHOPIFY_PRODUCT_HANDLE =
  process.env.SHOPIFY_PRODUCT_HANDLE || 'dips-chocolate';

/**
 * Compat layer for older components still using link-based helpers.
 * These now prefer internal site routes instead of Shopify redirects.
 */
export function getShopifyBuyUrl(fallback: string = '/en/product/dips-chocolate'): string {
  return fallback;
}

export function getShopifyShopUrl(fallback: string = '/en/product/dips-chocolate'): string {
  return fallback;
}

export function getShopifyCartUrl(fallback: string = '/en/product/dips-chocolate'): string {
  return fallback;
}

export function isShopifyConfigured(): boolean {
  return true;
}

type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

type ShopifyVariantNode = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoney;
  image: ShopifyImage | null;
};

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: {
    edges: { node: ShopifyImage }[];
  };
  variants: {
    edges: { node: ShopifyVariantNode }[];
  };
};

type GetProductByHandleResponse = {
  product: ShopifyProductNode | null;
};

export type DipsProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  variant: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    priceAmount: number;
    currencyCode: string;
    image: ShopifyImage | null;
  } | null;
};

export async function getDipsProduct(
  handle: string = SHOPIFY_PRODUCT_HANDLE
): Promise<DipsProduct | null> {
  const data = await shopifyFetch<GetProductByHandleResponse, { handle: string }>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });

  if (!data.product) {
    return null;
  }

  const firstVariant = data.product.variants.edges[0]?.node ?? null;

  return {
    id: data.product.id,
    handle: data.product.handle,
    title: data.product.title,
    description: data.product.description,
    availableForSale: data.product.availableForSale,
    featuredImage: data.product.featuredImage,
    images: data.product.images.edges.map((edge) => edge.node),
    variant: firstVariant
      ? {
          id: firstVariant.id,
          title: firstVariant.title,
          availableForSale: firstVariant.availableForSale,
          quantityAvailable: firstVariant.quantityAvailable,
          priceAmount: Number(firstVariant.price.amount),
          currencyCode: firstVariant.price.currencyCode,
          image: firstVariant.image,
        }
      : null,
  };
}