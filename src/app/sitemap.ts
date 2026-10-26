import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return [];
  const baseUrl = siteUrl.replace(/\/$/, "");
  return [
    "",
    "/about",
    "/contact",
    "/shipping-returns",
    "/privacy",
    "/terms",
    "/collections/all",
    "/collections/new-arrivals",
    "/collections/women",
    "/collections/men",
    "/collections/shoes",
    "/collections/kids",
    ...["the-sculpted-trench", "soft-structure-shirt", "the-everyday-loafer", "relaxed-cotton-knit"].map((handle) => `/products/${handle}`),
  ].map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date() }));
}
