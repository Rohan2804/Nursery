"use client";

import { motion } from "framer-motion";
import { CalendarDays, Mail, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Line } from "@/components/providers/CartProvider";
import { site } from "@/lib/site";
import { formatINR, img } from "@/lib/utils";
import { variantLabel } from "@vanam/catalog";
import { useCatalog } from "@/components/providers/CatalogProvider";

const ease = [0.16, 1, 0.3, 1] as const;

type Order = { id: string; lines: Line[]; total: number; name: string; date: Date };

export function OrderPlaced({ order, slotLabel, email }: { order: Order; slotLabel: string; email: string }) {
  const { planters } = useCatalog();
  const date = order.date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="grain relative min-h-[100svh] overflow-hidden bg-forest-950 text-cream">
      <div className="container-x relative flex min-h-[100svh] flex-col items-center justify-center py-24 text-center">
        <Sprout />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 1.4 }}
          className="eyebrow mt-10 text-lime"
        >
          Order {order.id} confirmed
        </motion.p>

        <h1 className="mt-6 font-display text-[clamp(3.4rem,9vw,9rem)] leading-[0.88] tracking-[-0.035em]">
          {["Thank you,", `${order.name || "friend"}.`].map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className={i === 1 ? "block italic text-lime" : "block"}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.2, ease, delay: 1.5 + i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.9 }}
          className="mt-6 max-w-lg text-lg text-cream/70"
        >
          Our growers are lifting your plants from the beds now. They&rsquo;ll be packed by hand and on their way to you soon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 2.1 }}
          className="mt-14 w-full max-w-2xl rounded-[28px] border border-cream/10 bg-forest-900/80 p-6 text-left backdrop-blur sm:p-8"
        >
          <div className="grid gap-4 border-b border-cream/10 pb-6 sm:grid-cols-3">
            <Info icon={CalendarDays} label="Arriving" value={`${date}, ${slotLabel}`} />
            <Info icon={Mail} label="Receipt sent to" value={email} />
            <Info icon={MessageCircle} label="Updates on" value="WhatsApp & SMS" />
          </div>
          <ul className="mt-6 space-y-4">
            {order.lines.map((l) => (
              <li key={l.key} className="flex items-center gap-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-forest-800">
                  <Image src={img(l.product.image)} alt={l.product.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg leading-tight">
                    {l.product.name} <span className="font-sans text-xs text-cream/50">× {l.qty}</span>
                  </p>
                  <p className="text-xs text-cream/50">{variantLabel(l.product, l.size, l.planter, planters)}</p>
                </div>
                <p className="text-sm">{formatINR(l.price * l.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-baseline justify-between border-t border-cream/10 pt-6">
            <span className="text-cream/60">Total paid</span>
            <span className="font-display text-4xl">{formatINR(order.total)}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-14 items-center rounded-full bg-lime px-8 font-semibold text-forest-950 transition-colors hover:bg-cream">
            Continue shopping
          </Link>
          <Link href={`/track-order?id=${order.id}`} className="inline-flex h-14 items-center rounded-full border border-cream/25 px-8 font-semibold transition-colors hover:bg-cream/10">
            Track this order
          </Link>
        </motion.div>
        <p className="mt-10 text-xs text-cream/40">
          Questions? {site.phone} · {site.email}
        </p>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs text-cream/50">
        <Icon className="size-3.5 text-lime" /> {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

/** A seedling that draws itself — stem, then two leaves unfurling. */
function Sprout() {
  const draw = (delay: number, duration = 1) => ({
    pathLength: 1,
    className: "draw-path",
    style: { animationDelay: `${delay}s`, animationDuration: `${duration}s` },
  });
  return (
    <svg viewBox="0 0 120 120" className="size-32 text-lime" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="60" cy="60" r="56" stroke="rgb(236 230 216 / 0.15)" {...draw(0, 1.2)} />
      <path d="M60 96 C60 80 60 66 60 52" {...draw(0.5, 0.6)} />
      <path d="M60 66 C46 66 36 56 34 42 C48 42 58 50 60 66 Z" {...draw(0.9, 0.7)} />
      <path d="M60 56 C64 40 76 32 90 32 C88 48 76 58 60 56 Z" {...draw(1.1, 0.7)} />
      <path d="M42 96 L78 96" stroke="#c9a66b" {...draw(0.3, 0.5)} />
    </svg>
  );
}
