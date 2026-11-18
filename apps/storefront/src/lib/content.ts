// Editorial content for the storefront that isn't part of the catalog.
import type { Light } from "@vanam/catalog";
import { IMAGES } from "./utils";

export type Tile = { id: string; title: string; note: string; image: string; collection: string };

export const rooms: Tile[] = [
  { id: "living", title: "Living Room", note: "Statement floor plants that anchor a room", image: IMAGES.livingRoom, collection: "living-room-plants" },
  { id: "bedroom", title: "Bedroom", note: "Calm, air-purifying greens for better sleep", image: IMAGES.bedroomShelf, collection: "bedroom-plants" },
  { id: "balcony", title: "Balcony & Terrace", note: "Sun-hardy plants raised in open soil", image: IMAGES.gardenPath, collection: "balcony-plants" },
  { id: "workspace", title: "Workspace", note: "Low-fuss desk companions for focus", image: IMAGES.workspace, collection: "office-desk-plants" },
  { id: "kitchen", title: "Kitchen", note: "Herbs and humidity-lovers by the sink", image: IMAGES.kitchen, collection: "kitchen-plants" },
];

export const lights: Tile[] = [
  { id: "low", title: "Low Light", note: "For corridors, north rooms and dim corners", image: "1632207691143-643e2a9a9361", collection: "low-light-plants" },
  { id: "medium", title: "Soft & Indirect", note: "A few feet from a window, behind sheer curtains", image: IMAGES.bohoRoom, collection: "indoor-plants" },
  { id: "bright", title: "Bright Indirect", note: "Right beside a big, bright window", image: "1453904300235-0f2f60b15b5d", collection: "bright-light-plants" },
  { id: "sun", title: "Full Sun", note: "Terraces, balconies and south-facing sills", image: IMAGES.cactusField, collection: "full-sun-plants" },
];

export const lightCopy: Record<Light, { label: string; body: string }> = {
  low: { label: "Low light", body: "Happy several metres from a window or in a north-facing room." },
  medium: { label: "Soft, indirect light", body: "A few feet from a window, or behind a sheer curtain." },
  bright: { label: "Bright, indirect light", body: "Right beside a large window, out of harsh afternoon sun." },
  sun: { label: "Direct sun", body: "At least 4–6 hours of direct sunlight on a terrace or south sill." },
};
