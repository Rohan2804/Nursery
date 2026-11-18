"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useLenis } from "@/components/providers/SmoothScroll";
import { site } from "@/lib/site";
import { formatINR, img } from "@/lib/utils";
import { variantLabel } from "@/lib/variants";

export function CartDrawer() {
  const { isOpen, close, lines, subtotal, setQty, remove, count } = useCart();
  const lenis = useLenis();
  const remaining = Math.max(0, site.freeDeliveryAbove - subtotal);
  const progress = Math.min(1, subtotal / site.freeDeliveryAbove);

  useEffect(() => {
    if (isOpen) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, lenis, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping bag">
          <motion.div
            className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-bone text-forest-950 sm:inset-y-3 sm:right-3 sm:rounded-3xl"
            initial={{ x: "105%" }}
            animate={{ x: "0%" }}
            exit={{ x: "105%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-7 pb-4 pt-7">
              <h2 className="font-display text-4xl">
                Your bag <sup className="font-sans text-sm font-semibold text-moss">({count})</sup>
              </h2>
              <button
                onClick={close}
                aria-label="Close bag"
                className="grid size-11 place-items-center rounded-full border border-forest-950/10 transition-transform duration-500 hover:rotate-90"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mx-7 rounded-2xl bg-forest-950/[0.05] p-4">
              <p className="flex items-center gap-2 text-sm">
                <Truck className="size-4 text-moss" />
                {remaining > 0 ? (
                  <span>
                    Add <b>{formatINR(remaining)}</b> more for free delivery
                  </span>
                ) : (
                  <span>
                    <b>Free delivery</b> unlocked — packed fresh from the nursery
                  </span>
                )}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-forest-950/10">
                <motion.div
                  className="h-full rounded-full bg-moss"
                  initial={false}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-5" data-lenis-prevent>
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="size-10 text-moss" strokeWidth={1.2} />
                  <p className="mt-4 font-display text-3xl">Your bag is empty</p>
                  <p className="mt-2 max-w-60 text-sm text-forest-950/60">Every great jungle starts with a single leaf.</p>
                </div>
              ) : (
                <ul className="space-y-5">
                  <AnimatePresence initial={false}>
                    {lines.map(({ key, product, qty, price, size, planter }) => (
                      <motion.li
                        key={key}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex gap-4"
                      >
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-forest-950/5">
                          <Image src={img(product.image)} alt={product.name} fill sizes="96px" className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link href={`/plants/${product.id}`} onClick={close} className="font-display text-xl leading-tight hover:text-moss">
                                {product.name}
                              </Link>
                              <p className="mt-0.5 text-xs text-forest-950/55">{variantLabel(product, size, planter)}</p>
                            </div>
                            <p className="font-semibold">{formatINR(price * qty)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-forest-950/15">
                              <button aria-label="Decrease quantity" onClick={() => setQty(key, qty - 1)} className="grid size-9 place-items-center">
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                              <button aria-label="Increase quantity" onClick={() => setQty(key, qty + 1)} className="grid size-9 place-items-center">
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <button onClick={() => remove(key)} className="text-xs font-medium text-forest-950/50 underline-offset-4 hover:underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-forest-950/10 px-7 pb-7 pt-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-forest-950/60">Subtotal</span>
                  <span className="font-display text-3xl">{formatINR(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-forest-950/50">Taxes included. Delivery slot chosen at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="group relative mt-5 flex h-14 w-full items-center justify-center overflow-hidden rounded-full bg-forest-950 font-semibold text-cream"
                >
                  <span className="absolute inset-0 translate-y-full bg-forest-700 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                  <span className="relative">Checkout securely</span>
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
