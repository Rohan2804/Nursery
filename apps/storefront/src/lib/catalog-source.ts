import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Catalog } from "@vanam/catalog";
import { PLANT_SELECT, toCatalog, type CollectionRow, type PlanterRow, type PlantWithRelations } from "@vanam/catalog/db";
import { staticCatalog } from "@vanam/catalog/seed";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
  if (!url || !key) return publishedOnly(readPreviewCatalog() ?? staticCatalog);
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

/**
 * Local development only: when the admin runs in preview mode (no Supabase), it saves the catalog to
 * apps/admin/.preview/catalog.json. Reading it here lets you test admin → storefront end to end.
 */
function readPreviewCatalog(): Catalog | null {
  if (process.env.NODE_ENV === "production") return null;
  const file = process.env.PREVIEW_CATALOG_FILE ?? join(process.cwd(), "../admin/.preview/catalog.json");
  if (!existsSync(file)) return null;
  try {
    const s = JSON.parse(readFileSync(file, "utf8")) as { plants: PlantWithRelations[]; planters: PlanterRow[]; collections: CollectionRow[] };
    return { ...toCatalog(s.plants, s.planters, s.collections), source: "static" };
  } catch (err) {
    console.warn("[catalog] could not read the admin preview file:", (err as Error).message);
    return null;
  }
}
