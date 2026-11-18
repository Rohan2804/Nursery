"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Droplets, PawPrint, Sun, Thermometer, Wind } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { FadeUp, RevealText, SectionLabel } from "@/components/ui/RevealText";
import type { Light, Product } from "@/lib/catalog";
import { lightCopy, type PlantDetails } from "@/lib/plant-details";
import { cn, img, IMAGES } from "@/lib/utils";

const lightLevel: Record<Light, number> = { low: 1, medium: 2, bright: 3, sun: 4 };

export function ProductStory({ product, details }: { product: Product; details: PlantDetails }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const maxLight = Math.max(...product.light.map((l) => lightLevel[l]));
  const minLight = Math.min(...product.light.map((l) => lightLevel[l]));

  const tiles = [
    {
      icon: Sun,
      label: "Light",
      value: lightCopy[product.light[0]].label,
      body: lightCopy[product.light[product.light.length - 1]].body,
      meter: <Meter total={4} from={minLight} to={maxLight} />,
    },
    { icon: Droplets, label: "Water", value: ["Sparingly", "Moderately", "Generously"][details.waterLevel - 1], body: details.water, meter: <Meter total={3} from={1} to={details.waterLevel} /> },
    { icon: Wind, label: "Humidity", value: ["Any", "Moderate", "High"][details.humidityLevel - 1], body: details.humidity, meter: <Meter total={3} from={1} to={details.humidityLevel} /> },
    {
      icon: PawPrint,
      label: "Pets",
      value: product.petSafe ? "Pet safe" : "Not pet safe",
      body: product.petSafe ? "Non-toxic to cats and dogs." : "Place out of reach of curious pets.",
      meter: <Meter total={1} from={1} to={product.petSafe ? 1 : 0} />,
    },
    { icon: Thermometer, label: "Climate", value: details.temperature, body: `Native to ${details.origin.toLowerCase().replace(/^the /, "")}.`, meter: null },
  ];

  return (
    <>
      <section className="container-x border-t border-cream/10 py-[clamp(5rem,9vw,8rem)]">
        <SectionLabel index="01">Care at a glance</SectionLabel>
        <RevealText
          className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,5.5vw,5.4rem)] leading-[0.92] tracking-[-0.03em]"
          lines={[
            <>
              Keep it <em className="text-lime">thriving.</em>
            </>,
          ]}
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-cream/10 bg-cream/10 sm:grid-cols-2 lg:grid-cols-5">
          {tiles.map(({ icon: Icon, label, value, body, meter }, i) => (
            <FadeUp key={label} delay={i * 0.06} className="flex flex-col bg-forest-950 p-7">
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-lime" strokeWidth={1.4} />
                {meter}
              </div>
              <p className="eyebrow mt-10 text-sage">{label}</p>
              <p className="mt-2 font-display text-[1.7rem] leading-tight">{value}</p>
              <p className="mt-3 text-sm leading-relaxed text-cream/60">{body}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      <section ref={ref} className="relative overflow-hidden">
        <motion.div style={{ y }} className="absolute -inset-y-[15%] inset-x-0">
          <Image src={img(IMAGES.greenhouse)} alt="" fill sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-forest-950/75" />
        <div className="container-x relative py-[clamp(6rem,12vw,11rem)]">
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow text-brass">From the grower</p>
            <FadeUp>
              <blockquote className="mt-8 font-display text-[clamp(2rem,4.2vw,3.8rem)] leading-[1.08] tracking-[-0.01em]">
                &ldquo;{details.growerNote}&rdquo;
              </blockquote>
            </FadeUp>
            <p className="mt-8 text-sm text-cream/60">Head grower, Vanam Nursery · Origin: {details.origin}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function Meter({ total, from, to }: { total: number; from: number; to: number }) {
  if (total === 1) {
    return <span className={cn("size-2.5 rounded-full", to ? "bg-lime" : "bg-[#e0714a]")} />;
  }
  return (
    <span className="flex gap-1" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("h-1.5 w-5 rounded-full", i + 1 >= from && i + 1 <= to ? "bg-lime" : "bg-cream/15")} />
      ))}
    </span>
  );
}
