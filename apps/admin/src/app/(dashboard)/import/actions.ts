"use server";

import { z } from "zod";
import { check, logActivity, publishChanges, run } from "@/lib/actions";
import { assertRole } from "@/lib/auth";
import { rowSchema, type ImportRow } from "@/lib/import-schema";
import { createClient } from "@/lib/supabase/server";

/** Upsert plants by slug, then their three sizes. Care details and photos are left untouched. */
export async function importPlants(input: ImportRow[]) {
  return run(async () => {
    const admin = await assertRole("manager");
    const rows = z.array(rowSchema).min(1).max(1000).parse(input);
    const supabase = await createClient();

    const plants = check<{ id: string; slug: string }[]>(
      await supabase
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
    const existing = check<{ plant_id: string; size: string; sku: string }[]>(
      await supabase.from("plant_variants").select("plant_id, size, sku").in("plant_id", [...idBySlug.values()]),
    );
    const skuOf = (pid: string, size: string, slug: string) => existing.find((e) => e.plant_id === pid && e.size === size)?.sku ?? `VN-${slug.toUpperCase().slice(0, 18)}-${size}`;

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
          sku: skuOf(pid, k.toUpperCase(), r.slug),
        }));
    });
    if (variants.length) check(await supabase.from("plant_variants").upsert(variants, { onConflict: "plant_id,size" }).select("id"));

    await logActivity(admin, "import", "plant", null, `Imported ${rows.length} plants from CSV`);
    await publishChanges("/plants", "/inventory");
    return { count: rows.length };
  }, `Imported ${input.length} plants`);
}
