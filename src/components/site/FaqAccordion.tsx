"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Faq } from "@/lib/faqs";
import { cn } from "@/lib/utils";

export function FaqAccordion({ items, light }: { items: Faq[]; light?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className={cn("border-t", light ? "border-forest-950/15" : "border-cream/10")}>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q} className={cn("border-b", light ? "border-forest-950/15" : "border-cream/10")}>
            <h3>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight">{f.q}</span>
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500",
                    isOpen ? "rotate-45 border-transparent bg-lime text-forest-950" : light ? "border-forest-950/20" : "border-cream/20",
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className={cn("max-w-3xl pb-7 leading-relaxed", light ? "text-forest-950/70" : "text-cream/70")}>{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
