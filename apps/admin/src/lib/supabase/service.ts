import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

/**
 * Privileged client using the secret key. Bypasses row-level security — only use it for
 * operations the owner has already been authorised for (team invites and role changes).
 */
export function createServiceClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set — required for team management.");
  return createClient(env.supabaseUrl, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
