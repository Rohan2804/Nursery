"use client";

import { animate, motion, useInView, useScroll, useTransform } from "framer-motion";
import { Clock, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { RevealText, SectionLabel } from "@/components/ui/RevealText";
import { site } from "@/lib/site";
import { img, IMAGES } from "@/lib/utils";

const stats = [
  { value: new Date().getFullYear() - site.established, suffix: "", label: "Years growing" },
  { value: site.acres, suffix: "", label: "Acres of nursery" },
  { value: site.varieties, suffix: "+", label: "Plant varieties" },
  { value: site.gardens / 1000, suffix: "k+", label: "Gardens planted" },
];

export function Visit() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yBack = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const yFront = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);

  return (
    <section ref={ref} id="visit" className="relative z-10 rounded-t-[clamp(2rem,5vw,4rem)] bg-bone py-[clamp(5rem,10vw,9rem)] text-forest-950">
      <div className="container-x">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <SectionLabel index="05" className="!text-moss">
              Visit the nursery
            </SectionLabel>
            <RevealText
              className="mt-6 font-display text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.9] tracking-[-0.03em]"
              lines={[
                "Walk twelve",
                <>
                  acres of <em className="text-moss">living</em>
                </>,
                "green.",
              ]}
            />
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-forest-950/70">
              Wander shaded greenhouses, sun-drenched terraces and our rare-plant conservatory. Talk to the growers who raised
              every plant, pick your own specimen, and leave with soil on your shoes.
            </p>

            <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-forest-950/10 pt-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="eyebrow text-forest-950/50">{s.label}</dt>
                  <dd className="mt-2 font-display text-[clamp(3rem,5vw,4.8rem)] leading-none tracking-tight">
                    <Counter to={s.value} />
                    <span className="text-moss">{s.suffix}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-14 rounded-3xl bg-forest-950 p-8 text-cream">
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-lime" />
                  <span>{site.address.join(", ")}</span>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-lime" />
                  <span>{site.hours}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-lime" />
                  <span>{site.phone}</span>
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/visit#book">Book a guided visit</Button>
                <Button href={site.mapsUrl} target="_blank" rel="noopener noreferrer" variant="ghost" icon={false}>
                  Get directions
                </Button>
              </div>
            </div>
          </div>

          <div className="relative min-h-[560px] lg:min-h-0">
            <motion.div style={{ y: yBack }} className="absolute right-0 top-0 h-[78%] w-[82%] overflow-hidden rounded-[32px]">
              <Image src={img(IMAGES.plantShop)} alt="Rows of potted plants at the Vanam nursery store" fill sizes="(min-width: 1024px) 40vw, 80vw" className="object-cover" />
            </motion.div>
            <motion.div
              style={{ y: yFront }}
              className="absolute bottom-0 left-0 h-[46%] w-[52%] overflow-hidden rounded-[28px] border-[6px] border-bone shadow-2xl"
            >
              <Image src={img(IMAGES.succulentsTexture)} alt="Echeveria succulents in the propagation house" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </motion.div>
            <motion.div
              style={{ y: yFront }}
              className="absolute bottom-[14%] right-[4%] grid size-32 place-items-center rounded-full bg-lime text-center animate-float md:size-36"
            >
              <span className="font-display text-lg leading-tight">
                Open
                <br />
                <em>every day</em>
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString("en-IN")}
    </span>
  );
}
