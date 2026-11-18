export type Light = "low" | "medium" | "bright" | "sun";
export type Space = "desk" | "floor" | "hanging" | "outdoor";
export type Care = 1 | 2 | 3;
export type SizeId = "S" | "M" | "L";
export type Status = "draft" | "published" | "archived";

export const LIGHTS: Light[] = ["low", "medium", "bright", "sun"];
export const SPACES: Space[] = ["desk", "floor", "hanging", "outdoor"];
export const SIZES: SizeId[] = ["S", "M", "L"];

export type Variant = {
  size: SizeId;
  price: number;
  compareAt?: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  active: boolean;
};

export type PlantImage = { url: string; alt: string; focalX: number; focalY: number };

export type PlantDetails = {
  water: string;
  waterLevel: 1 | 2 | 3;
  humidity: string;
  humidityLevel: 1 | 2 | 3;
  temperature: string;
  origin: string;
  growerNote: string;
};

export type Product = {
  /** URL slug — also the stable public id used in carts and links. */
  id: string;
  name: string;
  botanical: string;
  blurb: string;
  badge?: string;
  status: Status;
  light: Light[];
  space: Space[];
  petSafe: boolean;
  care: Care;
  /** The plant's natural stature; its listed price is for this size. */
  size: SizeId;
  rating: number;
  reviews: number;
  /** Primary image URL and its focal point (CSS object-position). */
  image: string;
  imageFocal: string;
  images: PlantImage[];
  variants: Variant[];
  /** Price of the default size, for listings. */
  price: number;
  compareAt?: number;
  details: PlantDetails;
  seoTitle?: string;
  seoDescription?: string;
  featured: boolean;
  sortOrder: number;
};

export type Planter = { id: string; label: string; note: string; price: number; swatch: string };

export type CollectionGroup = "Type" | "Room" | "Light" | "Need";

/** Rule-based membership, editable in the admin. Manual include/exclude lists override the rules. */
export type CollectionRules = {
  match: "all" | "any";
  light?: Light[];
  space?: Space[];
  excludeSpace?: Space[];
  petSafe?: boolean;
  careMax?: Care;
  priceMin?: number;
  priceMax?: number;
  sizes?: SizeId[];
  includeIds?: string[];
  excludeIds?: string[];
};

export type Collection = {
  slug: string;
  group: CollectionGroup;
  title: string;
  short: string;
  description: string;
  intro: string;
  image: string;
  rules: CollectionRules;
  status: Status;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
};

export type Catalog = {
  products: Product[];
  planters: Planter[];
  collections: Collection[];
  source: "supabase" | "static";
};
