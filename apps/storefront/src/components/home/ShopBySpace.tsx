"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RevealText, SectionLabel } from "@/components/ui/RevealText";
import { productsInCollection } from "@vanam/catalog";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { lights, rooms, type Tile } from "@/lib/content";

/** Live plant count for a tile's collection. */
function useCount(tile: Tile) {
  const { products, collections } = useCatalog();
  const c = collections.find((x) => x.slug === tile.collection);
  return c ? productsInCollection(products, c).length : 0;
}
import { cn, img } from "@/lib/utils";

const tabs = [
  { id: "room", label: "By room", tiles: rooms },
  { id: "light", label: "By light", tiles: lights },
] as const;

export function ShopBySpace() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("room");
  const [active, setActive] = useState(0);
  const tiles = tabs.find((t) => t.id === tab)!.tiles;

  return (
    <section id="spaces" className="py-[clamp(5rem,10vw,9rem)]">
      <div className="container-x">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel index="02">Shop by space</SectionLabel>
            <RevealText
              className="mt-6 font-display text-[clamp(2.8rem,7vw,7rem)] leading-[0.9] tracking-[-0.03em]"
              lines={[
                "Every corner,",
                <>
                  its own <em className="text-lime">green.</em>
                </>,
              ]}
            />
          </div>

          <div role="tablist" aria-label="Browse by" className="relative flex w-fit rounded-full border border-cream/15 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  setTab(t.id);
                  setActive(0);
                }}
                className={cn(
                  "relative z-10 h-11 rounded-full px-6 text-sm font-semibold transition-colors duration-500",
                  tab === t.id ? "text-forest-950" : "text-cream/70 hover:text-cream",
                )}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="space-tab"
                    className="absolute inset-0 -z-10 rounded-full bg-cream"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Desktop: expanding accordion */}
          <div className="container-x mt-14 hidden h-[72vh] min-h-[540px] gap-3 lg:flex">
            {tiles.map((tile, i) => (
              <Panel key={tile.id} tile={tile} index={i} active={active === i} onActivate={() => setActive(i)} />
            ))}
          </div>

          {/* Mobile & tablet: swipeable cards */}
          <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1rem,4vw,4rem)] pb-4 lg:hidden">
            {tiles.map((tile, i) => (
              <Link
                key={tile.id}
                href={`/collections/${tile.collection}`}
                className="relative aspect-[3/4] w-[78vw] max-w-[380px] shrink-0 snap-start overflow-hidden rounded-3xl"
              >
                <Image src={img(tile.image)} alt={tile.title} fill sizes="80vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="font-display text-sm italic text-brass">0{i + 1}</span>
                  <p className="font-display text-4xl leading-none">{tile.title}</p>
                  <p className="mt-2 text-sm text-cream/75">{tile.note}</p>
                  <p className="eyebrow mt-4 text-lime"><Count tile={tile} /> plants →</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function Panel({ tile, index, active, onActivate }: { tile: Tile; index: number; active: boolean; onActivate: () => void }) {
  return (
    <Link
      href={`/collections/${tile.collection}`}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      data-cursor={active ? "Explore" : undefined}
      className="group relative overflow-hidden rounded-[28px] transition-[flex-grow] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ flexGrow: active ? 5 : 1, flexBasis: 0 }}
    >
      <Image
        src={img(tile.image)}
        alt={tile.title}
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className={cn(
          "object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          active ? "scale-100" : "scale-125",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-700",
          active ? "bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent" : "bg-forest-950/55",
        )}
      />

      {/* Collapsed state: vertical label */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-between py-8 transition-opacity duration-500",
          active ? "opacity-0" : "opacity-100 delay-200",
        )}
      >
        <span className="font-display text-lg italic text-brass">0{index + 1}</span>
        <span className="font-display text-3xl whitespace-nowrap [writing-mode:vertical-rl] rotate-180">{tile.title}</span>
      </div>

      {/* Expanded state */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-10">
        <div className="min-w-0 overflow-hidden">
          <motion.div
            initial={false}
            animate={active ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: active ? 0.25 : 0 }}
          >
            <span className="font-display text-xl italic text-brass">0{index + 1}</span>
            <p className="whitespace-nowrap font-display text-[clamp(3rem,4.5vw,5rem)] leading-none tracking-[-0.02em]">{tile.title}</p>
            <p className="mt-3 max-w-sm text-cream/75">{tile.note}</p>
          </motion.div>
        </div>
        <motion.span
          initial={false}
          animate={active ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: active ? 0.35 : 0 }}
          className="flex shrink-0 items-center gap-3 rounded-full bg-cream/10 py-2 pl-5 pr-2 text-sm font-semibold backdrop-blur-md"
        >
          <Count tile={tile} /> plants
          <span className="grid size-10 place-items-center rounded-full bg-lime text-forest-950 transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="size-5" />
          </span>
        </motion.span>
      </div>
    </Link>
  );
}

function Count({ tile }: { tile: Tile }) {
  return <>{useCount(tile)}</>;
}
