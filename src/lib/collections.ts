import { products, type Product } from "./catalog";
import { IMAGES } from "./utils";

export type CollectionGroup = "Type" | "Room" | "Light" | "Need";

export type Collection = {
  slug: string;
  group: CollectionGroup;
  title: string;
  /** Short name for menus and chips. */
  short: string;
  /** Meta description (≈150 chars). */
  description: string;
  /** On-page SEO intro. */
  intro: string;
  image: string;
  match: (p: Product) => boolean;
};

const has = <T,>(arr: readonly T[], ...v: T[]) => v.some((x) => arr.includes(x));

export const collections: Collection[] = [
  {
    slug: "indoor-plants",
    group: "Type",
    title: "Indoor Plants",
    short: "Indoor",
    description: "Shop nursery-grown indoor plants online in India — from Monstera to ZZ plants. Hand-raised, delivered fresh, with a 30-day happiness guarantee.",
    intro:
      "Our indoor plants are raised under shade-house conditions that mimic Indian homes, so they settle in quickly once they reach yours. Every plant is acclimatised for a minimum of six weeks before it ships.",
    image: IMAGES.livingRoom,
    match: (p) => !p.space.every((s) => s === "outdoor"),
  },
  {
    slug: "outdoor-plants",
    group: "Type",
    title: "Outdoor & Garden Plants",
    short: "Outdoor",
    description: "Sun-hardy outdoor plants for balconies, terraces and gardens. Grown in open soil at our nursery and delivered across India.",
    intro:
      "Raised in open soil under real sky, our outdoor plants are already used to Indian summers and monsoons. Ideal for balconies, terraces, entrances and garden beds.",
    image: IMAGES.gardenPath,
    match: (p) => has(p.space, "outdoor") || has(p.light, "sun"),
  },
  {
    slug: "pet-friendly-plants",
    group: "Need",
    title: "Pet-Friendly Plants",
    short: "Pet friendly",
    description: "Non-toxic, pet-safe plants for homes with cats and dogs. Calathea, orchids, spider plants and more — delivered across India.",
    intro: "Every plant here is listed as non-toxic to cats and dogs, so curious noses and nibbling teeth are no cause for worry.",
    image: IMAGES.calatheaLeaves,
    match: (p) => p.petSafe,
  },
  {
    slug: "low-light-plants",
    group: "Light",
    title: "Low Light Plants",
    short: "Low light",
    description: "Plants that thrive in low light — perfect for north-facing rooms, corridors and offices. Shop ZZ, snake plants and pothos online.",
    intro: "No bright window? No problem. These are the plants we trust in dim corridors, north-facing flats and offices with more tube-light than sunlight.",
    image: "1632207691143-643e2a9a9361",
    match: (p) => has(p.light, "low"),
  },
  {
    slug: "bright-light-plants",
    group: "Light",
    title: "Bright Light Plants",
    short: "Bright light",
    description: "Indoor plants for bright rooms and big windows — fiddle leaf figs, Monstera, orchids and more, grown at our nursery.",
    intro: "For rooms flooded with daylight. These plants reward a bright spot near a big window with bold, fast growth.",
    image: "1453904300235-0f2f60b15b5d",
    match: (p) => has(p.light, "bright"),
  },
  {
    slug: "full-sun-plants",
    group: "Light",
    title: "Full Sun Plants",
    short: "Full sun",
    description: "Sun-loving plants for terraces, balconies and south-facing windows. Cactus, succulents, eucalyptus and topiary.",
    intro: "Built for the Indian sun. These plants want four to six hours of direct sunlight and will happily bake on a terrace.",
    image: IMAGES.cactusField,
    match: (p) => has(p.light, "sun"),
  },
  {
    slug: "easy-care-plants",
    group: "Need",
    title: "Easy Care Plants for Beginners",
    short: "Easy care",
    description: "Hard-to-kill, low-maintenance plants for beginners and busy people. Forgiving, beautiful and delivered with a care card.",
    intro: "New to plants, or simply busy? These are forgiving, low-maintenance companions that tolerate the odd missed watering.",
    image: "1611211232932-da3113c5b960",
    match: (p) => p.care === 1,
  },
  {
    slug: "air-purifying-plants",
    group: "Need",
    title: "Air-Purifying Plants",
    short: "Air purifying",
    description: "Air-purifying indoor plants like snake plant, pothos, spider plant and rubber plant — fresher-feeling rooms, naturally.",
    intro: "Leafy, hardworking plants long associated with cleaner-feeling indoor air — and a calmer room. Great for bedrooms and workspaces.",
    image: IMAGES.bedroomShelf,
    match: (p) => ["snake", "pothos", "spider", "rubber", "zz", "calathea"].includes(p.id),
  },
  {
    slug: "plant-gifts",
    group: "Need",
    title: "Plant Gifts",
    short: "Gifts",
    description: "Thoughtful plant gifts delivered across India — gift-wrapped in linen with a hand-written note. Perfect for birthdays and housewarmings.",
    intro: "A plant is a gift that grows. Each order can be wrapped in linen with prices hidden and a note written by hand at the nursery.",
    image: "1610397648930-477b8c7f0943",
    match: (p) => p.price <= 1700 && p.size !== "L",
  },
  {
    slug: "living-room-plants",
    group: "Room",
    title: "Living Room Plants",
    short: "Living room",
    description: "Statement floor plants and leafy companions for your living room — Monstera, fiddle leaf fig, rubber plant and more.",
    intro: "Statement plants that anchor a room — sculptural floor specimens and lush companions for shelves and side tables.",
    image: IMAGES.livingRoom,
    match: (p) => has(p.space, "floor") && !has(p.space, "outdoor"),
  },
  {
    slug: "bedroom-plants",
    group: "Room",
    title: "Bedroom Plants",
    short: "Bedroom",
    description: "Calm, air-purifying bedroom plants that cope with softer light — snake plants, ZZ, calathea and more.",
    intro: "Quiet, soft-light-loving plants for the room where you rest. Many release oxygen through the night.",
    image: IMAGES.bedroomShelf,
    match: (p) => has(p.light, "low", "medium") && !has(p.space, "outdoor"),
  },
  {
    slug: "balcony-plants",
    group: "Room",
    title: "Balcony & Terrace Plants",
    short: "Balcony",
    description: "Hardy balcony and terrace plants for Indian weather — sun-lovers, topiary and fragrant eucalyptus, grown in open soil.",
    intro: "Hardy plants raised in open soil that shrug off heat, wind and the monsoon. Perfect for balconies of every size.",
    image: IMAGES.gardenPath,
    match: (p) => has(p.space, "outdoor") || has(p.light, "sun"),
  },
  {
    slug: "office-desk-plants",
    group: "Room",
    title: "Office & Desk Plants",
    short: "Workspace",
    description: "Compact, low-fuss desk plants for offices and work-from-home setups. Tolerant of AC and artificial light.",
    intro: "Compact, low-fuss plants that cope with AC and artificial light — perfect for desks, reception counters and home offices.",
    image: IMAGES.workspace,
    match: (p) => has(p.space, "desk") && has(p.light, "low", "medium"),
  },
  {
    slug: "kitchen-plants",
    group: "Room",
    title: "Kitchen Plants",
    short: "Kitchen",
    description: "Humidity-loving and compact plants for kitchen windowsills and counters.",
    intro: "Small, humidity-loving plants that thrive on a bright kitchen sill and bring life to the busiest room in the house.",
    image: IMAGES.kitchen,
    match: (p) => has(p.space, "desk", "hanging") && has(p.light, "medium", "bright"),
  },
];

export const collectionBySlug = (slug: string) => collections.find((c) => c.slug === slug);
export const productsIn = (c: Collection) => products.filter(c.match);

/** Maps the homepage "Shop by space" tiles to collection pages. */
export const tileToCollection: Record<string, string> = {
  living: "living-room-plants",
  bedroom: "bedroom-plants",
  balcony: "balcony-plants",
  workspace: "office-desk-plants",
  kitchen: "kitchen-plants",
  low: "low-light-plants",
  medium: "indoor-plants",
  bright: "bright-light-plants",
  sun: "full-sun-plants",
};
