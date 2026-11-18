import { Car, Clock, Coffee, MapPin, Phone, Sprout, Trees, Users } from "lucide-react";
import Image from "next/image";
import { PageHeader } from "@/components/site/PageHeader";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { Button } from "@/components/ui/Button";
import { FadeUp, SectionLabel } from "@/components/ui/RevealText";
import { ogImage, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { img, IMAGES } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Visit the Nursery — Hours, Directions & Guided Tours",
  description: `Walk ${site.acres} acres of greenhouses, terraces and a rare-plant conservatory. Open daily 8 am – 7:30 pm. Book a free guided tour with our growers.`,
  path: "/visit",
  image: ogImage(IMAGES.greenhouse),
});

const zones = [
  { icon: Trees, title: "The tropical greenhouse", body: "Monstera, philodendron and calathea under a misted glass roof.", image: IMAGES.greenhouse },
  { icon: Sprout, title: "Propagation houses", body: "Watch cuttings root and seedlings sprout — the start of every plant we sell.", image: IMAGES.succulentsTexture },
  { icon: MapPin, title: "Open-soil beds", body: "Outdoor plants, topiary and fruit trees raised under real sky.", image: IMAGES.gardenPath },
  { icon: Coffee, title: "The potting café", body: "Chai, repotting benches and planters to choose from.", image: IMAGES.plantShop },
];

const week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function VisitPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Open every day"
        crumbs={[{ name: "Visit the nursery", path: "/visit" }]}
        title={[
          "Soil on your",
          <>
            <em className="text-lime">shoes.</em>
          </>,
        ]}
        intro={`Wander ${site.acres} acres of greenhouses and open beds, talk to the growers who raised every plant, and pick your own specimen.`}
        image={IMAGES.gardenPath}
        imageAlt="A garden path at the Vanam nursery"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#book">Book a guided tour</Button>
          <Button href={site.mapsUrl} variant="ghost" icon={false} target="_blank" rel="noopener noreferrer">
            Get directions
          </Button>
        </div>
      </PageHeader>

      <section className="container-x grid gap-6 pb-24 lg:grid-cols-3">
        <FadeUp className="rounded-[28px] border border-cream/10 p-8">
          <MapPin className="size-6 text-lime" />
          <h2 className="mt-8 font-display text-3xl">Find us</h2>
          <address className="mt-4 space-y-1 not-italic text-cream/70">
            {site.address.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </address>
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-sm font-semibold text-lime underline-offset-4 hover:underline">
            Open in Google Maps →
          </a>
        </FadeUp>
        <FadeUp delay={0.06} className="rounded-[28px] border border-cream/10 p-8">
          <Clock className="size-6 text-lime" />
          <h2 className="mt-8 font-display text-3xl">Opening hours</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {week.map((d) => (
              <div key={d} className="flex justify-between border-b border-cream/5 pb-2">
                <dt className="text-cream/60">{d}</dt>
                <dd>8:00 am – 7:30 pm</dd>
              </div>
            ))}
          </dl>
        </FadeUp>
        <FadeUp delay={0.12} className="rounded-[28px] border border-cream/10 p-8">
          <Car className="size-6 text-lime" />
          <h2 className="mt-8 font-display text-3xl">Good to know</h2>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            <li>Free parking for 60 cars, plus space for tempos to load large plants.</li>
            <li>Wheelchair-friendly main paths and greenhouse.</li>
            <li>Leashed dogs are welcome.</li>
            <li>Large orders can be delivered same-day from the nursery.</li>
          </ul>
          <p className="mt-6 flex items-center gap-2 text-sm">
            <Phone className="size-4 text-lime" /> {site.phone}
          </p>
        </FadeUp>
      </section>

      <section className="container-x pb-24">
        <SectionLabel index="01">What you&rsquo;ll see</SectionLabel>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {zones.map(({ icon: Icon, title, body, image }, i) => (
            <FadeUp key={title} delay={i * 0.06} className="group relative aspect-[16/11] overflow-hidden rounded-[28px]">
              <Image src={img(image)} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <Icon className="size-6 text-lime" />
                <h3 className="mt-4 font-display text-4xl">{title}</h3>
                <p className="mt-2 max-w-md text-cream/75">{body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section id="book" className="scroll-mt-24 border-t border-cream/10 py-24">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <SectionLabel index="02">Guided tours</SectionLabel>
            <h2 className="mt-6 font-display text-[clamp(2.6rem,5vw,5rem)] leading-[0.92] tracking-[-0.03em]">
              Walk with a <em className="text-lime">grower.</em>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/70">
              A free 45-minute tour through the greenhouses and propagation houses, with time for questions and a cutting to take home.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-cream/75">
              <li className="flex items-center gap-3">
                <Clock className="size-4 text-lime" /> Daily at 10 am and 4 pm
              </li>
              <li className="flex items-center gap-3">
                <Users className="size-4 text-lime" /> Up to 12 people per tour — schools and groups welcome
              </li>
            </ul>
          </div>
          <EnquiryForm
            submitLabel="Request my tour"
            successTitle="See you soon!"
            successBody="We'll confirm your tour on WhatsApp within a few hours."
            fields={[
              { name: "name", label: "Your name", type: "text", required: true },
              { name: "phone", label: "Mobile number", type: "tel", required: true, half: true },
              { name: "email", label: "Email (optional)", type: "email", half: true },
              { name: "date", label: "Preferred date", type: "date", required: true, half: true },
              { name: "time", label: "Tour time", type: "select", options: ["10:00 am", "4:00 pm"], required: true, half: true },
              { name: "group", label: "Group size", type: "select", options: ["1–2", "3–5", "6–12", "School / large group"], required: true },
              { name: "notes", label: "Anything we should know? (optional)", type: "textarea" },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
