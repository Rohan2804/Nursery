"use client";

import { motion } from "framer-motion";
import { Droplet, Heart, PawPrint, Plus, Star, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { defaultSize, isInStock, type Product } from "@vanam/catalog";
import { cn, formatINR, img } from "@/lib/utils";

const lightLabel = { low: "Low light", medium: "Indirect", bright: "Bright", sun: "Full sun" } as const;
const careLabel = { 1: "Easy care", 2: "Moderate", 3: "Expert" } as const;

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { add, wishlist, toggleWish } = useCart();
  const wished = wishlist.includes(product.id);
  const available = isInStock(product);
  const quick = product.variants.find((v) => v.size === defaultSize(product));
  const lowStock = available && product.variants.every((v) => !v.active || v.stock <= v.lowStockThreshold);

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-forest-800">
        <Link href={`/plants/${product.id}`} data-cursor="View" aria-label={`View ${product.name}`} className="absolute inset-0 z-[1]" />
        <Image
          src={img(product.image)}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          style={{ objectPosition: product.imageFocal }}
          className={cn(
            "object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]",
            !available && "opacity-60 grayscale-[40%]",
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/50 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

        {(product.badge || !available || lowStock) && (
          <span
            className={cn(
              "pointer-events-none absolute left-3 top-3 z-[2] rounded-full px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider backdrop-blur",
              !available ? "bg-forest-950/80 text-cream" : lowStock ? "bg-brass text-forest-950" : "bg-bone/90 text-forest-950",
            )}
          >
            {!available ? "Sold out" : lowStock ? "Almost gone" : product.badge}
          </span>
        )}

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => toggleWish(product.id)}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={wished}
          className="absolute right-3 top-3 z-[2] grid size-10 place-items-center rounded-full bg-bone/90 text-forest-950 backdrop-blur transition-transform hover:scale-110"
        >
          <Heart className={cn("size-4 transition-colors", wished && "fill-[#c2410c] text-[#c2410c]")} />
        </motion.button>

        {/* Quick add — slides up on hover, always reachable on touch */}
        {available && quick && (
        <div className="absolute inset-x-3 bottom-3 z-[2] translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-y-[130%] md:group-hover:translate-y-0 md:group-focus-within:translate-y-0">
          <button
            onClick={() => add(product)}
            className="flex h-12 w-full items-center justify-between rounded-full bg-lime pl-5 pr-1.5 text-sm font-bold text-forest-950 transition-colors hover:bg-cream"
          >
            <span>
              Add to bag <span className="font-medium opacity-60">· {formatINR(quick.price)}</span>
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-forest-950 text-lime">
              <Plus className="size-4" />
            </span>
          </button>
        </div>
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-[1.7rem] leading-[1.05] tracking-tight">
            <Link href={`/plants/${product.id}`} className="transition-colors hover:text-lime">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm italic text-sage">{product.botanical}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold">{formatINR(product.price)}</p>
          {product.compareAt && <p className="text-sm text-cream/40 line-through">{formatINR(product.compareAt)}</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-cream/60">
        {product.reviews > 0 && (
          <span className="flex items-center gap-1.5">
            <Star className="size-3.5 fill-brass text-brass" />
            <b className="text-cream">{product.rating}</b> ({product.reviews})
          </span>
        )}
        {product.light[0] && (
          <span className="flex items-center gap-1.5">
            <Sun className="size-3.5" /> {lightLabel[product.light[0]]}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Droplet className="size-3.5" /> {careLabel[product.care]}
        </span>
        {product.petSafe && (
          <span className="flex items-center gap-1.5 text-lime">
            <PawPrint className="size-3.5" /> Pet safe
          </span>
        )}
      </div>
    </article>
  );
}
