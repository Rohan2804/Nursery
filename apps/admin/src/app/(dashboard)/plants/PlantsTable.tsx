"use client";

import type { PlantWithRelations } from "@vanam/catalog/db";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { Button, EmptyState, Segmented, StatusPill, StockPill } from "@/components/ui";
import { cn, formatINR } from "@/lib/cn";
import { setStatus } from "./actions";

type Filter = "all" | "published" | "draft" | "archived" | "attention";

export function PlantsTable({ plants, canEdit, initialStatus, initialQuery }: { plants: PlantWithRelations[]; canEdit: boolean; initialStatus: string; initialQuery: string }) {
  const [q, setQ] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>((["all", "published", "draft", "archived", "attention"].includes(initialStatus) ? initialStatus : "all") as Filter);
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return plants.filter((p) => {
      if (needle && !`${p.name} ${p.botanical} ${p.slug} ${p.plant_variants.map((v) => v.sku).join(" ")}`.toLowerCase().includes(needle)) return false;
      if (filter === "attention") return p.plant_variants.some((v) => v.active && v.stock <= v.low_stock_threshold);
      return filter === "all" || p.status === filter;
    });
  }, [plants, q, filter]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const bulk = (status: "draft" | "published" | "archived") =>
    start(async () => {
      const res = await setStatus(selected, status);
      if (res.ok) {
        toast("success", res.message ?? "Updated");
        setSelected([]);
        router.refresh();
      } else toast("error", res.error);
    });

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
          <input className="input pl-10" placeholder="Search name, botanical name, slug or SKU" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search plants" />
        </div>
        <div className="overflow-x-auto">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "published", label: "Live" },
              { value: "draft", label: "Drafts" },
              { value: "archived", label: "Archived" },
              { value: "attention", label: "Low stock" },
            ]}
          />
        </div>
      </div>

      {canEdit && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-lime/30 px-4 py-2.5 text-sm">
          <b>{selected.length} selected</b>
          <span className="mx-2 h-4 w-px bg-ink/15" />
          <Button variant="secondary" className="h-8 px-3" loading={pending} onClick={() => bulk("published")}>Publish</Button>
          <Button variant="secondary" className="h-8 px-3" loading={pending} onClick={() => bulk("draft")}>Unpublish</Button>
          <Button variant="secondary" className="h-8 px-3" loading={pending} onClick={() => bulk("archived")}>Archive</Button>
          <button className="ml-auto text-xs font-semibold text-ink/60 hover:text-ink" onClick={() => setSelected([])}>Clear</button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState title="No plants found" body="Try a different search or filter." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink/45">
                {canEdit && (
                  <th className="w-10 py-3 pl-4">
                    <input type="checkbox" aria-label="Select all" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))} className="size-4 accent-forest-950" />
                  </th>
                )}
                <th className="py-3 pl-4 font-semibold">Plant</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">Price</th>
                <th className="py-3 font-semibold">Stock S · M · L</th>
                <th className="py-3 pr-4 text-right font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const active = p.plant_variants.filter((v) => v.active);
                const prices = active.map((v) => v.price);
                const isSel = selected.includes(p.id);
                return (
                  <tr key={p.id} className={cn("border-b border-line/70 transition-colors last:border-0 hover:bg-paper", isSel && "bg-lime/15")}>
                    {canEdit && (
                      <td className="py-3 pl-4">
                        <input
                          type="checkbox"
                          aria-label={`Select ${p.name}`}
                          checked={isSel}
                          onChange={() => setSelected(isSel ? selected.filter((x) => x !== p.id) : [...selected, p.id])}
                          className="size-4 accent-forest-950"
                        />
                      </td>
                    )}
                    <td className="py-3 pl-4">
                      <Link href={`/plants/${p.id}`} className="group flex items-center gap-3">
                        <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-paper">
                          {p.plant_images[0] && <img src={p.plant_images[0].url} alt="" className="size-full object-cover" style={{ objectPosition: `${p.plant_images[0].focal_x * 100}% ${p.plant_images[0].focal_y * 100}%` }} />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold group-hover:text-moss">
                            {p.name} {p.featured && <span className="ml-1 rounded bg-brass/25 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase">Featured</span>}
                          </p>
                          <p className="truncate text-xs italic text-ink/50">{p.botanical || p.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="py-3 tabular-nums">
                      {prices.length ? (Math.min(...prices) === Math.max(...prices) ? formatINR(prices[0]) : `${formatINR(Math.min(...prices))} – ${formatINR(Math.max(...prices))}`) : "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1.5">
                        {p.plant_variants.map((v) =>
                          v.active ? <StockPill key={v.id} stock={v.stock} threshold={v.low_stock_threshold} /> : <span key={v.id} className="inline-flex min-w-12 justify-center rounded-full px-2 py-1 text-xs text-ink/30">—</span>,
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right text-xs text-ink/50">{p.updated_at ? new Date(p.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
