import { site } from "@/lib/site";

const items = [
  `Hand-raised since ${site.established}`,
  `${site.varieties.toLocaleString("en-IN")}+ varieties`,
  "Delivered across India",
  "30-day happiness guarantee",
  "Plant doctors on call",
  "Packed in plastic-free crates",
];

function Leaf() {
  return (
    <svg viewBox="0 0 24 24" className="size-[0.55em] shrink-0 text-brass" fill="currentColor" aria-hidden>
      <path d="M21 3C10 3 4 9 4 17c0 1.3.2 2.5.6 3.5C6 15 10 10.5 16 8c-5 3.5-8.3 8-9.6 12.8.9.1 1.7.2 2.6.2C17 21 21 14 21 3Z" />
    </svg>
  );
}

export function Marquee() {
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((t) => (
        <span key={t} className="flex items-center gap-10 whitespace-nowrap">
          {t}
          <Leaf />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y border-cream/10 py-7" aria-label="Our promises">
      <div className="flex w-max animate-marquee font-display text-[clamp(2rem,4.5vw,4rem)] italic leading-none text-cream/90 hover:[animation-play-state:paused]">
        {row}
        <div aria-hidden className="flex">
          {row}
        </div>
      </div>
    </div>
  );
}
