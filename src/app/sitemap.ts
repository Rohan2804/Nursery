import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";
import { collections } from "@/lib/collections";
import { guides } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";
import { img } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    page("/", 1, "daily"),
    page("/plants", 0.9, "daily"),
    page("/collections", 0.8, "weekly"),
    ...collections.map((c) => page(`/collections/${c.slug}`, 0.8, "weekly")),
    ...products.map((p) => ({ ...page(`/plants/${p.id}`, 0.8, "weekly"), images: [`${img(p.image)}&w=1200&q=80`] })),
    page("/care-guides", 0.7, "weekly"),
    ...guides.map((g) => ({ ...page(`/care-guides/${g.slug}`, 0.6), lastModified: new Date(g.date) })),
    page("/landscaping", 0.7),
    page("/visit", 0.7),
    page("/about", 0.6),
    page("/contact", 0.5),
    page("/faq", 0.5),
    page("/track-order", 0.3),
    page("/shipping-returns", 0.3, "yearly"),
    page("/privacy-policy", 0.2, "yearly"),
    page("/terms", 0.2, "yearly"),
  ];
}
