import type { Light } from "./catalog";

export type PlantDetails = {
  water: string;
  waterLevel: 1 | 2 | 3;
  humidity: string;
  humidityLevel: 1 | 2 | 3;
  temperature: string;
  origin: string;
  growerNote: string;
};

export const lightCopy: Record<Light, { label: string; body: string }> = {
  low: { label: "Low light", body: "Happy several metres from a window or in a north-facing room." },
  medium: { label: "Soft, indirect light", body: "A few feet from a window, or behind a sheer curtain." },
  bright: { label: "Bright, indirect light", body: "Right beside a large window, out of harsh afternoon sun." },
  sun: { label: "Direct sun", body: "At least 4–6 hours of direct sunlight on a terrace or south sill." },
};

const d = (x: PlantDetails) => x;

export const details: Record<string, PlantDetails> = {
  monstera: d({ water: "Every 7–10 days, when the top 5 cm is dry", waterLevel: 2, humidity: "Loves 60%+ — mist in dry months", humidityLevel: 3, temperature: "18–30 °C", origin: "Rainforests of southern Mexico", growerNote: "We stake every Monstera on a coir pole from its third leaf, so it arrives climbing — not flopping." }),
  zz: d({ water: "Every 2–3 weeks; let it dry out fully", waterLevel: 1, humidity: "Any household humidity", humidityLevel: 1, temperature: "15–32 °C", origin: "Eastern Africa", growerNote: "Its potato-like rhizomes store water, so the only way to harm a ZZ is kindness. Forget it a little." }),
  fiddle: d({ water: "Weekly, evenly — never soggy", waterLevel: 2, humidity: "40–60%, away from AC drafts", humidityLevel: 2, temperature: "18–30 °C", origin: "Tropical West Africa", growerNote: "Fiddles hate being moved. Pick its spot on day one, rotate a quarter-turn monthly, and leave it be." }),
  calathea: d({ water: "Keep lightly moist; use filtered water", waterLevel: 3, humidity: "High — 60%+, a pebble tray helps", humidityLevel: 3, temperature: "18–28 °C", origin: "Bolivian forest floor", growerNote: "The leaves fold up at night and open at dawn — we call them our prayer plants. Crispy edges mean thirsty air." }),
  snake: d({ water: "Every 2–3 weeks; less in monsoon", waterLevel: 1, humidity: "Any household humidity", humidityLevel: 1, temperature: "15–35 °C", origin: "West Africa", growerNote: "One of the few plants that releases oxygen at night — the best bedroom companion we grow." }),
  pothos: d({ water: "Weekly, when the top inch is dry", waterLevel: 2, humidity: "Any; loves a bathroom", humidityLevel: 2, temperature: "15–32 °C", origin: "Mo'orea, French Polynesia", growerNote: "Snip a vine just below a node, drop it in water and you'll have a new plant in three weeks." }),
  bonsai: d({ water: "Every 3–4 days; never let it dry out", waterLevel: 3, humidity: "Moderate — mist the leaves", humidityLevel: 2, temperature: "16–30 °C", origin: "Southern China & Southeast Asia", growerNote: "Each bonsai is shaped by hand in our nursery for six years. Its free first pruning visit is on us." }),
  orchid: d({ water: "Weekly soak for 10 min, then drain", waterLevel: 2, humidity: "50–70%", humidityLevel: 3, temperature: "18–29 °C", origin: "Southeast Asian cloud forests", growerNote: "Shipped in bud so you enjoy every bloom. Cut the spike above the second node to encourage a rebloom." }),
  spider: d({ water: "Weekly; a bit more in summer", waterLevel: 2, humidity: "Any household humidity", humidityLevel: 1, temperature: "13–30 °C", origin: "Southern Africa", growerNote: "Happy plants send out 'spiderettes'. Pot them up and share — our oldest mother plant is 22 years old." }),
  rubber: d({ water: "Every 10 days, when half-dry", waterLevel: 2, humidity: "Any household humidity", humidityLevel: 1, temperature: "16–32 °C", origin: "Northeast India & Malaysia", growerNote: "Wipe its leaves monthly with a damp cloth — they photosynthesise better and gleam like lacquer." }),
  topiary: d({ water: "Every 2–3 days outdoors in summer", waterLevel: 3, humidity: "Outdoor air", humidityLevel: 2, temperature: "10–38 °C", origin: "Clipped in our own nursery", growerNote: "Five years of hand-clipping go into each standard. Trim new growth every six weeks to keep the globe crisp." }),
  haworthia: d({ water: "Every 2 weeks; soak and dry", waterLevel: 1, humidity: "Low — keep it airy", humidityLevel: 1, temperature: "10–32 °C", origin: "Eastern Cape, South Africa", growerNote: "Haworthias blush pink when they're getting a little too much sun — move them back a foot." }),
  cactus: d({ water: "Monthly; none in monsoon", waterLevel: 1, humidity: "Dry", humidityLevel: 1, temperature: "10–40 °C", origin: "Central Mexico", growerNote: "Slow and steady — a golden barrel grows about a centimetre a year, so the one you get is genuinely seasoned." }),
  eucalyptus: d({ water: "Every 2–3 days in the pot", waterLevel: 3, humidity: "Outdoor air", humidityLevel: 1, temperature: "8–38 °C", origin: "New South Wales, Australia", growerNote: "Pinch the tips each month for a bushier plant — and keep the cuttings for a fragrant vase." }),
};
