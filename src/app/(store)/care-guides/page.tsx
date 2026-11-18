import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeUp } from "@/components/ui/RevealText";
import { guides } from "@/lib/guides";
import { ogImage, pageMetadata } from "@/lib/seo";
import { img, IMAGES } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Plant Care Guides — Advice from Our Growers",
  description: "Practical, India-specific plant care guides from the Vanam nursery team: watering, low-light plants, monsoon care, repotting and pet-safe plants.",
  path: "/care-guides",
  image: ogImage(IMAGES.soilTrowel),
});

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function GuidesPage() {
  const sorted = [...guides].sort((a, b) => b.date.localeCompare(a.date));
  const [lead, ...rest] = sorted;

  return (
    <main>
      <PageHeader
        eyebrow="The Vanam journal"
        crumbs={[{ name: "Care guides", path: "/care-guides" }]}
        title={[
          "Grown-up",
          <>
            <em className="text-lime">advice.</em>
          </>,
        ]}
        intro="Three decades of what we've learned in the nursery — written for Indian homes, Indian weather and real life."
      />

      <div className="container-x pb-28">
        <FadeUp>
          <Link href={`/care-guides/${lead.slug}`} data-cursor="Read" className="group grid overflow-hidden rounded-[32px] border border-cream/10 bg-forest-900 lg:grid-cols-[1.3fr_1fr]">
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[480px]">
              <Image src={img(lead.image)} alt="" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-end p-8 md:p-12">
              <p className="eyebrow text-brass">Latest · {lead.category}</p>
              <h2 className="mt-5 font-display text-[clamp(2.4rem,4vw,4rem)] leading-[0.95] transition-colors group-hover:text-lime">{lead.title}</h2>
              <p className="mt-5 text-cream/70">{lead.description}</p>
              <p className="mt-8 text-xs text-cream/50">
                {fmt(lead.date)} · {lead.readMinutes} min read
              </p>
            </div>
          </Link>
        </FadeUp>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {rest.map((g, i) => (
            <FadeUp key={g.slug} delay={i * 0.06}>
              <Link href={`/care-guides/${g.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-forest-800">
                  <Image src={img(g.image)} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-bone/90 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-forest-950">{g.category}</span>
                </div>
                <h2 className="mt-5 font-display text-2xl leading-tight transition-colors group-hover:text-lime">{g.title}</h2>
                <p className="mt-2 text-xs text-cream/50">{g.readMinutes} min read</p>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </main>
  );
}
