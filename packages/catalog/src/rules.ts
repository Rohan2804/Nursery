import type { Collection, CollectionRules, Product } from "./types.ts";

const any = <T,>(have: readonly T[], want?: readonly T[]) => !!want?.length && want.some((w) => have.includes(w));

/** Does a product belong in a collection? Criteria combine with AND ("all") or OR ("any"). */
export function matchesRules(p: Product, r: CollectionRules): boolean {
  if (r.excludeIds?.includes(p.id)) return false;
  if (r.includeIds?.includes(p.id)) return true;

  const checks: boolean[] = [];
  if (r.light?.length) checks.push(any(p.light, r.light));
  if (r.space?.length) checks.push(any(p.space, r.space));
  if (r.excludeSpace?.length) checks.push(!any(p.space, r.excludeSpace));
  if (r.petSafe !== undefined) checks.push(p.petSafe === r.petSafe);
  if (r.careMax) checks.push(p.care <= r.careMax);
  if (r.priceMin !== undefined) checks.push(p.price >= r.priceMin);
  if (r.priceMax !== undefined) checks.push(p.price <= r.priceMax);
  if (r.sizes?.length) checks.push(r.sizes.includes(p.size));

  if (checks.length === 0) return false; // manual-only collection
  return r.match === "any" ? checks.some(Boolean) : checks.every(Boolean);
}

export const productsInCollection = (products: Product[], c: Collection) => products.filter((p) => matchesRules(p, c.rules));
