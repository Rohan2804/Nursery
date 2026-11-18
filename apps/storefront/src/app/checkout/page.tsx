import { Checkout } from "@/components/checkout/Checkout";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Secure Checkout",
  description: "Complete your order — choose a delivery slot, gift wrap and payment method.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return <Checkout />;
}
