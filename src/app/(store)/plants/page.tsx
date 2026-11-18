import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { CollectionPills } from "@/components/shop/CollectionPills";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { PageHeader } from "@/components/site/PageHeader";
import { products } from "@/lib/catalog";
import { itemListLd, ogImage, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { IMAGES } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Buy Plants Online in India — Indoor & Outdoor Plants",
  description: `Shop ${site.varieties.toLocaleString("en-IN")}+ nursery-grown indoor and outdoor plants online. Filter by light, size, care level and pet safety. Delivered fresh across India.`,
  path: "/plants",
  image: ogImage(IMAGES.plantShop),
});

export default function ShopPage() {
  return (
    <main>
      <PageHeader
        eyebrow={`${products.length} plants in season · ${site.varieties.toLocaleString("en-IN")}+ at the nursery`}
        crumbs={[{ name: "Plants", path: "/plants" }]}
        title={[
          <>
            The <em className="text-lime">whole</em>
          </>,
          "nursery.",
        ]}
        intro="Every plant here was raised in our own beds. Filter by the light you have, the space you want to fill and how much care you can give."
      />
      <div className="container-x">
        <CollectionPills />
      </div>
      <Suspense>
        <ShopGrid products={products} />
      </Suspense>
      <JsonLd data={itemListLd("All plants", "/plants", products)} />
    </main>
  );
}
