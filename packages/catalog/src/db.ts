// Mapping between Supabase rows (snake_case) and catalog types. Shared by the storefront and the admin.
import { listingPrice } from "./pricing.ts";
import type { Catalog, Collection, CollectionRules, Planter, PlantImage, Product, Status, Variant } from "./types.ts";
import { SIZES } from "./types.ts";

export type PlantRow = {
  id: string;
  slug: string;
  name: string;
  botanical: string;
  blurb: string;
  badge: string | null;
  status: Status;
  light: string[];
  space: string[];
  pet_safe: boolean;
  care: number;
  natural_size: string;
  rating: number;
  review_count: number;
  water: string;
  water_level: number;
  humidity: string;
  humidity_level: number;
  temperature: string;
  origin: string;
  grower_note: string;
  seo_title: string | null;
  seo_description: string | null;
  featured: boolean;
  sort_order: number;
  updated_at?: string;
};

export type VariantRow = {
  id: string;
  plant_id: string;
  size: string;
  price: number;
  compare_at: number | null;
  stock: number;
  low_stock_threshold: number;
  sku: string;
  active: boolean;
};

export type ImageRow = {
  id: string;
  plant_id: string;
  url: string;
  storage_path: string | null;
  alt: string;
  position: number;
  focal_x: number;
  focal_y: number;
};

export type PlanterRow = { id: string; label: string; note: string; price: number; swatch: string; active: boolean; sort_order: number };

export type CollectionRow = {
  slug: string;
  grp: string;
  title: string;
  short: string;
  description: string;
  intro: string;
  image_url: string;
  rules: CollectionRules;
  status: Status;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
};

export type PlantWithRelations = PlantRow & { plant_variants: VariantRow[]; plant_images: ImageRow[] };

/** Select string for a plant with its variants and images. */
export const PLANT_SELECT = "*, plant_variants(*), plant_images(*)";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop";

export function toVariant(v: VariantRow): Variant {
  return {
    size: v.size as Variant["size"],
    price: v.price,
    compareAt: v.compare_at ?? undefined,
    stock: v.stock,
    lowStockThreshold: v.low_stock_threshold,
    sku: v.sku,
    active: v.active,
  };
}

export function toProduct(r: PlantWithRelations): Product {
  const variants = [...(r.plant_variants ?? [])]
    .sort((a, b) => SIZES.indexOf(a.size as Variant["size"]) - SIZES.indexOf(b.size as Variant["size"]))
    .map(toVariant);
  const images: PlantImage[] = [...(r.plant_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((i) => ({ url: i.url, alt: i.alt || r.name, focalX: i.focal_x, focalY: i.focal_y }));
  const primary = images[0];
  const natural = r.natural_size as Product["size"];
  return {
    id: r.slug,
    name: r.name,
    botanical: r.botanical,
    blurb: r.blurb,
    badge: r.badge ?? undefined,
    status: r.status,
    light: r.light as Product["light"],
    space: r.space as Product["space"],
    petSafe: r.pet_safe,
    care: r.care as Product["care"],
    size: natural,
    rating: Number(r.rating),
    reviews: r.review_count,
    image: primary?.url ?? FALLBACK_IMAGE,
    imageFocal: primary ? `${Math.round(primary.focalX * 100)}% ${Math.round(primary.focalY * 100)}%` : "50% 50%",
    images,
    variants,
    ...listingPrice(variants, natural),
    details: {
      water: r.water,
      waterLevel: r.water_level as 1 | 2 | 3,
      humidity: r.humidity,
      humidityLevel: r.humidity_level as 1 | 2 | 3,
      temperature: r.temperature,
      origin: r.origin,
      growerNote: r.grower_note,
    },
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
    featured: r.featured,
    sortOrder: r.sort_order,
  };
}

export const toPlanter = (r: PlanterRow): Planter => ({ id: r.id, label: r.label, note: r.note, price: r.price, swatch: r.swatch });

export const toCollection = (r: CollectionRow): Collection => ({
  slug: r.slug,
  group: r.grp as Collection["group"],
  title: r.title,
  short: r.short,
  description: r.description,
  intro: r.intro,
  image: r.image_url,
  rules: r.rules ?? { match: "all" },
  status: r.status,
  seoTitle: r.seo_title ?? undefined,
  seoDescription: r.seo_description ?? undefined,
  sortOrder: r.sort_order,
});

export function toCatalog(plants: PlantWithRelations[], planters: PlanterRow[], collections: CollectionRow[]): Catalog {
  return {
    products: plants.map(toProduct).sort((a, b) => a.sortOrder - b.sortOrder),
    planters: planters.filter((p) => p.active).sort((a, b) => a.sort_order - b.sort_order).map(toPlanter),
    collections: collections.map(toCollection).sort((a, b) => a.sortOrder - b.sortOrder),
    source: "supabase",
  };
}
