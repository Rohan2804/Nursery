import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/home/ProductCard";
import { ProductStory } from "@/components/product/ProductStory";
import { ProductView } from "@/components/product/ProductView";
import { Reviews } from "@/components/product/Reviews";
import { SectionLabel } from "@/components/ui/RevealText";
import { products, type Product, type Space } from "@/lib/catalog";
import { details } from "@/lib/plant-details";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMetadata, productLd } from "@/lib/seo";
import { formatINR, img, IMAGES } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return {};
  return pageMetadata({
    title: `${product.name} (${product.botanical}) — Buy Online`,
    description: `${product.blurb} Nursery-grown, from ${formatINR(product.price)}. ${product.petSafe ? "Pet safe. " : ""}Delivered across India with a 30-day guarantee.`,
    path: `/plants/${product.id}`,
    image: `${img(product.image)}&w=1200&h=630&q=80`,
  });
}

const roomFor: Record<Space, { id: string; caption: string }> = {
  floor: { id: IMAGES.livingRoom, caption: "Styled in a living room" },
  desk: { id: IMAGES.bedroomShelf, caption: "Styled on a shelf" },
  hanging: { id: IMAGES.bohoRoom, caption: "Styled in a sunny corner" },
  outdoor: { id: IMAGES.gardenPath, caption: "Styled in the garden" },
};

function shotsFor(p: Product) {
  const room = roomFor[p.space[0]];
  return [
    { src: img(p.image), alt: p.name, caption: "As it arrives" },
    { src: `${img(p.image)}&crop=focalpoint&fp-x=0.5&fp-y=0.35&fp-z=2.2&ar=4:5`, alt: `${p.name} leaf detail`, caption: "Leaf detail" },
    { src: img(room.id), alt: `${p.name} styled at home`, caption: room.caption },
    { src: img(IMAGES.greenhouse), alt: "Our greenhouse where it was grown", caption: "Raised in our greenhouse" },
  ];
}

function related(p: Product) {
  return products
    .filter((o) => o.id !== p.id)
    .map((o) => ({ o, score: o.light.filter((l) => p.light.includes(l)).length + (o.petSafe === p.petSafe ? 0.5 : 0) }))
    .sort((a, b) => b.score - a.score || b.o.rating - a.o.rating)
    .slice(0, 4)
    .map((x) => x.o);
}

export default async function PlantPage({ params }: Params) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  const info = details[product.id];

  return (
    <main>
      <ProductView product={product} details={info} shots={shotsFor(product)} />
      <ProductStory product={product} details={info} />
      <Reviews product={product} />
      <section className="container-x border-t border-cream/10 py-[clamp(5rem,9vw,8rem)]">
        <SectionLabel index="03">Pairs well with</SectionLabel>
        <h2 className="mt-6 font-display text-[clamp(2.6rem,5.5vw,5.4rem)] leading-[0.92] tracking-[-0.03em]">
          Grow your <em className="text-lime">corner.</em>
        </h2>
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 xl:grid-cols-4">
          {related(product).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <JsonLd
        data={[
          productLd(product),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Plants", path: "/plants" },
            { name: product.name, path: `/plants/${product.id}` },
          ]),
        ]}
      />
    </main>
  );
}
