"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useIntro } from "@/components/providers/IntroProvider";
import { site } from "@/lib/site";

const SEEN_KEY = "vanam-intro-seen";
const DURATION = 1700;

/** Curtain intro with a counter — plays once per browser session. */
export function Preloader() {
  const { finish } = useIntro();
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setVisible(false);
      finish();
      return;
    }

    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) frame = requestAnimationFrame(tick);
      else
        setTimeout(() => {
          setVisible(false);
          document.documentElement.style.overflow = "";
          finish();
        }, 250);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-forest-950 p-6 md:p-10"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="eyebrow flex justify-between text-sage">
            <span>{site.tagline}</span>
            <span>Est. {site.established}</span>
          </div>

          <div className="overflow-hidden">
            <motion.p
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-display text-[clamp(4rem,16vw,15rem)] leading-[0.85] tracking-tight text-cream"
            >
              {site.name}
              <span className="text-brass">.</span>
            </motion.p>
          </div>

          <div className="flex items-end justify-between">
            <div className="h-px w-1/2 overflow-hidden bg-cream/10">
              <div className="h-full bg-lime transition-[width] duration-100" style={{ width: `${count}%` }} />
            </div>
            <span className="font-display text-6xl tabular-nums text-cream md:text-8xl">{count}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
