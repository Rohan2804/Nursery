import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Catalog } from "@vanam/catalog";
import { PLANT_SELECT, toCatalog, type CollectionRow, type PlanterRow, type PlantWithRelations } from "@vanam/catalog/db";
import { staticCatalog } from "@vanam/catalog/seed";
import { unstable_cache } from "next/cache";

export const CATALOG_TAG = "catalog";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function fetchFromSupabase(): Promise<Catalog> {
  const supabase = createClient(url!, key!, { auth: { persistSession: false } });
  // Row-level security limits anonymous reads to published plants and collections.
  const [plants, planters, collections] = await Promise.all([
    supabase.from("plants").select(PLANT_SELECT).eq("status", "published"),
    supabase.from("planters").select("*").eq("active", true),
    supabase.from("collections").select("*").eq("status", "published"),
  ]);
  const error = plants.error ?? planters.error ?? collections.error;
  if (error) throw new Error(`Catalog fetch failed: ${error.message}`);
  return toCatalog(plants.data as PlantWithRelations[], planters.data as PlanterRow[], collections.data as CollectionRow[]);
}

const cachedCatalog = unstable_cache(fetchFromSupabase, ["catalog-v1"], { tags: [CATALOG_TAG], revalidate: 300 });

/**
 * The live catalog. Reads Supabase when configured (cached, refreshed instantly when the admin
 * calls /api/revalidate); otherwise serves the built-in catalog so the site always works.
 */
export async function getCatalog(): Promise<Catalog> {
  if (!url || !key) return publishedOnly(staticCatalog);
  try {
    return await cachedCatalog();
  } catch (err) {
    console.error("[catalog] falling back to built-in catalog:", err);
    return publishedOnly(staticCatalog);
  }
}

const publishedOnly = (c: Catalog): Catalog => ({
  ...c,
  products: c.products.filter((p) => p.status === "published"),
  collections: c.collections.filter((x) => x.status === "published"),
});
