"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: { offset: -100, duration: 1.4 } });
    setLenis(instance);

    let frame = 0;
    const loop = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // New page: start at the top, or glide to the requested section (e.g. "/#finder").
  const pathname = usePathname();
  useEffect(() => {
    if (!lenis) return;
    lenis.resize();
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) {
      const t = setTimeout(() => lenis.scrollTo(hash, { offset: -40, duration: 1.4 }), 250);
      return () => clearTimeout(t);
    }
    lenis.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
