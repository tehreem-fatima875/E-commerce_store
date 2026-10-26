import "server-only";
import { z } from "zod";

const configSchema = z.object({
  storeDomain: z.string().regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i),
  storefrontToken: z.string().min(1),
  apiVersion: z.string().regex(/^\d{4}-\d{2}$/).default("2026-10"),
  checkoutHost: z.preprocess(
    (host) => host === "" ? undefined : host,
    z.string().regex(/^[a-z0-9.-]+$/i).transform((host) => host.toLowerCase()).optional(),
  ),
});

export class ShopifyApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyApiError";
  }
}

export function getShopifyConfig() {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!storeDomain && !storefrontToken) return null;

  const config = configSchema.safeParse({
    storeDomain,
    storefrontToken,
    apiVersion: process.env.SHOPIFY_API_VERSION,
    checkoutHost: process.env.SHOPIFY_CHECKOUT_HOST,
  });
  if (!config.success) {
    throw new ShopifyApiError("Shopify configuration is incomplete or invalid.");
  }
  return config.data;
}

const apiErrorSchema = z.object({ message: z.string() }).passthrough();
const responseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(apiErrorSchema).optional(),
});

export async function shopifyRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  dataSchema: z.ZodType<T>,
): Promise<T> {
  const config = getShopifyConfig();
  if (!config) throw new ShopifyApiError("Shopify is not configured for this storefront.");

  const response = await fetch(
    `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new ShopifyApiError(`Shopify Storefront API returned HTTP ${response.status}.`);
  }

  const result = responseSchema.parse(await response.json());
  if (result.errors?.length) {
    throw new ShopifyApiError(`Shopify Storefront API error: ${result.errors.map((error) => error.message).join("; ")}`);
  }
  return dataSchema.parse(result.data);
}

const imageSchema = z.object({ url: z.string().url(), altText: z.string().nullable() });
const priceSchema = z.object({
  amount: z.string().regex(/^\d+(?:\.\d+)?$/),
  currencyCode: z.string().regex(/^[A-Z]{3}$/),
});
const variantSchema = z.object({
  id: z.string(),
  title: z.string(),
  availableForSale: z.boolean(),
  price: priceSchema,
  selectedOptions: z.array(z.object({ name: z.string(), value: z.string() })),
});

export const shopifyProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string(),
  featuredImage: imageSchema.nullable(),
  images: z.object({ nodes: z.array(imageSchema) }),
  priceRange: z.object({ minVariantPrice: priceSchema, maxVariantPrice: priceSchema }),
  variants: z.object({ nodes: z.array(variantSchema) }),
});

export type ShopifyProduct = z.infer<typeof shopifyProductSchema>;

export function formatShopifyMoney(money: z.infer<typeof priceSchema>) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}

const productConnectionSchema = z.object({
  products: z.object({ nodes: z.array(shopifyProductSchema) }),
});
const productRequestSchema = z.object({
  first: z.number().int().min(1).max(100).default(24),
  query: z.string().trim().max(250).optional(),
});

const productQuery = `query StorefrontProducts($first: Int!, $query: String) @inContext(country: PK) {
  products(first: $first, query: $query) {
    nodes {
      id handle title description
      featuredImage { url altText }
      images(first: 8) { nodes { url altText } }
      priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
      variants(first: 100) {
        nodes { id title availableForSale price { amount currencyCode } selectedOptions { name value } }
      }
    }
  }
}`;

export async function getShopifyProducts(first = 24, query?: string) {
  const input = productRequestSchema.parse({ first, query });
  return shopifyRequest(productQuery, { first: input.first, query: input.query || null }, productConnectionSchema);
}

const collectionSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string(),
  products: z.object({ nodes: z.array(shopifyProductSchema) }),
});
const collectionResponseSchema = z.object({
  collection: collectionSchema.nullable(),
});
const collectionQuery = `query StorefrontCollection($handle: String!, $first: Int!) @inContext(country: PK) {
  collection(handle: $handle) {
    id handle title description
    products(first: $first) {
      nodes {
        id handle title description
        featuredImage { url altText }
        images(first: 8) { nodes { url altText } }
        priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
        variants(first: 100) {
          nodes { id title availableForSale price { amount currencyCode } selectedOptions { name value } }
        }
      }
    }
  }
}`;

export async function getShopifyCollection(handle: string, first = 24) {
  const input = z.object({
    handle: z.string().trim().min(1).max(128),
    first: z.number().int().min(1).max(100).default(24),
  }).parse({ handle, first });
  const data = await shopifyRequest(collectionQuery, input, collectionResponseSchema);
  return data.collection;
}

const cartSchema = z.object({
  id: z.string(),
  checkoutUrl: z.string().url(),
  totalQuantity: z.number().int().nonnegative(),
  cost: z.object({
    subtotalAmount: priceSchema,
    totalAmount: priceSchema,
  }),
});
export type ShopifyCart = z.infer<typeof cartSchema>;

const cartCreateQuery = `mutation CreateCart($lines: [CartLineInput!]!) @inContext(country: PK) {
  cartCreate(input: { lines: $lines }) {
    cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } }
    userErrors { message }
  }
}`;
const cartLinesMutationSchema = z.object({
  cart: cartSchema.nullable(),
  userErrors: z.array(z.object({ message: z.string() })),
});

async function getMutatedCart(
  query: string,
  variables: Record<string, unknown>,
  operation: "cartCreate" | "cartLinesAdd" | "cartLinesUpdate" | "cartLinesRemove",
) {
  const result = await shopifyRequest(
    query,
    variables,
    z.object({ [operation]: cartLinesMutationSchema }),
  );
  const mutation = result[operation];
  if (mutation.userErrors.length) {
    throw new ShopifyApiError(`Shopify cart error: ${mutation.userErrors.map((error) => error.message).join("; ")}`);
  }
  if (!mutation.cart) throw new ShopifyApiError("Shopify did not return a cart.");
  return mutation.cart;
}

export function createShopifyCart(merchandiseId: string, quantity: number) {
  const input = cartLineInputSchema.parse({ merchandiseId, quantity });
  return getMutatedCart(cartCreateQuery, {
    lines: [input],
  }, "cartCreate");
}

export function addShopifyCartLine(cartId: string, merchandiseId: string, quantity: number) {
  const input = cartLineInputSchema.parse({ cartId, merchandiseId, quantity });
  return getMutatedCart(
    `mutation AddCartLine($cartId: ID!, $lines: [CartLineInput!]!) @inContext(country: PK) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } }
        userErrors { message }
      }
    }`,
    { cartId: input.cartId, lines: [{ merchandiseId: input.merchandiseId, quantity: input.quantity }] },
    "cartLinesAdd",
  );
}

export function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const input = cartUpdateInputSchema.parse({ cartId, lineId, quantity });
  return getMutatedCart(
    `mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) @inContext(country: PK) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } }
        userErrors { message }
      }
    }`,
    { cartId: input.cartId, lines: [{ id: input.lineId, quantity: input.quantity }] },
    "cartLinesUpdate",
  );
}

export async function removeShopifyCartLine(cartId: string, lineId: string) {
  const input = cartIdentifierSchema.parse({ cartId, lineId });
  return getMutatedCart(
    `mutation RemoveCartLine($cartId: ID!, $lineIds: [ID!]!) @inContext(country: PK) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } }
        userErrors { message }
      }
    }`,
    { cartId: input.cartId, lineIds: [input.lineId] },
    "cartLinesRemove",
  );
}

const cartIdentifierSchema = z.object({
  cartId: z.string().min(1).max(512),
  lineId: z.string().min(1).max(512),
});
const cartLineInputSchema = z.object({
  cartId: z.string().min(1).max(512).optional(),
  merchandiseId: z.string().min(1).max(512),
  quantity: z.number().int().min(1).max(99),
});
const cartUpdateInputSchema = z.object({
  cartId: z.string().min(1).max(512),
  lineId: z.string().min(1).max(512),
  quantity: z.number().int().min(1).max(99),
});

export function validateShopifyCheckoutUrl(checkoutUrl: string) {
  const config = getShopifyConfig();
  if (!config) throw new ShopifyApiError("Shopify is not configured for this storefront.");
  let url: URL;
  try {
    url = new URL(checkoutUrl);
  } catch {
    throw new ShopifyApiError("Shopify returned an invalid checkout URL.");
  }
  const allowedHosts = [config.storeDomain, config.checkoutHost].filter(
    (host): host is string => Boolean(host),
  );
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !allowedHosts.includes(url.hostname)
  ) {
    throw new ShopifyApiError("Shopify returned a checkout URL outside the configured trusted hosts.");
  }
  return url.toString();
}
