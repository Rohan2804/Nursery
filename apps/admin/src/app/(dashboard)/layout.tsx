import { Sidebar } from "@/components/shell/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { isPreview } from "@/lib/repo";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <ToastProvider>
      <div className="lg:flex">
        <Sidebar admin={admin} storefrontUrl={env.storefrontUrl} />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
          {isPreview() && (
            <p className="mx-auto mb-6 max-w-7xl rounded-2xl border border-brass/40 bg-brass/10 px-5 py-3 text-sm">
              <b>Local preview</b> — changes are saved to <code>apps/admin/.preview/catalog.json</code> and show on the storefront at localhost:3000. Connect Supabase (docs/ADMIN_SETUP.md) for real accounts and data.
            </p>
          )}
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
