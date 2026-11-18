"use server";

import { z } from "zod";
import { check, logActivity, publishChanges, run } from "@/lib/actions";
import { assertRole } from "@/lib/auth";
import { plantSchema, type PlantInput } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

const toRow = (p: PlantInput) => ({
  slug: p.slug,
  name: p.name,
  botanical: p.botanical,
  blurb: p.blurb,
  badge: p.badge || null,
  status: p.status,
  light: p.light,
  space: p.space,
  pet_safe: p.petSafe,
  care: p.care,
  natural_size: p.naturalSize,
  featured: p.featured,
  sort_order: p.sortOrder,
  rating: p.rating,
  review_count: p.reviewCount,
  water: p.water,
  water_level: p.waterLevel,
  humidity: p.humidity,
  humidity_level: p.humidityLevel,
  temperature: p.temperature,
  origin: p.origin,
  grower_note: p.growerNote,
  seo_title: p.seoTitle || null,
  seo_description: p.seoDescription || null,
});

/** Create or update a plant and its three sizes. */
export async function savePlant(input: PlantInput) {
  return run(async () => {
    const admin = await assertRole("manager");
    const p = plantSchema.parse(input);
    const supabase = await createClient();

    const saved = p.id
      ? check(await supabase.from("plants").update(toRow(p)).eq("id", p.id).select("id, slug").single())
      : check(await supabase.from("plants").insert(toRow(p)).select("id, slug").single());

    check(
      await supabase.from("plant_variants").upsert(
        p.variants.map((v) => ({
          plant_id: saved.id,
          size: v.size,
          active: v.active,
          price: v.price,
          compare_at: v.compareAt,
          stock: v.stock,
          low_stock_threshold: v.lowStockThreshold,
          sku: v.sku.toUpperCase(),
        })),
        { onConflict: "plant_id,size" },
      ),
    );

    await logActivity(admin, p.id ? "update" : "create", "plant", saved.id, `${p.id ? "Updated" : "Created"} ${p.name} (${p.status})`);
    await publishChanges("/plants", `/plants/${saved.id}`);
    return { id: saved.id as string };
  }, "Saved");
}

export async function setStatus(ids: string[], status: "draft" | "published" | "archived") {
  return run(async () => {
    const admin = await assertRole("manager");
    z.array(z.string().uuid()).min(1).parse(ids);
    const supabase = await createClient();
    const rows = check<{ name: string }[]>(await supabase.from("plants").update({ status }).in("id", ids).select("name"));
    await logActivity(admin, "status", "plant", ids.length === 1 ? ids[0] : null, `Set ${rows.map((r) => r.name).join(", ")} to ${status}`);
    await publishChanges("/plants");
    return { count: rows.length };
  }, `${ids.length} plant${ids.length === 1 ? "" : "s"} set to ${status}`);
}

export async function deletePlant(id: string) {
  return run(async () => {
    const admin = await assertRole("owner");
    const supabase = await createClient();
    const images = check<{ storage_path: string | null }[]>(await supabase.from("plant_images").select("storage_path").eq("plant_id", id));
    const removed = check(await supabase.from("plants").delete().eq("id", id).select("name").single());
    const paths = images.map((i) => i.storage_path).filter((x): x is string => !!x);
    if (paths.length) await supabase.storage.from("plant-images").remove(paths);
    await logActivity(admin, "delete", "plant", id, `Deleted ${removed.name}`);
    await publishChanges("/plants");
  }, "Plant deleted");
}

/* ---------------- images ---------------- */

export async function addImage(plantId: string, url: string, storagePath: string, alt: string) {
  return run(async () => {
    const admin = await assertRole("manager");
    const supabase = await createClient();
    const { count } = await supabase.from("plant_images").select("id", { count: "exact", head: true }).eq("plant_id", plantId);
    const row = check(
      await supabase.from("plant_images").insert({ plant_id: plantId, url, storage_path: storagePath, alt, position: count ?? 0 }).select("*").single(),
    );
    await logActivity(admin, "image", "plant", plantId, `Added a photo to ${alt || "a plant"}`);
    await publishChanges(`/plants/${plantId}`);
    return row;
  });
}

export async function updateImage(id: string, patch: { alt?: string; focalX?: number; focalY?: number }) {
  return run(async () => {
    await assertRole("manager");
    const supabase = await createClient();
    const row = check(
      await supabase
        .from("plant_images")
        .update({
          ...(patch.alt !== undefined && { alt: patch.alt.slice(0, 160) }),
          ...(patch.focalX !== undefined && { focal_x: Math.min(1, Math.max(0, patch.focalX)) }),
          ...(patch.focalY !== undefined && { focal_y: Math.min(1, Math.max(0, patch.focalY)) }),
        })
        .eq("id", id)
        .select("plant_id")
        .single(),
    );
    await publishChanges(`/plants/${row.plant_id}`);
  });
}

export async function reorderImages(plantId: string, ids: string[]) {
  return run(async () => {
    const admin = await assertRole("manager");
    const supabase = await createClient();
    await Promise.all(ids.map((id, position) => supabase.from("plant_images").update({ position }).eq("id", id).eq("plant_id", plantId)));
    await logActivity(admin, "image", "plant", plantId, "Reordered photos");
    await publishChanges(`/plants/${plantId}`);
  });
}

export async function deleteImage(id: string) {
  return run(async () => {
    const admin = await assertRole("manager");
    const supabase = await createClient();
    const row = check(await supabase.from("plant_images").delete().eq("id", id).select("plant_id, storage_path").single());
    if (row.storage_path) await supabase.storage.from("plant-images").remove([row.storage_path]);
    await logActivity(admin, "image", "plant", row.plant_id, "Removed a photo");
    await publishChanges(`/plants/${row.plant_id}`);
  }, "Photo removed");
}
