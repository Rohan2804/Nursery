import { isInStock } from "./pricing.ts";
import type { Care, Light, Product, Space } from "./types.ts";

export type Answers = { light?: Light; space?: Space; pets?: boolean; care?: Care };
export type Match = { product: Product; score: number; reasons: string[] };

const lightOrder: Light[] = ["low", "medium", "bright", "sun"];

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

/** Plant-finder scoring: in-stock plants ranked against the quiz answers. */
export function findMatches(products: Product[], a: Answers, limit = 3): Match[] {
  const scored = products
    .filter((p) => isInStock(p) && !(a.pets && !p.petSafe))
    .map((p) => {
      let score = 0;
      const reasons: string[] = [];
      if (a.light) {
        if (p.light.includes(a.light)) {
          score += 4;
          reasons.push(lightReason[a.light]);
        } else {
          const near = p.light.some((l) => Math.abs(lightOrder.indexOf(l) - lightOrder.indexOf(a.light!)) === 1);
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

  return scored.slice(0, limit).map((m) => ({ ...m, score: Math.max(62, Math.min(99, Math.round((m.score / 9) * 100))) }));
}
