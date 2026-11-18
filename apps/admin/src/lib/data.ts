import "server-only";
import type { PlantWithRelations } from "@vanam/catalog/db";
import { repo } from "./repo";

export type { AuditRow } from "./repo";

export const loadPlants = () => repo().listPlants();
export const loadPlant = (id: string) => repo().getPlant(id);
export const loadCollections = () => repo().listCollections();
export const loadPlanters = () => repo().listPlanters();
export const loadActivity = (limit = 50) => repo().listActivity(limit);
export const loadTeam = () => repo().listTeam();

/** First image URL for thumbnails. */
export const thumb = (p: PlantWithRelations) => p.plant_images[0]?.url;
