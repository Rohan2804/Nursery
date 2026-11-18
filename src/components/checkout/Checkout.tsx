"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Gift,
  Lock,
  Pencil,
  ShoppingBag,
  Smartphone,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useCart, type Line } from "@/components/providers/CartProvider";
import { saveOrder } from "@/lib/account-store";
import { site } from "@/lib/site";
import { cn, formatINR, img } from "@/lib/utils";
import { variantLabel } from "@/lib/variants";
import { Field, Select, STATES } from "./fields";
import { OrderPlaced } from "./OrderPlaced";

const ease = [0.16, 1, 0.3, 1] as const;

type Address = { email: string; phone: string; name: string; line1: string; line2: string; city: string; state: string; pincode: string };
type Slot = "morning" | "afternoon" | "evening";
type Payment = "upi" | "card" | "netbanking" | "cod";

const SLOTS: { id: Slot; label: string; time: string }[] = [
  { id: "morning", label: "Morning", time: "8 am – 12 pm" },
  { id: "afternoon", label: "Afternoon", time: "12 – 4 pm" },
  { id: "evening", label: "Evening", time: "4 – 8 pm" },
];

const PAYMENTS: { id: Payment; label: string; note: string; icon: typeof CreditCard }[] = [
  { id: "upi", label: "UPI", note: "GPay, PhonePe, Paytm & more", icon: Smartphone },
  { id: "card", label: "Credit / debit card", note: "Visa, Mastercard, RuPay, Amex", icon: CreditCard },
  { id: "netbanking", label: "Net banking", note: "All major Indian banks", icon: Building2 },
  { id: "cod", label: "Cash on delivery", note: `${formatINR(49)} handling fee`, icon: Banknote },
];

// Demo promo codes — move server-side when the backend is connected.
const PROMOS: Record<string, { label: string; apply: (subtotal: number) => number }> = {
  GREEN10: { label: "10% off your order", apply: (s) => Math.round(s * 0.1) },
  FIRSTLEAF: { label: "₹200 off orders above ₹1,500", apply: (s) => (s >= 1500 ? 200 : 0) },
};

const EXPRESS_FEE = 149;
const STANDARD_FEE = 99;
const GIFT_WRAP_FEE = 99;
const COD_FEE = 49;

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

