"use server";

import { z } from "zod";
import { logActivity, publishChanges, run } from "@/lib/actions";
import { assertRole } from "@/lib/auth";
import { rowSchema, type ImportRow } from "@/lib/import-schema";
import { repo } from "@/lib/repo";

/** Upsert plants by slug, then their three sizes. Care details and photos are left untouched. */
export async function importPlants(input: ImportRow[]) {
  return run(async () => {
    const admin = await assertRole("manager");
    const rows = z.array(rowSchema).min(1).max(1000).parse(input);
    const count = await repo().importPlants(rows);
    await logActivity(admin, "import", "plant", null, `Imported ${count} plants from CSV`);
    await publishChanges("/plants", "/inventory");
    return { count };
  }, `Imported ${input.length} plants`);
}
