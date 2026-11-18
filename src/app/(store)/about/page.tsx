import Image from "next/image";
import { CarePromise } from "@/components/home/CarePromise";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/Button";
import { FadeUp, SectionLabel } from "@/components/ui/RevealText";
import { ogImage, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { img, IMAGES } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Our Story — A Family Nursery Since 1994",
  description: `${site.name} began as a one-acre family nursery in ${site.established}. Three decades on, we grow ${site.varieties.toLocaleString("en-IN")}+ varieties across ${site.acres} acres — and deliver them across India.`,
  path: "/about",
  image: ogImage(IMAGES.plantShop),
});

// Milestones are placeholders — replace with your nursery's real history.
const timeline = [
  { year: String(site.established), title: "One acre, one family", body: "A small roadside nursery, a few hundred crotons and a great deal of curiosity." },
  { year: "2003", title: "The first greenhouse", body: "Our shade house let us raise tropical foliage like Monstera and Calathea for the first time." },
  { year: "2011", title: "Landscaping begins", body: "Customers asked us to plant their gardens, not just sell to them. Our design studio was born." },
  { year: "2018", title: `${site.acres} acres of living green`, body: "New propagation houses, a rare-plant conservatory and open-soil beds for outdoor plants." },
  { year: "2026", title: "The nursery, online", body: "Everything we've learned, delivered to your door — still lifted from our beds the day it ships." },
];

const values = [
  { title: "Grown, not sourced", body: "We raise what we sell. Nothing is bought in from wholesalers and repotted — so we know every plant's story." },
  { title: "Patience over shortcuts", body: "No forcing, no growth hormones. Plants acclimatise for at least six weeks before they're ready to leave." },
  { title: "Care for life", body: "A plant is a relationship. Our plant doctors answer on WhatsApp for as long as you own it." },
];

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        eyebrow={`Est. ${site.established} · Family-run`}
        crumbs={[{ name: "Our story", path: "/about" }]}
        title={[
          "Three decades",
          <>
            of <em className="text-lime">patience.</em>
          </>,
        ]}
        intro="We are growers first. Long before there was a website, there were early mornings, muddy boots and a family that believed plants should be raised slowly and sold honestly."
        image={IMAGES.plantShop}
        imageAlt="Rows of plants at the Vanam nursery"
      />

      <section className="container-x py-24">
        <SectionLabel index="01">How we grew</SectionLabel>
        <ol className="mt-14 border-t border-cream/10">
          {timeline.map((t, i) => (
            <FadeUp key={t.year} delay={i * 0.05}>
              <li className="grid gap-4 border-b border-cream/10 py-10 md:grid-cols-[200px_1fr_1.2fr] md:items-baseline">
                <span className="font-display text-6xl text-brass md:text-7xl">{t.year}</span>
                <span className="font-display text-3xl">{t.title}</span>
                <span className="text-cream/65">{t.body}</span>
              </li>
            </FadeUp>
          ))}
        </ol>
      </section>

      <section className="relative overflow-hidden">
        <div className="relative aspect-[21/9] min-h-[380px]">
          <Image src={img(IMAGES.greenhouse)} alt="Inside the Vanam greenhouse" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-forest-950/55" />
          <div className="container-x absolute inset-0 flex items-center">
            <blockquote className="max-w-4xl font-display text-[clamp(2.2rem,5vw,5rem)] leading-[1] tracking-[-0.02em]">
              &ldquo;You can&rsquo;t rush a plant. You can only give it <em className="text-lime">good reasons</em> to grow.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      <section className="container-x py-24">
        <SectionLabel index="02">What we believe</SectionLabel>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {values.map((v, i) => (
            <FadeUp key={v.title} delay={i * 0.08}>
              <p className="font-display text-xl italic text-brass">0{i + 1}</p>
              <h2 className="mt-4 font-display text-4xl leading-tight">{v.title}</h2>
              <p className="mt-4 leading-relaxed text-cream/65">{v.body}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      <CarePromise />

      <section className="container-x pb-28">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[32px] bg-lime p-10 text-forest-950 md:flex-row md:items-center md:p-14">
          <h2 className="max-w-xl font-display text-[clamp(2.4rem,4.5vw,4rem)] leading-[0.95]">Come walk the rows with us.</h2>
          <div className="flex flex-wrap gap-3">
            <Button href="/visit" variant="dark">
              Plan a visit
            </Button>
            <Button href="/plants" variant="dark" icon={false} className="!bg-transparent ring-1 ring-forest-950/30">
              Shop plants
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