export function Checkout() {
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address>({ email: "", phone: "", name: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const days = useMemo(() => nextDays(7), []);
  const [dayIndex, setDayIndex] = useState(1);
  const [slot, setSlot] = useState<Slot>("morning");
  const [gift, setGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [payment, setPayment] = useState<Payment>("upi");
  const [promo, setPromo] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState<null | { id: string; lines: Line[]; total: number; name: string; date: Date; slot: Slot }>(null);

  const express = dayIndex === 0;
  const discount = promo ? PROMOS[promo].apply(subtotal) : 0;
  const delivery = express ? EXPRESS_FEE : subtotal - discount >= site.freeDeliveryAbove ? 0 : STANDARD_FEE;
  const extras = (gift ? GIFT_WRAP_FEE : 0) + (payment === "cod" ? COD_FEE : 0);
  const total = Math.max(0, subtotal - discount) + delivery + extras;

  const validate = () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(address.email)) e.email = "Enter a valid email";
    if (!/^[6-9]\d{9}$/.test(address.phone)) e.phone = "Enter a 10-digit mobile number";
    if (address.name.trim().length < 2) e.name = "Enter your full name";
    if (address.line1.trim().length < 4) e.line1 = "Enter your house / flat and street";
    if (!address.city.trim()) e.city = "Enter your city";
    if (!address.state) e.state = "Select your state";
    if (!/^[1-9]\d{5}$/.test(address.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let v = e.target.value;
    if (k === "phone" || k === "pincode") v = v.replace(/\D/g, "");
    setAddress((a) => ({ ...a, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  // Payment gateway hand-off goes here (e.g. Razorpay). For now we simulate a successful order.
  const placeOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      const id = `VN-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      saveOrder({
        id,
        placedAt: new Date().toISOString(),
        deliveryDate: days[dayIndex].toISOString(),
        slot: SLOTS.find((s) => s.id === slot)!.time,
        phone: address.phone,
        name: address.name,
        address: [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(", "),
        payment: PAYMENTS.find((p) => p.id === payment)!.label,
        total,
        lines: lines.map((l) => ({ id: l.product.id, name: l.product.name, image: l.product.image, size: l.size, planter: l.planter, qty: l.qty, price: l.price })),
      });
      setOrder({
        id,
        lines,
        total,
        name: address.name.split(" ")[0],
        date: days[dayIndex],
        slot,
      });
      clear();
      setPlacing(false);
      window.scrollTo({ top: 0 });
    }, 1800);
  };

  if (order) return <OrderPlaced order={order} slotLabel={SLOTS.find((s) => s.id === order.slot)!.time} email={address.email} />;

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center bg-bone px-6 text-center text-forest-950">
        <ShoppingBag className="size-12 text-moss" strokeWidth={1.2} />
        <h1 className="mt-6 font-display text-5xl">Your bag is empty</h1>
        <p className="mt-3 text-forest-950/60">Every great jungle starts with a single leaf.</p>
        <Link href="/#bestsellers" className="mt-8 inline-flex h-14 items-center rounded-full bg-forest-950 px-8 font-semibold text-cream">
          Explore plants
        </Link>
      </div>
    );
  }

  const fullDate = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-[100svh] bg-bone text-forest-950 lg:grid lg:grid-cols-[1fr_minmax(420px,0.8fr)]">
      {/* ---------- Form ---------- */}
      <div className="px-[clamp(1rem,5vw,5rem)] pb-24">
        <header className="flex h-24 items-center justify-between">
          <Link href="/" className="font-display text-[2rem] leading-none tracking-tight">
            {site.name}
            <span className="text-brass">.</span>
          </Link>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-950/60">
            <Lock className="size-3.5" /> Secure checkout
          </p>
        </header>

        <MobileSummary lines={lines} total={total}>
          <Summary lines={lines} subtotal={subtotal} discount={discount} delivery={delivery} gift={gift} cod={payment === "cod"} total={total} promo={promo} setPromo={setPromo} express={express} />
        </MobileSummary>

        <div className="mx-auto max-w-2xl pt-6 lg:pt-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-forest-950/60 hover:text-forest-950">
            <ArrowLeft className="size-4" /> Continue shopping
          </Link>
          <h1 className="mt-6 font-display text-[clamp(3rem,6vw,5rem)] leading-[0.9] tracking-[-0.03em]">
            Almost <em className="text-moss">home.</em>
          </h1>

          <Steps current={step} />

          {/* Step 1 — Details */}
          <StepCard
            index={0}
            current={step}
            title="Contact & address"
            summary={`${address.name}, ${address.line1}, ${address.city} ${address.pincode} · +91 ${address.phone}`}
            onEdit={() => setStep(0)}
          >
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (validate()) setStep(1);
              }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <Field name="email" type="email" label="Email" autoComplete="email" value={address.email} onChange={set("email")} error={errors.email} />
              <Field name="phone" type="tel" label="Mobile number" prefix="+91" maxLength={10} inputMode="numeric" autoComplete="tel-national" value={address.phone} onChange={set("phone")} error={errors.phone} />
              <Field name="name" label="Full name" autoComplete="name" value={address.name} onChange={set("name")} error={errors.name} className="sm:col-span-2" />
              <Field name="line1" label="Flat, house no., building, street" autoComplete="address-line1" value={address.line1} onChange={set("line1")} error={errors.line1} className="sm:col-span-2" />
              <Field name="line2" label="Area, landmark (optional)" autoComplete="address-line2" value={address.line2} onChange={set("line2")} className="sm:col-span-2" />
              <Field name="pincode" label="Pincode" maxLength={6} inputMode="numeric" autoComplete="postal-code" value={address.pincode} onChange={set("pincode")} error={errors.pincode} />
              <Field name="city" label="City" autoComplete="address-level2" value={address.city} onChange={set("city")} error={errors.city} />
              <Select name="state" label="State" options={STATES} value={address.state} onChange={set("state")} error={errors.state} className="sm:col-span-2" />
              <ContinueButton className="sm:col-span-2">Continue to delivery</ContinueButton>
            </form>
          </StepCard>

          {/* Step 2 — Delivery */}
          <StepCard
            index={1}
            current={step}
            title="Delivery slot"
            summary={`${fullDate(days[dayIndex])} · ${SLOTS.find((s) => s.id === slot)!.time}${gift ? " · Gift wrapped" : ""}`}
            onEdit={() => setStep(1)}
          >
            <p className="eyebrow text-forest-950/50">Choose a day</p>
            <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
              {days.map((d, i) => (
                <button
                  key={d.toISOString()}
                  onClick={() => setDayIndex(i)}
                  aria-pressed={dayIndex === i}
                  className={cn(
                    "relative flex w-[84px] shrink-0 flex-col items-center rounded-2xl border py-4 transition-colors duration-300",
                    dayIndex === i ? "border-forest-950 bg-forest-950 text-cream" : "border-forest-950/15 hover:border-forest-950/40",
                  )}
                >
                  <span className="text-xs uppercase tracking-wider opacity-70">{i === 0 ? "Tmrw" : d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                  <span className="mt-1 font-display text-3xl leading-none">{d.getDate()}</span>
                  <span className="mt-1 text-xs opacity-70">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                  {i === 0 && <span className="absolute -top-2 rounded-full bg-lime px-2 py-0.5 text-[0.6rem] font-bold text-forest-950">EXPRESS</span>}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-forest-950/55">
              {express ? `Express next-day delivery · ${formatINR(EXPRESS_FEE)}` : delivery === 0 ? "Standard delivery · Free" : `Standard delivery · ${formatINR(STANDARD_FEE)} (free above ${formatINR(site.freeDeliveryAbove)})`}
            </p>

            <p className="eyebrow mt-8 text-forest-950/50">Time window</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {SLOTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSlot(s.id)}
                  aria-pressed={slot === s.id}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-colors duration-300",
                    slot === s.id ? "border-forest-950 bg-forest-950 text-cream" : "border-forest-950/15 hover:border-forest-950/40",
                  )}
                >
                  <span className="block text-sm font-bold">{s.label}</span>
                  <span className="mt-1 block text-xs opacity-65">{s.time}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-forest-950/15 p-5">
              <label className="flex cursor-pointer items-center gap-4">
                <Gift className="size-5 text-moss" />
                <span className="flex-1">
                  <span className="block font-semibold">This is a gift</span>
                  <span className="text-sm text-forest-950/60">Linen wrap, hidden prices &amp; a hand-written note · {formatINR(GIFT_WRAP_FEE)}</span>
                </span>
                <Toggle on={gift} onChange={setGift} label="Gift wrap" />
              </label>
              <AnimatePresence initial={false}>
                {gift && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease }} className="overflow-hidden">
                    <textarea
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value.slice(0, 200))}
                      placeholder="Your message (we'll write it by hand)"
                      aria-label="Gift message"
                      rows={3}
                      className="mt-4 w-full resize-none rounded-xl border border-forest-950/15 bg-white/60 p-4 text-sm focus:border-forest-950 focus:outline-none"
                    />
                    <p className="text-right text-xs text-forest-950/40">{giftNote.length}/200</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ContinueButton className="mt-8 w-full" onClick={() => setStep(2)}>
              Continue to payment
            </ContinueButton>
          </StepCard>

          {/* Step 3 — Payment */}
          <StepCard index={2} current={step} title="Payment" summary="" onEdit={() => setStep(2)}>
            <div className="grid gap-2">
              {PAYMENTS.map(({ id, label, note, icon: Icon }) => (
                <label
                  key={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-2xl border p-5 transition-colors duration-300",
                    payment === id ? "border-forest-950 bg-white" : "border-forest-950/15 hover:border-forest-950/40",
                  )}
                >
                  <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} className="sr-only" />
                  <span className={cn("grid size-5 place-items-center rounded-full border-2 transition-colors", payment === id ? "border-forest-950" : "border-forest-950/25")}>
                    {payment === id && <motion.span layoutId="pay-dot" className="size-2.5 rounded-full bg-forest-950" />}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">{label}</span>
                    <span className="text-sm text-forest-950/55">{note}</span>
                  </span>
                  <Icon className="size-5 text-moss" strokeWidth={1.5} />
                </label>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-forest-950/55">
              <Lock className="size-3.5" />
              {payment === "cod" ? "Pay in cash or UPI when your plants arrive." : "You'll complete payment on our secure payment partner's page. We never store card details."}
            </p>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="group relative mt-8 flex h-16 w-full items-center justify-center overflow-hidden rounded-full bg-forest-950 text-lg font-semibold text-cream disabled:cursor-wait"
            >
              <span className="absolute inset-0 translate-y-full bg-forest-700 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
              <AnimatePresence mode="wait" initial={false}>
                {placing ? (
                  <motion.span key="placing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative flex items-center gap-3">
                    <span className="size-4 animate-spin rounded-full border-2 border-cream/30 border-t-lime" /> Placing your order…
                  </motion.span>
                ) : (
                  <motion.span key="place" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative">
                    {payment === "cod" ? "Place order" : "Pay"} · {formatINR(total)}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <p className="mt-4 text-center text-xs text-forest-950/45">By placing this order you agree to our terms and 30-day happiness guarantee.</p>
          </StepCard>
        </div>
      </div>

      {/* ---------- Summary (desktop) ---------- */}
      <aside className="hidden bg-forest-950 text-cream lg:block">
        <div className="sticky top-0 max-h-[100svh] overflow-y-auto px-12 py-24" data-lenis-prevent>
          <Summary lines={lines} subtotal={subtotal} discount={discount} delivery={delivery} gift={gift} cod={payment === "cod"} total={total} promo={promo} setPromo={setPromo} express={express} dark />
        </div>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Steps({ current }: { current: number }) {
  const labels = ["Details", "Delivery", "Payment"];
  return (
    <ol className="mt-10 flex items-center gap-3" aria-label="Checkout progress">
      {labels.map((l, i) => (
        <li key={l} className="flex flex-1 items-center gap-3">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-500",
              i < current ? "bg-moss text-cream" : i === current ? "bg-forest-950 text-cream" : "border border-forest-950/20 text-forest-950/50",
            )}
          >
            {i < current ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={cn("text-sm font-semibold", i > current && "text-forest-950/40")}>{l}</span>
          {i < labels.length - 1 && (
            <span className="relative h-px flex-1 bg-forest-950/15">
              <motion.span className="absolute inset-y-0 left-0 bg-moss" animate={{ width: i < current ? "100%" : "0%" }} transition={{ duration: 0.8, ease }} />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function StepCard({ index, current, title, summary, onEdit, children }: { index: number; current: number; title: string; summary: string; onEdit: () => void; children: ReactNode }) {
  const done = index < current;
  const active = index === current;
  return (
    <section className={cn("mt-6 rounded-[28px] border transition-colors duration-500", active ? "border-forest-950/15 bg-white/50 p-6 sm:p-8" : "border-forest-950/10 p-6")}>
      <div className="flex items-center justify-between gap-4">
        <h2 className={cn("font-display leading-none transition-all duration-500", active ? "text-4xl" : "text-2xl", !active && !done && "text-forest-950/35")}>
          <span className="mr-3 font-sans text-xs font-bold text-moss">0{index + 1}</span>
          {title}
        </h2>
        {done && (
          <button onClick={onEdit} className="flex items-center gap-1.5 text-sm font-semibold text-moss hover:text-forest-950">
            <Pencil className="size-3.5" /> Edit
          </button>
        )}
      </div>
      {done && summary && <p className="mt-3 text-sm text-forest-950/60">{summary}</p>}
      <AnimatePresence initial={false}>
        {active && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.7, ease }} className="overflow-hidden">
            <div className="pt-8">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ContinueButton({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      className={cn("group relative mt-4 flex h-14 items-center justify-center overflow-hidden rounded-full bg-forest-950 font-semibold text-cream", className)}
    >
      <span className="absolute inset-0 translate-y-full bg-forest-700 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
      <span className="relative">{children}</span>
    </button>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        onChange(!on);
      }}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300", on ? "bg-moss" : "bg-forest-950/15")}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={cn("absolute top-1 size-5 rounded-full bg-white shadow", on ? "right-1" : "left-1")} />
    </button>
  );
}

type SummaryProps = {
  lines: Line[];
  subtotal: number;
  discount: number;
  delivery: number;
  gift: boolean;
  cod: boolean;
  total: number;
  promo: string | null;
  setPromo: (p: string | null) => void;
  express: boolean;
  dark?: boolean;
};

function Summary({ lines, subtotal, discount, delivery, gift, cod, total, promo, setPromo, express, dark }: SummaryProps) {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const muted = dark ? "text-cream/55" : "text-forest-950/55";
  const rule = dark ? "border-cream/10" : "border-forest-950/10";

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (PROMOS[c]) {
      setPromo(c);
      setCode("");
      setCodeError(null);
    } else setCodeError("That code isn't valid. Try GREEN10.");
  };

  return (
    <div>
      {dark && <p className="eyebrow text-sage">Order summary</p>}
      <ul className={cn("space-y-5", dark && "mt-8")}>
        {lines.map((l) => (
          <li key={l.key} className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className={cn("relative size-20 overflow-hidden rounded-2xl", dark ? "bg-forest-800" : "bg-forest-950/5")}>
                <Image src={img(l.product.image)} alt={l.product.name} fill sizes="80px" className="object-cover" />
              </div>
              <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-lime text-xs font-bold text-forest-950">{l.qty}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xl leading-tight">{l.product.name}</p>
              <p className={cn("mt-0.5 text-xs", muted)}>{variantLabel(l.product, l.size, l.planter)}</p>
            </div>
            <p className="text-sm font-semibold">{formatINR(l.price * l.qty)}</p>
          </li>
        ))}
      </ul>

      <div className={cn("mt-8 border-t pt-6", rule)}>
        {promo ? (
          <div className={cn("flex items-center justify-between rounded-2xl px-4 py-3", dark ? "bg-lime/10" : "bg-moss/10")}>
            <span className="flex items-center gap-2 text-sm">
              <Tag className="size-4 text-lime" />
              <b>{promo}</b> <span className={muted}>· {PROMOS[promo].label}</span>
            </span>
            <button onClick={() => setPromo(null)} aria-label="Remove code">
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={apply} className="flex gap-2">
            <label htmlFor={dark ? "promo-d" : "promo-m"} className="sr-only">
              Promo code
            </label>
            <input
              id={dark ? "promo-d" : "promo-m"}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeError(null);
              }}
              placeholder="Gift card or promo code"
              className={cn(
                "h-12 min-w-0 flex-1 rounded-full border bg-transparent px-5 text-sm uppercase placeholder:normal-case focus:outline-none",
                dark ? "border-cream/15 placeholder:text-cream/40 focus:border-lime" : "border-forest-950/15 placeholder:text-forest-950/40 focus:border-forest-950",
              )}
            />
            <button className={cn("h-12 rounded-full px-5 text-sm font-semibold", dark ? "bg-cream/10 hover:bg-cream/20" : "bg-forest-950/10")}>Apply</button>
          </form>
        )}
        {codeError && <p className="mt-2 pl-2 text-xs text-[#e0714a]">{codeError}</p>}
      </div>

      <dl className={cn("mt-6 space-y-3 border-t pt-6 text-sm", rule)}>
        <Row label="Subtotal" value={formatINR(subtotal)} muted={muted} />
        {discount > 0 && <Row label="Discount" value={`− ${formatINR(discount)}`} muted={muted} accent />}
        <Row label={express ? "Express delivery" : "Delivery"} value={delivery === 0 ? "Free" : formatINR(delivery)} muted={muted} />
        {gift && <Row label="Gift wrap" value={formatINR(GIFT_WRAP_FEE)} muted={muted} />}
        {cod && <Row label="Cash on delivery" value={formatINR(COD_FEE)} muted={muted} />}
      </dl>

      <div className={cn("mt-6 flex items-baseline justify-between border-t pt-6", rule)}>
        <span className="font-semibold">Total</span>
        <span className="text-right">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={total} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="block font-display text-5xl leading-none">
              {formatINR(total)}
            </motion.span>
          </AnimatePresence>
          <span className={cn("mt-1 block text-xs", muted)}>Inclusive of all taxes</span>
        </span>
      </div>

      {dark && (
        <div className="mt-12 grid grid-cols-3 gap-3 border-t border-cream/10 pt-8 text-center text-xs text-cream/60">
          <p>
            <span className="block font-display text-2xl text-cream">30</span>day guarantee
          </p>
          <p>
            <span className="block font-display text-2xl text-cream">0</span>plastic packaging
          </p>
          <p>
            <span className="block font-display text-2xl text-cream">{new Date().getFullYear() - site.established}</span>years growing
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, muted, accent }: { label: string; value: string; muted: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={muted}>{label}</dt>
      <dd className={cn("font-semibold", accent && "text-moss")}>{value}</dd>
    </div>
  );
}

function MobileSummary({ lines, total, children }: { lines: Line[]; total: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  return (
    <div className="-mx-[clamp(1rem,5vw,5rem)] border-y border-forest-950/10 bg-white/50 lg:hidden">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between px-[clamp(1rem,5vw,5rem)] py-4 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="size-4" />
          {open ? "Hide" : "Show"} order summary ({count})
          <ChevronDown className={cn("size-4 transition-transform duration-500", open && "rotate-180")} />
        </span>
        <span className="font-display text-2xl">{formatINR(total)}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.6, ease }} className="overflow-hidden">
            <div className="px-[clamp(1rem,5vw,5rem)] pb-6 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
