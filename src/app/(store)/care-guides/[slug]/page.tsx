import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/home/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { RevealText } from "@/components/ui/RevealText";
import { products } from "@/lib/catalog";
import { guideBySlug, guides } from "@/lib/guides";
import { articleLd, ogImage, pageMetadata } from "@/lib/seo";
import { img } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return pageMetadata({ title: g.title, description: g.description, path: `/care-guides/${g.slug}`, image: ogImage(g.image), type: "article" });
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default async function GuidePage({ params }: Params) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const recs = g.products.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  const more = guides.filter((x) => x.slug !== g.slug).slice(0, 3);
  const path = `/care-guides/${g.slug}`;

  return (
    <main>
      <article>
        <header className="container-x pb-12 pt-32 lg:pt-40">
          <Breadcrumbs items={[{ name: "Care guides", path: "/care-guides" }, { name: g.title, path }]} />
          <div className="mx-auto mt-12 max-w-4xl text-center">
            <p className="eyebrow text-brass">
              {g.category} · {g.readMinutes} min read
            </p>
            <RevealText as="h1" className="mt-6 font-display text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.92] tracking-[-0.03em]" lines={[g.title]} />
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-cream/70">{g.description}</p>
            <p className="mt-6 text-xs text-cream/50">
              By {g.author} · <time dateTime={g.date}>{new Date(g.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time>
            </p>
          </div>
        </header>

        <div className="container-x">
          <div className="relative aspect-[21/9] overflow-hidden rounded-[32px] bg-forest-800">
            <Image src={img(g.image)} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>

        <div className="container-x grid gap-16 py-20 lg:grid-cols-[220px_1fr_220px]">
          <nav aria-label="In this guide" className="hidden lg:block">
            <div className="sticky top-32">
              <p className="eyebrow text-sage">In this guide</p>
              <ol className="mt-5 space-y-3 text-sm">
                {g.sections.map((s) => (
                  <li key={s.heading}>
                    <a href={`#${slugify(s.heading)}`} className="text-cream/60 transition-colors hover:text-lime">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="mx-auto w-full max-w-[680px]">
            {g.sections.map((s) => (
              <section key={s.heading} id={slugify(s.heading)} className="scroll-mt-32 [&+&]:mt-14">
                <h2 className="font-display text-[clamp(2rem,3vw,2.8rem)] leading-tight">{s.heading}</h2>
                {s.body.map((para) => (
                  <p key={para.slice(0, 24)} className="mt-5 text-[1.08rem] leading-[1.8] text-cream/80">
                    {para}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-6 space-y-3">
                    {s.list.map((li) => (
                      <li key={li} className="flex gap-4 text-[1.05rem] leading-relaxed text-cream/80">
                        <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-lime" />
                        {li}
                      </li>
                    ))}
                  </ul>
                )}
                {s.tip && (
                  <aside className="mt-8 flex gap-4 rounded-2xl border border-lime/25 bg-lime/[0.06] p-6">
                    <Lightbulb className="mt-0.5 size-5 shrink-0 text-lime" />
                    <p className="leading-relaxed">
                      <b className="text-lime">Grower&rsquo;s tip — </b>
                      {s.tip}
                    </p>
                  </aside>
                )}
              </section>
            ))}
          </div>
          <div className="hidden lg:block" />
        </div>
      </article>

      <section className="container-x border-t border-cream/10 py-20">
        <h2 className="font-display text-4xl md:text-5xl">Plants from this guide</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 xl:grid-cols-4">
          {recs.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="container-x border-t border-cream/10 py-20">
        <h2 className="font-display text-4xl md:text-5xl">Keep reading</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {more.map((m) => (
            <Link key={m.slug} href={`/care-guides/${m.slug}`} className="group flex gap-5 rounded-[24px] border border-cream/10 p-4 transition-colors hover:border-cream/30">
              <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl">
                <Image src={img(m.image)} alt="" fill sizes="112px" className="object-cover" />
              </div>
              <div>
                <p className="eyebrow text-brass">{m.category}</p>
                <p className="mt-2 font-display text-xl leading-tight group-hover:text-lime">{m.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <JsonLd data={articleLd({ title: g.title, description: g.description, path, image: ogImage(g.image), date: g.date, author: g.author })} />
    </main>
  );
}
