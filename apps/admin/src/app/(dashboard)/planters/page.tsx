import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { loadPlanters } from "@/lib/data";
import { PlantersEditor } from "./PlantersEditor";

export const metadata = { title: "Planters" };

export default async function PlantersPage() {
  await requireAdmin("manager");
  const rows = await loadPlanters();
  return (
    <>
      <PageHeader eyebrow="Pricing" title="Planters" description="The pot options shown on every plant page. The price is added to the plant's size price." />
      <PlantersEditor rows={rows} />
    </>
  );
}
