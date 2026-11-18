"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RevealText, SectionLabel } from "@/components/ui/RevealText";
import type { Product } from "@vanam/catalog";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

const filters: { id: string; label: string; test: (p: Product) => boolean }[] = [
  { id: "all", label: "Bestsellers", test: () => true },
  { id: "low", label: "Low light", test: (p) => p.light.includes("low") },
  { id: "pet", label: "Pet friendly", test: (p) => p.petSafe },
  { id: "easy", label: "Easy care", test: (p) => p.care === 1 },
  { id: "statement", label: "Statement", test: (p) => p.size === "L" || (p.price >= 1800 && p.size !== "S") },
];

export function Bestsellers() {
  const [filter, setFilter] = useState("all");
  const { products } = useCatalog();
  const featured = products.filter((p) => p.featured);
  const active = filters.find((f) => f.id === filter)!;
  const list = (filter === "all" ? featured : products.filter(active.test)).slice(0, 8);

  return (
    <section id="bestsellers" className="container-x py-[clamp(5rem,10vw,9rem)]">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <SectionLabel index="01">The collection</SectionLabel>
          <RevealText
            className="mt-6 font-display text-[clamp(2.8rem,7vw,7rem)] leading-[0.9] tracking-[-0.03em]"
            lines={[
              "Loved by",
              <>
                <em className="text-lime">50,000</em> homes.
              </>,
            ]}
          />
        </div>

        <div className="no-scrollbar -mx-[clamp(1rem,4vw,4rem)] flex gap-2 overflow-x-auto px-[clamp(1rem,4vw,4rem)] lg:mx-0 lg:px-0">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "relative h-11 shrink-0 rounded-full border px-5 text-sm font-semibold transition-colors duration-500",
                filter === f.id ? "border-transparent text-forest-950" : "border-cream/15 text-cream/70 hover:border-cream/40 hover:text-cream",
              )}
            >
              {filter === f.id && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-lime"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
            >
              <ProductCard product={p} priority={i < 4} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="mt-16 flex justify-center">
        <Button href="/plants" variant="ghost">View all {site.varieties.toLocaleString("en-IN")}+ plants</Button>
      </div>
    </section>
  );
}
