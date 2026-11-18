"use client";

import { Minus, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { Button, EmptyState, Segmented, StatusPill, StockPill } from "@/components/ui";
import { cn } from "@/lib/cn";
import { saveStock } from "./actions";

type Row = { id: string; plantId: string; plant: string; status: "draft" | "published" | "archived"; image?: string; size: string; sku: string; stock: number; threshold: number; price: number };
type Filter = "all" | "low" | "out";

export function InventoryTable({ rows, initialFilter }: { rows: Row[]; initialFilter: Filter }) {
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const value = (r: Row) => edits[r.id] ?? r.stock;
  const changed = rows.filter((r) => edits[r.id] !== undefined && edits[r.id] !== r.stock);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (needle && !`${r.plant} ${r.sku}`.toLowerCase().includes(needle)) return false;
      if (filter === "out") return r.stock === 0;
      if (filter === "low") return r.stock > 0 && r.stock <= r.threshold;
      return true;
    });
  }, [rows, q, filter]);

  const set = (r: Row, n: number) => setEdits((e) => ({ ...e, [r.id]: Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)) }));

  const save = () =>
    start(async () => {
      const res = await saveStock(changed.map((r) => ({ id: r.id, label: `${r.plant} (${r.size})`, from: r.stock, stock: edits[r.id] })));
      if (!res.ok) return toast("error", res.error);
      toast("success", res.message ?? "Saved");
      setEdits({});
      router.refresh();
    });

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
          <input className="input pl-10" placeholder="Search plant or SKU" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search inventory" />
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: `All (${rows.length})` },
            { value: "low", label: `Low (${rows.filter((r) => r.stock > 0 && r.stock <= r.threshold).length})` },
            { value: "out", label: `Sold out (${rows.filter((r) => r.stock === 0).length})` },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <div className="p-6">
          <EmptyState title="Nothing here" body={filter === "all" ? "No sizes match your search." : "Great — nothing in this list right now."} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink/45">
                <th className="py-3 pl-4 font-semibold">Plant</th>
                <th className="py-3 font-semibold">Size</th>
                <th className="py-3 font-semibold">SKU</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">Now</th>
                <th className="py-3 pr-4 font-semibold">New stock</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const dirty = edits[r.id] !== undefined && edits[r.id] !== r.stock;
                return (
                  <tr key={r.id} className={cn("border-b border-line/70 last:border-0", dirty && "bg-lime/20")}>
                    <td className="py-2.5 pl-4">
                      <Link href={`/plants/${r.plantId}`} className="flex items-center gap-3 hover:text-moss">
                        <span className="size-10 shrink-0 overflow-hidden rounded-lg bg-paper">{r.image && <img src={r.image} alt="" className="size-full object-cover" />}</span>
                        <span className="font-semibold">{r.plant}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 font-semibold">{r.size}</td>
                    <td className="py-2.5 font-mono text-xs text-ink/55">{r.sku}</td>
                    <td className="py-2.5">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="py-2.5">
                      <StockPill stock={r.stock} threshold={r.threshold} />
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="inline-flex items-center rounded-xl border border-line bg-paper">
                        <button type="button" aria-label={`Decrease ${r.plant} ${r.size}`} onClick={() => set(r, value(r) - 1)} className="grid size-9 place-items-center text-ink/60 hover:text-ink">
                          <Minus className="size-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          aria-label={`${r.plant} ${r.size} stock`}
                          value={value(r)}
                          onChange={(e) => set(r, Number(e.target.value))}
                          className="w-16 bg-transparent text-center font-semibold tabular-nums focus:outline-none"
                        />
                        <button type="button" aria-label={`Increase ${r.plant} ${r.size}`} onClick={() => set(r, value(r) + 1)} className="grid size-9 place-items-center text-ink/60 hover:text-ink">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {changed.length > 0 && (
        <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur">
          <p className="text-sm">
            <b>{changed.length}</b> unsaved change{changed.length === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEdits({})} disabled={pending}>
              Discard
            </Button>
            <Button onClick={save} loading={pending}>
              Save stock
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
