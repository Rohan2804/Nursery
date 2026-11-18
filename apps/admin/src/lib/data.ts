import "server-only";
import { PLANT_SELECT, type CollectionRow, type PlanterRow, type PlantWithRelations } from "@vanam/catalog/db";
import { SIZES } from "@vanam/catalog";
import { createClient } from "./supabase/server";

export type AuditRow = { id: number; user_email: string | null; action: string; entity: string; entity_id: string | null; summary: string; created_at: string };

const sortVariants = (p: PlantWithRelations): PlantWithRelations => ({
  ...p,
  plant_variants: [...p.plant_variants].sort((a, b) => SIZES.indexOf(a.size as never) - SIZES.indexOf(b.size as never)),
  plant_images: [...p.plant_images].sort((a, b) => a.position - b.position),
});

export async function loadPlants() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("plants").select(PLANT_SELECT).order("sort_order").order("name");
  if (error) throw new Error(error.message);
  return (data as PlantWithRelations[]).map(sortVariants);
}

export async function loadPlant(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("plants").select(PLANT_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? sortVariants(data as PlantWithRelations) : null;
}

export async function loadCollections() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("collections").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data as CollectionRow[];
}

export async function loadPlanters() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("planters").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data as PlanterRow[];
}

export async function loadActivity(limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return data as AuditRow[];
}

/** First image URL for thumbnails. */
export const thumb = (p: PlantWithRelations) => p.plant_images[0]?.url;
