"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity, run } from "@/lib/actions";
import { ActionError, assertRole } from "@/lib/auth";
import { repo } from "@/lib/repo";

const role = z.enum(["staff", "manager", "owner"]);

export async function inviteMember(input: { email: string; name: string; role: string }) {
  return run(async () => {
    const admin = await assertRole("owner");
    const m = z.object({ email: z.string().trim().toLowerCase().email(), name: z.string().trim().min(2), role }).parse(input);
    const id = await repo().inviteMember(m);
    await logActivity(admin, "create", "team", id, `Invited ${m.name} (${m.email}) as ${m.role}`);
    revalidatePath("/team");
  }, `Invitation sent to ${input.email}`);
}

export async function updateMember(userId: string, patch: { role?: string; active?: boolean }) {
  return run(async () => {
    const admin = await assertRole("owner");
    const p = z.object({ role: role.optional(), active: z.boolean().optional() }).parse(patch);
    if (userId === admin.id) throw new ActionError("You can't change your own role or access — ask another owner.");
    const owners = (await repo().listTeam()).filter((m) => m.role === "owner" && m.active);
    const losingOwner = (p.role !== undefined && p.role !== "owner") || p.active === false;
    if (losingOwner && owners.length <= 1 && owners[0]?.user_id === userId) throw new ActionError("There must always be at least one active owner.");
    const email = await repo().updateMember(userId, p);
    const what = [p.role && `role → ${p.role}`, p.active !== undefined && (p.active ? "access restored" : "access removed")].filter(Boolean).join(", ");
    await logActivity(admin, "update", "team", userId, `${email}: ${what}`);
    revalidatePath("/team");
  }, "Team updated");
}
