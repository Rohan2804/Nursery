import type { Metadata, Viewport } from "next";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { CartProvider } from "@/components/providers/CartProvider";
import { CatalogProvider } from "@/components/providers/CatalogProvider";
import { getCatalog } from "@/lib/catalog-source";
import { IntroProvider } from "@/components/providers/IntroProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/ui/Cursor";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationLd, websiteLd } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline} | Buy Plants Online in India`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["buy plants online", "indoor plants India", "plant nursery", "outdoor plants", "pet-friendly plants", "low light plants", "landscaping", "plant delivery"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: `${site.name} — ${site.tagline}`, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: false },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: "#08110c",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  return (
    <html lang="en-IN">
      <head>
        {/* Loaded by the browser so fonts work behind corporate TLS proxies too. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400..800&display=swap"
        />
      </head>
      <body>
        <CatalogProvider catalog={catalog}>
        <IntroProvider>
          <SmoothScroll>
            <CartProvider>
              {children}
              <CartDrawer />
              <Cursor />
            </CartProvider>
          </SmoothScroll>
        </IntroProvider>
        </CatalogProvider>
        <JsonLd data={[organizationLd(), websiteLd()]} />
      </body>
    </html>
  );
}
