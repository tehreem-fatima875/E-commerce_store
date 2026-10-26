import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getShopifyProducts,
  getShopifyConfig,
  formatShopifyMoney,
  ShopifyApiError,
  shopifyRequest,
  validateShopifyCheckoutUrl,
} from "@/lib/shopify";
import { z } from "zod";

describe("Shopify Storefront API", () => {
  beforeEach(() => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "avenoir.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "test-storefront-token");
    vi.stubEnv("SHOPIFY_API_VERSION", "2026-10");
    vi.stubEnv("SHOPIFY_CHECKOUT_HOST", "avenoir.myshopify.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports missing Shopify credentials without pretending the store is live", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "");
    expect(getShopifyConfig()).toBeNull();
    await expect(getShopifyProducts()).rejects.toThrow(/not configured/i);
  });

  it("sends Storefront API requests with server credentials and PK market context", async () => {
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("X-Shopify-Storefront-Access-Token")).toBe("test-storefront-token");
      expect(String(_input)).toBe("https://avenoir.myshopify.com/api/2026-10/graphql.json");
      const body = JSON.parse(String(init?.body)) as { query: string };
      expect(body.query).toContain("@inContext(country: PK)");
      return Response.json({ data: { products: { nodes: [] } } });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getShopifyProducts()).resolves.toEqual({ products: { nodes: [] } });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("surfaces GraphQL errors and rejects malformed response data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({
      errors: [{ message: "Access denied" }],
    })));
    await expect(shopifyRequest("query { shop { name } }", {}, z.object({})))
      .rejects.toThrow(/Access denied/);

    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ data: { unexpected: true } })));
    await expect(shopifyRequest("query { shop { name } }", {}, z.object({ shop: z.object({ name: z.string() }) })))
      .rejects.toThrow();
  });

  it("surfaces HTTP failures and validates cart inputs", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unavailable", { status: 503 })));
    await expect(getShopifyProducts()).rejects.toThrow(/HTTP 503/);
    await expect(getShopifyProducts(101)).rejects.toThrow();
  });

  it("accepts only secure checkout URLs on configured hosts", () => {
    expect(validateShopifyCheckoutUrl("https://avenoir.myshopify.com/checkout/abc"))
      .toBe("https://avenoir.myshopify.com/checkout/abc");
    expect(() => validateShopifyCheckoutUrl("https://attacker.example/checkout"))
      .toThrow(ShopifyApiError);
    expect(() => validateShopifyCheckoutUrl("javascript:alert(1)"))
      .toThrow(ShopifyApiError);
  });

  it("formats the currency returned by Shopify instead of relabeling it", () => {
    expect(formatShopifyMoney({ amount: "125.50", currencyCode: "USD" })).toContain("US$");
    expect(formatShopifyMoney({ amount: "125.50", currencyCode: "PKR" })).toContain("125.50");
  });
});
