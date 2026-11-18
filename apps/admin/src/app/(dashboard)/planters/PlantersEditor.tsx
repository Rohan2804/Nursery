"use client";

import type { PlanterRow } from "@vanam/catalog/db";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { Button, Toggle } from "@/components/ui";
import { slugify } from "@/lib/cn";
import { savePlanters } from "./actions";

type P = { id: string; label: string; note: string; price: number; swatch: string; active: boolean; sortOrder: number; isNew?: boolean };

export function PlantersEditor({ rows }: { rows: PlanterRow[] }) {
  const [list, setList] = useState<P[]>(rows.map((r) => ({ id: r.id, label: r.label, note: r.note, price: r.price, swatch: r.swatch, active: r.active, sortOrder: r.sort_order })));
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const set = (i: number, patch: Partial<P>) => setList((l) => l.map((p, n) => (n === i ? { ...p, ...patch } : p)));

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink/45">
              <th className="py-3 pl-4 font-semibold">Swatch</th>
              <th className="py-3 font-semibold">Name</th>
              <th className="py-3 font-semibold">Note</th>
              <th className="py-3 font-semibold">Price (₹)</th>
              <th className="py-3 font-semibold">Order</th>
              <th className="py-3 pr-4 font-semibold">Available</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, i) => (
              <tr key={i} className="border-b border-line/70 last:border-0">
                <td className="py-3 pl-4">
                  <input type="color" aria-label={`${p.label} swatch`} value={p.swatch} onChange={(e) => set(i, { swatch: e.target.value })} className="size-10 cursor-pointer rounded-full border border-line" />
                </td>
                <td className="py-3 pr-3">
                  <input className="input" value={p.label} onChange={(e) => set(i, { label: e.target.value, ...(p.isNew && { id: slugify(e.target.value) }) })} aria-label="Planter name" />
                  <p className="mt-1 font-mono text-[0.65rem] text-ink/40">{p.id || "id"}</p>
                </td>
                <td className="py-3 pr-3">
                  <input className="input" value={p.note} onChange={(e) => set(i, { note: e.target.value })} aria-label="Note" />
                </td>
                <td className="py-3 pr-3">
                  <input className="input w-28" type="number" min={0} value={p.price} onChange={(e) => set(i, { price: Number(e.target.value) })} aria-label="Price" />
                </td>
                <td className="py-3 pr-3">
                  <input className="input w-20" type="number" value={p.sortOrder} onChange={(e) => set(i, { sortOrder: Number(e.target.value) })} aria-label="Order" />
                </td>
                <td className="py-3 pr-4">
                  <Toggle checked={p.active} onChange={(v) => set(i, { active: v })} label={`${p.label} available`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-line p-4">
        <Button variant="secondary" onClick={() => setList((l) => [...l, { id: "", label: "", note: "", price: 0, swatch: "#8a6d4b", active: false, sortOrder: l.length, isNew: true }])}>
          <Plus className="size-4" /> Add planter
        </Button>
        <Button
          loading={pending}
          onClick={() =>
            start(async () => {
              const res = await savePlanters(list.map(({ isNew: _isNew, ...p }) => p));
              if (!res.ok) return toast("error", res.error);
              toast("success", "Planters saved");
              router.refresh();
            })
          }
        >
          Save planters
        </Button>
      </div>
    </div>
  );
}
