import { Suspense } from "react";
import { TrackOrder } from "@/components/account/TrackOrder";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Track Your Order",
  description: "Enter your order number and mobile number to see where your plants are.",
  path: "/track-order",
});

export default function TrackOrderPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Order status"
        crumbs={[{ name: "Track your order", path: "/track-order" }]}
        title={[
          "Where are",
          <>
            my <em className="text-lime">plants?</em>
          </>,
        ]}
        intro="Use the order number from your confirmation (it starts with VN-) and the mobile number you checked out with."
      />
      <div className="container-x pb-28">
        <Suspense>
          <TrackOrder />
        </Suspense>
      </div>
    </main>
  );
}
