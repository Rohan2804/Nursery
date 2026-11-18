import Image from "next/image";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { Button } from "@/components/ui/Button";
import { FadeUp, SectionLabel } from "@/components/ui/RevealText";
import { absoluteUrl, ogImage, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { img, IMAGES } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Landscaping & Garden Design Services",
  description: "Garden and landscape design, terrace and vertical gardens, corporate greening and plant maintenance — designed, grown and planted by the Vanam nursery.",
  path: "/landscaping",
  image: ogImage(IMAGES.gardenPath),
});

const services = [
  { title: "Garden & landscape design", body: "Master-planned gardens for villas, farmhouses and estates — planting plans, hardscape, lighting and irrigation.", image: IMAGES.gardenPath },
  { title: "Terrace & vertical gardens", body: "Rooftop oases, green walls and balcony makeovers engineered for weight, waterproofing and wind.", image: "1598880940080-ff9a29891b85" },
  { title: "Corporate greening", body: "Biophilic offices, lobbies, restaurants and hotels — designed, installed and maintained on a plan.", image: IMAGES.workspace },
  { title: "Plant care & maintenance", body: "Scheduled visits from our gardeners: pruning, feeding, pest care and seasonal replacements.", image: IMAGES.soilTrowel },
];

const process = [
  { title: "Site visit", body: "We walk your space, measure light and soil, and listen to how you want to use it." },
  { title: "Design", body: "A planting plan and 3D concept, with plants chosen from what thrives in your city." },
  { title: "Grow & build", body: "Plants are selected from our own beds; our team handles hardscape and irrigation." },
  { title: "Plant & care", body: "We plant, then return for the first season to make sure everything establishes." },
];

export default function LandscapingPage() {
  return (
    <main>
      <PageHeader
        eyebrow={`${(site.gardens / 1000).toFixed(0)}k+ gardens planted`}
        crumbs={[{ name: "Landscaping", path: "/landscaping" }]}
        title={[
          "Landscapes,",
          <>
            <em className="text-lime">grown</em> by us.
          </>,
        ]}
        intro="Most landscapers buy plants in. We grow ours — which means healthier gardens, better-matched species and one team accountable from design to the last leaf."
        image={IMAGES.gardenPath}
        imageAlt="A landscaped garden path designed by Vanam"
      >
        <div className="mt-8">
          <Button href="#consult">Request a consultation</Button>
        </div>
      </PageHeader>

      <section className="container-x pb-24">
        <SectionLabel index="01">Services</SectionLabel>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((s, i) => (
            <FadeUp key={s.title} delay={i * 0.06} className="group overflow-hidden rounded-[28px] border border-cream/10 bg-forest-900">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={img(s.image)} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
              </div>
              <div className="p-8">
                <h2 className="font-display text-4xl">{s.title}</h2>
                <p className="mt-3 text-cream/65">{s.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="bg-bone py-24 text-forest-950">
        <div className="container-x">
          <SectionLabel index="02" className="!text-moss">
            How it works
          </SectionLabel>
          <h2 className="mt-6 font-display text-[clamp(2.6rem,5vw,5rem)] leading-[0.92] tracking-[-0.03em]">
            From bare ground to <em className="text-moss">thriving.</em>
          </h2>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-forest-950/10 bg-forest-950/10 md:grid-cols-4">
            {process.map((p, i) => (
              <li key={p.title} className="bg-bone p-8">
                <span className="font-display text-6xl text-moss">0{i + 1}</span>
                <h3 className="mt-8 font-display text-3xl">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-forest-950/65">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="consult" className="scroll-mt-24 py-24">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <SectionLabel index="03">Start a project</SectionLabel>
            <h2 className="mt-6 font-display text-[clamp(2.6rem,5vw,5rem)] leading-[0.92] tracking-[-0.03em]">
              Tell us about your <em className="text-lime">space.</em>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/70">
              Our design team replies within one working day to arrange a site visit. Consultations within city limits are complimentary.
            </p>
          </div>
          <EnquiryForm
            submitLabel="Request a consultation"
            successTitle="Thank you!"
            successBody="A member of our design team will call you within one working day."
            fields={[
              { name: "name", label: "Your name", type: "text", required: true },
              { name: "phone", label: "Mobile number", type: "tel", required: true, half: true },
              { name: "email", label: "Email", type: "email", required: true, half: true },
              { name: "service", label: "Service", type: "select", options: services.map((s) => s.title), required: true, half: true },
              { name: "size", label: "Approximate area", type: "select", options: ["Balcony / under 200 sq ft", "200–1,000 sq ft", "1,000–5,000 sq ft", "Over 5,000 sq ft"], required: true, half: true },
              { name: "city", label: "City", type: "text", required: true },
              { name: "brief", label: "Tell us a little about the space and what you'd love", type: "textarea" },
            ]}
          />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Landscape design and garden maintenance",
          provider: { "@id": absoluteUrl("/#business") },
          areaServed: { "@type": "Country", name: "India" },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Landscaping services",
            itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, description: s.body } })),
          },
        }}
      />
    </main>
  );
}
