import { IMAGES } from "./utils";

export type Light = "low" | "medium" | "bright" | "sun";
export type Space = "desk" | "floor" | "hanging" | "outdoor";
export type Care = 1 | 2 | 3;

export type Product = {
  id: string;
  name: string;
  botanical: string;
  price: number;
  compareAt?: number;
  image: string;
  rating: number;
  reviews: number;
  light: Light[];
  space: Space[];
  petSafe: boolean;
  care: Care;
  size: "S" | "M" | "L";
  badge?: string;
  blurb: string;
};

export const products: Product[] = [
  {
    id: "monstera",
    name: "Monstera Deliciosa",
    botanical: "Monstera deliciosa",
    price: 1450,
    compareAt: 1690,
    image: "1614594975525-e45190c55d0b",
    rating: 4.9,
    reviews: 412,
    light: ["medium", "bright"],
    space: ["floor"],
    petSafe: false,
    care: 2,
    size: "L",
    badge: "Bestseller",
    blurb: "The sculptural icon. Fenestrated leaves that grow more dramatic every season.",
  },
  {
    id: "zz",
    name: "ZZ Plant",
    botanical: "Zamioculcas zamiifolia",
    price: 1150,
    image: "1632207691143-643e2a9a9361",
    rating: 4.8,
    reviews: 389,
    light: ["low", "medium"],
    space: ["floor", "desk"],
    petSafe: false,
    care: 1,
    size: "M",
    badge: "Thrives on neglect",
    blurb: "Glossy, architectural and nearly indestructible. Happy in the darkest corner.",
  },
  {
    id: "fiddle",
    name: "Fiddle Leaf Fig",
    botanical: "Ficus lyrata",
    price: 2200,
    image: "1453904300235-0f2f60b15b5d",
    rating: 4.7,
    reviews: 268,
    light: ["bright"],
    space: ["floor"],
    petSafe: false,
    care: 3,
    size: "L",
    blurb: "A tall, violin-leaved statement for bright rooms and confident plant parents.",
  },
  {
    id: "calathea",
    name: "Calathea Orbifolia",
    botanical: "Goeppertia orbifolia",
    price: 1350,
    image: IMAGES.calatheaLeaves,
    rating: 4.8,
    reviews: 197,
    light: ["low", "medium"],
    space: ["desk", "floor"],
    petSafe: true,
    care: 2,
    size: "M",
    badge: "Pet friendly",
    blurb: "Silver-striped leaves that fold up at dusk — a living, breathing artwork.",
  },
  {
    id: "snake",
    name: "Snake Plant 'Laurentii'",
    botanical: "Dracaena trifasciata",
    price: 890,
    image: "1611211232932-da3113c5b960",
    rating: 4.9,
    reviews: 524,
    light: ["low", "medium", "bright"],
    space: ["desk", "floor"],
    petSafe: false,
    care: 1,
    size: "M",
    badge: "Air purifier",
    blurb: "Gold-edged blades that clean the air while you sleep. Forgiving of everything.",
  },
  {
    id: "pothos",
    name: "Golden Pothos",
    botanical: "Epipremnum aureum",
    price: 650,
    image: "1598880940080-ff9a29891b85",
    rating: 4.8,
    reviews: 341,
    light: ["low", "medium", "bright"],
    space: ["hanging", "desk"],
    petSafe: false,
    care: 1,
    size: "S",
    blurb: "Cascading heart-shaped vines. The easiest way to soften a shelf or a hook.",
  },
  {
    id: "bonsai",
    name: "Ginseng Ficus Bonsai",
    botanical: "Ficus microcarpa",
    price: 1890,
    image: "1512428813834-c702c7702b78",
    rating: 4.6,
    reviews: 143,
    light: ["bright", "sun"],
    space: ["desk"],
    petSafe: false,
    care: 3,
    size: "S",
    badge: "Nursery grown 6 yrs",
    blurb: "Sculpted by our growers over six years. A miniature tree with real character.",
  },
  {
    id: "orchid",
    name: "Phalaenopsis Orchid",
    botanical: "Phalaenopsis spp.",
    price: 1600,
    image: "1610397648930-477b8c7f0943",
    rating: 4.7,
    reviews: 221,
    light: ["medium", "bright"],
    space: ["desk"],
    petSafe: true,
    care: 2,
    size: "S",
    badge: "Pet friendly",
    blurb: "Months-long blooms in magenta. Elegant, pet-safe and surprisingly easy.",
  },
  {
    id: "spider",
    name: "Spider Plant",
    botanical: "Chlorophytum comosum",
    price: 550,
    image: "1572688484438-313a6e50c333",
    rating: 4.8,
    reviews: 298,
    light: ["medium", "bright"],
    space: ["hanging", "desk"],
    petSafe: true,
    care: 1,
    size: "S",
    blurb: "Arching striped leaves and baby plantlets. Pet-safe and endlessly cheerful.",
  },
  {
    id: "rubber",
    name: "Burgundy Rubber Plant",
    botanical: "Ficus elastica",
    price: 990,
    image: "1501004318641-b39e6451bec6",
    rating: 4.7,
    reviews: 176,
    light: ["medium", "bright"],
    space: ["floor", "desk"],
    petSafe: false,
    care: 1,
    size: "M",
    blurb: "Leathery, polished leaves on an upright frame. Grows tall with little fuss.",
  },
  {
    id: "topiary",
    name: "Ficus Topiary Standard",
    botanical: "Ficus benjamina",
    price: 3400,
    image: "1520412099551-62b6bafeb5bb",
    rating: 4.9,
    reviews: 88,
    light: ["bright", "sun"],
    space: ["outdoor", "floor"],
    petSafe: false,
    care: 2,
    size: "L",
    badge: "Entrance piece",
    blurb: "A hand-clipped lollipop standard for entrances, terraces and grand foyers.",
  },
  {
    id: "haworthia",
    name: "Zebra Haworthia",
    botanical: "Haworthiopsis attenuata",
    price: 450,
    image: "1485955900006-10f4d324d411",
    rating: 4.8,
    reviews: 233,
    light: ["bright", "sun"],
    space: ["desk"],
    petSafe: true,
    care: 1,
    size: "S",
    blurb: "A tiny striped succulent for sunny sills. Water once a fortnight, that's all.",
  },
  {
    id: "cactus",
    name: "Golden Barrel Cactus",
    botanical: "Echinocactus grusonii",
    price: 520,
    image: "1459411552884-841db9b3cc2a",
    rating: 4.6,
    reviews: 119,
    light: ["sun"],
    space: ["desk", "outdoor"],
    petSafe: false,
    care: 1,
    size: "S",
    blurb: "Sun-loving and slow-growing. Perfect for terraces and south-facing windows.",
  },
  {
    id: "eucalyptus",
    name: "Silver Dollar Eucalyptus",
    botanical: "Eucalyptus cinerea",
    price: 780,
    image: "1466781783364-36c955e42a7f",
    rating: 4.5,
    reviews: 64,
    light: ["sun"],
    space: ["outdoor"],
    petSafe: false,
    care: 2,
    size: "M",
    blurb: "Fragrant silver-blue rounds for balconies. Snip stems for the vase all year.",
  },
];

