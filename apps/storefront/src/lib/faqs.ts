import { site } from "./site";

export type Faq = { q: string; a: string };

const free = `₹${site.freeDeliveryAbove.toLocaleString("en-IN")}`;

export const faqGroups: { title: string; items: Faq[] }[] = [
  {
    title: "Orders & delivery",
    items: [
      { q: "Where do you deliver?", a: "We deliver across India. Our home city gets same-day and next-day slots; metro cities usually receive plants in 2–3 days and the rest of India in 3–5 days." },
      { q: "How much does delivery cost?", a: `Standard delivery is free on orders above ${free}; below that it is ₹99. Express next-day delivery is ₹149.` },
      { q: "Can I choose a delivery slot?", a: "Yes. At checkout you can pick the day and a morning, afternoon or evening window. We'll WhatsApp you on the day with a live update." },
      { q: "How are plants packed?", a: "In plastic-free, ventilated crates with moisture-locked roots and paper cushioning, so plants arrive upright and hydrated." },
    ],
  },
  {
    title: "Plant health & guarantee",
    items: [
      { q: "What is the 30-day happiness guarantee?", a: "If your plant struggles in its first 30 days, send us a photo on WhatsApp. If it's something we can't help you fix, we'll replace it — no forms, no fuss." },
      { q: "My plant dropped a leaf after delivery. Is that normal?", a: "Yes. Plants often shed an older leaf while adjusting to a new home. Keep it in the recommended light, don't overwater, and give it two weeks to settle." },
      { q: "Do you offer plant care help after purchase?", a: "Always. Our plant doctors answer on WhatsApp for the life of your plant — just send a photo and a description." },
    ],
  },
  {
    title: "Products",
    items: [
      { q: "Are your plants really grown at your nursery?", a: `Yes. We have grown plants at our ${site.acres}-acre nursery since ${site.established}. Every plant is lifted from our beds the day it ships — never warehoused.` },
      { q: "Which plants are safe for cats and dogs?", a: "Look for the 'Pet safe' badge, or browse our Pet-Friendly collection. Calathea, orchids, spider plants and haworthia are all non-toxic." },
      { q: "Can I choose a planter?", a: "Yes. Every plant can be sent in a recycled nursery pot, terracotta, glazed ceramic or matte stone planter, chosen on the product page." },
    ],
  },
  {
    title: "Returns, payments & gifting",
    items: [
      { q: "What payment methods do you accept?", a: "UPI, all major credit and debit cards, net banking and cash on delivery (₹49 handling fee)." },
      { q: "Can I send a plant as a gift?", a: "Of course. Choose gift wrap at checkout for linen wrapping, hidden prices and a hand-written note from the nursery." },
      { q: "Can I return a plant?", a: "As living things, plants can't be returned for change of mind, but anything damaged or unhealthy on arrival is replaced under our guarantee. Planters can be returned unused within 7 days." },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);
