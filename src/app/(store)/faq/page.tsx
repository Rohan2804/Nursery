import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { PageHeader } from "@/components/site/PageHeader";
import { faqGroups, allFaqs } from "@/lib/faqs";
import { faqLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description: "Answers about delivery across India, our 30-day plant guarantee, pet-safe plants, payments, gifting and plant care.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Help centre"
        crumbs={[{ name: "FAQs", path: "/faq" }]}
        title={[
          "Good",
          <>
            <em className="text-lime">questions.</em>
          </>,
        ]}
        intro="Everything you might want to know before (and after) bringing a plant home."
      />
      <div className="container-x grid gap-14 pb-28 lg:grid-cols-[260px_1fr]">
        <nav aria-label="FAQ topics" className="hidden lg:block">
          <ul className="sticky top-32 space-y-3 text-sm">
            {faqGroups.map((g) => (
              <li key={g.title}>
                <a href={`#${g.title.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="text-cream/60 hover:text-lime">
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16">
          {faqGroups.map((g) => (
            <section key={g.title} id={g.title.toLowerCase().replace(/[^a-z]+/g, "-")} className="scroll-mt-32">
              <h2 className="eyebrow mb-4 text-sage">{g.title}</h2>
              <FaqAccordion items={g.items} />
            </section>
          ))}
          <div className="rounded-[28px] border border-cream/10 p-8">
            <p className="font-display text-3xl">Still curious?</p>
            <p className="mt-2 text-cream/65">
              Our plant doctors are on{" "}
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="text-lime underline underline-offset-4">
                WhatsApp
              </a>{" "}
              or you can{" "}
              <Link href="/contact" className="text-lime underline underline-offset-4">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
      <JsonLd data={faqLd(allFaqs)} />
    </main>
  );
}
