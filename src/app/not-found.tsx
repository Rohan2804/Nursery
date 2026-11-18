import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-forest-950 px-6 text-center text-cream">
      <Link href="/" className="absolute left-6 top-8 font-display text-3xl md:left-10">
        {site.name}
        <span className="text-brass">.</span>
      </Link>
      <p aria-hidden className="pointer-events-none absolute select-none font-display text-[42vw] leading-none text-forest-800/70">
        404
      </p>
      <div className="relative">
        <p className="eyebrow text-lime">Page not found</p>
        <h1 className="mt-6 font-display text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-[-0.03em]">
          This path is <em className="text-lime">overgrown.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-cream/70">The page you&rsquo;re looking for has been moved, repotted or never sprouted.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-14 items-center rounded-full bg-lime px-8 font-semibold text-forest-950 transition-colors hover:bg-cream">
            Back to home
          </Link>
          <Link href="/plants" className="inline-flex h-14 items-center rounded-full border border-cream/25 px-8 font-semibold transition-colors hover:bg-cream/10">
            Browse plants
          </Link>
        </div>
      </div>
    </main>
  );
}
