import "server-only";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { SIZES } from "@vanam/catalog";
import type { CollectionRow, ImageRow, PlanterRow, PlantWithRelations, VariantRow } from "@vanam/catalog/db";
import { seedCollections, seedPlanters, seedProducts } from "@vanam/catalog/seed";
import { cookies } from "next/headers";
import { collectionRow, plantRow, skuFor, variantRows } from "./shared";
import type { Admin, AuditRow, Member, Repo, Role } from "./types";

/**
 * LOCAL PREVIEW ONLY — used when Supabase isn't configured and NODE_ENV is not production.
 * Stores the catalog in a JSON file so the admin (and the storefront, which reads the same file)
 * can be tested end-to-end without a database. Sign-in is a role picker, no passwords.
 */

export const PREVIEW_DIR = process.env.PREVIEW_DATA_DIR ?? join(process.cwd(), ".preview");
export const PREVIEW_FILE = join(PREVIEW_DIR, "catalog.json");
export const PREVIEW_UPLOADS = join(process.cwd(), "public", "preview-uploads");
export const PREVIEW_ROLE_COOKIE = "vanam_preview_role";

type Store = {
  plants: PlantWithRelations[];
  collections: CollectionRow[];
  planters: PlanterRow[];
  audit: AuditRow[];
  team: Member[];
};

const now = () => new Date().toISOString();

const PEOPLE: Record<Role, { id: string; name: string; email: string }> = {
  owner: { id: "00000000-0000-4000-8000-000000000001", name: "Preview Owner", email: "owner@preview.local" },
  manager: { id: "00000000-0000-4000-8000-000000000002", name: "Preview Manager", email: "manager@preview.local" },
  staff: { id: "00000000-0000-4000-8000-000000000003", name: "Preview Staff", email: "staff@preview.local" },
};

function seed(): Store {
  const plants: PlantWithRelations[] = seedProducts.map((p) => {
    const id = randomUUID();
    return {
      id,
      slug: p.id,
      name: p.name,
      botanical: p.botanical,
      blurb: p.blurb,
      badge: p.badge ?? null,
      status: p.status,
      light: p.light,
      space: p.space,
      pet_safe: p.petSafe,
      care: p.care,
      natural_size: p.size,
      rating: p.rating,
      review_count: p.reviews,
      water: p.details.water,
      water_level: p.details.waterLevel,
      humidity: p.details.humidity,
      humidity_level: p.details.humidityLevel,
      temperature: p.details.temperature,
      origin: p.details.origin,
      grower_note: p.details.growerNote,
      seo_title: null,
      seo_description: null,
      featured: p.featured,
      sort_order: p.sortOrder,
      updated_at: now(),
      plant_variants: p.variants.map((v) => ({
        id: randomUUID(),
        plant_id: id,
        size: v.size,
        price: v.price,
        compare_at: v.compareAt ?? null,
        stock: v.stock,
        low_stock_threshold: v.lowStockThreshold,
        sku: v.sku,
        active: v.active,
      })),
      plant_images: p.images.map((img, i) => ({ id: randomUUID(), plant_id: id, url: img.url, storage_path: null, alt: img.alt, position: i, focal_x: img.focalX, focal_y: img.focalY })),
    };
  });
  return {
    plants,
    collections: seedCollections.map((c) => ({
      slug: c.slug,
      grp: c.group,
      title: c.title,
      short: c.short,
      description: c.description,
      intro: c.intro,
      image_url: c.image,
      rules: c.rules,
      status: c.status,
      seo_title: null,
      seo_description: null,
      sort_order: c.sortOrder,
    })),
    planters: seedPlanters.map((p, i) => ({ ...p, active: true, sort_order: i })),
    audit: [],
    team: (Object.keys(PEOPLE) as Role[]).map((role) => ({ user_id: PEOPLE[role].id, email: PEOPLE[role].email, full_name: PEOPLE[role].name, role, active: true, created_at: now() })),
  };
}

function load(): Store {
  if (!existsSync(PREVIEW_FILE)) save(seed());
  return JSON.parse(readFileSync(PREVIEW_FILE, "utf8")) as Store;
}

