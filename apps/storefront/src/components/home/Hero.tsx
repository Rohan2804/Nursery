"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useIntro } from "@/components/providers/IntroProvider";
import { Button } from "@/components/ui/Button";
import { RevealText } from "@/components/ui/RevealText";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { site } from "@/lib/site";
import { formatINR, img, IMAGES } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { done } = useIntro();
  const { products } = useCatalog();
  const spotlight = products.find((p) => p.id === "calathea") ?? products.find((p) => p.featured) ?? products[0];
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // As you scroll, the full-bleed image recedes into a framed window.
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.55],
    ["inset(0% 0% 0% 0% round 0px)", "inset(9% 5% 9% 5% round 36px)"],
  );
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-35%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);

  // Subtle pointer parallax on the image.
  const px = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  return (
    <section
      id="top"
      ref={ref}
      className="relative h-[175vh]"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        px.set((e.clientX / window.innerWidth - 0.5) * -24);
        py.set((e.clientY / window.innerHeight - 0.5) * -16);
      }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0 will-change-[clip-path]" style={{ clipPath }}>
          <motion.div className="absolute -inset-6" style={{ scale: imageScale, x: px, y: py }}>
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.18, filter: "blur(12px)" }}
              animate={done ? { scale: 1, filter: "blur(0px)" } : undefined}
              transition={{ duration: 2.2, ease }}
            >
              <Image
                src={img(IMAGES.greenhouse)}
                alt="Lush tropical foliage inside the Vanam greenhouse"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/25 to-forest-950/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,transparent_20%,rgba(8,17,12,0.55)_80%)]" />
        </motion.div>

        <motion.p
          style={{ opacity: captionOpacity }}
          className="eyebrow absolute inset-x-0 bottom-[3%] text-center text-sage"
        >
          Inside our greenhouse · Grown here since {site.established}
        </motion.p>

        <motion.div style={{ y: textY, opacity: textOpacity }} className="container-x relative flex h-full flex-col justify-end pb-[8vh] pt-32">
          <motion.p
            className="eyebrow mb-6 flex items-center gap-3 text-lime"
            initial={{ opacity: 0, y: 12 }}
            animate={done ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: 0.2 }}
          >
            <span className="size-1.5 animate-pulse rounded-full bg-lime" />
            Est. {site.established} · Nursery &amp; Botanical House
          </motion.p>

          <RevealText
            as="h1"
            play={done}
            delay={0.3}
            stagger={0.11}
            className="font-display text-[clamp(3.6rem,11.5vw,12.5rem)] leading-[0.86] tracking-[-0.035em] text-cream"
            lines={[
              <>Bring the</>,
              <>
                <em className="text-lime">forest</em> home<span className="text-brass">.</span>
              </>,
            ]}
          />

          <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={done ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease, delay: 0.75 }}
              className="max-w-md"
            >
              <p className="text-base leading-relaxed text-cream/80 md:text-lg">
                Hand-raised in our {site.acres}-acre nursery for three decades — now delivered, rooted and
                thriving, to homes across India.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#bestsellers">Shop the collection</Button>
                <Button href="#finder" variant="ghost" icon={false}>
                  Find your plant
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={done ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 1.2, ease, delay: 0.95 }}
              className="hidden md:block"
            >
            <Link
              href={`/plants/${spotlight.id}`}
              data-cursor="View"
              className="group hidden w-[320px] items-center gap-4 rounded-3xl border border-cream/15 bg-forest-950/40 p-3 pr-5 backdrop-blur-xl transition-colors hover:border-lime/40 md:flex"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src={img(spotlight.image)}
                  alt={spotlight.name}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="min-w-0">
                <p className="eyebrow !text-[0.6rem] text-brass">Plant of the month</p>
                <p className="mt-1 truncate font-display text-2xl leading-tight">{spotlight.name}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-cream/70">
                  {formatINR(spotlight.price)}
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="size-3 fill-brass text-brass" /> {spotlight.rating}
                  </span>
                </p>
              </div>
            </Link>
            </motion.div>
          </div>

          <div className="absolute bottom-[8vh] left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
            <span className="eyebrow !text-[0.6rem] text-cream/60">Scroll</span>
            <span className="relative h-14 w-px overflow-hidden bg-cream/15">
              <span className="scroll-cue absolute inset-0 bg-lime" />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
