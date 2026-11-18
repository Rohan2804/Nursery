import "server-only";
import { SIZES } from "@vanam/catalog";
import { PLANT_SELECT, type CollectionRow, type ImageRow, type PlanterRow, type PlantWithRelations } from "@vanam/catalog/db";
import { env } from "../env";
import { createClient } from "../supabase/server";
import { createServiceClient } from "../supabase/service";
import { collectionRow, plantRow, skuFor, variantRows } from "./shared";
import type { Admin, AuditRow, Member, Repo, Role } from "./types";

/** Throw a readable error from a Supabase response; the schema is untyped so callers name the row type. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function check<R = any>(res: { data: unknown; error: { message: string } | null }): R {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null) throw new Error("Not found, or you don't have access to it.");
  return res.data as R;
}

const tidy = (p: PlantWithRelations): PlantWithRelations => ({
  ...p,
  plant_variants: [...p.plant_variants].sort((a, b) => SIZES.indexOf(a.size as never) - SIZES.indexOf(b.size as never)),
  plant_images: [...p.plant_images].sort((a, b) => a.position - b.position),
});

/** Production storage: Supabase Postgres + Storage, protected by row-level security. */
export const supabaseRepo: Repo = {
  mode: "supabase",

  async currentAdmin() {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return null;
    const { data } = await db.from("admin_users").select("email, full_name, role, active").eq("user_id", user.id).maybeSingle();
    if (!data || !data.active) return null;
    return { id: user.id, email: data.email, name: data.full_name || data.email, role: data.role as Role } satisfies Admin;
  },

  async listPlants() {
    const db = await createClient();
    return check<PlantWithRelations[]>(await db.from("plants").select(PLANT_SELECT).order("sort_order").order("name")).map(tidy);
  },

  async getPlant(id) {
    const db = await createClient();
    const { data, error } = await db.from("plants").select(PLANT_SELECT).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? tidy(data as PlantWithRelations) : null;
  },

  async savePlant(p) {
    const db = await createClient();
    const saved = p.id
      ? check<{ id: string }>(await db.from("plants").update(plantRow(p)).eq("id", p.id).select("id").single())
      : check<{ id: string }>(await db.from("plants").insert(plantRow(p)).select("id").single());
    check(await db.from("plant_variants").upsert(variantRows(saved.id, p), { onConflict: "plant_id,size" }).select("id"));
    return { id: saved.id };
  },

  async setPlantStatus(ids, status) {
    const db = await createClient();
    return check<{ name: string }[]>(await db.from("plants").update({ status }).in("id", ids).select("name")).map((r) => r.name);
  },

  async deletePlant(id) {
    const db = await createClient();
    const images = check<{ storage_path: string | null }[]>(await db.from("plant_images").select("storage_path").eq("plant_id", id));
    const removed = check<{ name: string }>(await db.from("plants").delete().eq("id", id).select("name").single());
    const paths = images.map((i) => i.storage_path).filter((x): x is string => !!x);
    if (paths.length) await db.storage.from("plant-images").remove(paths);
    return removed.name;
  },

  async addImage(plantId, img) {
    const db = await createClient();
    const { count } = await db.from("plant_images").select("id", { count: "exact", head: true }).eq("plant_id", plantId);
    return check<ImageRow>(
      await db.from("plant_images").insert({ plant_id: plantId, url: img.url, storage_path: img.storagePath, alt: img.alt, position: count ?? 0 }).select("*").single(),
    );
  },

  async updateImage(id, patch) {
    const db = await createClient();
    const row = check<{ plant_id: string }>(
      await db
        .from("plant_images")
        .update({
          ...(patch.alt !== undefined && { alt: patch.alt }),
          ...(patch.focalX !== undefined && { focal_x: patch.focalX }),
          ...(patch.focalY !== undefined && { focal_y: patch.focalY }),
        })
        .eq("id", id)
        .select("plant_id")
        .single(),
    );
    return row.plant_id;
  },

  async reorderImages(plantId, ids) {
    const db = await createClient();
    await Promise.all(ids.map((id, position) => db.from("plant_images").update({ position }).eq("id", id).eq("plant_id", plantId)));
  },

  async deleteImage(id) {
    const db = await createClient();
    const row = check<{ plant_id: string; storage_path: string | null }>(await db.from("plant_images").delete().eq("id", id).select("plant_id, storage_path").single());
    if (row.storage_path) await db.storage.from("plant-images").remove([row.storage_path]);
    return row.plant_id;
  },

  async setStock(changes) {
    const db = await createClient();
    for (const c of changes) {
      const { error } = await db.rpc("set_stock", { variant: c.id, new_stock: c.stock });
      if (error) throw new Error(error.message);
    }
  },

  async listCollections() {
    const db = await createClient();
    return check<CollectionRow[]>(await db.from("collections").select("*").order("sort_order"));
  },

  async saveCollection(c) {
    const db = await createClient();
    if (c.originalSlug) check(await db.from("collections").update(collectionRow(c)).eq("slug", c.originalSlug).select("slug").single());
    else check(await db.from("collections").insert(collectionRow(c)).select("slug").single());
  },

  async deleteCollection(slug) {
    const db = await createClient();
    return check<{ title: string }>(await db.from("collections").delete().eq("slug", slug).select("title").single()).title;
  },

  async listPlanters() {
    const db = await createClient();
    return check<PlanterRow[]>(await db.from("planters").select("*").order("sort_order"));
  },

  async savePlanters(list) {
    const db = await createClient();
    check(
      await db
        .from("planters")
        .upsert(list.map((p) => ({ id: p.id, label: p.label, note: p.note, price: p.price, swatch: p.swatch, active: p.active, sort_order: p.sortOrder })))
        .select("id"),
    );
  },

  async listActivity(limit) {
    const db = await createClient();
    return check<AuditRow[]>(await db.from("audit_log").select("*").order("created_at", { ascending: false }).limit(limit));
  },

  async logActivity(admin, e) {
    const db = await createClient();
    await db.from("audit_log").insert({ user_id: admin.id, user_email: admin.email, action: e.action, entity: e.entity, entity_id: e.entityId, summary: e.summary });
  },

  async listTeam() {
    const db = await createClient();
    return check<Member[]>(await db.from("admin_users").select("user_id, email, full_name, role, active, created_at").order("created_at"));
  },

  async inviteMember({ email, name, role }) {
    const service = createServiceClient();
    const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${env.adminUrl}/auth/callback?next=/settings/password`,
      data: { full_name: name },
    });
    if (error) throw new Error(error.message.includes("already") ? "That email already has an account." : error.message);
    check(await service.from("admin_users").upsert({ user_id: data.user.id, email, full_name: name, role, active: true }).select("user_id"));
    return data.user.id;
  },

  async updateMember(userId, patch) {
    const db = await createClient();
    return check<{ email: string }>(await db.from("admin_users").update(patch).eq("user_id", userId).select("email").single()).email;
  },

  async importPlants(rows) {
    const db = await createClient();
    const plants = check<{ id: string; slug: string }[]>(
      await db
        .from("plants")
        .upsert(
          rows.map((r) => ({
            slug: r.slug, name: r.name, botanical: r.botanical, status: r.status, badge: r.badge || null, light: r.light, space: r.space,
            pet_safe: r.pet_safe, care: r.care, natural_size: r.natural_size, featured: r.featured, blurb: r.blurb,
            seo_title: r.seo_title || null, seo_description: r.seo_description || null,
          })),
          { onConflict: "slug" },
        )
        .select("id, slug"),
    );
    const idBySlug = new Map(plants.map((p) => [p.slug, p.id]));
    const existing = check<{ plant_id: string; size: string; sku: string }[]>(await db.from("plant_variants").select("plant_id, size, sku").in("plant_id", [...idBySlug.values()]));
    const variants = rows.flatMap((r) => {
      const pid = idBySlug.get(r.slug)!;
      return (["s", "m", "l"] as const)
        .filter((k) => r[`price_${k}`] !== null)
        .map((k) => ({
          plant_id: pid,
          size: k.toUpperCase(),
          price: r[`price_${k}`]!,
          compare_at: r[`compare_at_${k}`],
          stock: r[`stock_${k}`] ?? 0,
          active: r[`active_${k}`],
          sku: existing.find((e) => e.plant_id === pid && e.size === k.toUpperCase())?.sku ?? skuFor(r.slug, k.toUpperCase()),
        }));
    });
    if (variants.length) check(await db.from("plant_variants").upsert(variants, { onConflict: "plant_id,size" }).select("id"));
    return rows.length;
  },
};
