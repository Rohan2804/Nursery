"use client";

import type { Catalog } from "@vanam/catalog";
import { createContext, useContext, type ReactNode } from "react";

const CatalogContext = createContext<Catalog | null>(null);

/** Makes the server-loaded catalog available to client components. */
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
