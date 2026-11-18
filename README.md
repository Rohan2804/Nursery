# Vanam — House of Plants (customer storefront)

Premium online storefront for the nursery. Next.js 15 · React 19 · Tailwind CSS v4 · Framer Motion · Lenis smooth scroll.

## Run it

Requires Node.js 20+ **with npm** (the macOS installer from https://nodejs.org includes both).

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Where things live

| What | File |
| --- | --- |
| Brand name, address, hours, phone, delivery threshold | `src/lib/site.ts` |
| Plants, prices, rooms/light tiles, plant-finder logic | `src/lib/catalog.ts` |
| Photography ids (Unsplash placeholders) | `src/lib/utils.ts` → `IMAGES` |
| Colours, fonts, easing tokens | `src/app/globals.css` (`@theme`) |
| Homepage section order | `src/app/(store)/page.tsx` |
| Plant detail page | `src/app/(store)/plants/[id]/page.tsx` + `src/components/product/` |
| Checkout | `src/app/checkout/page.tsx` + `src/components/checkout/` |
| Sizes, planters & pricing rules | `src/lib/variants.ts` |
| Per-plant care details & grower notes | `src/lib/plant-details.ts` |

## Homepage sections

1. **Preloader** — curtain + counter, once per session
2. **Hero** — full-bleed greenhouse that recedes into a framed window on scroll, masked headline reveal, pointer parallax, "Plant of the month" card
3. **Marquee** — brand promises ticker
4. **Collection** — filterable bestseller grid with quick-add, wishlist, care badges
5. **Shop by space** — By room / By light; expanding accordion on desktop, swipe cards on mobile
6. **Our roots** — words light up as you scroll, with inline image pills
7. **Care promise** — four trust pillars
8. **Plant finder** — 4-question quiz scored against the real catalogue
9. **Visit the nursery** — parallax collage, animated stats, address & booking
10. **Landscaping services** — list with a cursor-following image preview
11. **Footer** — newsletter, links, giant wordmark

Global: hide-on-scroll header with announcement bar, slide-out bag with free-delivery progress (persists in the browser), contextual cursor labels, reduced-motion support.

## All pages

| Route | What it is |
| --- | --- |
| `/` | Homepage |
| `/plants` | Shop all — filters (type, light, placement, care, price, size, pet safe), sort and search, all kept in the URL |
| `/collections`, `/collections/[slug]` | 14 SEO landing pages by type, room, light and need (`src/lib/collections.ts`) |
| `/plants/[id]` | Plant detail — gallery, size & planter, pincode estimate, care, reviews (sample), related |
| `/checkout` | 3-step checkout with confirmation (payment simulated) |
| `/track-order` | Track by order number + mobile |
| `/account` | Phone-OTP sign-in (preview mode), orders, addresses, profile |
| `/wishlist` | Saved plants |
| `/care-guides`, `/care-guides/[slug]` | Journal + 5 articles (`src/lib/guides.ts`) |
| `/about`, `/visit`, `/landscaping`, `/contact`, `/faq` | Brand & service pages, with enquiry / booking forms |
| `/shipping-returns`, `/privacy-policy`, `/terms` | Policy pages (templates — get legal review) |

Header search opens with the **/** key and searches plants, collections and guides.

## SEO

- Per-page title, description, canonical URL, Open Graph & Twitter cards (`pageMetadata` in `src/lib/seo.ts`)
- `sitemap.xml` (with product images), `robots.txt`, web manifest, favicon, generated brand share image
- JSON-LD: GardenStore/LocalBusiness + WebSite search (every page), Product + AggregateOffer, BreadcrumbList, CollectionPage, Article, FAQPage, Service
- Product ratings are **not** emitted as structured data until real reviews exist — flip `publishRatingsInStructuredData` in `src/lib/site.ts`
- Set the real domain with `NEXT_PUBLIC_SITE_URL` (defaults to `https://www.vanam.in`)

## Not yet connected (preview only)

- **Payments** — `placeOrder` in `src/components/checkout/Checkout.tsx` (e.g. Razorpay)
- **Accounts & orders** — stored in the browser via `src/lib/account-store.ts`; any 6-digit OTP works
- **Forms** (tour booking, consultation, contact, newsletter) — show success but send nothing; wire `EnquiryForm` to an API/CRM
- **Reviews** on plant pages are sample text
- Address, phone, map pin, history milestones and social links are placeholders in `src/lib/site.ts` and `/about`

## Production build alongside the dev server

```bash
NEXT_DIST_DIR=.next-build npm run build
```
