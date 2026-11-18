import "server-only";
import { isConfigured } from "../env";
import { previewRepo } from "./preview";
import { supabaseRepo } from "./supabase";
import type { Repo } from "./types";

/** Local preview runs only on a developer machine with no Supabase keys — never in production. */
export const isPreview = () => !isConfigured() && process.env.NODE_ENV !== "production";

export function repo(): Repo {
  return isPreview() ? previewRepo : supabaseRepo;
}

export type * from "./types";
