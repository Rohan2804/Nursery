"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Check, ChevronDown, Heart, MapPin, MessageCircle, Minus, PawPrint, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { defaultSize, sizeOptions, unitPrice, type PlantDetails, type Product, type SizeId } from "@vanam/catalog";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { lightCopy } from "@/lib/content";
import { site } from "@/lib/site";
import { cn, formatINR } from "@/lib/utils";
import { Gallery, type Shot } from "./Gallery";

const ease = [0.16, 1, 0.3, 1] as const;

export function ProductView({ product, details, shots }: { product: Product; details: PlantDetails; shots: Shot[] }) {
  const { add, wishlist, toggleWish } = useCart();
  const { planters } = useCatalog();
  const [size, setSize] = useState<SizeId>(defaultSize(product));
  const [planter, setPlanter] = useState<string>(planters[0]?.id ?? "grow");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const buyVisible = useInView(buyRef, { margin: "0px 0px -40px 0px" });

  const sizes = sizeOptions(product);
  const price = unitPrice(product, size, planter, planters);
  const wished = wishlist.includes(product.id);
  const planterInfo = planters.find((p) => p.id === planter) ?? { id: "grow", label: "Nursery pot", note: "", price: 0, swatch: "#1f2a22" };
  const chosen = sizes.find((s) => s.id === size);
  const stock = chosen?.stock ?? 0;
  const soldOut = stock === 0;
  const lowStock = !soldOut && chosen && stock <= chosen.lowStockThreshold;

  const addToBag = () => {
    add(product, { size, planter, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      <section className="container-x pb-20 pt-28 lg:pt-36">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-cream/50">
          <Link href="/" className="hover:text-lime">
            Home
          </Link>
          <span>/</span>
          <Link href="/plants" className="hover:text-lime">
            Plants
          </Link>
          <span>/</span>
          <span className="text-cream/80">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="-mx-[clamp(1rem,4vw,4rem)] overflow-hidden lg:mx-0">
            <Gallery shots={shots} />
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease }}>
              <div className="flex flex-wrap items-center gap-2">
                {product.badge && (
                  <span className="rounded-full bg-lime px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-forest-950">{product.badge}</span>
                )}
                {product.petSafe && (
                  <span className="flex items-center gap-1.5 rounded-full border border-lime/40 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-lime">
                    <PawPrint className="size-3" /> Pet safe
                  </span>
                )}
                <a href="#reviews" className="ml-auto flex items-center gap-1.5 text-sm text-cream/70 hover:text-cream">
                  <Star className="size-4 fill-brass text-brass" />
                  <b className="text-cream">{product.rating}</b>
                  <span className="underline underline-offset-4">{product.reviews} reviews</span>
                </a>
              </div>

              <h1 className="mt-6 font-display text-[clamp(3rem,5.5vw,5.4rem)] leading-[0.9] tracking-[-0.03em]">{product.name}</h1>
              <p className="mt-3 font-display text-xl italic text-sage">{product.botanical}</p>

              <div className="mt-6 flex items-baseline gap-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={price}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="font-display text-4xl"
                  >
                    {formatINR(price)}
                  </motion.span>
                </AnimatePresence>
                {chosen?.compareAt && (
                  <span className="text-lg text-cream/40 line-through">{formatINR(chosen.compareAt + planterInfo.price)}</span>
                )}
                <span className="text-xs text-cream/50">incl. of all taxes</span>
              </div>

              <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-cream/75">{product.blurb}</p>

              {/* Size */}
              <fieldset className="mt-10">
                <legend className="eyebrow flex w-full justify-between text-sage">
                  <span>Size</span>
                  <span className="normal-case tracking-normal text-cream/50">Height incl. pot</span>
                </legend>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSize(s.id);
                        setQty((q) => Math.max(1, Math.min(q, s.stock)));
                      }}
                      aria-pressed={size === s.id}
                      className={cn(
                        "relative rounded-2xl border p-4 text-left transition-colors duration-300",
                        size === s.id ? "border-lime bg-lime/[0.08]" : "border-cream/15 hover:border-cream/40",
                        s.stock === 0 && "opacity-50",
                      )}
                    >
                      {size === s.id && (
                        <motion.span layoutId="size-ring" className="absolute inset-0 rounded-2xl ring-1 ring-lime" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                      )}
                      <span className="block text-sm font-bold">{s.label}</span>
                      <span className="mt-1 block text-xs text-cream/55">{s.height}</span>
                      <span className="mt-3 block text-sm text-cream/85">{s.stock === 0 ? <span className="text-cream/50 line-through">{formatINR(s.price)}</span> : formatINR(s.price)}</span>
                      {s.stock === 0 && <span className="mt-1 block text-[0.68rem] font-bold uppercase tracking-wider text-[#e0714a]">Sold out</span>}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Planter */}
              <fieldset className="mt-8">
                <legend className="eyebrow flex w-full justify-between text-sage">
                  <span>Planter</span>
                  <span className="normal-case tracking-normal text-cream/70">
                    {planterInfo.label} {planterInfo.price > 0 && <span className="text-cream/50">+{formatINR(planterInfo.price)}</span>}
                  </span>
                </legend>
                <div className="mt-4 flex items-center gap-3">
                  {planters.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlanter(p.id)}
                      aria-label={`${p.label}${p.price ? `, add ${formatINR(p.price)}` : ""}`}
                      aria-pressed={planter === p.id}
                      className={cn(
                        "grid size-12 place-items-center rounded-full border-2 transition-all duration-300",
                        planter === p.id ? "border-lime" : "border-transparent hover:border-cream/30",
                      )}
                    >
                      <span className="size-9 rounded-full border border-cream/20 shadow-inner" style={{ background: p.swatch }} />
                    </button>
                  ))}
                  <p className="ml-2 text-xs text-cream/50">{planterInfo.note}</p>
                </div>
              </fieldset>

              {/* Buy */}
              <div ref={buyRef} className="mt-10 flex gap-3">
                <div className="flex h-16 items-center rounded-full border border-cream/20">
                  <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-full w-12 place-items-center">
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center font-semibold tabular-nums">{qty}</span>
                  <button aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(stock, q + 1))} disabled={qty >= stock} className="grid h-full w-12 place-items-center disabled:opacity-30">
                    <Plus className="size-4" />
                  </button>
                </div>
                <AddButton onClick={addToBag} added={added} total={price * qty} disabled={soldOut} />
                <button
                  onClick={() => toggleWish(product.id)}
                  aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                  aria-pressed={wished}
                  className="grid size-16 shrink-0 place-items-center rounded-full border border-cream/20 transition-colors hover:border-cream/50"
                >
                  <Heart className={cn("size-5", wished && "fill-[#e0714a] text-[#e0714a]")} />
                </button>
              </div>

              {(soldOut || lowStock) && (
                <p className={cn("mt-3 text-sm font-semibold", soldOut ? "text-[#e0714a]" : "text-brass")}>
                  {soldOut ? "This size is sold out — try another size, or check back soon." : `Only ${stock} left in this size`}
                </p>
              )}

              <PincodeCheck />

              <ul className="mt-8 grid gap-3 border-t border-cream/10 pt-8 text-sm text-cream/75 sm:grid-cols-2">
                <li className="flex items-center gap-3">
                  <Truck className="size-4 shrink-0 text-lime" /> Free delivery above {formatINR(site.freeDeliveryAbove)}
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="size-4 shrink-0 text-lime" /> 30-day happiness guarantee
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="size-4 shrink-0 text-lime" /> Plant doctor on WhatsApp
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-lime" /> Nursery-grown, never warehoused
                </li>
              </ul>

              <div className="mt-8 border-t border-cream/10">
                <Accordion title="Care in brief" defaultOpen>
                  <dl className="grid grid-cols-[110px_1fr] gap-y-3 text-sm">
                    <dt className="text-cream/50">Light</dt>
                    <dd>{product.light.map((l) => lightCopy[l].label).join(" · ")}</dd>
                    <dt className="text-cream/50">Water</dt>
                    <dd>{details.water}</dd>
                    <dt className="text-cream/50">Humidity</dt>
                    <dd>{details.humidity}</dd>
                    <dt className="text-cream/50">Temperature</dt>
                    <dd>{details.temperature}</dd>
                    <dt className="text-cream/50">Pets</dt>
                    <dd>{product.petSafe ? "Non-toxic to cats and dogs" : "Keep away from curious pets — mildly toxic if chewed"}</dd>
                  </dl>
                </Accordion>
                <Accordion title="What arrives at your door">
                  <ul className="space-y-2 text-sm text-cream/75">
                    <li>— Your plant, lifted from our beds the day it ships</li>
                    <li>— Planter of your choice, with drainage</li>
                    <li>— Hand-written care card from your grower</li>
                    <li>— Organic potting mix top-up sachet</li>
                  </ul>
                </Accordion>
                <Accordion title="Delivery & returns">
                  <p className="text-sm leading-relaxed text-cream/75">
                    Delivered in plastic-free crates with moisture-locked roots. Same-day delivery in our home city, 2–5 days across India. If your
                    plant struggles in its first 30 days, send us a photo and we&rsquo;ll replace it — no forms, no fuss.
                  </p>
                </Accordion>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile sticky bar once the main button scrolls away */}
      <AnimatePresence>
        {!buyVisible && (
          <motion.div
            initial={{ y: "120%" }}
            animate={{ y: 0 }}
            exit={{ y: "120%" }}
            transition={{ duration: 0.6, ease }}
            className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-full border border-cream/10 bg-forest-900/90 p-2 pl-5 backdrop-blur-xl lg:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg leading-tight">{product.name}</p>
              <p className="text-xs text-cream/60">{formatINR(price)}</p>
            </div>
            <button onClick={addToBag} disabled={soldOut} className="h-12 rounded-full bg-lime px-6 text-sm font-bold text-forest-950 disabled:bg-cream/15 disabled:text-cream/50">
              {soldOut ? "Sold out" : added ? "Added ✓" : "Add to bag"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AddButton({ onClick, added, total, disabled }: { onClick: () => void; added: boolean; total: number; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative flex h-16 flex-1 items-center justify-between overflow-hidden rounded-full bg-lime pl-7 pr-2 font-bold text-forest-950 disabled:cursor-not-allowed disabled:bg-cream/15 disabled:text-cream/50"
    >
      {!disabled && (
        <span className="absolute inset-0 translate-y-full bg-cream transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={added ? "added" : "add"}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative flex items-center gap-2"
        >
          {disabled ? (
            "Sold out"
          ) : added ? (
            <>
              <Check className="size-4" /> Added to bag
            </>
          ) : (
            "Add to bag"
          )}
        </motion.span>
      </AnimatePresence>
      <span className="relative rounded-full bg-forest-950 px-4 py-3 text-sm text-lime">{formatINR(total)}</span>
    </button>
  );
}

function Accordion({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-cream/10">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-5 text-left">
        <span className="font-display text-2xl">{title}</span>
        <ChevronDown className={cn("size-5 transition-transform duration-500", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="overflow-hidden"
          >
            <div className="pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Metro pincode prefixes get faster delivery. Estimate only — replace with courier API later.
const FAST_PREFIXES = ["11", "40", "41", "56", "60", "70", "50", "38", "12", "20"];

function PincodeCheck() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setResult("Please enter a valid 6-digit pincode");
      return;
    }
    const days = FAST_PREFIXES.includes(pin.slice(0, 2)) ? 2 : 4;
    const date = new Date();
    date.setDate(date.getDate() + days);
    setResult(`Arrives by ${date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}`);
  };

  return (
    <form onSubmit={check} className="mt-6 flex items-center gap-3 rounded-2xl bg-cream/[0.04] p-2 pl-4">
      <MapPin className="size-4 shrink-0 text-sage" />
      <label htmlFor="pincode" className="sr-only">
        Delivery pincode
      </label>
      <input
        id="pincode"
        inputMode="numeric"
        maxLength={6}
        value={pin}
        onChange={(e) => {
          setPin(e.target.value.replace(/\D/g, ""));
          setResult(null);
        }}
        placeholder="Enter pincode for delivery date"
        className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-cream/40 focus:outline-none"
      />
      {result ? (
        <span className={cn("shrink-0 pr-3 text-sm font-semibold", result.startsWith("Arrives") ? "text-lime" : "text-[#e0714a]")}>{result}</span>
      ) : (
        <button type="submit" className="h-10 shrink-0 rounded-xl bg-cream/10 px-4 text-sm font-semibold hover:bg-cream/20">
          Check
        </button>
      )}
    </form>
  );
}
