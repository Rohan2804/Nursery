import { Download, Plus } from "lucide-react";
import { LinkButton, PageHeader } from "@/components/ui";
import { can, requireAdmin } from "@/lib/auth";
import { loadPlants } from "@/lib/data";
import { PlantsTable } from "./PlantsTable";

export const metadata = { title: "Plants" };

export default async function PlantsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const admin = await requireAdmin();
  const [plants, sp] = await Promise.all([loadPlants(), searchParams]);
  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Plants"
        description={`${plants.length} plants · ${plants.filter((p) => p.status === "published").length} live on the storefront`}
        actions={
          <>
            {can(admin, "manager") && (
              <LinkButton href="/api/export/plants" variant="secondary" prefetch={false}>
                <Download className="size-4" /> Export CSV
              </LinkButton>
            )}
            {can(admin, "manager") && (
              <LinkButton href="/plants/new">
                <Plus className="size-4" /> Add plant
              </LinkButton>
            )}
          </>
        }
      />
      <PlantsTable plants={plants} canEdit={can(admin, "manager")} initialStatus={sp.status ?? "all"} initialQuery={sp.q ?? ""} />
    </>
  );
}
