import { IMAGES } from "./utils";

export type GuideSection = { heading: string; body: string[]; list?: string[]; tip?: string };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: "Basics" | "Seasonal" | "Know your plant" | "Home & lifestyle";
  image: string;
  date: string;
  readMinutes: number;
  author: string;
  /** Product ids to recommend alongside the article. */
  products: string[];
  sections: GuideSection[];
};

export const guides: Guide[] = [
  {
    slug: "how-often-to-water-indoor-plants",
    title: "How often should you water indoor plants?",
    description: "The finger test, the weight test and the seasonal rhythm our growers use — a simple, India-specific watering guide for indoor plants.",
    category: "Basics",
    image: IMAGES.soilTrowel,
    date: "2026-10-02",
    readMinutes: 6,
    author: "Vanam Growers",
    products: ["zz", "snake", "pothos", "monstera"],
    sections: [
      {
        heading: "Forget the schedule, read the soil",
        body: [
          "More houseplants are lost to overwatering than to anything else. Roots need air as much as water, and soil that never dries out slowly suffocates them.",
          "Instead of watering every Sunday, check the soil. Push a finger in up to the second knuckle — about five centimetres. If it feels dry, water. If it feels cool and damp, wait two or three days and check again.",
        ],
        tip: "Lift the pot just after a thorough watering and remember the weight. A light pot is a thirsty pot.",
      },
      {
        heading: "Water deeply, then let it drain",
        body: [
          "When you do water, water thoroughly until it runs from the drainage hole, then empty the saucer after fifteen minutes. A small sip every day keeps the top wet and the roots dry — the worst of both worlds.",
        ],
      },
      {
        heading: "Adjust for Indian seasons",
        body: ["Our climate swings hard, and your watering should swing with it."],
        list: [
          "Summer (March–June): plants drink fastest. Check every 3–4 days, especially near sunny windows.",
          "Monsoon (July–September): humidity is high and growth slows indoors. Water roughly half as often and watch for fungus gnats.",
          "Winter (November–February): most plants rest. Many need water only every 10–14 days.",
          "Air-conditioned rooms dry soil and leaves faster — check more often and consider a pebble tray.",
        ],
      },
      {
        heading: "Know your plant's personality",
        body: [
          "Succulents, ZZ plants and snake plants store water and prefer to dry out completely. Calatheas and ferns like evenly moist soil. Pothos and Monstera sit happily in between. Every Vanam plant ships with a care card that tells you which camp it belongs to.",
        ],
      },
    ],
  },
  {
    slug: "best-low-light-indoor-plants",
    title: "The best plants for low-light rooms",
    description: "North-facing flat or a dim corridor? These are the low-light indoor plants our growers trust — and how to keep them thriving.",
    category: "Know your plant",
    image: "1632207691143-643e2a9a9361",
    date: "2026-09-18",
    readMinutes: 5,
    author: "Vanam Growers",
    products: ["zz", "snake", "pothos", "calathea"],
    sections: [
      {
        heading: "What 'low light' really means",
        body: [
          "Low light isn't no light. A plant several metres from a window, in a north-facing room or a corridor that gets bounced daylight, is in low light. A windowless bathroom lit only by a bulb is in darkness — no plant thrives there long-term.",
          "A quick test: at midday, if you can comfortably read a book without switching on a lamp, most low-light plants will be happy.",
        ],
      },
      {
        heading: "Our five favourites",
        body: ["These are the plants we put in our own darkest corners."],
        list: [
          "ZZ Plant — glossy, architectural and nearly indestructible. Water every 2–3 weeks.",
          "Snake Plant — upright blades that tolerate almost anything, and release oxygen at night.",
          "Golden Pothos — trailing heart-shaped leaves; perfect for shelves and hooks.",
          "Calathea — patterned leaves that fold up at dusk. Pet-safe, but likes humidity.",
          "Rubber Plant — copes with soft light, grows taller in brighter spots.",
        ],
      },
      {
        heading: "Low light, less water",
        body: [
          "Plants in dim spots photosynthesise slowly and use far less water. Halve the watering you'd give the same plant by a window, and always check the soil first.",
        ],
        tip: "Wipe leaves monthly with a damp cloth. In low light, every bit of leaf surface counts.",
      },
    ],
  },
  {
    slug: "monsoon-plant-care-india",
    title: "Monsoon plant care: keeping plants healthy through the rains",
    description: "Root rot, fungus gnats and leggy growth — how to protect indoor and balcony plants through the Indian monsoon.",
    category: "Seasonal",
    image: IMAGES.ferns,
    date: "2026-07-05",
    readMinutes: 7,
    author: "Vanam Growers",
    products: ["snake", "zz", "rubber", "eucalyptus"],
    sections: [
      {
        heading: "Why the monsoon is tricky",
        body: [
          "High humidity, grey skies and still air mean soil stays wet for longer while plants grow more slowly. It's the perfect recipe for root rot and fungal problems — for indoor and outdoor plants alike.",
        ],
      },
      {
        heading: "Indoors: water less, ventilate more",
        body: ["Most indoor plants need roughly half their summer watering during the rains."],
        list: [
          "Check soil before every watering — it may stay damp for a week.",
          "Empty saucers promptly; standing water invites mosquitoes and rot.",
          "Open windows on dry days or run a fan for air circulation.",
          "Move plants a little closer to windows to make up for cloudy days.",
        ],
      },
      {
        heading: "Balconies: drainage is everything",
        body: [
          "Make sure every pot has clear drainage holes and raise pots on feet or bricks so they don't sit in pooled water. Succulents and cacti are happiest under a ledge, sheltered from direct downpours.",
        ],
        tip: "Tiny black flies hovering over the soil are fungus gnats — a sign the soil is staying too wet. Let it dry out and top-dress with a layer of sand.",
      },
      {
        heading: "Hold the fertiliser",
        body: ["Slow growth means plants need little feeding. Pause fertiliser for most indoor plants until the rains ease, and resume gently in October."],
      },
    ],
  },
  {
    slug: "how-to-repot-a-plant",
    title: "How to repot a plant (without the stress)",
    description: "When to repot, choosing the right pot size, the best potting mix and a step-by-step method from our nursery team.",
    category: "Basics",
    image: IMAGES.succulentsTexture,
    date: "2026-08-21",
    readMinutes: 6,
    author: "Vanam Growers",
    products: ["monstera", "fiddle", "rubber", "spider"],
    sections: [
      {
        heading: "Signs it's time",
        body: ["Most indoor plants need repotting every 12–24 months. Look for:"],
        list: [
          "Roots growing out of the drainage hole or circling the surface",
          "Water running straight through without soaking in",
          "Growth that has stalled despite good light and care",
        ],
      },
      {
        heading: "Go up just one size",
        body: [
          "Choose a pot 2–5 cm wider than the current one. A much bigger pot holds more wet soil than the roots can use, which leads to rot. Always use a pot with a drainage hole.",
        ],
      },
      {
        heading: "Step by step",
        body: ["Repot in spring or early autumn, when plants are actively growing."],
        list: [
          "Water the plant the day before so the root ball holds together.",
          "Tip the pot sideways and ease the plant out — squeeze plastic pots to loosen.",
          "Gently tease apart circling roots and trim any that are black or mushy.",
          "Add fresh potting mix to the new pot so the plant sits at the same depth.",
          "Fill around the sides, firm lightly and water thoroughly.",
          "Keep it out of harsh sun for a week while it recovers.",
        ],
        tip: "Our house mix is two parts cocopeat, one part compost and one part perlite or coarse sand — airy, rich and free-draining.",
      },
    ],
  },
  {
    slug: "pet-safe-plants-for-cats-and-dogs",
    title: "Pet-safe plants for homes with cats and dogs",
    description: "Which houseplants are non-toxic to cats and dogs, which to avoid, and how to keep curious pets and plants living happily together.",
    category: "Home & lifestyle",
    image: IMAGES.calatheaLeaves,
    date: "2026-09-02",
    readMinutes: 5,
    author: "Vanam Growers",
    products: ["calathea", "orchid", "spider", "haworthia"],
    sections: [
      {
        heading: "Plants you can relax around",
        body: ["These popular plants are widely listed as non-toxic to cats and dogs:"],
        list: [
          "Calathea and other prayer plants",
          "Phalaenopsis (moth) orchids",
          "Spider plant",
          "Haworthia",
          "Areca and parlour palms",
          "Boston fern",
        ],
      },
      {
        heading: "Plants to place out of reach",
        body: [
          "Some much-loved plants contain compounds that can irritate the mouth and stomach if chewed — including Monstera, pothos, ZZ, snake plant, rubber plant and aloe. They're fine to own; just keep them on high shelves or in rooms pets don't visit.",
        ],
      },
      {
        heading: "Living together happily",
        body: [
          "Cats often nibble plants out of boredom or to aid digestion. A pot of cat grass gives them something of their own. Hanging planters and sturdy, heavy pots help with tail-wagging dogs.",
        ],
        tip: "If you suspect your pet has eaten something toxic, contact your vet straight away and take a photo of the plant with you.",
      },
    ],
  },
];

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);
