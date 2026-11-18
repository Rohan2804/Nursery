import { PageHeader } from "@/components/ui";
import { requireAdmin, ROLE_INFO, type Role } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TeamManager } from "./TeamManager";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const admin = await requireAdmin("owner");
  const supabase = await createClient();
  const { data } = await supabase.from("admin_users").select("user_id, email, full_name, role, active, created_at").order("created_at");
  return (
    <>
      <PageHeader eyebrow="Access" title="Team" description="Invite people and choose what they can do. Everyone signs in with their own email and password." />
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {(Object.keys(ROLE_INFO) as Role[]).map((r) => (
          <div key={r} className="card p-5">
            <p className="font-display text-2xl">{ROLE_INFO[r].label}</p>
            <p className="mt-1 text-sm text-ink/55">{ROLE_INFO[r].summary}</p>
          </div>
        ))}
      </div>
      <TeamManager members={(data ?? []) as { user_id: string; email: string; full_name: string; role: Role; active: boolean; created_at: string }[]} selfId={admin.id} />
    </>
  );
}
