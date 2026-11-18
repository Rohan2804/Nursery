"use client";

// Browser-only stand-in for the customer backend: orders and profile live in localStorage
// until real accounts and an orders API are connected.
import { useCallback, useEffect, useState } from "react";
import type { SizeId } from "@vanam/catalog";

type PlanterId = string;

export type SavedOrder = {
  id: string;
  placedAt: string;
  deliveryDate: string;
  slot: string;
  phone: string;
  name: string;
  address: string;
  payment: string;
  total: number;
  lines: { id: string; name: string; image: string; size: SizeId; planter: PlanterId; qty: number; price: number }[];
};

export type Profile = { name: string; phone: string; email: string };

const ORDERS = "vanam-orders";
const PROFILE = "vanam-profile";
const EVENT = "vanam-account-change";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export const saveOrder = (order: SavedOrder) => write(ORDERS, [order, ...read<SavedOrder[]>(ORDERS, [])]);
export const findOrder = (id: string, phone: string) =>
  read<SavedOrder[]>(ORDERS, []).find((o) => o.id.toUpperCase() === id.trim().toUpperCase() && o.phone.slice(-10) === phone.replace(/\D/g, "").slice(-10));

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [value, ready] as const;
}

export function useOrders() {
  const [orders, ready] = useStored<SavedOrder[]>(ORDERS, []);
  return { orders, ready };
}

export function useProfile() {
  const [profile, ready] = useStored<Profile | null>(PROFILE, null);
  const signIn = useCallback((p: Profile) => write(PROFILE, p), []);
  const signOut = useCallback(() => write(PROFILE, null), []);
  return { profile, ready, signIn, signOut };
}

/** Delivery progress for a saved order, derived from its timestamps. */
export function orderStage(o: SavedOrder) {
  const now = Date.now();
  const placed = new Date(o.placedAt).getTime();
  const due = new Date(o.deliveryDate).getTime();
  if (now >= due + 12 * 3600e3) return 4;
  if (now >= due) return 3;
  if (now >= placed + 20 * 3600e3) return 2;
  if (now >= placed + 2 * 3600e3) return 1;
  return 0;
}

export const ORDER_STAGES = ["Order confirmed", "Lifted & packed at the nursery", "On its way", "Out for delivery", "Delivered"];
