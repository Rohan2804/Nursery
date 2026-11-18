"use client";

import { Heart } from "lucide-react";
import { ProductCard } from "@/components/home/ProductCard";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { products } from "@/lib/catalog";

export function WishlistView() {
  const { wishlist, add } = useCart();
  const items = wishlist.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[32px] border border-cream/10 px-6 py-24 text-center">
        <Heart className="size-10 text-lime" strokeWidth={1.3} />
        <p className="mt-6 font-display text-4xl">Nothing saved yet</p>
        <p className="mt-3 max-w-sm text-cream/60">Tap the heart on any plant to keep it here for later.</p>
        <div className="mt-8">
          <Button href="/plants">Browse plants</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <p className="text-cream/60">
          {items.length} saved {items.length === 1 ? "plant" : "plants"}
        </p>
        <button
          onClick={() => items.forEach((p, i) => add(p, { openBag: i === items.length - 1 }))}
          className="h-12 rounded-full bg-lime px-6 text-sm font-bold text-forest-950 transition-colors hover:bg-cream"
        >
          Add all to bag
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
