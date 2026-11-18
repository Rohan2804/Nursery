import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { CollectionPills } from "@/components/shop/CollectionPills";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { RevealText } from "@/components/ui/RevealText";
import { productsInCollection } from "@vanam/catalog";
import { getCatalog } from "@/lib/catalog-source";
import { itemListLd, pageMetadata, shareImage } from "@/lib/seo";
import { img } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { collections } = await getCatalog();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = (await params).slug;
  const c = (await getCatalog()).collections.find((x) => x.slug === slug);
  if (!c) return {};
  return pageMetadata({
    title: c.seoTitle || `${c.title} — Buy Online in India`,
    description: c.seoDescription || c.description,
    path: `/collections/${c.slug}`,
    image: shareImage(img(c.image)),
  });
}

export default async function CollectionPage({ params }: Params) {
  const slug = (await params).slug;
  const { products, collections } = await getCatalog();
  const c = collections.find((x) => x.slug === slug);
  if (!c) notFound();
  const items = productsInCollection(products, c);
  const countIn = (x: typeof c) => productsInCollection(products, x).length;
  const siblings = collections.filter((x) => x.group === c.group && x.slug !== c.slug);
  const [first, ...rest] = c.title.split(" ");

  return (
    <main>
      <header className="relative flex min-h-[78svh] items-end overflow-hidden pb-16 pt-40">
        <Image src={img(c.image)} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/55 to-forest-950/40" />
        <div className="container-x relative">
          <Breadcrumbs items={[{ name: "Collections", path: "/collections" }, { name: c.title, path: `/collections/${c.slug}` }]} />
          <p className="eyebrow mt-10 text-lime">
            {c.group === "Room" ? "Shop by room" : c.group === "Light" ? "Shop by light" : "Collection"} · {items.length} plants
          </p>
          <RevealText
            as="h1"
            className="mt-5 max-w-5xl font-display text-[clamp(3.2rem,9vw,9rem)] leading-[0.88] tracking-[-0.035em]"
            lines={[<em key="f" className="text-lime">{first}</em>, rest.join(" ")]}
          />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-cream/80">{c.intro}</p>
        </div>
      </header>

      <div className="container-x pt-10">
        <CollectionPills active={c.slug} />
      </div>
      <Suspense>
        <ShopGrid products={items} />
      </Suspense>

      {siblings.length > 0 && (
        <section className="container-x border-t border-cream/10 py-20">
          <h2 className="font-display text-4xl md:text-5xl">You might also like</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.slice(0, 4).map((s) => (
              <Link key={s.slug} href={`/collections/${s.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-[24px]">
                <Image src={img(s.image)} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-display text-3xl leading-none">{s.title}</p>
                  <p className="eyebrow mt-3 text-lime">{countIn(s)} plants →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <JsonLd data={itemListLd(c.title, `/collections/${c.slug}`, items)} />
    </main>
  );
}
