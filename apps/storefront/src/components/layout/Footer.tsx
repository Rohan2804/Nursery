"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { footerNav, site } from "@/lib/site";

export function Footer() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <footer className="grain relative overflow-hidden bg-forest-950 pt-24 text-cream">
      <div className="container-x">
        <div className="grid gap-16 border-b border-cream/10 pb-16 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="eyebrow text-brass">Letters from the nursery</p>
            <h3 className="mt-4 max-w-md font-display text-5xl leading-[0.95] md:text-6xl">
              Seasonal care notes, rare arrivals &amp; <em className="text-lime">first dibs.</em>
            </h3>
            <form
              className="mt-8 max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setJoined(true);
              }}
            >
              <div className="relative flex h-16 items-center overflow-hidden rounded-full border border-cream/20 bg-cream/[0.04] pl-6 focus-within:border-lime">
                <AnimatePresence mode="wait" initial={false}>
                  {joined ? (
                    <motion.p
                      key="ok"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-lime"
                    >
                      <Check className="size-4" /> You&rsquo;re on the list. Welcome to the family.
                    </motion.p>
                  ) : (
                    <motion.div key="form" exit={{ opacity: 0, y: -10 }} className="flex flex-1 items-center">
                      <label htmlFor="newsletter" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="newsletter"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="h-full flex-1 bg-transparent text-sm placeholder:text-cream/40 focus:outline-none"
                      />
                      <button
                        type="submit"
                        aria-label="Subscribe"
                        className="mr-2 grid size-12 place-items-center rounded-full bg-lime text-forest-950 transition-transform duration-500 hover:scale-105"
                      >
                        <ArrowRight className="size-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {footerNav.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-sage">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-cream/75 transition-colors hover:text-lime">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="eyebrow text-sage">Visit</p>
              <address className="mt-5 space-y-1 text-sm not-italic text-cream/75">
                {site.address.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p className="pt-3">{site.hours}</p>
                <p className="pt-3">{site.phone}</p>
                <p>{site.email}</p>
              </address>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 py-6 text-xs text-cream/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name} Nursery. Grown with care since {site.established}.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="transition-colors hover:text-lime">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-lime">
              Terms
            </Link>
            {[
              ["Instagram", site.social.instagram],
              ["YouTube", site.social.youtube],
              ["Pinterest", site.social.pinterest],
              ["WhatsApp", site.whatsapp],
            ].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-lime">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <motion.p
          initial={{ y: "40%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="-mb-[0.22em] text-center font-display text-[27vw] leading-[0.8] tracking-[-0.04em] text-forest-800"
        >
          {site.name}
        </motion.p>
      </div>
    </footer>
  );
}
