"use server";

import { z } from "zod";
import { check, logActivity, publishChanges, run } from "@/lib/actions";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const planterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "ID must be lowercase letters, numbers and hyphens").min(2),
  label: z.string().trim().min(2).max(40),
  note: z.string().trim().max(80),
  price: z.number().int().min(0),
  swatch: z.string().regex(/^#[0-9a-f]{6}$/i, "Swatch must be a hex colour like #b8653c"),
  active: z.boolean(),
  sortOrder: z.number().int(),
});

export async function savePlanters(input: z.infer<typeof planterSchema>[]) {
  return run(async () => {
    const admin = await assertRole("manager");
    const list = z.array(planterSchema).parse(input);
    if (!list.some((p) => p.active)) throw new Error("Keep at least one planter available.");
    const supabase = await createClient();
    check(
      await supabase
        .from("planters")
        .upsert(list.map((p) => ({ id: p.id, label: p.label, note: p.note, price: p.price, swatch: p.swatch, active: p.active, sort_order: p.sortOrder })))
        .select("id"),
    );
    await logActivity(admin, "update", "planter", null, `Updated planter options (${list.length})`);
    await publishChanges("/planters");
  }, "Planters saved");
}
