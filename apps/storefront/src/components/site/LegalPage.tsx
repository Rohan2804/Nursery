import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";

export type LegalSection = { heading: string; body: ReactNode[] };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Calm, readable layout for policy pages, on a light background with a sticky contents list. */
export function LegalPage({ title, path, updated, intro, sections }: { title: string; path: string; updated: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <main className="bg-bone text-forest-950">
      <div className="container-x pb-28 pt-32 lg:pt-40">
        <Breadcrumbs light items={[{ name: title, path }]} />
        <h1 className="mt-10 max-w-4xl font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] tracking-[-0.03em]">{title}</h1>
        <p className="mt-4 text-sm text-forest-950/50">Last updated {updated}</p>
        <div className="mt-8 max-w-2xl text-lg leading-relaxed text-forest-950/75">{intro}</div>

        <div className="mt-16 grid gap-14 border-t border-forest-950/10 pt-14 lg:grid-cols-[240px_1fr]">
          <nav aria-label="Contents" className="hidden lg:block">
            <ol className="sticky top-32 space-y-3 text-sm">
              {sections.map((s, i) => (
                <li key={s.heading}>
                  <a href={`#${slug(s.heading)}`} className="text-forest-950/55 hover:text-moss">
                    {i + 1}. {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-[720px] space-y-12">
            {sections.map((s, i) => (
              <section key={s.heading} id={slug(s.heading)} className="scroll-mt-32">
                <h2 className="font-display text-3xl md:text-4xl">
                  <span className="mr-3 text-moss">{i + 1}.</span>
                  {s.heading}
                </h2>
                <div className="mt-4 space-y-4 leading-[1.8] text-forest-950/75">
                  {s.body.map((b, k) => (
                    <div key={k}>{b}</div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
