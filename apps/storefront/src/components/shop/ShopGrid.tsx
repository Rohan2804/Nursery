"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { Product } from "@vanam/catalog";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; test: (p: Product) => boolean };
type Group = { key: string; label: string; options: Option[] };

const GROUPS: Group[] = [
  {
    key: "type",
    label: "Type",
    options: [
      { value: "indoor", label: "Indoor", test: (p) => !p.space.every((s) => s === "outdoor") },
      { value: "outdoor", label: "Outdoor", test: (p) => p.space.includes("outdoor") || p.light.includes("sun") },
    ],
  },
  {
    key: "light",
    label: "Light",
    options: [
      { value: "low", label: "Low light", test: (p) => p.light.includes("low") },
      { value: "medium", label: "Soft & indirect", test: (p) => p.light.includes("medium") },
      { value: "bright", label: "Bright indirect", test: (p) => p.light.includes("bright") },
      { value: "sun", label: "Full sun", test: (p) => p.light.includes("sun") },
    ],
  },
  {
    key: "space",
    label: "Placement",
    options: [
      { value: "desk", label: "Tabletop", test: (p) => p.space.includes("desk") },
      { value: "floor", label: "Floor", test: (p) => p.space.includes("floor") },
      { value: "hanging", label: "Hanging", test: (p) => p.space.includes("hanging") },
      { value: "outdoor", label: "Garden & balcony", test: (p) => p.space.includes("outdoor") },
    ],
  },
  {
    key: "care",
    label: "Care level",
    options: [
      { value: "1", label: "Easy", test: (p) => p.care === 1 },
      { value: "2", label: "Moderate", test: (p) => p.care === 2 },
      { value: "3", label: "Expert", test: (p) => p.care === 3 },
    ],
  },
  {
    key: "price",
    label: "Price",
    options: [
      { value: "u750", label: "Under ₹750", test: (p) => p.price < 750 },
      { value: "750-1500", label: "₹750 – ₹1,500", test: (p) => p.price >= 750 && p.price <= 1500 },
      { value: "1500-2500", label: "₹1,500 – ₹2,500", test: (p) => p.price > 1500 && p.price <= 2500 },
      { value: "o2500", label: "Above ₹2,500", test: (p) => p.price > 2500 },
    ],
  },
  {
    key: "size",
    label: "Plant size",
    options: [
      { value: "S", label: "Small", test: (p) => p.size === "S" },
      { value: "M", label: "Medium", test: (p) => p.size === "M" },
      { value: "L", label: "Large", test: (p) => p.size === "L" },
    ],
  },
];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
] as const;

