"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ORDER_STAGES, orderStage, type SavedOrder } from "@/lib/account-store";
import { cn, formatINR, img } from "@/lib/utils";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export function OrderTimeline({ order }: { order: SavedOrder }) {
  const stage = orderStage(order);
  return (
    <div className="rounded-[28px] border border-cream/10 bg-forest-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-sage">Order {order.id}</p>
          <p className="mt-2 font-display text-3xl">{ORDER_STAGES[stage]}</p>
          <p className="mt-1 text-sm text-cream/60">
            {stage === 4 ? "Delivered" : "Arriving"} {fmt(order.deliveryDate)} · {order.slot}
          </p>
        </div>
        <p className="font-display text-3xl">{formatINR(order.total)}</p>
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-5 sm:gap-2">
        {ORDER_STAGES.map((s, i) => (
          <li key={s} className="flex items-center gap-3 sm:flex-col sm:items-start">
            <div className="flex w-full items-center gap-2">
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold", i <= stage ? "bg-lime text-forest-950" : "border border-cream/20 text-cream/40")}>
                {i <= stage ? <Check className="size-3.5" /> : i + 1}
              </span>
              {i < ORDER_STAGES.length - 1 && (
                <span className="relative hidden h-px flex-1 bg-cream/15 sm:block">
                  <motion.span className="absolute inset-y-0 left-0 bg-lime" initial={{ width: 0 }} animate={{ width: i < stage ? "100%" : "0%" }} transition={{ duration: 0.8, delay: i * 0.15 }} />
                </span>
              )}
            </div>
            <span className={cn("text-sm sm:mt-1", i > stage && "text-cream/40")}>{s}</span>
          </li>
        ))}
      </ol>

      <ul className="mt-8 space-y-3 border-t border-cream/10 pt-6">
        {order.lines.map((l) => (
          <li key={`${l.id}-${l.size}-${l.planter}`} className="flex items-center gap-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-forest-800">
              <Image src={img(l.image)} alt={l.name} fill sizes="56px" className="object-cover" />
            </div>
            <Link href={`/plants/${l.id}`} className="flex-1 font-display text-lg hover:text-lime">
              {l.name} <span className="font-sans text-xs text-cream/50">× {l.qty}</span>
            </Link>
            <span className="text-sm">{formatINR(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-cream/50">
        Delivering to {order.name}, {order.address} · Paid by {order.payment}
      </p>
    </div>
  );
}
