import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { repo, type Admin, type Role } from "./repo";

export type { Admin, Role };

const rank: Record<Role, number> = { staff: 1, manager: 2, owner: 3 };
export const can = (admin: Pick<Admin, "role">, min: Role) => rank[admin.role] >= rank[min];

export const ROLE_INFO: Record<Role, { label: string; summary: string }> = {
  staff: { label: "Staff", summary: "View the catalog and update stock" },
  manager: { label: "Manager", summary: "Edit plants, prices, photos and collections" },
  owner: { label: "Owner", summary: "Everything, plus deleting and managing the team" },
};

/** The signed-in, active admin for this request — or null. */
export const getAdmin = cache(async (): Promise<Admin | null> => repo().currentAdmin());

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
