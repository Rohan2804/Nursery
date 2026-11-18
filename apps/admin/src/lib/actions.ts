import "server-only";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { ActionError, type Admin } from "./auth";
import { env } from "./env";
import { createClient } from "./supabase/server";

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

/** Wraps a server action body: consistent errors, and validation messages people can read. */
export async function run<T>(fn: () => Promise<T>, message?: string): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data, message };
  } catch (err) {
    if (err instanceof ZodError) {
      const first = err.issues[0];
      return { ok: false, error: `${first.path.join(" › ") || "Form"}: ${first.message}` };
    }
    if (err instanceof ActionError) return { ok: false, error: err.message };
    const msg = (err as { message?: string })?.message ?? "Something went wrong";
    if (msg.includes("duplicate key")) return { ok: false, error: "That slug or SKU is already used by another item." };
    if (msg.includes("row-level security") || msg.includes("not authorised")) return { ok: false, error: "You don't have permission to do that." };
    console.error("[admin action]", err);
    return { ok: false, error: msg };
  }
}

/** Append to the activity log (who did what, when). */
export async function logActivity(admin: Admin, action: string, entity: string, entityId: string | null, summary: string) {
  const supabase = await createClient();
  await supabase.from("audit_log").insert({ user_id: admin.id, user_email: admin.email, action, entity, entity_id: entityId, summary });
}

/** Refresh admin pages and tell the storefront to rebuild its cached catalog. */
export async function publishChanges(...paths: string[]) {
  for (const p of paths) revalidatePath(p);
  revalidatePath("/");
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;
  try {
    await fetch(`${env.storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    console.warn("[admin] storefront revalidate failed (it will refresh within 5 minutes):", (err as Error).message);
  }
}

/** Throw a readable error from a Supabase response; returns the data (typed by the caller, untyped schema). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function check<R = any>(res: { data: unknown; error: { message: string } | null }): R {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null) throw new Error("Not found, or you don't have access to it.");
  return res.data as R;
}
