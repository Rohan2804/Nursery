"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { guides } from "@/lib/guides";
import { formatINR, img } from "@/lib/utils";

const POPULAR = ["Monstera", "Low light", "Pet friendly", "Snake plant", "Orchid", "Balcony"];

const score = (text: string, q: string) => {
  const t = text.toLowerCase();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.every((w) => t.includes(w))) return 0;
  return t.startsWith(words[0]) ? 2 : 1;
};

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const lenis = useLenis();
  const { products, collections } = useCatalog();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const t = setTimeout(() => input.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, lenis]);

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return null;
    return {
      plants: products
        .map((p) => ({ p, s: score(`${p.name} ${p.botanical} ${p.badge ?? ""}`, query) }))
        .filter((x) => x.s)
        .sort((a, b) => b.s - a.s)
        .slice(0, 5)
        .map((x) => x.p),
      collections: collections.filter((c) => score(`${c.title} ${c.short}`, query)).slice(0, 3),
      guides: guides.filter((g) => score(g.title, query)).slice(0, 2),
    };
  }, [q, products, collections]);

  const go = (href: string) => {
    onClose();
    setQ("");
    router.push(href);
  };

  const empty = results && !results.plants.length && !results.collections.length && !results.guides.length;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search">
          <motion.div className="absolute inset-0 bg-forest-950/70 backdrop-blur-md" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-0 max-h-[90svh] overflow-y-auto rounded-b-[32px] bg-forest-900"
            data-lenis-prevent
          >
            <div className="container-x py-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (q.trim()) go(`/plants?q=${encodeURIComponent(q.trim())}`);
                }}
                className="flex items-center gap-4 border-b border-cream/15 pb-6"
              >
                <Search className="size-7 shrink-0 text-lime" />
                <label htmlFor="site-search" className="sr-only">
                  Search plants, collections and guides
                </label>
                <input
                  ref={input}
                  id="site-search"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search plants, rooms, care guides…"
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent font-display text-[clamp(1.8rem,4vw,3.4rem)] placeholder:text-cream/30 focus:outline-none"
                />
                <button type="button" onClick={onClose} aria-label="Close search" className="grid size-12 shrink-0 place-items-center rounded-full border border-cream/15 transition-transform hover:rotate-90">
                  <X className="size-5" />
                </button>
              </form>

              {!results && (
                <div className="py-8">
                  <p className="eyebrow text-sage">Popular searches</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {POPULAR.map((p) => (
                      <button key={p} onClick={() => setQ(p)} className="rounded-full border border-cream/15 px-4 py-2 text-sm hover:border-lime hover:text-lime">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {empty && (
                <p className="py-10 text-cream/60">
                  No matches for &ldquo;{q}&rdquo;. Try a plant name, a room, or{" "}
                  <button onClick={() => go("/#finder")} className="text-lime underline underline-offset-4">
                    take the plant finder quiz
                  </button>
                  .
                </p>
              )}

              {results && !empty && (
                <div className="grid gap-10 py-8 lg:grid-cols-[1.4fr_1fr]">
                  <div>
                    <p className="eyebrow text-sage">Plants</p>
                    <ul className="mt-4 space-y-1">
                      {results.plants.map((p) => (
                        <li key={p.id}>
                          <Link href={`/plants/${p.id}`} onClick={onClose} className="group flex items-center gap-4 rounded-2xl p-2 hover:bg-cream/5">
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-forest-800">
                              <Image src={img(p.image)} alt="" fill sizes="56px" className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-xl group-hover:text-lime">{p.name}</p>
                              <p className="text-xs italic text-cream/50">{p.botanical}</p>
                            </div>
                            <span className="text-sm">{formatINR(p.price)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {results.plants.length > 0 && (
                      <button onClick={() => go(`/plants?q=${encodeURIComponent(q.trim())}`)} className="mt-4 flex items-center gap-2 text-sm font-semibold text-lime">
                        See all results <ArrowRight className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-8">
                    {results.collections.length > 0 && (
                      <div>
                        <p className="eyebrow text-sage">Collections</p>
                        <ul className="mt-4 space-y-2">
                          {results.collections.map((c) => (
                            <li key={c.slug}>
                              <Link href={`/collections/${c.slug}`} onClick={onClose} className="font-display text-2xl hover:text-lime">
                                {c.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {results.guides.length > 0 && (
                      <div>
                        <p className="eyebrow text-sage">Care guides</p>
                        <ul className="mt-4 space-y-3">
                          {results.guides.map((g) => (
                            <li key={g.slug}>
                              <Link href={`/care-guides/${g.slug}`} onClick={onClose} className="flex items-start gap-3 hover:text-lime">
                                <BookOpen className="mt-1 size-4 shrink-0 text-lime" /> {g.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
