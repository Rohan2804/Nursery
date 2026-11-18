"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/RevealText";
import { site } from "@/lib/site";
import { img, IMAGES } from "@/lib/utils";

type Token = { kind: "word"; text: string; italic?: boolean } | { kind: "image"; id: string; alt: string };

const w = (s: string, italic = false): Token[] => s.split(" ").map((text) => ({ kind: "word", text, italic }));

const tokens: Token[] = [
  ...w("For three decades our family has grown plants the slow way —"),
  { kind: "image", id: IMAGES.soilTrowel, alt: "Hands working nursery soil" },
  ...w("in open soil, under real sky,"),
  ...w("by hands that know every leaf.", true),
  { kind: "image", id: IMAGES.calatheaLeaves, alt: "Striped calathea leaves" },
  ...w("Now the nursery comes to you."),
];

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  return (
    <section className="container-x py-[clamp(6rem,14vw,12rem)]">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <SectionLabel index="03">Our roots</SectionLabel>

        <div>
          <p
            ref={ref}
            className="font-display text-[clamp(2.1rem,5.4vw,5.6rem)] leading-[1.02] tracking-[-0.02em] text-cream"
          >
            {tokens.map((t, i) => {
              const range: [number, number] = [i / tokens.length, (i + 1) / tokens.length];
              return t.kind === "word" ? (
                <Word key={i} progress={scrollYProgress} range={range} italic={t.italic}>
                  {t.text}
                </Word>
              ) : (
                <InlineImage key={i} progress={scrollYProgress} range={range} id={t.id} alt={t.alt} />
              );
            })}
          </p>

          <div className="mt-14 flex flex-wrap items-center gap-8">
            <Button href="/about" variant="ghost">
              Read our story
            </Button>
            <p className="max-w-xs text-sm leading-relaxed text-sage">
              Every plant you order is raised at our own nursery — never warehoused, never shipped in from afar. Since{" "}
              {site.established}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
  italic,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  italic?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={italic ? "italic text-lime" : undefined}>
      {children}{" "}
    </motion.span>
  );
}

function InlineImage({ progress, range, id, alt }: { progress: MotionValue<number>; range: [number, number]; id: string; alt: string }) {
  const width = useTransform(progress, range, ["0em", "1.9em"]);
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <motion.span
      style={{ width, opacity }}
      className="relative mx-[0.12em] inline-block h-[0.78em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline"
    >
      <Image src={img(id)} alt={alt} fill sizes="160px" className="object-cover" />
    </motion.span>
  );
}
