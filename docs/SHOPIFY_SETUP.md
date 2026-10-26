# Shopify connection and PKR launch checklist

The current storefront runs against explicitly labelled development fixtures. The server-only Storefront API module in `src/lib/shopify.ts` contains typed product, collection, and cart operations, but live commerce is not enabled in the UI. Do not present preview cart totals as Shopify totals or redirect customers to checkout until a secure server cart session and the full live flow have been wired and verified.

## Credentials

1. Create a Shopify custom app with Storefront API access for products, collections, and cart operations.
2. Set `SHOPIFY_STORE_DOMAIN` to the shop's exact `*.myshopify.com` hostname.
3. Set `SHOPIFY_STOREFRONT_ACCESS_TOKEN` in the server deployment's secret manager only. Never prefix it with `NEXT_PUBLIC_`, commit it, or log it.
4. Set `SHOPIFY_API_VERSION` to a currently supported stable Storefront API version.
5. Set `SHOPIFY_CHECKOUT_HOST` only if Shopify returns checkout URLs from a separate, verified host; the URL validator trusts exact configured HTTPS hostnames only.
6. Set `NEXT_PUBLIC_SITE_URL` to the canonical public HTTPS storefront origin for sitemap and metadata URLs.

## Pakistan / PKR market

1. In Shopify Markets, create or enable the Pakistan market and include Pakistan as its country.
2. Enable PKR as the market's presentment currency. Configure market-specific product prices or a documented conversion/pricing strategy; the Storefront queries request the Pakistan market context and use the returned `currencyCode` and amount.
3. Confirm the selected Shopify Payments or third-party provider supports the store's settlement currency, PKR presentment, and checkout for Pakistan. Presentment currency is not a guarantee that the merchant settles in PKR.
4. Configure shipping zones and rates for Pakistan, applicable taxes/duties, and the store's payment methods and legal policies in Shopify.
5. Verify representative product and variant prices through the Storefront API with Pakistan context, then complete a real end-to-end checkout manually before enabling the production purchase UI.

Prices must always be displayed using Shopify's returned currency code. Do not relabel a different currency as PKR. No real order or payment belongs in automated tests.
