import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "./supabase/server";

export type Role = "staff" | "manager" | "owner";
export type Admin = { id: string; email: string; name: string; role: Role };

const rank: Record<Role, number> = { staff: 1, manager: 2, owner: 3 };
export const can = (admin: Pick<Admin, "role">, min: Role) => rank[admin.role] >= rank[min];

export const ROLE_INFO: Record<Role, { label: string; summary: string }> = {
  staff: { label: "Staff", summary: "View the catalog and update stock" },
  manager: { label: "Manager", summary: "Edit plants, prices, photos and collections" },
  owner: { label: "Owner", summary: "Everything, plus deleting and managing the team" },
};

/** The signed-in, active admin for this request — or null. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("admin_users").select("email, full_name, role, active").eq("user_id", user.id).maybeSingle();
  if (!data || !data.active) return null;
  return { id: user.id, email: data.email, name: data.full_name || data.email, role: data.role as Role };
});

/** Use in pages: redirects to login, or to the dashboard if the role is too low. */
export async function requireAdmin(min: Role = "staff"): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/login?error=not-authorised");
  if (!can(admin, min)) redirect("/?denied=1");
  return admin;
}

/** Use in server actions: throws instead of redirecting so the UI can show the message. */
export async function assertRole(min: Role): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) throw new ActionError("Your session has expired. Please sign in again.");
  if (!can(admin, min)) throw new ActionError(`This needs ${ROLE_INFO[min].label} access.`);
  return admin;
}

export class ActionError extends Error {}
