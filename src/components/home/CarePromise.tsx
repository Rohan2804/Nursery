import { MessageCircle, Package, ShieldCheck, Sprout } from "lucide-react";
import { FadeUp } from "@/components/ui/RevealText";

const promises = [
  { icon: Sprout, title: "Nursery-grown, never warehoused", body: "Lifted from our beds the day it ships — acclimatised and healthy." },
  { icon: Package, title: "Packed to travel", body: "Plastic-free crates and moisture-locked roots for the journey home." },
  { icon: ShieldCheck, title: "30-day happiness guarantee", body: "If it struggles in the first month, we replace it. No forms." },
  { icon: MessageCircle, title: "Plant doctors on WhatsApp", body: "Send a photo, get advice from our horticulturists — for life." },
];

export function CarePromise() {
  return (
    <section className="container-x pb-[clamp(5rem,10vw,9rem)]">
      <div className="grid gap-px overflow-hidden rounded-[28px] border border-cream/10 bg-cream/10 sm:grid-cols-2 lg:grid-cols-4">
        {promises.map(({ icon: Icon, title, body }, i) => (
          <FadeUp key={title} delay={i * 0.08} className="group bg-forest-950 p-8 transition-colors duration-700 hover:bg-forest-900 md:p-10">
            <Icon className="size-8 text-lime transition-transform duration-700 group-hover:-rotate-12 group-hover:scale-110" strokeWidth={1.3} />
            <h3 className="mt-10 font-display text-[1.75rem] leading-[1.05]">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream/60">{body}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
