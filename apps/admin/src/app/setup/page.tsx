import { isConfigured } from "@/lib/env";
import { isPreview } from "@/lib/repo";
import { redirect } from "next/navigation";

export const metadata = { title: "Setup" };

/** Shown until Supabase keys are configured. */
export default function SetupPage() {
  if (isConfigured() || isPreview()) redirect("/");
  return (
    <main className="grid min-h-svh place-items-center bg-forest-950 p-6 text-cream">
      <div className="max-w-xl">
        <p className="eyebrow text-lime">Vanam Admin · Setup</p>
        <h1 className="mt-4 font-display text-6xl leading-none">Connect your database</h1>
        <p className="mt-6 text-cream/70">The admin needs a Supabase project. Follow <b>docs/ADMIN_SETUP.md</b> in the repo:</p>
        <ol className="mt-6 space-y-3 text-sm text-cream/80">
          <li>1. Create a Supabase project.</li>
          <li>2. Copy <code className="rounded bg-cream/10 px-1.5">apps/admin/.env.example</code> to <code className="rounded bg-cream/10 px-1.5">.env.local</code> and fill in the keys.</li>
          <li>3. Run <code className="rounded bg-cream/10 px-1.5">npm run db:setup</code>, then <code className="rounded bg-cream/10 px-1.5">npm run admin:create-owner</code>.</li>
          <li>4. Restart <code className="rounded bg-cream/10 px-1.5">npm run dev:admin</code>.</li>
        </ol>
      </div>
    </main>
  );
}
