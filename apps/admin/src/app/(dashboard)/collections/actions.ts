"use server";

import { check, logActivity, publishChanges, run } from "@/lib/actions";
import { assertRole } from "@/lib/auth";
import { collectionSchema, type CollectionInput } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

export async function saveCollection(input: CollectionInput) {
  return run(async () => {
    const admin = await assertRole("manager");
    const c = collectionSchema.parse(input);
    const supabase = await createClient();
    const row = {
      slug: c.slug,
      grp: c.group,
      title: c.title,
      short: c.short,
      description: c.description,
      intro: c.intro,
      image_url: c.image,
      rules: c.rules,
      status: c.status,
      seo_title: c.seoTitle || null,
      seo_description: c.seoDescription || null,
      sort_order: c.sortOrder,
    };
    if (c.originalSlug) check(await supabase.from("collections").update(row).eq("slug", c.originalSlug).select("slug").single());
    else check(await supabase.from("collections").insert(row).select("slug").single());
    await logActivity(admin, c.originalSlug ? "update" : "create", "collection", c.slug, `${c.originalSlug ? "Updated" : "Created"} collection ${c.title}`);
    await publishChanges("/collections");
    return { slug: c.slug };
  }, "Collection saved");
}

export async function deleteCollection(slug: string) {
  return run(async () => {
    const admin = await assertRole("owner");
    const supabase = await createClient();
    const row = check<{ title: string }>(await supabase.from("collections").delete().eq("slug", slug).select("title").single());
    await logActivity(admin, "delete", "collection", slug, `Deleted collection ${row.title}`);
    await publishChanges("/collections");
  }, "Collection deleted");
}
