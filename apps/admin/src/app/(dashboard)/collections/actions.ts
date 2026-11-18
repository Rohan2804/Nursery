"use server";

import { logActivity, publishChanges, run } from "@/lib/actions";
import { assertRole } from "@/lib/auth";
import { repo } from "@/lib/repo";
import { collectionSchema, type CollectionInput } from "@/lib/schemas";

export async function saveCollection(input: CollectionInput) {
  return run(async () => {
    const admin = await assertRole("manager");
    const c = collectionSchema.parse(input);
    await repo().saveCollection(c);
    await logActivity(admin, c.originalSlug ? "update" : "create", "collection", c.slug, `${c.originalSlug ? "Updated" : "Created"} collection ${c.title}`);
    await publishChanges("/collections");
    return { slug: c.slug };
  }, "Collection saved");
}

export async function deleteCollection(slug: string) {
  return run(async () => {
    const admin = await assertRole("owner");
    const title = await repo().deleteCollection(slug);
    await logActivity(admin, "delete", "collection", slug, `Deleted collection ${title}`);
    await publishChanges("/collections");
  }, "Collection deleted");
}
