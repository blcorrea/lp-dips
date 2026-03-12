type ShopifyFetchParams<TVariables> = {
  query: string;
  variables?: TVariables;
};

type ShopifyGraphQLError = {
  message: string;
};

type ShopifyResponse<TData> = {
  data?: TData;
  errors?: ShopifyGraphQLError[];
};

function getShopifyConfig() {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-10';

  if (!storeDomain) {
    throw new Error('Missing SHOPIFY_STORE_DOMAIN');
  }

  if (!storefrontAccessToken) {
    throw new Error('Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  }

  return {
    storeDomain,
    storefrontAccessToken,
    apiVersion,
    endpoint: `https://${storeDomain}/api/${apiVersion}/graphql.json`,
  };
}

export async function shopifyFetch<TData, TVariables = Record<string, unknown>>({
  query,
  variables,
}: ShopifyFetchParams<TVariables>): Promise<TData> {
  const config = getShopifyConfig();

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify request failed (${response.status}): ${text}`);
  }

  const result = (await response.json()) as ShopifyResponse<TData>;

  if (result.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${result.errors.map((e) => e.message).join(' | ')}`
    );
  }

  if (!result.data) {
    throw new Error('Shopify response missing data');
  }

  return result.data;
}