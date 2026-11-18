"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { findOrder, type SavedOrder } from "@/lib/account-store";
import { site } from "@/lib/site";
import { OrderTimeline } from "./OrderTimeline";

export function TrackOrder() {
  const params = useSearchParams();
  const [id, setId] = useState(params.get("id") ?? "");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<SavedOrder | null | "missing">(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(findOrder(id, phone) ?? "missing");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={submit} className="grid gap-3 rounded-[28px] border border-cream/10 p-4 sm:grid-cols-[1fr_1fr_auto]">
        <label className="sr-only" htmlFor="order-id">
          Order number
        </label>
        <input
          id="order-id"
          required
          value={id}
          onChange={(e) => setId(e.target.value.toUpperCase())}
          placeholder="Order number (VN-XXXXX)"
          className="h-14 rounded-2xl bg-cream/[0.05] px-5 text-sm uppercase placeholder:normal-case placeholder:text-cream/40 focus:outline focus:outline-lime"
        />
        <label className="sr-only" htmlFor="order-phone">
          Mobile number used at checkout
        </label>
        <input
          id="order-phone"
          required
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          placeholder="Mobile number"
          className="h-14 rounded-2xl bg-cream/[0.05] px-5 text-sm placeholder:text-cream/40 focus:outline focus:outline-lime"
        />
        <button className="h-14 rounded-2xl bg-lime px-8 text-sm font-bold text-forest-950 transition-colors hover:bg-cream">Track</button>
      </form>

      <AnimatePresence mode="wait">
        {result === "missing" && (
          <motion.div key="missing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 rounded-[28px] border border-cream/10 p-8 text-center">
            <p className="font-display text-3xl">We couldn&rsquo;t find that order</p>
            <p className="mt-2 text-cream/60">
              Check the number in your confirmation email, or message us on{" "}
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="text-lime underline underline-offset-4">
                WhatsApp
              </a>
              .
            </p>
          </motion.div>
        )}
        {result && result !== "missing" && (
          <motion.div key={result.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8">
            <OrderTimeline order={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