function save(s: Store) {
  mkdirSync(dirname(PREVIEW_FILE), { recursive: true });
  const tmp = `${PREVIEW_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(s, null, 2));
  renameSync(tmp, PREVIEW_FILE); // atomic, so the storefront never reads a half-written file
}

/** Read-modify-write helper. */
function mutate<T>(fn: (s: Store) => T): T {
  const s = load();
  const out = fn(s);
  save(s);
  return out;
}

const tidy = (p: PlantWithRelations): PlantWithRelations => ({
  ...p,
  plant_variants: [...p.plant_variants].sort((a, b) => SIZES.indexOf(a.size as never) - SIZES.indexOf(b.size as never)),
  plant_images: [...p.plant_images].sort((a, b) => a.position - b.position),
});

/** Mirror the database's unique constraints so errors match production. */
function assertUnique(s: Store, plantId: string | undefined, slug: string, skus: string[]) {
  if (s.plants.some((p) => p.slug === slug && p.id !== plantId)) throw new Error("duplicate key: slug");
  const others = s.plants.filter((p) => p.id !== plantId).flatMap((p) => p.plant_variants.map((v) => v.sku));
  if (skus.some((k) => others.includes(k)) || new Set(skus).size !== skus.length) throw new Error("duplicate key: sku");
}

export const previewRepo: Repo = {
  mode: "preview",

  async currentAdmin() {
    const role = (await cookies()).get(PREVIEW_ROLE_COOKIE)?.value as Role | undefined;
    if (!role || !(role in PEOPLE)) return null;
    const member = load().team.find((m) => m.user_id === PEOPLE[role].id);
    if (member && !member.active) return null;
    return { id: PEOPLE[role].id, email: PEOPLE[role].email, name: PEOPLE[role].name, role } satisfies Admin;
  },

  async listPlants() {
    return load()
      .plants.map(tidy)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  },

  async getPlant(id) {
    const p = load().plants.find((x) => x.id === id);
    return p ? tidy(p) : null;
  },

  async savePlant(input) {
    return mutate((s) => {
      const rows = variantRows("", input);
      assertUnique(s, input.id, input.slug, rows.map((r) => r.sku));
      let plant = input.id ? s.plants.find((p) => p.id === input.id) : undefined;
      if (input.id && !plant) throw new Error("Not found, or you don't have access to it.");
      if (!plant) {
        plant = { ...(plantRow(input) as Omit<PlantWithRelations, "id" | "plant_variants" | "plant_images">), id: randomUUID(), plant_variants: [], plant_images: [] } as PlantWithRelations;
        s.plants.push(plant);
      } else Object.assign(plant, plantRow(input));
      plant.updated_at = now();
      const p = plant;
      p.plant_variants = rows.map((r) => {
        const existing = p.plant_variants.find((v) => v.size === r.size);
        return { ...(existing ?? { id: randomUUID() }), ...r, plant_id: p.id } as VariantRow;
      });
      return { id: p.id };
    });
  },

  async setPlantStatus(ids, status) {
    return mutate((s) =>
      s.plants
        .filter((p) => ids.includes(p.id))
        .map((p) => {
          p.status = status;
          p.updated_at = now();
          return p.name;
        }),
    );
  },

  async deletePlant(id) {
    return mutate((s) => {
      const p = s.plants.find((x) => x.id === id);
      if (!p) throw new Error("Not found, or you don't have access to it.");
      s.plants = s.plants.filter((x) => x.id !== id);
      for (const img of p.plant_images) removeUpload(img.storage_path);
      return p.name;
    });
  },

  async addImage(plantId, img) {
    return mutate((s) => {
      const p = s.plants.find((x) => x.id === plantId);
      if (!p) throw new Error("Not found, or you don't have access to it.");
      const row: ImageRow = { id: randomUUID(), plant_id: plantId, url: img.url, storage_path: img.storagePath, alt: img.alt, position: p.plant_images.length, focal_x: 0.5, focal_y: 0.5 };
      p.plant_images.push(row);
      p.updated_at = now();
      return row;
    });
  },

  async updateImage(id, patch) {
    return mutate((s) => {
      for (const p of s.plants) {
        const img = p.plant_images.find((i) => i.id === id);
        if (!img) continue;
        if (patch.alt !== undefined) img.alt = patch.alt;
        if (patch.focalX !== undefined) img.focal_x = patch.focalX;
        if (patch.focalY !== undefined) img.focal_y = patch.focalY;
        p.updated_at = now();
        return p.id;
      }
      throw new Error("Not found, or you don't have access to it.");
    });
  },

  async reorderImages(plantId, ids) {
    mutate((s) => {
      const p = s.plants.find((x) => x.id === plantId);
      if (!p) return;
      p.plant_images.forEach((img) => (img.position = ids.indexOf(img.id) >= 0 ? ids.indexOf(img.id) : 999));
      p.updated_at = now();
    });
  },

  async deleteImage(id) {
    return mutate((s) => {
      for (const p of s.plants) {
        const img = p.plant_images.find((i) => i.id === id);
        if (!img) continue;
        p.plant_images = p.plant_images.filter((i) => i.id !== id);
        p.plant_images.sort((a, b) => a.position - b.position).forEach((i, n) => (i.position = n));
        removeUpload(img.storage_path);
        p.updated_at = now();
        return p.id;
      }
      throw new Error("Not found, or you don't have access to it.");
    });
  },

  async setStock(changes) {
    mutate((s) => {
      for (const c of changes) {
        if (c.stock < 0) throw new Error("stock cannot be negative");
        const owner = s.plants.find((p) => p.plant_variants.some((v) => v.id === c.id));
        const v = owner?.plant_variants.find((x) => x.id === c.id);
        if (!owner || !v) throw new Error("Size not found");
        v.stock = c.stock;
        owner.updated_at = now();
      }
    });
  },

  async listCollections() {
    return [...load().collections].sort((a, b) => a.sort_order - b.sort_order);
  },

  async saveCollection(c) {
    mutate((s) => {
      if (s.collections.some((x) => x.slug === c.slug && x.slug !== c.originalSlug)) throw new Error("duplicate key: slug");
      const row = collectionRow(c) as CollectionRow;
      const i = c.originalSlug ? s.collections.findIndex((x) => x.slug === c.originalSlug) : -1;
      if (c.originalSlug && i < 0) throw new Error("Not found, or you don't have access to it.");
      if (i >= 0) s.collections[i] = row;
      else s.collections.push(row);
    });
  },

  async deleteCollection(slug) {
    return mutate((s) => {
      const c = s.collections.find((x) => x.slug === slug);
      if (!c) throw new Error("Not found, or you don't have access to it.");
      s.collections = s.collections.filter((x) => x.slug !== slug);
      return c.title;
    });
  },

  async listPlanters() {
    return [...load().planters].sort((a, b) => a.sort_order - b.sort_order);
  },

  async savePlanters(list) {
    mutate((s) => {
      for (const p of list) {
        const row: PlanterRow = { id: p.id, label: p.label, note: p.note, price: p.price, swatch: p.swatch, active: p.active, sort_order: p.sortOrder };
        const i = s.planters.findIndex((x) => x.id === p.id);
        if (i >= 0) s.planters[i] = row;
        else s.planters.push(row);
      }
    });
  },

  async listActivity(limit) {
    return load().audit.slice(0, limit);
  },

  async logActivity(admin, e) {
    mutate((s) => {
      s.audit.unshift({ id: (s.audit[0]?.id ?? 0) + 1, user_email: admin.email, action: e.action, entity: e.entity, entity_id: e.entityId, summary: e.summary, created_at: now() });
      s.audit = s.audit.slice(0, 500);
    });
  },

  async listTeam() {
    return load().team;
  },

  async inviteMember({ email, name, role }) {
    return mutate((s) => {
      if (s.team.some((m) => m.email === email)) throw new Error("That email already has an account.");
      const id = randomUUID();
      s.team.push({ user_id: id, email, full_name: name, role, active: true, created_at: now() });
      return id;
    });
  },

  async updateMember(userId, patch) {
    return mutate((s) => {
      const m = s.team.find((x) => x.user_id === userId);
      if (!m) throw new Error("Not found");
      Object.assign(m, patch);
      return m.email;
    });
  },

  async importPlants(rows) {
    return mutate((s) => {
      for (const r of rows) {
        let p = s.plants.find((x) => x.slug === r.slug);
        const fields = {
          slug: r.slug, name: r.name, botanical: r.botanical, status: r.status, badge: r.badge || null, light: r.light, space: r.space,
          pet_safe: r.pet_safe, care: r.care, natural_size: r.natural_size, featured: r.featured, blurb: r.blurb,
          seo_title: r.seo_title || null, seo_description: r.seo_description || null,
        };
        if (!p) {
          p = {
            ...fields, id: randomUUID(), rating: 0, review_count: 0, water: "", water_level: 2, humidity: "", humidity_level: 2, temperature: "", origin: "", grower_note: "",
            sort_order: 100, plant_variants: [], plant_images: [],
          } as PlantWithRelations;
          s.plants.push(p);
        } else Object.assign(p, fields);
        p.updated_at = now();
        const plant = p;
        for (const k of ["s", "m", "l"] as const) {
          const price = r[`price_${k}`];
          if (price === null) continue;
          const size = k.toUpperCase();
          const v = plant.plant_variants.find((x) => x.size === size);
          const data = { price, compare_at: r[`compare_at_${k}`], stock: r[`stock_${k}`] ?? 0, active: r[`active_${k}`] };
          if (v) Object.assign(v, data);
          else plant.plant_variants.push({ id: randomUUID(), plant_id: plant.id, size, low_stock_threshold: 5, sku: skuFor(r.slug, size), ...data });
        }
      }
      return rows.length;
    });
  },
};

function removeUpload(path: string | null) {
  if (!path) return;
  try {
    unlinkSync(join(PREVIEW_UPLOADS, path));
  } catch {
    /* already gone */
  }
}

export const PREVIEW_PEOPLE = PEOPLE;
