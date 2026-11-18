"use client";

import { matchesRules, type Collection, type CollectionRules, type Product } from "@vanam/catalog";
import { ExternalLink, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { Button, Card, Chips, Field, PageHeader, Segmented, StatusPill } from "@/components/ui";
import { cn, slugify } from "@/lib/cn";
import type { CollectionInput } from "@/lib/schemas";
import { deleteCollection, saveCollection } from "./actions";

const LIGHT = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Soft" },
  { value: "bright", label: "Bright" },
  { value: "sun", label: "Full sun" },
] as const;
const SPACE = [
  { value: "desk", label: "Tabletop" },
  { value: "floor", label: "Floor" },
  { value: "hanging", label: "Hanging" },
  { value: "outdoor", label: "Outdoor" },
] as const;

const fromCollection = (c: Collection | null): CollectionInput => ({
  originalSlug: c?.slug,
  slug: c?.slug ?? "",
  group: c?.group ?? "Need",
  title: c?.title ?? "",
  short: c?.short ?? "",
  description: c?.description ?? "",
  intro: c?.intro ?? "",
  image: c?.image ?? "",
  rules: c?.rules ?? { match: "all" },
  status: c?.status ?? "draft",
  seoTitle: c?.seoTitle ?? null,
  seoDescription: c?.seoDescription ?? null,
  sortOrder: c?.sortOrder ?? 100,
});

/** Drop empty rule fields so stored JSON stays tidy. */
const clean = (r: CollectionRules): CollectionRules =>
  Object.fromEntries(Object.entries(r).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))) as CollectionRules;

