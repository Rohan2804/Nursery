import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Delivery, Returns & 30-Day Plant Guarantee",
  description: `Delivery across India, free above ${formatINR(site.freeDeliveryAbove)}. How our plant packaging works, delivery timelines and our 30-day happiness guarantee.`,
  path: "/shipping-returns",
});

// Review with your operations and legal team before launch.
export default function ShippingPage() {
  return (
    <LegalPage
      title="Delivery & returns"
      path="/shipping-returns"
      updated="17 November 2026"
      intro="Plants are living things, so we treat delivery as part of their care — from the moment they're lifted from our beds to the moment they reach your door."
      sections={[
        {
          heading: "Delivery areas & timelines",
          body: [
            "We deliver across India. Orders placed before 2 pm are lifted and packed the same day.",
            "Our home city: same-day or next-day delivery in a slot you choose. Metro cities: 2–3 working days. Rest of India: 3–5 working days. Remote pincodes may take a little longer — enter your pincode on any plant page for an estimate.",
          ],
        },
        {
          heading: "Delivery charges",
          body: [
            `Standard delivery is free on orders above ${formatINR(site.freeDeliveryAbove)}, and ${formatINR(99)} below that. Express next-day delivery is ${formatINR(149)}. Cash on delivery carries a ${formatINR(49)} handling fee.`,
          ],
        },
        {
          heading: "How plants are packed",
          body: [
            "Each plant is watered, its soil is secured with a breathable cover and it travels upright in a ventilated, plastic-free crate. Large plants are delivered by our own team within serviceable cities.",
          ],
        },
        {
          heading: "30-day happiness guarantee",
          body: [
            "If your plant arrives damaged or struggles in its first 30 days, send a photo to our plant doctors on WhatsApp. If we can't help you nurse it back to health, we'll send a replacement or a full refund — your choice.",
            "The guarantee covers plant health issues, not damage caused by pets, extreme neglect or placement far outside the recommended conditions — but we'll always try to help.",
          ],
        },
        {
          heading: "Returns & refunds",
          body: [
            "Because plants are living, they can't be returned for a change of mind. Unused planters and accessories may be returned within 7 days of delivery in their original packaging.",
            "Approved refunds are processed to the original payment method within 5–7 working days. Cash-on-delivery refunds are made by bank transfer or UPI.",
          ],
        },
        {
          heading: "Cancellations",
          body: ["You can cancel free of charge until your order is packed — usually a few hours after ordering. Contact us on WhatsApp or by email with your order number."],
        },
      ]}
    />
  );
}
