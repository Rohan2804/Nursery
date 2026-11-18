import type { Planter, Product, SizeId, Variant } from "./types.ts";
import { SIZES } from "./types.ts";

export const sizeMeta: Record<SizeId, { label: string; factor: number; pot: string }> = {
  S: { label: "Small", factor: 0.65, pot: "4″ pot" },
  M: { label: "Medium", factor: 1, pot: "6″ pot" },
  L: { label: "Large", factor: 1.75, pot: "10″ pot" },
};

// Approximate heights (incl. pot) by the plant's natural stature.
export const heights: Record<SizeId, Record<SizeId, string>> = {
  S: { S: "10–15 cm", M: "15–25 cm", L: "25–35 cm" },
  M: { S: "25–35 cm", M: "40–55 cm", L: "70–90 cm" },
  L: { S: "40–50 cm", M: "70–90 cm", L: "120–150 cm" },
};

const round10 = (n: number) => Math.round(n / 10) * 10;

/** Suggested price for a size, scaled from the natural-size price. Used for seeding and as an admin hint. */
export function suggestedPrice(basePrice: number, natural: SizeId, size: SizeId) {
  return size === natural ? basePrice : round10((basePrice * sizeMeta[size].factor) / sizeMeta[natural].factor);
}

export type SizeOption = Variant & { id: SizeId; label: string; pot: string; height: string };

/** Active sizes for a product, smallest first, with display labels. */
export function sizeOptions(product: Product): SizeOption[] {
  return SIZES.map((s) => product.variants.find((v) => v.size === s && v.active))
    .filter((v): v is Variant => !!v)
    .map((v) => ({ ...v, id: v.size, label: sizeMeta[v.size].label, pot: sizeMeta[v.size].pot, height: heights[product.size][v.size] }));
}

export const isInStock = (p: Product) => p.variants.some((v) => v.active && v.stock > 0);

/** The size to preselect: the natural size if available, otherwise the first in stock. */
export function defaultSize(p: Product): SizeId {
  const opts = sizeOptions(p);
  return (opts.find((o) => o.id === p.size && o.stock > 0) ?? opts.find((o) => o.stock > 0) ?? opts[0])?.id ?? p.size;
}

export function unitPrice(product: Product, size: SizeId, planterId: string, planters: Planter[]) {
  const s = product.variants.find((v) => v.size === size) ?? product.variants[0];
  const p = planters.find((o) => o.id === planterId);
  return (s?.price ?? product.price) + (p?.price ?? 0);
}

export function variantLabel(product: Product, size: SizeId, planterId: string, planters: Planter[]) {
  const p = planters.find((o) => o.id === planterId);
  return `${sizeMeta[size].label} · ${heights[product.size][size]} · ${p?.label ?? "Nursery pot"}`;
}

/** Listing price = default size's price. */
export function listingPrice(variants: Variant[], natural: SizeId) {
  const active = variants.filter((v) => v.active);
  const home = active.find((v) => v.size === natural) ?? active[0];
  return { price: home?.price ?? 0, compareAt: home?.compareAt };
}
