import Link from "next/link";
import { getCatalog } from "@/lib/catalog-source";
import { cn } from "@/lib/utils";

/** Horizontal strip of collection links — internal linking for shoppers and crawlers alike. */
export async function CollectionPills({ active }: { active?: string }) {
  const { collections } = await getCatalog();
  return (
    <nav aria-label="Collections" className="no-scrollbar -mx-[clamp(1rem,4vw,4rem)] mb-6 flex gap-2 overflow-x-auto px-[clamp(1rem,4vw,4rem)]">
      <Link
        href="/plants"
        className={cn(
          "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
          !active ? "border-cream bg-cream font-semibold text-forest-950" : "border-cream/15 text-cream/75 hover:border-cream/40",
        )}
      >
        All plants
      </Link>
      {collections.map((c) => (
        <Link
          key={c.slug}
          href={`/collections/${c.slug}`}
          aria-current={active === c.slug ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
            active === c.slug ? "border-cream bg-cream font-semibold text-forest-950" : "border-cream/15 text-cream/75 hover:border-cream/40",
          )}
        >
          {c.short}
        </Link>
      ))}
    </nav>
  );
}
