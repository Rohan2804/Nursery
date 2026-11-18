"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import { SectionLabel } from "@/components/ui/RevealText";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

// SAMPLE REVIEWS — placeholders for layout only. Replace with real customer reviews from your store backend.
const sample = [
  { name: "Ananya R.", city: "Bengaluru", rating: 5, title: "Arrived greener than the photos", body: "Packed beautifully, not a single leaf bruised. Three weeks in and it's already pushing a new leaf." },
  { name: "Karan M.", city: "Pune", rating: 5, title: "The care card is a lovely touch", body: "Hand-written note from the grower and a WhatsApp number that actually replies. Feels like buying from a friend." },
  { name: "Meera S.", city: "Mumbai", rating: 4, title: "Healthy, well-rooted plant", body: "Slightly smaller than I imagined in the medium size, but very healthy and well settled in its pot." },
];

export function Reviews({ product }: { product: Product }) {
  // Illustrative distribution derived from the average rating.
  const five = Math.round((product.rating - 4) * 100 * 0.9);
  const dist = [five, 100 - five - 6, 4, 1, 1];

  return (
    <section id="reviews" className="container-x border-t border-cream/10 py-[clamp(5rem,9vw,8rem)]">
      <div className="grid gap-14 lg:grid-cols-[320px_1fr]">
        <div>
          <SectionLabel index="02">Reviews</SectionLabel>
          <p className="mt-8 font-display text-8xl leading-none">{product.rating}</p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={cn("size-5", i < Math.round(product.rating) ? "fill-brass text-brass" : "text-cream/20")} />
            ))}
          </div>
          <p className="mt-2 text-sm text-cream/60">Based on {product.reviews} reviews</p>
          <div className="mt-8 space-y-2">
            {dist.map((pct, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-cream/60">
                <span className="w-3">{5 - i}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream/10">
                  <motion.div
                    className="h-full rounded-full bg-lime"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                  />
                </div>
                <span className="w-8 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {sample.map((r, i) => (
            <motion.article
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              className="flex flex-col rounded-[24px] border border-cream/10 bg-forest-900 p-7"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} className={cn("size-3.5", k < r.rating ? "fill-brass text-brass" : "text-cream/20")} />
                ))}
              </div>
              <h3 className="mt-5 font-display text-2xl leading-tight">{r.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-cream/70">{r.body}</p>
              <p className="mt-6 flex items-center gap-2 text-xs text-cream/50">
                <BadgeCheck className="size-4 text-lime" />
                <span className="font-semibold text-cream/80">{r.name}</span> · {r.city}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
