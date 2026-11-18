import { z } from "zod";

const slug = z
  .string()
  .min(2, "is too short")
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use lowercase letters, numbers and single hyphens");

const level = z.coerce.number().int().min(1).max(3);
const money = z.coerce.number().int("must be a whole number of rupees").min(0, "can't be negative").max(10_00_000);

export const variantSchema = z
  .object({
    size: z.enum(["S", "M", "L"]),
    active: z.boolean(),
    price: money,
    compareAt: money.nullable(),
    stock: z.coerce.number().int().min(0, "can't be negative"),
    lowStockThreshold: z.coerce.number().int().min(0),
    sku: z.string().trim().min(2, "is required").max(40),
  })
  .refine((v) => v.compareAt === null || v.compareAt > v.price, { message: "Compare-at price must be higher than the price", path: ["compareAt"] });

export const plantSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug,
    name: z.string().trim().min(2, "is required").max(120),
    botanical: z.string().trim().max(120),
    blurb: z.string().trim().max(400),
    badge: z.string().trim().max(30).nullable(),
    status: z.enum(["draft", "published", "archived"]),
    light: z.array(z.enum(["low", "medium", "bright", "sun"])),
    space: z.array(z.enum(["desk", "floor", "hanging", "outdoor"])),
    petSafe: z.boolean(),
    care: level,
    naturalSize: z.enum(["S", "M", "L"]),
    featured: z.boolean(),
    sortOrder: z.coerce.number().int(),
    rating: z.coerce.number().min(0).max(5),
    reviewCount: z.coerce.number().int().min(0),
    water: z.string().trim().max(200),
    waterLevel: level,
    humidity: z.string().trim().max(200),
    humidityLevel: level,
    temperature: z.string().trim().max(60),
    origin: z.string().trim().max(120),
    growerNote: z.string().trim().max(600),
    seoTitle: z.string().trim().max(70).nullable(),
    seoDescription: z.string().trim().max(170).nullable(),
    variants: z.array(variantSchema).length(3),
  })
  .superRefine((p, ctx) => {
    if (p.status === "published") {
      if (!p.variants.some((v) => v.active)) ctx.addIssue({ code: "custom", path: ["variants"], message: "A published plant needs at least one active size" });
      if (p.light.length === 0) ctx.addIssue({ code: "custom", path: ["light"], message: "Pick at least one light level before publishing" });
      if (p.space.length === 0) ctx.addIssue({ code: "custom", path: ["space"], message: "Pick at least one placement before publishing" });
      if (!p.blurb) ctx.addIssue({ code: "custom", path: ["blurb"], message: "Add a short description before publishing" });
    }
  });

export type PlantInput = z.infer<typeof plantSchema>;

export const rulesSchema = z.object({
  match: z.enum(["all", "any"]),
  light: z.array(z.enum(["low", "medium", "bright", "sun"])).optional(),
  space: z.array(z.enum(["desk", "floor", "hanging", "outdoor"])).optional(),
  excludeSpace: z.array(z.enum(["desk", "floor", "hanging", "outdoor"])).optional(),
  petSafe: z.boolean().optional(),
  careMax: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  priceMin: z.number().int().min(0).optional(),
  priceMax: z.number().int().min(0).optional(),
  sizes: z.array(z.enum(["S", "M", "L"])).optional(),
  includeIds: z.array(z.string()).optional(),
  excludeIds: z.array(z.string()).optional(),
});

export const collectionSchema = z.object({
  originalSlug: z.string().optional(),
  slug,
  group: z.enum(["Type", "Room", "Light", "Need"]),
  title: z.string().trim().min(2, "is required").max(80),
  short: z.string().trim().min(2, "is required").max(30),
  description: z.string().trim().max(170),
  intro: z.string().trim().max(600),
  image: z.string().trim().url("must be a full image URL").or(z.literal("")),
  rules: rulesSchema,
  status: z.enum(["draft", "published", "archived"]),
  seoTitle: z.string().trim().max(70).nullable(),
  seoDescription: z.string().trim().max(170).nullable(),
  sortOrder: z.coerce.number().int(),
});

export type CollectionInput = z.infer<typeof collectionSchema>;
