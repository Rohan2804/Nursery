// Brand configuration — change the name, story, contact details and domain here.
export const site = {
  name: "Vanam",
  legalName: "Vanam Nursery",
  tagline: "House of Plants",
  // Production domain — used for canonical URLs, sitemap and social cards.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vanam.in",
  description:
    "Hand-raised indoor plants, outdoor plants and landscaping from our 12-acre nursery, family-run since 1994. Delivered fresh across India with a 30-day happiness guarantee.",
  established: 1994,
  acres: 12,
  varieties: 1200,
  gardens: 50000,
  freeDeliveryAbove: 1999,
  address: ["Vanam Nursery, Survey No. 42", "Nursery Road, Your City 411000"],
  addressParts: { street: "Survey No. 42, Nursery Road", city: "Your City", region: "Maharashtra", postalCode: "411000", country: "IN" },
  geo: { lat: 18.5204, lng: 73.8567 },
  mapsUrl: "https://maps.google.com/?q=18.5204,73.8567",
  hours: "Open daily · 8:00 am – 7:30 pm",
  openingHours: { opens: "08:00", closes: "19:30" },
  phone: "+91 98765 43210",
  whatsapp: "https://wa.me/919876543210",
  email: "hello@vanam.in",
  social: {
    instagram: "https://instagram.com/vanam",
    youtube: "https://youtube.com/@vanam",
    pinterest: "https://pinterest.com/vanam",
  },
  // Turn on only once ratings come from real, verified customer reviews.
  publishRatingsInStructuredData: false,
} as const;

export const nav = [
  { label: "Shop", href: "/plants" },
  { label: "Plant Finder", href: "/#finder" },
  { label: "Care Guides", href: "/care-guides" },
  { label: "Landscaping", href: "/landscaping" },
  { label: "Visit Us", href: "/visit" },
] as const;

export const footerNav = [
  {
    title: "Shop",
    links: [
      { label: "All plants", href: "/plants" },
      { label: "Indoor plants", href: "/collections/indoor-plants" },
      { label: "Outdoor & garden", href: "/collections/outdoor-plants" },
      { label: "Pet-friendly plants", href: "/collections/pet-friendly-plants" },
      { label: "Plant gifts", href: "/collections/plant-gifts" },
      { label: "All collections", href: "/collections" },
    ],
  },
  {
    title: "Care",
    links: [
      { label: "Plant care guides", href: "/care-guides" },
      { label: "Plant finder quiz", href: "/#finder" },
      { label: "Track your order", href: "/track-order" },
      { label: "Delivery & returns", href: "/shipping-returns" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Landscaping", href: "/landscaping" },
      { label: "Visit the nursery", href: "/visit" },
      { label: "Contact", href: "/contact" },
      { label: "My account", href: "/account" },
    ],
  },
] as const;