export const featured = ["monstera", "zz", "calathea", "snake", "fiddle", "orchid", "pothos", "bonsai"]
  .map((id) => products.find((p) => p.id === id)!)
  .filter(Boolean);

export type Tile = {
  id: string;
  title: string;
  note: string;
  count: number;
  image: string;
};

export const rooms: Tile[] = [
  { id: "living", title: "Living Room", note: "Statement floor plants that anchor a room", count: 86, image: IMAGES.livingRoom },
  { id: "bedroom", title: "Bedroom", note: "Calm, air-purifying greens for better sleep", count: 54, image: IMAGES.bedroomShelf },
  { id: "balcony", title: "Balcony & Terrace", note: "Sun-hardy plants raised in open soil", count: 142, image: IMAGES.gardenPath },
  { id: "workspace", title: "Workspace", note: "Low-fuss desk companions for focus", count: 47, image: IMAGES.workspace },
  { id: "kitchen", title: "Kitchen", note: "Herbs and humidity-lovers by the sink", count: 38, image: IMAGES.kitchen },
];

export const lights: Tile[] = [
  { id: "low", title: "Low Light", note: "For corridors, north rooms and dim corners", count: 41, image: "1632207691143-643e2a9a9361" },
  { id: "medium", title: "Soft & Indirect", note: "A few feet from a window, behind sheer curtains", count: 96, image: IMAGES.bohoRoom },
  { id: "bright", title: "Bright Indirect", note: "Right beside a big, bright window", count: 73, image: "1453904300235-0f2f60b15b5d" },
  { id: "sun", title: "Full Sun", note: "Terraces, balconies and south-facing sills", count: 118, image: IMAGES.cactusField },
];

// ---- Plant finder ----

export type Answers = {
  light?: Light;
  space?: Space;
  pets?: boolean;
  care?: Care;
};

const lightOrder: Light[] = ["low", "medium", "bright", "sun"];

export type Match = { product: Product; score: number; reasons: string[] };

export function findMatches(a: Answers, limit = 3): Match[] {
  const scored = products
    .filter((p) => !(a.pets && !p.petSafe))
    .map((p) => {
      let score = 0;
      const reasons: string[] = [];

      if (a.light) {
        if (p.light.includes(a.light)) {
          score += 4;
          reasons.push(lightReason[a.light]);
        } else {
          const near = p.light.some(
            (l) => Math.abs(lightOrder.indexOf(l) - lightOrder.indexOf(a.light!)) === 1,
          );
          score += near ? 1 : -3;
        }
      }
      if (a.space) {
        if (p.space.includes(a.space)) {
          score += 3;
          reasons.push(spaceReason[a.space]);
        } else score -= 1;
      }
      if (a.care) {
        if (p.care <= a.care) {
          score += 2;
          if (p.care === 1) reasons.push("Forgiving if you forget to water");
        } else score -= 3;
      }
      if (a.pets && p.petSafe) reasons.push("Non-toxic to cats and dogs");

      return { product: p, score, reasons: reasons.slice(0, 3) };
    })
    .sort((x, y) => y.score - x.score || y.product.rating - x.product.rating);

  const max = 9;
  return scored.slice(0, limit).map((m) => ({
    ...m,
    score: Math.max(62, Math.min(99, Math.round((m.score / max) * 100))),
  }));
}

const lightReason: Record<Light, string> = {
  low: "Content in low light",
  medium: "Loves soft, indirect light",
  bright: "Thrives beside a bright window",
  sun: "Made for direct sunshine",
};

const spaceReason: Record<Space, string> = {
  desk: "Sized for tabletops and shelves",
  floor: "A floor-standing statement",
  hanging: "Trails beautifully from a hook",
  outdoor: "Hardy enough for the outdoors",
};