export function CollectionForm({
  collection,
  plants,
  canEdit,
  canDelete,
  storefrontUrl,
}: {
  collection: Collection | null;
  plants: Product[];
  canEdit: boolean;
  canDelete: boolean;
  storefrontUrl: string;
}) {
  const initial = useMemo(() => fromCollection(collection), [collection]);
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!!collection);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const isNew = !collection;
  const r = form.rules;

  const set = <K extends keyof CollectionInput>(k: K, v: CollectionInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setRule = <K extends keyof CollectionRules>(k: K, v: CollectionRules[K]) => setForm((f) => ({ ...f, rules: clean({ ...f.rules, [k]: v }) }));

  const live = plants.filter((p) => p.status === "published");
  const matched = live.filter((p) => matchesRules(p, r));
  const others = live.filter((p) => !matched.includes(p));

  const toggleId = (list: "includeIds" | "excludeIds", id: string) => {
    const cur = r[list] ?? [];
    const other = list === "includeIds" ? "excludeIds" : "includeIds";
    setForm((f) => ({
      ...f,
      rules: clean({ ...f.rules, [list]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id], [other]: (f.rules[other] ?? []).filter((x) => x !== id) }),
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await saveCollection(form);
      if (!res.ok) return toast("error", res.error);
      toast("success", "Collection saved. The storefront is updating.");
      if (res.data && res.data.slug !== collection?.slug) router.replace(`/collections/${res.data.slug}`);
      else router.refresh();
    });
  };

  const remove = () => {
    if (!collection || !confirm(`Delete the "${collection.title}" collection? Its page will stop existing.`)) return;
    start(async () => {
      const res = await deleteCollection(collection.slug);
      if (!res.ok) return toast("error", res.error);
      toast("success", "Collection deleted");
      router.replace("/collections");
    });
  };

  return (
    <form onSubmit={submit}>
      <PageHeader
        eyebrow={isNew ? "New collection" : "Edit collection"}
        title={form.title || "Untitled collection"}
        description={
          <span className="flex flex-wrap items-center gap-3">
            <StatusPill status={form.status} />
            <span className="text-sm">{matched.length} live plants match</span>
            {!isNew && form.status === "published" && (
              <a href={`${storefrontUrl}/collections/${collection!.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-moss hover:underline">
                View page <ExternalLink className="size-3.5" />
              </a>
            )}
          </span>
        }
        actions={
          canEdit && (
            <>
              <Link href="/collections" className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-ink/60 hover:text-ink">
                Cancel
              </Link>
              <Button type="submit" loading={pending}>
                {isNew ? "Create collection" : "Save changes"}
              </Button>
            </>
          )
        }
      />

      <fieldset disabled={!canEdit || pending} className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <Card title="Page content">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <input
                  className="input"
                  required
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
                  }}
                  placeholder="Low Light Plants"
                />
              </Field>
              <Field label="Short label" hint="Used in menus and filter chips.">
                <input className="input" required maxLength={30} value={form.short} onChange={(e) => set("short", e.target.value)} placeholder="Low light" />
              </Field>
              <Field label="URL slug" hint={`vanam.in/collections/${form.slug || "…"}`}>
                <input
                  className="input font-mono text-[0.85rem]"
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Group" group>
                <Segmented
                  value={form.group}
                  onChange={(g) => set("group", g)}
                  disabled={!canEdit}
                  options={[
                    { value: "Type", label: "Type" },
                    { value: "Room", label: "Room" },
                    { value: "Light", label: "Light" },
                    { value: "Need", label: "Need" },
                  ]}
                />
              </Field>
              <Field label="Intro" className="md:col-span-2" counter={{ value: form.intro.length, max: 600 }} hint="Shown under the page heading.">
                <textarea className="input" rows={3} value={form.intro} onChange={(e) => set("intro", e.target.value)} />
              </Field>
              <Field label="Hero image URL" className="md:col-span-2" hint="Paste the URL of an uploaded plant photo or other image.">
                <input className="input" type="url" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://…" />
              </Field>
              {form.image && (
                <div className="overflow-hidden rounded-2xl md:col-span-2">
                  <img src={form.image} alt="" className="h-48 w-full object-cover" />
                </div>
              )}
            </div>
          </Card>

          <Card title="Which plants belong" description="Plants that match these rules join automatically — including new plants you add later.">
            <div className="space-y-5">
              <Field label="Match" group>
                <Segmented
                  value={r.match}
                  onChange={(m) => setRule("match", m)}
                  disabled={!canEdit}
                  options={[
                    { value: "all", label: "All rules" },
                    { value: "any", label: "Any rule" },
                  ]}
                />
              </Field>
              <Field label="Light includes any of" group>
                <Chips options={[...LIGHT]} value={r.light ?? []} onChange={(v) => setRule("light", v)} disabled={!canEdit} />
              </Field>
              <Field label="Placement includes any of" group>
                <Chips options={[...SPACE]} value={r.space ?? []} onChange={(v) => setRule("space", v)} disabled={!canEdit} />
              </Field>
              <Field label="Exclude placements" group>
                <Chips options={[...SPACE]} value={r.excludeSpace ?? []} onChange={(v) => setRule("excludeSpace", v)} disabled={!canEdit} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Pet safety" group>
                  <Segmented
                    value={r.petSafe === undefined ? "any" : r.petSafe ? "yes" : "no"}
                    onChange={(v) => setRule("petSafe", v === "any" ? undefined : v === "yes")}
                    disabled={!canEdit}
                    options={[
                      { value: "any", label: "Any" },
                      { value: "yes", label: "Safe" },
                      { value: "no", label: "Not" },
                    ]}
                  />
                </Field>
                <Field label="Max care level" group>
                  <Segmented
                    value={r.careMax ?? 0}
                    onChange={(v) => setRule("careMax", v === 0 ? undefined : (v as 1 | 2 | 3))}
                    disabled={!canEdit}
                    options={[
                      { value: 0, label: "Any" },
                      { value: 1, label: "Easy" },
                      { value: 2, label: "Mod." },
                    ]}
                  />
                </Field>
                <Field label="Sizes" group>
                  <Chips
                    options={[
                      { value: "S", label: "S" },
                      { value: "M", label: "M" },
                      { value: "L", label: "L" },
                    ]}
                    value={r.sizes ?? []}
                    onChange={(v) => setRule("sizes", v)}
                    disabled={!canEdit}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Min price (₹)">
                  <input className="input" type="number" min={0} value={r.priceMin ?? ""} onChange={(e) => setRule("priceMin", e.target.value ? Number(e.target.value) : undefined)} />
                </Field>
                <Field label="Max price (₹)">
                  <input className="input" type="number" min={0} value={r.priceMax ?? ""} onChange={(e) => setRule("priceMax", e.target.value ? Number(e.target.value) : undefined)} />
                </Field>
              </div>
              <p className="text-xs text-ink/50">No rules? Then only the plants you add by hand (in the preview) are included.</p>
            </div>
          </Card>

          <Card title="Search engine listing" description="Leave blank to use defaults.">
            <div className="grid gap-4">
              <Field label="Meta description" counter={{ value: form.description.length, max: 170 }} hint="Also used when no SEO description is set.">
                <textarea className="input" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <Field label="SEO title" counter={{ value: (form.seoTitle ?? "").length, max: 70 }}>
                <input className="input" maxLength={70} value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value || null)} placeholder={`${form.title || "Title"} — Buy Online in India`} />
              </Field>
              <Field label="SEO description" counter={{ value: (form.seoDescription ?? "").length, max: 170 }}>
                <textarea className="input" rows={2} maxLength={170} value={form.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value || null)} />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          <Card title="Visibility">
            <Segmented
              value={form.status}
              onChange={(s) => set("status", s)}
              disabled={!canEdit}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Live" },
                { value: "archived", label: "Archived" },
              ]}
            />
            <Field label="Sort order" className="mt-4">
              <input className="input w-28" type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
            </Field>
          </Card>

          <Card title={`Preview · ${matched.length} plants`} description="Live plants only. Use + / − to force a plant in or out.">
            <ul className="max-h-[520px] space-y-1 overflow-y-auto pr-1">
              {matched.map((p) => (
                <PreviewRow key={p.id} p={p} pinned={r.includeIds?.includes(p.id)} action="remove" onClick={() => toggleId(r.includeIds?.includes(p.id) ? "includeIds" : "excludeIds", p.id)} disabled={!canEdit} />
              ))}
              {others.length > 0 && <li className="eyebrow pb-1 pt-4 text-ink/40">Not included</li>}
              {others.map((p) => (
                <PreviewRow key={p.id} p={p} excluded={r.excludeIds?.includes(p.id)} action="add" onClick={() => toggleId(r.excludeIds?.includes(p.id) ? "excludeIds" : "includeIds", p.id)} disabled={!canEdit} />
              ))}
            </ul>
          </Card>

          {canDelete && !isNew && (
            <Card title="Danger zone">
              <Button type="button" variant="danger" onClick={remove} loading={pending}>
                <Trash2 className="size-4" /> Delete collection
              </Button>
            </Card>
          )}
        </aside>
      </fieldset>
    </form>
  );
}

function PreviewRow({ p, action, onClick, pinned, excluded, disabled }: { p: Product; action: "add" | "remove"; onClick: () => void; pinned?: boolean; excluded?: boolean; disabled?: boolean }) {
  return (
    <li className={cn("flex items-center gap-3 rounded-xl p-1.5", action === "add" && "opacity-60")}>
      <img src={p.image} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
      <span className="min-w-0 flex-1 truncate text-sm">
        {p.name}
        {pinned && <span className="ml-1.5 text-[0.65rem] font-bold uppercase text-moss">added</span>}
        {excluded && <span className="ml-1.5 text-[0.65rem] font-bold uppercase text-danger">excluded</span>}
      </span>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={action === "add" ? `Add ${p.name}` : `Remove ${p.name}`}
        className="grid size-7 place-items-center rounded-lg border border-line hover:border-forest-700 disabled:opacity-40"
      >
        {action === "add" ? <Plus className="size-3.5" /> : <Minus className="size-3.5" />}
      </button>
    </li>
  );
}
