import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: {
    default: "Avenoir — Objects of intention",
    template: "%s — Avenoir",
  },
  description: "Considered clothing, footwear and objects made to stay. Discover the Avenoir collection.",
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  openGraph: {
    title: "Avenoir — Objects of intention",
    description: "Considered pieces. Made to stay.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
