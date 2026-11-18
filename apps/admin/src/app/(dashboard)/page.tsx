import { AlertTriangle, ArrowUpRight, Eye, FileEdit, PackageX, Sprout } from "lucide-react";
import Link from "next/link";
import { Card, LinkButton, PageHeader, StockPill } from "@/components/ui";
import { can, requireAdmin } from "@/lib/auth";
import { timeAgo } from "@/lib/cn";
import { loadActivity, loadPlants, thumb } from "@/lib/data";

export const metadata = { title: "Overview" };

export default async function Overview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const admin = await requireAdmin();
  const { denied } = await searchParams;
  const [plants, activity] = await Promise.all([loadPlants(), loadActivity(8)]);

  const variants = plants.flatMap((p) => p.plant_variants.filter((v) => v.active).map((v) => ({ ...v, plant: p })));
  const soldOut = variants.filter((v) => v.stock === 0);
  const low = variants.filter((v) => v.stock > 0 && v.stock <= v.low_stock_threshold);
  const stats = [
    { label: "Live on store", value: plants.filter((p) => p.status === "published").length, icon: Eye, href: "/plants?status=published" },
    { label: "Drafts", value: plants.filter((p) => p.status === "draft").length, icon: FileEdit, href: "/plants?status=draft" },
    { label: "Low stock sizes", value: low.length, icon: AlertTriangle, href: "/inventory?filter=low" },
    { label: "Sold-out sizes", value: soldOut.length, icon: PackageX, href: "/inventory?filter=out" },
  ];
  const attention = [...soldOut, ...low].slice(0, 8);
  const hour = new Date().getHours();

  return (
    <>
      {denied && <p className="mb-6 rounded-2xl bg-brass/15 px-5 py-3 text-sm">That page needs a higher access level. Ask an owner if you need it.</p>}
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        title={
          <>
            Good {hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, <em className="text-moss">{admin.name.split(" ")[0]}.</em>
          </>
        }
        actions={
          can(admin, "manager") && (
            <LinkButton href="/plants/new">
              <Sprout className="size-4" /> Add a plant
            </LinkButton>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card group p-6 transition-colors hover:border-forest-700/30">
            <div className="flex items-center justify-between">
              <Icon className="size-5 text-moss" />
              <ArrowUpRight className="size-4 text-ink/30 transition-transform group-hover:rotate-45" />
            </div>
            <p className="mt-6 font-display text-5xl leading-none tabular-nums">{value}</p>
            <p className="mt-2 text-sm text-ink/55">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Needs attention" description="Sizes that are sold out or at their low-stock threshold." actions={<LinkButton href="/inventory" variant="secondary">Inventory</LinkButton>}>
          {attention.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/50">Everything is well stocked. 🌿</p>
          ) : (
            <ul className="divide-y divide-line">
              {attention.map((v) => (
                <li key={v.id} className="flex items-center gap-4 py-3">
                  <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-paper">
                    {thumb(v.plant) && <img src={thumb(v.plant)} alt="" className="size-full object-cover" />}
                  </div>
                  <Link href={`/plants/${v.plant.id}`} className="min-w-0 flex-1 hover:text-moss">
                    <p className="truncate font-semibold">{v.plant.name}</p>
                    <p className="text-xs text-ink/50">
                      Size {v.size} · {v.sku}
                    </p>
                  </Link>
                  <StockPill stock={v.stock} threshold={v.low_stock_threshold} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent activity" actions={<LinkButton href="/activity" variant="secondary">All</LinkButton>}>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/50">No changes yet.</p>
          ) : (
            <ul className="space-y-4">
              {activity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p>{a.summary}</p>
                  <p className="mt-0.5 text-xs text-ink/45">
                    {a.user_email} · {timeAgo(a.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
