import type { CollectionRow, ImageRow, PlanterRow, PlantWithRelations } from "@vanam/catalog/db";
import type { ImportRowParsed } from "../import-schema";
import type { CollectionInput, PlantInput } from "../schemas";

export type Role = "staff" | "manager" | "owner";
export type Admin = { id: string; email: string; name: string; role: Role };
export type AuditRow = { id: number; user_email: string | null; action: string; entity: string; entity_id: string | null; summary: string; created_at: string };
export type Member = { user_id: string; email: string; full_name: string; role: Role; active: boolean; created_at: string };
export type PlanterInput = { id: string; label: string; note: string; price: number; swatch: string; active: boolean; sortOrder: number };

/** Persistence for the admin. Validation and role checks happen in the server actions before these are called. */
export interface Repo {
  mode: "supabase" | "preview";
  currentAdmin(): Promise<Admin | null>;

  listPlants(): Promise<PlantWithRelations[]>;
  getPlant(id: string): Promise<PlantWithRelations | null>;
  savePlant(p: PlantInput): Promise<{ id: string }>;
  setPlantStatus(ids: string[], status: "draft" | "published" | "archived"): Promise<string[]>;
  deletePlant(id: string): Promise<string>;

  addImage(plantId: string, img: { url: string; storagePath: string | null; alt: string }): Promise<ImageRow>;
  updateImage(id: string, patch: { alt?: string; focalX?: number; focalY?: number }): Promise<string>;
  reorderImages(plantId: string, ids: string[]): Promise<void>;
  deleteImage(id: string): Promise<string>;

  setStock(changes: { id: string; stock: number }[]): Promise<void>;

  listCollections(): Promise<CollectionRow[]>;
  saveCollection(c: CollectionInput): Promise<void>;
  deleteCollection(slug: string): Promise<string>;

  listPlanters(): Promise<PlanterRow[]>;
  savePlanters(list: PlanterInput[]): Promise<void>;

  listActivity(limit: number): Promise<AuditRow[]>;
  logActivity(admin: Admin, e: { action: string; entity: string; entityId: string | null; summary: string }): Promise<void>;

  listTeam(): Promise<Member[]>;
  inviteMember(m: { email: string; name: string; role: Role }): Promise<string>;
  updateMember(userId: string, patch: { role?: Role; active?: boolean }): Promise<string>;

  importPlants(rows: ImportRowParsed[]): Promise<number>;
}
