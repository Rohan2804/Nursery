import { z } from "zod";

const bool = z.enum(["yes", "no", "true", "false", "1", "0", ""]).transform((v) => v === "yes" || v === "true" || v === "1");
const list = <T extends string>(allowed: readonly T[]) =>
  z.string().transform((v, ctx) => {
    const items = v.split(/[|;]/).map((x) => x.trim().toLowerCase()).filter(Boolean);
    const bad = items.find((x) => !allowed.includes(x as T));
    if (bad) ctx.addIssue({ code: "custom", message: `"${bad}" isn't one of ${allowed.join(", ")}` });
    return items as T[];
  });
const int = z.string().trim().regex(/^\d*$/, "must be a whole number").transform((v) => (v === "" ? null : Number(v)));

export const rowSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be lowercase-with-hyphens"),
  name: z.string().trim().min(2, "name is required"),
  botanical: z.string().trim().default(""),
  status: z.enum(["draft", "published", "archived"]).catch("draft"),
  badge: z.string().trim().default(""),
  light: list(["low", "medium", "bright", "sun"] as const),
  space: list(["desk", "floor", "hanging", "outdoor"] as const),
  pet_safe: bool,
  care: z.coerce.number().int().min(1).max(3),
  natural_size: z.enum(["S", "M", "L"]),
  featured: bool,
  blurb: z.string().trim().default(""),
  price_s: int, price_m: int, price_l: int,
  compare_at_s: int, compare_at_m: int, compare_at_l: int,
  stock_s: int, stock_m: int, stock_l: int,
  active_s: bool, active_m: bool, active_l: bool,
  seo_title: z.string().trim().default(""),
  seo_description: z.string().trim().default(""),
});

export type ImportRow = z.input<typeof rowSchema>;
export type ImportRowParsed = z.output<typeof rowSchema>;


