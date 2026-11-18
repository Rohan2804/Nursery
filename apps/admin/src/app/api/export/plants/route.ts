import { NextResponse } from "next/server";
import { can, getAdmin } from "@/lib/auth";
import { PLANT_COLUMNS, toCsv } from "@/lib/csv";
import { loadPlants } from "@/lib/data";

/** Download the catalog as a spreadsheet-friendly CSV (one row per plant, one column per size). */
export async function GET() {
  const admin = await getAdmin();
  if (!admin || !can(admin, "manager")) return new NextResponse("Not authorised", { status: 403 });
  const plants = await loadPlants();
  const v = (p: (typeof plants)[number], size: string) => p.plant_variants.find((x) => x.size === size);
  const rows = plants.map((p) => [
    p.slug, p.name, p.botanical, p.status, p.badge ?? "", p.light.join("|"), p.space.join("|"), p.pet_safe ? "yes" : "no", p.care, p.natural_size, p.featured ? "yes" : "no", p.blurb,
    v(p, "S")?.price ?? "", v(p, "M")?.price ?? "", v(p, "L")?.price ?? "",
    v(p, "S")?.compare_at ?? "", v(p, "M")?.compare_at ?? "", v(p, "L")?.compare_at ?? "",
    v(p, "S")?.stock ?? "", v(p, "M")?.stock ?? "", v(p, "L")?.stock ?? "",
    v(p, "S")?.active === false ? "no" : "yes", v(p, "M")?.active === false ? "no" : "yes", v(p, "L")?.active === false ? "no" : "yes",
    p.seo_title ?? "", p.seo_description ?? "",
  ]);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv([[...PLANT_COLUMNS], ...rows]), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="vanam-plants-${date}.csv"`, "Cache-Control": "no-store" },
  });
}
