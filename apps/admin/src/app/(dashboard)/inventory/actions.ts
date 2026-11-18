"use server";

import { z } from "zod";
import { logActivity, publishChanges, run } from "@/lib/actions";
import { assertRole } from "@/lib/auth";
import { repo } from "@/lib/repo";

const changesSchema = z
  .array(z.object({ id: z.string().uuid(), label: z.string(), stock: z.number().int().min(0).max(100000), from: z.number().int() }))
  .min(1)
  .max(500);

/** Staff and above may change stock (in Supabase via set_stock, which can't touch prices). */
export async function saveStock(input: z.infer<typeof changesSchema>) {
  return run(async () => {
    const admin = await assertRole("staff");
    const changes = changesSchema.parse(input);
    await repo().setStock(changes);
    const summary = changes.length <= 3 ? changes.map((c) => `${c.label} ${c.from}→${c.stock}`).join(", ") : `${changes.length} sizes`;
    await logActivity(admin, "stock", "variant", null, `Updated stock: ${summary}`);
    await publishChanges("/inventory", "/plants");
    return { count: changes.length };
  }, `Stock updated for ${input.length} size${input.length === 1 ? "" : "s"}`);
}
