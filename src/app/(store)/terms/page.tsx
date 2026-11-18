import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms & Conditions",
  description: `The terms that apply when you shop with ${site.legalName}.`,
  path: "/terms",
});

// Template only — have this reviewed by a lawyer before launch.
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & conditions"
      path="/terms"
      updated="17 November 2026"
      intro={`These terms apply when you browse or buy from ${site.url.replace(/^https?:\/\//, "")}. By placing an order you agree to them.`}
      sections={[
        { heading: "About us", body: [`This website is operated by ${site.legalName}, ${site.address.join(", ")}.`] },
        {
          heading: "Plants are natural products",
          body: [
            "Every plant is unique. Size, shape, leaf count and colour can vary from the photographs, which show a representative specimen. Heights include the pot and are approximate.",
          ],
        },
        {
          heading: "Orders & pricing",
          body: [
            "All prices are in Indian Rupees and include applicable taxes. An order is confirmed once payment is received (or, for cash on delivery, once we confirm it). We may cancel and refund an order if an item becomes unavailable or a pricing error occurs.",
          ],
        },
        {
          heading: "Delivery, returns & guarantee",
          body: [
            <>
              Delivery timelines, returns and our 30-day happiness guarantee are described in our{" "}
              <Link href="/shipping-returns" className="text-moss underline underline-offset-4">
                delivery &amp; returns policy
              </Link>
              .
            </>,
          ],
        },
        {
          heading: "Promotions",
          body: ["Promo codes cannot be combined unless stated, have no cash value and may be withdrawn at any time. One code per order."],
        },
        {
          heading: "Landscaping services",
          body: ["Landscaping projects are governed by a separate written proposal and agreement shared before work begins."],
        },
        {
          heading: "Liability",
          body: ["Our liability for any order is limited to the amount paid for it. Some plants are toxic if eaten — please check the pet-safety information on each plant page."],
        },
        { heading: "Governing law", body: ["These terms are governed by the laws of India, and disputes are subject to the courts of our registered city."] },
      ]}
    />
  );
}
