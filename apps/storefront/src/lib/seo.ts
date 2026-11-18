import type { Metadata } from "next";
import { sizeOptions, type Planter, type Product } from "@vanam/catalog";
import { site } from "./site";
import { img } from "./utils";

export const absoluteUrl = (path = "/") => new URL(path, site.url).toString();

type PageMeta = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
};

/** Consistent title, description, canonical and social tags for every page. */
export function pageMetadata({ title, description, path, image, noIndex, type = "website" }: PageMeta): Metadata {
  // Fall back to the generated brand card so every page has a share image.
  const images = [{ url: image ?? "/opengraph-image", width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type, siteName: site.name, locale: "en_IN", images },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}

export const ogImage = (unsplashId: string) => `${img(unsplashId)}&w=1200&h=630&q=80`;

/** A 1200×630 share image for any catalog image URL (resized when it's an Unsplash URL). */
export const shareImage = (url: string) => (url.includes("images.unsplash.com") ? `${url}&w=1200&h=630&q=80` : url);

/* ---------- JSON-LD builders ---------- */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["GardenStore", "LocalBusiness"],
    "@id": absoluteUrl("/#business"),
    name: site.legalName,
    alternateName: site.name,
    description: site.description,
    url: site.url,
    logo: absoluteUrl("/icon.svg"),
    image: absoluteUrl("/opengraph-image"),
    telephone: site.phone,
    email: site.email,
    foundingDate: String(site.established),
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.addressParts.street,
      addressLocality: site.addressParts.city,
      addressRegion: site.addressParts.region,
      postalCode: site.addressParts.postalCode,
      addressCountry: site.addressParts.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: site.openingHours.opens,
        closes: site.openingHours.closes,
      },
    ],
    areaServed: { "@type": "Country", name: "India" },
    sameAs: Object.values(site.social),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: site.name,
    url: site.url,
    inLanguage: "en-IN",
    publisher: { "@id": absoluteUrl("/#business") },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/plants")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function productLd(p: Product, planters: Planter[]) {
  const sizes = sizeOptions(p);
  const prices = sizes.flatMap((s) => (planters.length ? planters : [{ price: 0 }]).map((pl) => s.price + pl.price));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/plants/${p.id}#product`),
    name: p.name,
    alternateName: p.botanical,
    description: p.blurb,
    image: p.images.length ? p.images.map((i) => shareImage(i.url)) : [shareImage(p.image)],
    sku: `VN-${p.id.toUpperCase()}`,
    brand: { "@type": "Brand", name: site.name },
    category: p.space.includes("outdoor") ? "Outdoor plants" : "Indoor plants",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: sizes.some((s) => s.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": absoluteUrl("/#business") },
      url: absoluteUrl(`/plants/${p.id}`),
    },
    ...((site.publishRatingsInStructuredData as boolean)
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews } }
      : {}),
  };
}

export function itemListLd(name: string, path: string, items: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/plants/${p.id}`), name: p.name })),
    },
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function articleLd(a: { title: string; description: string; path: string; image: string; date: string; author: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: [a.image],
    datePublished: a.date,
    dateModified: a.date,
    author: { "@type": "Organization", name: a.author, url: site.url },
    publisher: { "@id": absoluteUrl("/#business") },
    mainEntityOfPage: absoluteUrl(a.path),
  };
}
