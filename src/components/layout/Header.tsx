"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useLenis } from "@/components/providers/SmoothScroll";
import { products } from "@/lib/catalog";
import { collections } from "@/lib/collections";
import { nav, site } from "@/lib/site";
import { cn, formatINR, img, scrollToHash } from "@/lib/utils";
import { SearchOverlay } from "./SearchOverlay";

// Pages with a light background need a solid header from the top.
const LIGHT_PAGES = ["/shipping-returns", "/privacy-policy", "/terms"];
const featuredPlant = products.find((p) => p.id === "monstera")!;

export function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, open, wishlist } = useCart();
  const lenis = useLenis();
  const pathname = usePathname();
  const solid = scrolled || LIGHT_PAGES.includes(pathname) || megaOpen;

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240 && !menuOpen);
    setScrolled(y > 24);
    if (y > prev) setMegaOpen(false);
  });

  useEffect(() => {
    if (menuOpen) lenis?.stop();
    else if (!searchOpen) lenis?.start();
  }, [menuOpen, searchOpen, lenis]);

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  // "/" opens search from anywhere (unless typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // On the homepage, section links glide; elsewhere they navigate.
  const go = (href: string) => (e: React.MouseEvent) => {
    setMenuOpen(false);
    if (pathname !== "/" || !href.startsWith("/#")) return;
    e.preventDefault();
    scrollToHash(href, lenis);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className={cn("overflow-hidden bg-lime text-center text-forest-950 transition-[height] duration-500", scrolled ? "h-0" : "h-8")}>
          <p className="eyebrow flex h-8 items-center justify-center gap-3 whitespace-nowrap !text-[0.6rem] sm:!text-[0.65rem]">
            <span>Free nursery-to-door delivery above {formatINR(site.freeDeliveryAbove)}</span>
            <span className="hidden opacity-40 md:inline">✦</span>
            <span className="hidden md:inline">30-day plant happiness guarantee</span>
          </p>
        </div>

        <div className={cn("transition-colors duration-500", solid ? "border-b border-cream/[0.06] bg-forest-950/85 backdrop-blur-xl" : "bg-transparent")}>
          <div className="container-x flex h-20 items-center justify-between">
            <Link href="/" onClick={go("/#top")} className="group flex items-baseline gap-2" aria-label={`${site.name} home`}>
              <span className="font-display text-[2rem] leading-none tracking-tight text-cream">
                {site.name}
                <span className="text-brass">.</span>
              </span>
              <span className="eyebrow hidden !text-[0.6rem] text-sage xl:inline">{site.tagline}</span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {nav.map((item) => {
                const isShop = item.href === "/plants";
                const active = !item.href.startsWith("/#") && pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={go(item.href)}
                    onMouseEnter={() => setMegaOpen(isShop)}
                    onFocus={() => setMegaOpen(isShop)}
                    aria-expanded={isShop ? megaOpen : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-cream",
                      active ? "text-lime" : "text-cream/80",
                    )}
                  >
                    <span className="relative block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[130%]">{item.label}</span>
                    <span className="absolute inset-x-4 top-2 block translate-y-[130%] font-display text-[1.05rem] italic leading-tight text-lime transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1">
              <IconButton label="Search (press /)" onClick={() => setSearchOpen(true)}>
                <Search className="size-[18px]" />
              </IconButton>
              <IconLink href="/wishlist" label={`Wishlist, ${wishlist.length} saved`} className="hidden sm:grid">
                <Heart className="size-[18px]" />
                {wishlist.length > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-lime" />}
              </IconLink>
              <IconLink href="/account" label="Account" className="hidden sm:grid">
                <User className="size-[18px]" />
              </IconLink>
              <button
                onClick={open}
                className="relative ml-1 flex h-11 items-center gap-2 rounded-full bg-cream/[0.08] pl-4 pr-1.5 text-sm font-semibold text-cream transition-colors hover:bg-cream/15"
                aria-label={`Open bag, ${count} items`}
              >
                <ShoppingBag className="size-[18px]" />
                <span className="hidden sm:inline">Bag</span>
                <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-lime text-xs font-bold text-forest-950">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={count} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.35 }}>
                      {count}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>
              <IconButton label={menuOpen ? "Close menu" : "Open menu"} className="lg:hidden" onClick={() => setMenuOpen((v) => !v)}>
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </IconButton>
            </div>
          </div>
        </div>

        {/* Shop mega menu */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="hidden border-b border-cream/[0.06] bg-forest-950/95 backdrop-blur-xl lg:block"
            >
              <div className="container-x grid grid-cols-[1fr_1fr_1fr_1.1fr] gap-10 py-10">
                {(["Type", "Room", "Light"] as const).map((group) => (
                  <div key={group}>
                    <p className="eyebrow text-sage">{group === "Type" ? "Type & need" : `Shop by ${group.toLowerCase()}`}</p>
                    <ul className="mt-5 space-y-2">
                      {collections
                        .filter((c) => c.group === group || (group === "Type" && c.group === "Need"))
                        .map((c) => (
                          <li key={c.slug}>
                            <Link href={`/collections/${c.slug}`} className="font-display text-2xl text-cream/85 transition-colors hover:text-lime">
                              {c.title.replace(" for Beginners", "")}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
                <Link href={`/plants/${featuredPlant.id}`} className="group relative overflow-hidden rounded-[24px]">
                  <Image src={img(featuredPlant.image)} alt={featuredPlant.name} fill sizes="25vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                    <div>
                      <p className="eyebrow text-brass">Bestseller</p>
                      <p className="mt-1 font-display text-3xl">{featuredPlant.name}</p>
                      <p className="text-sm text-cream/70">from {formatINR(featuredPlant.price)}</p>
                    </div>
                    <span className="grid size-11 place-items-center rounded-full bg-lime text-forest-950 transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-forest-900 px-6 pb-10 pt-32 lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 6%)" }}
            animate={{ clipPath: "circle(150% at 92% 6%)" }}
            exit={{ clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <nav className="flex flex-1 flex-col justify-end gap-1 overflow-y-auto" aria-label="Mobile">
              {[...nav, { label: "Wishlist", href: "/wishlist" }, { label: "Account", href: "/account" }].map((item, i) => (
                <div key={item.label} className="overflow-hidden">
                  <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.05 }}>
                    <Link href={item.href} onClick={go(item.href)} className="flex items-baseline gap-4 font-display text-5xl text-cream">
                      <span className="font-sans text-xs text-brass">0{i + 1}</span>
                      {item.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <div className="mt-10 border-t border-cream/10 pt-6 text-sm text-sage">
              <p>{site.hours}</p>
              <p className="mt-1">{site.phone}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}

const iconClass = "relative grid size-11 place-items-center rounded-full text-cream/85 transition-colors hover:bg-cream/10 hover:text-cream";

function IconButton({ children, label, className, onClick }: { children: React.ReactNode; label: string; className?: string; onClick?: () => void }) {
  return (
    <button aria-label={label} title={label} onClick={onClick} className={cn(iconClass, className)}>
      {children}
    </button>
  );
}

function IconLink({ children, label, href, className }: { children: React.ReactNode; label: string; href: string; className?: string }) {
  return (
    <Link href={href} aria-label={label} title={label} className={cn(iconClass, className)}>
      {children}
    </Link>
  );
}
