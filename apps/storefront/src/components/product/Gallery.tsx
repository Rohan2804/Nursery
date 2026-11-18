"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Shot = { src: string; alt: string; caption: string; focal?: string };

/**
 * Desktop: an editorial stack of large images with hover-zoom (the info panel stays sticky beside it).
 * Mobile: a swipeable carousel with progress dots.
 */
export function Gallery({ shots }: { shots: Shot[] }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Mobile carousel */}
      <div className="relative lg:hidden">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {shots.map((s, i) => (
            <div key={s.src} className="relative aspect-[4/5] w-full shrink-0 snap-center">
              <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes="100vw" style={{ objectPosition: s.focal }} className="object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {shots.map((s, i) => (
            <button
              key={s.src}
              aria-label={`Show image ${i + 1}`}
              onClick={() => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" })}
              className={cn("h-1.5 rounded-full bg-cream transition-all duration-500", i === index ? "w-8" : "w-1.5 opacity-50")}
            />
          ))}
        </div>
      </div>

      {/* Desktop editorial stack */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        {shots.map((s, i) => (
          <ZoomFrame key={s.src} shot={s} priority={i === 0} wide={i === 0 || i === 3} />
        ))}
      </div>
    </>
  );
}

function ZoomFrame({ shot, priority, wide }: { shot: Shot; priority?: boolean; wide?: boolean }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [zoom, setZoom] = useState(false);

  return (
    <motion.figure
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group relative overflow-hidden rounded-[28px] bg-forest-800", wide ? "col-span-2 aspect-[5/6]" : "aspect-[4/5]")}
      data-cursor="Zoom"
      onPointerEnter={() => setZoom(true)}
      onPointerLeave={() => setZoom(false)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
      }}
    >
      <Image
        src={shot.src}
        alt={shot.alt}
        fill
        priority={priority}
        sizes={wide ? "55vw" : "28vw"}
        style={{ transformOrigin: origin, objectPosition: shot.focal }}
        className={cn("object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", zoom ? "scale-[1.6]" : "scale-100")}
      />
      <figcaption className="eyebrow absolute bottom-4 left-4 rounded-full bg-forest-950/60 px-3 py-1.5 !text-[0.6rem] text-cream opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100">
        {shot.caption}
      </figcaption>
    </motion.figure>
  );
}
