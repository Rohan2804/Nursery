import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { timeAgo } from "@/lib/cn";
import { loadActivity } from "@/lib/data";

export const metadata = { title: "Activity" };

const tone: Record<string, string> = { delete: "bg-danger", create: "bg-moss", stock: "bg-brass", status: "bg-forest-700" };

export default async function ActivityPage() {
  await requireAdmin();
  const rows = await loadActivity(200);
  return (
    <>
      <PageHeader eyebrow="Audit trail" title="Activity" description="Every change made in the admin, newest first." />
      <div className="card p-2">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-ink/50">No activity yet.</p>
        ) : (
          <ol>
            {rows.map((a) => (
              <li key={a.id} className="flex items-start gap-4 rounded-xl px-4 py-3 hover:bg-paper">
                <span className={`mt-2 size-2 shrink-0 rounded-full ${tone[a.action] ?? "bg-ink/30"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{a.summary}</p>
                  <p className="mt-0.5 text-xs text-ink/45">
                    {a.user_email ?? "Unknown"} · {a.entity}
                  </p>
                </div>
                <time dateTime={a.created_at} title={new Date(a.created_at).toLocaleString("en-IN")} className="shrink-0 text-xs text-ink/45">
                  {timeAgo(a.created_at)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
