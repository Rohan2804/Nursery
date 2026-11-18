import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { FadeUp } from "@/components/ui/RevealText";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact Us",
  description: `Talk to the ${site.name} team — orders, plant care help, landscaping and corporate enquiries. WhatsApp, phone or email; we reply the same day.`,
  path: "/contact",
});

const channels = [
  { icon: MessageCircle, title: "WhatsApp", body: "Fastest for plant-care help — send a photo.", value: "Chat with a plant doctor", href: site.whatsapp },
  { icon: Phone, title: "Call", body: site.hours, value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
  { icon: Mail, title: "Email", body: "For orders, invoices and partnerships.", value: site.email, href: `mailto:${site.email}` },
  { icon: MapPin, title: "Visit", body: site.address.join(", "), value: "Plan your visit", href: "/visit" },
];

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        eyebrow="We reply the same day"
        crumbs={[{ name: "Contact", path: "/contact" }]}
        title={[
          "Let’s talk",
          <>
            <em className="text-lime">plants.</em>
          </>,
        ]}
        intro={
          <>
            Questions about an order, a struggling plant or a garden project — we&rsquo;re here. Many answers are already in our{" "}
            <Link href="/faq" className="text-lime underline underline-offset-4">
              FAQs
            </Link>
            .
          </>
        }
      />

      <section className="container-x grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map(({ icon: Icon, title, body, value, href }, i) => (
          <FadeUp key={title} delay={i * 0.05}>
            <a
              href={href}
              {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
              className="group flex h-full flex-col rounded-[28px] border border-cream/10 p-7 transition-colors hover:border-lime/40 hover:bg-forest-900"
            >
              <Icon className="size-6 text-lime" />
              <h2 className="mt-10 font-display text-3xl">{title}</h2>
              <p className="mt-2 flex-1 text-sm text-cream/60">{body}</p>
              <p className="mt-6 text-sm font-semibold transition-colors group-hover:text-lime">{value} →</p>
            </a>
          </FadeUp>
        ))}
      </section>

      <section className="container-x grid gap-14 pb-28 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-[clamp(2.4rem,4.5vw,4.4rem)] leading-[0.95]">
            Send us a <em className="text-lime">note.</em>
          </h2>
          <p className="mt-6 max-w-md text-cream/70">
            For an existing order, include your order number (it starts with VN-) so we can help faster. You can also{" "}
            <Link href="/track-order" className="text-lime underline underline-offset-4">
              track your order
            </Link>{" "}
            yourself.
          </p>
        </div>
        <EnquiryForm
          submitLabel="Send message"
          successTitle="Message received"
          successBody="Thank you — someone from the nursery will get back to you today."
          fields={[
            { name: "name", label: "Your name", type: "text", required: true, half: true },
            { name: "email", label: "Email", type: "email", required: true, half: true },
            { name: "phone", label: "Mobile (optional)", type: "tel", half: true },
            { name: "topic", label: "Topic", type: "select", options: ["An existing order", "Plant care help", "Landscaping", "Corporate & bulk orders", "Something else"], required: true, half: true },
            { name: "order", label: "Order number (if any)", type: "text" },
            { name: "message", label: "How can we help?", type: "textarea", required: true },
          ]}
        />
      </section>
    </main>
  );
}
