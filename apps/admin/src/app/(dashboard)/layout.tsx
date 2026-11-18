import { Sidebar } from "@/components/shell/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <ToastProvider>
      <div className="lg:flex">
        <Sidebar admin={admin} storefrontUrl={env.storefrontUrl} />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
