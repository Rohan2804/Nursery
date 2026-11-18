import type { CollectionInput, PlantInput } from "../schemas";

export const plantRow = (p: PlantInput) => ({
  slug: p.slug,
  name: p.name,
  botanical: p.botanical,
  blurb: p.blurb,
  badge: p.badge || null,
  status: p.status,
  light: p.light,
  space: p.space,
  pet_safe: p.petSafe,
  care: p.care,
  natural_size: p.naturalSize,
  featured: p.featured,
  sort_order: p.sortOrder,
  rating: p.rating,
  review_count: p.reviewCount,
  water: p.water,
  water_level: p.waterLevel,
  humidity: p.humidity,
  humidity_level: p.humidityLevel,
  temperature: p.temperature,
  origin: p.origin,
  grower_note: p.growerNote,
  seo_title: p.seoTitle || null,
  seo_description: p.seoDescription || null,
});

export const variantRows = (plantId: string, p: PlantInput) =>
  p.variants.map((v) => ({
    plant_id: plantId,
    size: v.size,
    active: v.active,
    price: v.price,
    compare_at: v.compareAt,
    stock: v.stock,
    low_stock_threshold: v.lowStockThreshold,
    sku: v.sku.toUpperCase(),
  }));

export const collectionRow = (c: CollectionInput) => ({
  slug: c.slug,
  grp: c.group,
  title: c.title,
  short: c.short,
  description: c.description,
  intro: c.intro,
  image_url: c.image,
  rules: c.rules,
  status: c.status,
  seo_title: c.seoTitle || null,
  seo_description: c.seoDescription || null,
  sort_order: c.sortOrder,
});

export const skuFor = (slug: string, size: string) => `VN-${slug.toUpperCase().slice(0, 18)}-${size}`;
