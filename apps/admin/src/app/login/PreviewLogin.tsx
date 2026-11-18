import { ArrowRight } from "lucide-react";
import { previewSignIn } from "./actions";

const ROLES = [
  { role: "owner", title: "Owner", body: "Everything, including deleting plants and managing the team." },
  { role: "manager", title: "Manager", body: "Edit plants, prices, photos, collections and planters." },
  { role: "staff", title: "Staff", body: "View the catalog and update stock only." },
];

/** Local preview sign-in: pick a role to see the admin as that person would. */
export function PreviewLogin({ next }: { next: string }) {
  return (
    <div>
      <p className="eyebrow text-moss">Local preview</p>
      <h2 className="mt-2 font-display text-4xl">Sign in as…</h2>
      <p className="mt-2 text-sm text-ink/60">Supabase isn&rsquo;t connected yet, so changes are saved to a local file and passwords aren&rsquo;t needed. Try each role to see what it can do.</p>
      <div className="mt-6 space-y-3">
        {ROLES.map((r) => (
          <form key={r.role} action={previewSignIn}>
            <input type="hidden" name="role" value={r.role} />
            <input type="hidden" name="next" value={next} />
            <button className="card group flex w-full items-center gap-4 p-4 text-left transition-colors hover:border-forest-700/40">
              <span className="flex-1">
                <span className="block font-display text-2xl">{r.title}</span>
                <span className="text-sm text-ink/55">{r.body}</span>
              </span>
              <ArrowRight className="size-5 text-moss transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        ))}
      </div>
      <p className="mt-6 text-xs text-ink/45">To use real accounts, follow docs/ADMIN_SETUP.md.</p>
    </div>
  );
}
