import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { loadPlants } from "@/lib/data";
import { InventoryTable } from "./InventoryTable";

export const metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireAdmin();
  const [plants, { filter }] = await Promise.all([loadPlants(), searchParams]);
  const rows = plants.flatMap((p) =>
    p.plant_variants
      .filter((v) => v.active)
      .map((v) => ({ id: v.id, plantId: p.id, plant: p.name, status: p.status, image: p.plant_images[0]?.url, size: v.size, sku: v.sku, stock: v.stock, threshold: v.low_stock_threshold, price: v.price })),
  );
  const units = rows.reduce((n, r) => n + r.stock, 0);
  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Inventory"
        description={`${rows.length} sizes on sale · ${units.toLocaleString("en-IN")} plants in stock. Sold-out sizes are greyed out on the storefront automatically.`}
      />
      <InventoryTable rows={rows} initialFilter={filter === "low" || filter === "out" ? filter : "all"} />
    </>
  );
}
