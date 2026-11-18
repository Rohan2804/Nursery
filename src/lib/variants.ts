import type { Product } from "./catalog";

export type SizeId = "S" | "M" | "L";
export type PlanterId = "grow" | "terracotta" | "ceramic" | "stone";

const sizeMeta: Record<SizeId, { label: string; factor: number; pot: string }> = {
  S: { label: "Small", factor: 0.65, pot: "4″ pot" },
  M: { label: "Medium", factor: 1, pot: "6″ pot" },
  L: { label: "Large", factor: 1.75, pot: "10″ pot" },
};

// Approximate heights by the plant's natural stature.
const heights: Record<Product["size"], Record<SizeId, string>> = {
  S: { S: "10–15 cm", M: "15–25 cm", L: "25–35 cm" },
  M: { S: "25–35 cm", M: "40–55 cm", L: "70–90 cm" },
  L: { S: "40–50 cm", M: "70–90 cm", L: "120–150 cm" },
};

export const planters: { id: PlanterId; label: string; note: string; price: number; swatch: string }[] = [
  { id: "grow", label: "Nursery pot", note: "Recycled grow pot", price: 0, swatch: "#1f2a22" },
  { id: "terracotta", label: "Terracotta", note: "Hand-thrown, breathable", price: 390, swatch: "#b8653c" },
  { id: "ceramic", label: "Glazed ceramic", note: "Bone white, with saucer", price: 890, swatch: "#ece6d8" },
  { id: "stone", label: "Matte stone", note: "Charcoal, heavy & sculptural", price: 1290, swatch: "#3b3d3a" },
];

const round10 = (n: number) => Math.round(n / 10) * 10;

/** The plant's listed price is its "home" size; other sizes scale around it. */
export function sizeOptions(product: Product) {
  const home: SizeId = product.size;
  return (["S", "M", "L"] as SizeId[]).map((id) => {
    const rel = sizeMeta[id].factor / sizeMeta[home].factor;
    return {
      id,
      label: sizeMeta[id].label,
      pot: sizeMeta[id].pot,
      height: heights[product.size][id],
      price: id === home ? product.price : round10(product.price * rel),
    };
  });
}

export function unitPrice(product: Product, size: SizeId = product.size, planter: PlanterId = "grow") {
  const s = sizeOptions(product).find((o) => o.id === size)!;
  const p = planters.find((o) => o.id === planter)!;
  return s.price + p.price;
}

export function variantLabel(product: Product, size: SizeId, planter: PlanterId) {
  const s = sizeOptions(product).find((o) => o.id === size)!;
  const p = planters.find((o) => o.id === planter)!;
  return `${s.label} · ${s.height} · ${p.label}`;
}