function sortProducts(list: Product[], sort: string) {
  const out = [...list];
  if (sort === "rating") out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
  if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

const matchesQuery = (p: Product, q: string) => {
  const hay = `${p.name} ${p.botanical} ${p.blurb} ${p.badge ?? ""}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
};

/** Filterable product grid. Filter state lives in the URL so views are shareable and crawlable. */
export function ShopGrid({ products, hideGroups = [] }: { products: Product[]; hideGroups?: string[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const [drawer, setDrawer] = useState(false);
  const groups = GROUPS.filter((g) => !hideGroups.includes(g.key));

  const selected = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const sort = params.get("sort") ?? "featured";
  const q = params.get("q") ?? "";
  const pet = params.get("pet") === "1";
  const [query, setQuery] = useState(q);

  useEffect(() => setQuery(q), [q]);

  const update = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const toggle = (key: string, value: string) =>
    update((p) => {
      const cur = new Set(p.get(key)?.split(",").filter(Boolean));
      if (cur.has(value)) cur.delete(value);
      else cur.add(value);
      if (cur.size) p.set(key, [...cur].join(","));
      else p.delete(key);
    });

  // Debounce the search box into the URL.
  useEffect(() => {
    if (query === q) return;
    const t = setTimeout(() => update((p) => (query.trim() ? p.set("q", query.trim()) : p.delete("q"))), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (drawer) lenis?.stop();
    else lenis?.start();
  }, [drawer, lenis]);

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      groups.every((g) => {
        const vals = selected(g.key);
        return vals.length === 0 || g.options.some((o) => vals.includes(o.value) && o.test(p));
      }),
    );
    if (pet) list = list.filter((p) => p.petSafe);
    if (q) list = list.filter((p) => matchesQuery(p, q));
    return sortProducts(list, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, params]);

  const chips = [
    ...groups.flatMap((g) => selected(g.key).map((v) => ({ key: g.key, value: v, label: g.options.find((o) => o.value === v)?.label ?? v }))),
    ...(pet ? [{ key: "pet", value: "1", label: "Pet safe" }] : []),
    ...(q ? [{ key: "q", value: q, label: `“${q}”` }] : []),
  ];
  const clearAll = () => update((p) => ["q", "pet", ...GROUPS.map((g) => g.key)].forEach((k) => p.delete(k)));

  const filters = (
    <div className="space-y-8">
      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-cream/10 p-4">
        <span className="text-sm font-semibold">Pet safe only</span>
        <span className={cn("relative h-6 w-11 rounded-full transition-colors", pet ? "bg-lime" : "bg-cream/15")}>
          <input type="checkbox" className="sr-only" checked={pet} onChange={() => update((p) => (pet ? p.delete("pet") : p.set("pet", "1")))} />
          <span className={cn("absolute top-1 size-4 rounded-full bg-forest-950 transition-all", pet ? "left-6" : "left-1 bg-cream")} />
        </span>
      </label>
      {groups.map((g) => (
        <FilterGroup key={g.key} title={g.label}>
          <div className="flex flex-wrap gap-2">
            {g.options.map((o) => {
              const on = selected(g.key).includes(o.value);
              const count = products.filter(o.test).length;
              return (
                <button
                  key={o.value}
                  onClick={() => toggle(g.key, o.value)}
                  aria-pressed={on}
                  disabled={!count && !on}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-30",
                    on ? "border-lime bg-lime font-semibold text-forest-950" : "border-cream/15 text-cream/80 hover:border-cream/40",
                  )}
                >
                  {o.label} <span className={on ? "text-forest-950/60" : "text-cream/40"}>{count}</span>
                </button>
              );
            })}
          </div>
        </FilterGroup>
      ))}
    </div>
  );

  return (
    <div className="container-x pb-24">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 -mx-[clamp(1rem,4vw,4rem)] mb-10 border-b border-cream/10 bg-forest-950/85 px-[clamp(1rem,4vw,4rem)] py-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cream/40" />
            <label htmlFor="shop-search" className="sr-only">
              Search plants
            </label>
            <input
              id="shop-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or botanical name"
              className="h-12 w-full rounded-full border border-cream/15 bg-cream/[0.04] pl-11 pr-4 text-sm placeholder:text-cream/40 focus:border-lime focus:outline-none"
            />
          </div>
          <button
            onClick={() => setDrawer(true)}
            className="flex h-12 items-center gap-2 rounded-full border border-cream/15 px-5 text-sm font-semibold lg:hidden"
          >
            <SlidersHorizontal className="size-4" /> Filters {chips.length > 0 && <span className="rounded-full bg-lime px-2 text-xs text-forest-950">{chips.length}</span>}
          </button>
          <p className="ml-auto text-sm text-cream/60" aria-live="polite">
            <b className="text-cream">{filtered.length}</b> {filtered.length === 1 ? "plant" : "plants"}
          </p>
          <div className="relative">
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => update((p) => (e.target.value === "featured" ? p.delete("sort") : p.set("sort", e.target.value)))}
              className="h-12 appearance-none rounded-full border border-cream/15 bg-forest-950 pl-5 pr-11 text-sm font-semibold focus:border-lime focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2" />
          </div>
        </div>
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.key + c.value}
                onClick={() => (c.key === "q" ? update((p) => p.delete("q")) : c.key === "pet" ? update((p) => p.delete("pet")) : toggle(c.key, c.value))}
                className="flex items-center gap-1.5 rounded-full bg-cream/10 py-1.5 pl-3 pr-2 text-xs font-semibold hover:bg-cream/20"
              >
                {c.label} <X className="size-3.5" />
              </button>
            ))}
            <button onClick={clearAll} className="text-xs font-semibold text-lime underline-offset-4 hover:underline">
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-44">{filters}</div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center rounded-[28px] border border-cream/10 px-6 py-24 text-center">
              <p className="font-display text-4xl">No plants match — yet.</p>
              <p className="mt-3 max-w-sm text-cream/60">Try removing a filter, or ask our plant doctors on WhatsApp for a recommendation.</p>
              <button onClick={clearAll} className="mt-8 h-12 rounded-full bg-lime px-6 text-sm font-bold text-forest-950">
                Clear filters
              </button>
            </div>
          ) : (
            <motion.ul layout className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.04 }}
                  >
                    <ProductCard product={p} priority={i < 3} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.div className="absolute inset-0 bg-forest-950/70 backdrop-blur-sm" onClick={() => setDrawer(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-[28px] bg-forest-900"
            >
              <div className="flex items-center justify-between px-6 py-5">
                <p className="font-display text-3xl">Filters</p>
                <button onClick={() => setDrawer(false)} aria-label="Close filters" className="grid size-10 place-items-center rounded-full border border-cream/15">
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-6" data-lenis-prevent>
                {filters}
              </div>
              <div className="flex gap-3 border-t border-cream/10 p-4">
                <button onClick={clearAll} className="h-14 flex-1 rounded-full border border-cream/20 font-semibold">
                  Clear
                </button>
                <button onClick={() => setDrawer(false)} className="h-14 flex-[2] rounded-full bg-lime font-bold text-forest-950">
                  Show {filtered.length} plants
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-4 text-sage">{title}</legend>
      {children}
    </fieldset>
  );
}
