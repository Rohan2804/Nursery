import { WishlistView } from "@/components/account/WishlistView";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Your Wishlist",
  description: "Plants you've saved for later.",
  path: "/wishlist",
  noIndex: true,
});

export default function WishlistPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Saved for later"
        crumbs={[{ name: "Wishlist", path: "/wishlist" }]}
        title={[
          <>
            Your <em className="text-lime">wishlist.</em>
          </>,
        ]}
      />
      <div className="container-x pb-28">
        <WishlistView />
      </div>
    </main>
  );
}
