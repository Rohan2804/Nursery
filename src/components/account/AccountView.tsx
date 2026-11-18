"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Field } from "@/components/checkout/fields";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { useOrders, useProfile } from "@/lib/account-store";
import { cn } from "@/lib/utils";
import { OrderTimeline } from "./OrderTimeline";

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "profile", label: "Profile", icon: User },
] as const;

export function AccountView() {
  const { profile, ready, signOut } = useProfile();
  if (!ready) return <div className="h-96" />;
  return profile ? <Dashboard name={profile.name} phone={profile.phone} email={profile.email} onSignOut={signOut} /> : <SignIn />;
}

/* Phone + OTP sign-in. DEMO: no SMS is sent; any 6-digit code is accepted until an auth provider is connected. */
function SignIn() {
  const { signIn } = useProfile();
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step === "phone") {
      if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit mobile number");
      setStep("otp");
    } else if (step === "otp") {
      if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code");
      setStep("details");
    } else {
      if (name.trim().length < 2) return setError("Please tell us your name");
      signIn({ name: name.trim(), phone, email: email.trim() });
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-cream/10 lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-forest-900 p-10">
        <div>
          <p className="eyebrow text-brass">Your Vanam account</p>
          <h2 className="mt-5 font-display text-5xl leading-[0.95]">
            Your plants, <em className="text-lime">all in one place.</em>
          </h2>
        </div>
        <ul className="mt-10 space-y-3 text-sm text-cream/70">
          <li>— Track orders and delivery slots</li>
          <li>— Save addresses for faster checkout</li>
          <li>— Keep your wishlist across visits</li>
          <li>— Care reminders for the plants you own</li>
        </ul>
      </div>
      <div className="bg-bone p-8 text-forest-950 sm:p-10">
        <AnimatePresence mode="wait">
          <motion.form key={step} onSubmit={next} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }} noValidate>
            <h3 className="font-display text-4xl">{step === "phone" ? "Sign in or join" : step === "otp" ? "Enter the code" : "Nice to meet you"}</h3>
            <p className="mt-2 text-sm text-forest-950/60">
              {step === "phone" && "We'll send a one-time code to your mobile."}
              {step === "otp" && `Sent to +91 ${phone}. `}
              {step === "otp" && (
                <button type="button" onClick={() => setStep("phone")} className="font-semibold text-moss underline underline-offset-4">
                  Change
                </button>
              )}
              {step === "details" && "Just a couple of details to finish."}
            </p>
            <div className="mt-8 space-y-3">
              {step === "phone" && (
                <Field name="phone" label="Mobile number" prefix="+91" inputMode="numeric" maxLength={10} autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} error={error ?? undefined} />
              )}
              {step === "otp" && (
                <Field name="otp" label="6-digit code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} error={error ?? undefined} />
              )}
              {step === "details" && (
                <>
                  <Field name="name" label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={error ?? undefined} />
                  <Field name="email" type="email" label="Email (optional)" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </>
              )}
            </div>
            <button className="mt-6 h-14 w-full rounded-full bg-forest-950 font-semibold text-cream transition-colors hover:bg-forest-700">
              {step === "phone" ? "Send code" : step === "otp" ? "Verify" : "Create account"}
            </button>
            <p className="mt-6 rounded-xl bg-forest-950/[0.05] p-3 text-xs text-forest-950/55">
              Preview mode: no SMS is sent and any 6-digit code works. Account data stays in this browser until sign-in is connected to a backend.
            </p>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Dashboard({ name, phone, email, onSignOut }: { name: string; phone: string; email: string; onSignOut: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("orders");
  const { orders } = useOrders();
  const { wishlist } = useCart();
  const mine = orders.filter((o) => o.phone === phone);
  const addresses = [...new Set(mine.map((o) => o.address))];

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
      <aside>
        <p className="font-display text-4xl leading-tight">
          Hello, <em className="text-lime">{name.split(" ")[0]}.</em>
        </p>
        <p className="mt-2 text-sm text-cream/55">+91 {phone}</p>
        <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col" aria-label="Account">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id}
              className={cn("flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors", tab === id ? "bg-cream text-forest-950" : "text-cream/70 hover:bg-cream/10")}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
          <Link href="/wishlist" className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-cream/70 hover:bg-cream/10">
            <Heart className="size-4" /> Wishlist <span className="ml-auto text-cream/40">{wishlist.length}</span>
          </Link>
          <button onClick={onSignOut} className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-cream/50 hover:bg-cream/10">
            <LogOut className="size-4" /> Sign out
          </button>
        </nav>
      </aside>

      <div>
        {tab === "orders" &&
          (mine.length === 0 ? (
            <Empty title="No orders yet" body="When you place an order with this mobile number, it will appear here.">
              <Button href="/plants">Start shopping</Button>
            </Empty>
          ) : (
            <div className="space-y-6">
              {mine.map((o) => (
                <OrderTimeline key={o.id} order={o} />
              ))}
            </div>
          ))}
        {tab === "addresses" &&
          (addresses.length === 0 ? (
            <Empty title="No saved addresses" body="Addresses you use at checkout are saved here automatically." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((a, i) => (
                <div key={a} className="rounded-[24px] border border-cream/10 p-6">
                  <p className="eyebrow text-sage">{i === 0 ? "Default" : `Address ${i + 1}`}</p>
                  <p className="mt-3 font-semibold">{name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-cream/65">{a}</p>
                </div>
              ))}
            </div>
          ))}
        {tab === "profile" && (
          <dl className="grid max-w-xl gap-4 rounded-[24px] border border-cream/10 p-8 text-sm">
            <div>
              <dt className="text-cream/50">Name</dt>
              <dd className="mt-1 text-lg">{name}</dd>
            </div>
            <div>
              <dt className="text-cream/50">Mobile</dt>
              <dd className="mt-1 text-lg">+91 {phone}</dd>
            </div>
            <div>
              <dt className="text-cream/50">Email</dt>
              <dd className="mt-1 text-lg">{email || "—"}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}

function Empty({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border border-cream/10 px-6 py-20 text-center">
      <p className="font-display text-4xl">{title}</p>
      <p className="mt-3 max-w-sm text-cream/60">{body}</p>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
