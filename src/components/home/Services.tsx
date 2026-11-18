"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/RevealText";
import { img, IMAGES } from "@/lib/utils";

const services = [
  { title: "Garden & landscape design", body: "Master-planned gardens for villas, farmhouses and estates.", image: IMAGES.gardenPath },
  { title: "Terrace & vertical gardens", body: "Green walls, rooftop oases and balcony makeovers.", image: "1598880940080-ff9a29891b85" },
  { title: "Corporate greening", body: "Biophilic offices, lobbies and hospitality spaces — maintained.", image: IMAGES.workspace },
  { title: "Plant care & maintenance", body: "Scheduled visits from our gardeners to keep everything thriving.", image: IMAGES.soilTrowel },
];

export function Services() {
  const [hovered, setHovered] = useState<number | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 26 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 26 });

  return (
    <section
      id="services"
      className="relative rounded-b-[clamp(2rem,5vw,4rem)] bg-bone pb-[clamp(5rem,10vw,9rem)] text-forest-950"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
    >
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 border-b border-forest-950/15 pb-10 md:flex-row md:items-end">
          <div>
            <SectionLabel index="06" className="!text-moss">
              Beyond the pot
            </SectionLabel>
            <h2 className="mt-6 font-display text-[clamp(2.6rem,5.5vw,5.5rem)] leading-[0.92] tracking-[-0.03em]">
              Landscapes, <em className="text-moss">by Vanam.</em>
            </h2>
          </div>
          <Button href="/landscaping#consult" variant="dark">
            Request a consultation
          </Button>
        </div>

        <ul onPointerLeave={() => setHovered(null)}>
          {services.map((s, i) => (
            <li key={s.title}>
              <Link
                href="/landscaping"
                data-cursor="Enquire"
                onPointerEnter={() => setHovered(i)}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-forest-950/15 py-8 md:grid-cols-[80px_1.3fr_1fr_auto] md:py-10"
              >
                <span className="font-display text-lg italic text-moss">0{i + 1}</span>
                <span className="font-display text-[clamp(1.8rem,3.6vw,3.4rem)] leading-none tracking-tight transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-4">
                  {s.title}
                </span>
                <span className="hidden text-forest-950/60 md:block">{s.body}</span>
                <span className="grid size-12 place-items-center rounded-full border border-forest-950/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-forest-950 group-hover:bg-forest-950 group-hover:text-lime">
                  <ArrowUpRight className="size-5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating preview that follows the pointer (desktop) */}
      <motion.div className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block" style={{ x, y }}>
        <AnimatePresence>
          {hovered !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative -ml-[150px] -mt-[200px] h-[260px] w-[200px] overflow-hidden rounded-2xl shadow-2xl"
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={hovered}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={{ clipPath: "inset(0% 0 0 0)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image src={img(services[hovered].image)} alt="" fill sizes="200px" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
