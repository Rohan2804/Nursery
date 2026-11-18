"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultSize, unitPrice, type Catalog, type Product, type SizeId } from "@vanam/catalog";
import { useCatalog } from "./CatalogProvider";

type PlanterId = string;

export type Line = {
  key: string;
  product: Product;
  size: SizeId;
  planter: PlanterId;
  qty: number;
  price: number;
};

type AddOptions = { size?: SizeId; planter?: PlanterId; qty?: number; openBag?: boolean };

type CartState = {
  lines: Line[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, options?: AddOptions) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "vanam-cart-v2";

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

const makeLine = (catalog: Catalog, product: Product, size: SizeId, planter: PlanterId, qty: number): Line => ({
  key: `${product.id}:${size}:${planter}`,
  product,
  size,
  planter,
  qty,
  price: unitPrice(product, size, planter, catalog.planters),
});

/** Never more than what's in stock for that size. */
const stockFor = (product: Product, size: SizeId) => product.variants.find((v) => v.size === size)?.stock ?? 0;

export function CartProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  const [lines, setLines] = useState<Line[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore the bag for returning visitors (browser-only convenience).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as {
        lines?: { id: string; size: SizeId; planter: PlanterId; qty: number }[];
        wishlist?: string[];
      };
      const restored = (saved.lines ?? [])
        .map(({ id, size, planter, qty }) => {
          // Re-price from the live catalog; drop plants or sizes that are gone or sold out.
          const product = catalog.products.find((p) => p.id === id);
          if (!product || stockFor(product, size) === 0) return null;
          return makeLine(catalog, product, size, planter, Math.min(qty, stockFor(product, size)));
        })
        .filter((l): l is Line => l !== null);
      setLines(restored);
      setWishlist(saved.wishlist ?? []);
    } catch {
      /* storage unavailable — start empty */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lines: lines.map((l) => ({ id: l.product.id, size: l.size, planter: l.planter, qty: l.qty })),
          wishlist,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [lines, wishlist, hydrated]);

  const add = useCallback((product: Product, options: AddOptions = {}) => {
    const { size = defaultSize(product), planter = catalog.planters[0]?.id ?? "grow", qty = 1, openBag = true } = options;
    const max = stockFor(product, size);
    if (max === 0) return;
    const line = makeLine(catalog, product, size, planter, Math.min(qty, max));
    setLines((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) return prev.map((l) => (l.key === line.key ? { ...l, qty: Math.min(max, l.qty + qty) } : l));
      return [...prev, line];
    });
    if (openBag) setOpen(true);
  }, [catalog]);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, stockFor(l.product, l.size)) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const toggleWish = useCallback(
    (id: string) => setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [],
  );

  const value = useMemo<CartState>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQty,
      remove,
      clear,
      wishlist,
      toggleWish,
    }),
    [lines, isOpen, add, setQty, remove, clear, wishlist, toggleWish],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
