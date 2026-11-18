export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatINR = (value: number) => inr.format(value);

// Stock photography placeholders (Unsplash). Swap the ids for your own shoot later.
export const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop`;

export const IMAGES = {
  greenhouse: "1470058869958-2a77ade41c02",
  ferns: "1497250681960-ef046c08a56e",
  calatheaLeaves: "1491147334573-44cbb4602074",
  succulentsTexture: "1446071103084-c257b5f70672",
  monsteraLeaf: "1617173944883-6ffbd35d584d",
  plantShop: "1592150621744-aca64f48394a",
  gardenPath: "1585320806297-9794b3e4eeae",
  soilTrowel: "1416879595882-3373a0480b5b",
  cactusField: "1463936575829-25148e1db1b8",
  livingRoom: "1556228453-efd6c1ff04f6",
  bedroomShelf: "1604762524889-3e2fcc145683",
  workspace: "1524758631624-e2822e304c36",
  kitchen: "1586208958839-06c17cacdf08",
  bohoRoom: "1558603668-6570496b66f8",
} as const;

export function scrollToHash(href: string, lenis?: { scrollTo: (t: string, o?: object) => void } | null) {
  const hash = href.slice(href.indexOf("#"));
  const el = document.querySelector(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(hash, { offset: -40, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
}
