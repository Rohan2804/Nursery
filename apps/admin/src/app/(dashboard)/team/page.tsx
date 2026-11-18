import { PageHeader } from "@/components/ui";
import { requireAdmin, ROLE_INFO, type Role } from "@/lib/auth";
import { loadTeam } from "@/lib/data";
import { TeamManager } from "./TeamManager";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const admin = await requireAdmin("owner");
  const members = await loadTeam();
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
      <TeamManager members={members} selfId={admin.id} />
    </>
  );
}
