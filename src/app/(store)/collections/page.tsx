import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeUp } from "@/components/ui/RevealText";
import { collections, productsIn, type CollectionGroup } from "@/lib/collections";
import { ogImage, pageMetadata } from "@/lib/seo";
import { cn, img, IMAGES } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Plant Collections — Shop by Room, Light & Need",
  description: "Browse plant collections by room, light and lifestyle: low-light plants, pet-friendly plants, balcony plants, plant gifts and more.",
  path: "/collections",
  image: ogImage(IMAGES.greenhouse),
});

const GROUPS: { group: CollectionGroup; title: string }[] = [
  { group: "Type", title: "By type" },
  { group: "Room", title: "By room" },
  { group: "Light", title: "By light" },
  { group: "Need", title: "By need" },
];

export default function CollectionsPage() {
  return (
    <main>
      <PageHeader
        eyebrow={`${collections.length} curated collections`}
        crumbs={[{ name: "Collections", path: "/collections" }]}
        title={[
          "Find your",
          <>
            <em className="text-lime">kind</em> of green.
          </>,
        ]}
        intro="Curated by our growers around the way you actually live — the room, the light, the pets and the time you have."
      />
      <div className="container-x space-y-20 pb-28">
        {GROUPS.map(({ group, title }) => {
          const list = collections.filter((c) => c.group === group);
          return (
            <section key={group}>
              <h2 className="eyebrow border-b border-cream/10 pb-4 text-sage">{title}</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((c, i) => (
                  <FadeUp key={c.slug} delay={i * 0.06} className={cn(i === 0 && list.length > 3 && "lg:col-span-2")}>
                    <Link href={`/collections/${c.slug}`} data-cursor="Explore" className="group relative block aspect-[4/5] overflow-hidden rounded-[28px] lg:aspect-auto lg:h-[440px]">
                      <Image src={img(c.image)} alt="" fill sizes="(min-width: 1024px) 40vw, 50vw" className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-7">
                        <p className="font-display text-[clamp(2rem,3vw,2.8rem)] leading-none">{c.title}</p>
                        <p className="mt-3 line-clamp-2 max-w-sm text-sm text-cream/70">{c.intro}</p>
                        <p className="eyebrow mt-4 text-lime">{productsIn(c).length} plants →</p>
                      </div>
                    </Link>
                  </FadeUp>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
