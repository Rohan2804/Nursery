import { productsInCollection } from "@vanam/catalog";
import { toCollection, toProduct } from "@vanam/catalog/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import { LinkButton, PageHeader, StatusPill } from "@/components/ui";
import { can, requireAdmin } from "@/lib/auth";
import { loadCollections, loadPlants } from "@/lib/data";

export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const admin = await requireAdmin();
  const [rows, plants] = await Promise.all([loadCollections(), loadPlants()]);
  const live = plants.filter((p) => p.status === "published").map(toProduct);
  const groups = ["Type", "Room", "Light", "Need"] as const;

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Collections"
        description="Landing pages like 'Low light plants' or 'Balcony plants'. Membership updates automatically from rules."
        actions={
          can(admin, "manager") && (
            <LinkButton href="/collections/new">
              <Plus className="size-4" /> New collection
            </LinkButton>
          )
        }
      />
      <div className="space-y-8">
        {groups.map((g) => {
          const list = rows.filter((r) => r.grp === g);
          if (!list.length) return null;
          return (
            <section key={g}>
              <h2 className="eyebrow mb-3 text-ink/50">By {g.toLowerCase()}</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((r) => {
                  const c = toCollection(r);
                  const count = productsInCollection(live, c).length;
                  return (
                    <Link key={r.slug} href={`/collections/${r.slug}`} className="card group flex gap-4 p-3 transition-colors hover:border-forest-700/30">
                      <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-paper">{r.image_url && <img src={r.image_url} alt="" className="size-full object-cover" />}</div>
                      <div className="min-w-0 py-1">
                        <p className="truncate font-display text-xl leading-tight group-hover:text-moss">{r.title}</p>
                        <p className="mt-1 text-xs text-ink/50">/collections/{r.slug}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <StatusPill status={r.status} />
                          <span className="text-xs font-semibold text-ink/60">{count} plants</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
