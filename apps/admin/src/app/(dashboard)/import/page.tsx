import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { loadPlants } from "@/lib/data";
import { Importer } from "./Importer";

export const metadata = { title: "Import / export" };

export default async function ImportPage() {
  await requireAdmin("manager");
  const slugs = (await loadPlants()).map((p) => p.slug);
  return (
    <>
      <PageHeader
        eyebrow="Bulk editing"
        title="Import / export"
        description="Export the catalog, edit prices and stock in Excel or Google Sheets, then import it back. Plants are matched by slug."
      />
      <Importer existingSlugs={slugs} />
    </>
  );
}
