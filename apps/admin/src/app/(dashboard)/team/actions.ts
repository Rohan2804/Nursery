"use server";

import { z } from "zod";
import { check, logActivity, run } from "@/lib/actions";
import { assertRole } from "@/lib/auth";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

const role = z.enum(["staff", "manager", "owner"]);

export async function inviteMember(input: { email: string; name: string; role: string }) {
  return run(async () => {
    const admin = await assertRole("owner");
    const { email, name, role: r } = z.object({ email: z.string().trim().toLowerCase().email(), name: z.string().trim().min(2), role }).parse(input);
    const service = createServiceClient();
    const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${env.adminUrl}/auth/callback?next=/settings/password`,
      data: { full_name: name },
    });
    if (error) throw new Error(error.message.includes("already") ? "That email already has an account." : error.message);
    check(await service.from("admin_users").upsert({ user_id: data.user.id, email, full_name: name, role: r, active: true }).select("user_id"));
    await logActivity(admin, "create", "team", data.user.id, `Invited ${name} (${email}) as ${r}`);
    revalidatePath("/team");
  }, `Invitation sent to ${input.email}`);
}

export async function updateMember(userId: string, patch: { role?: string; active?: boolean }) {
  return run(async () => {
    const admin = await assertRole("owner");
    const p = z.object({ role: role.optional(), active: z.boolean().optional() }).parse(patch);
    if (userId === admin.id) throw new Error("You can't change your own role or access — ask another owner.");
    const supabase = await createClient();
    if (p.role !== undefined && p.role !== "owner") {
      const owners = check<{ user_id: string }[]>(await supabase.from("admin_users").select("user_id").eq("role", "owner").eq("active", true));
      if (owners.length <= 1 && owners[0]?.user_id === userId) throw new Error("There must always be at least one owner.");
    }
    const row = check<{ email: string }>(await supabase.from("admin_users").update(p).eq("user_id", userId).select("email").single());
    await logActivity(admin, "update", "team", userId, `${row.email}: ${p.role ? `role → ${p.role}` : ""}${p.active !== undefined ? (p.active ? "access restored" : "access removed") : ""}`);
    revalidatePath("/team");
  }, "Team updated");
}
