"use client";

import { sizeMeta, suggestedPrice, type SizeId } from "@vanam/catalog";
import type { PlantWithRelations } from "@vanam/catalog/db";
import { ExternalLink, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { Button, Card, Chips, Field, PageHeader, Segmented, StatusPill, Toggle } from "@/components/ui";
import { cn, formatINR, slugify } from "@/lib/cn";
import type { PlantInput } from "@/lib/schemas";
import { deletePlant, savePlant } from "./actions";
import { ImageManager } from "./ImageManager";

const LIGHT = [
  { value: "low", label: "Low light" },
  { value: "medium", label: "Soft & indirect" },
  { value: "bright", label: "Bright indirect" },
  { value: "sun", label: "Full sun" },
] as const;
const SPACE = [
  { value: "desk", label: "Tabletop" },
  { value: "floor", label: "Floor" },
  { value: "hanging", label: "Hanging" },
  { value: "outdoor", label: "Outdoor" },
] as const;
const LEVELS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
] as const;

function fromRow(p: PlantWithRelations | null): PlantInput {
  const v = (size: SizeId) => p?.plant_variants.find((x) => x.size === size);
  return {
    id: p?.id,
    slug: p?.slug ?? "",
    name: p?.name ?? "",
    botanical: p?.botanical ?? "",
    blurb: p?.blurb ?? "",
    badge: p?.badge ?? null,
    status: p?.status ?? "draft",
    light: (p?.light ?? []) as PlantInput["light"],
    space: (p?.space ?? []) as PlantInput["space"],
    petSafe: p?.pet_safe ?? false,
    care: (p?.care ?? 1) as 1 | 2 | 3,
    naturalSize: (p?.natural_size ?? "M") as SizeId,
    featured: p?.featured ?? false,
    sortOrder: p?.sort_order ?? 100,
    rating: Number(p?.rating ?? 0),
    reviewCount: p?.review_count ?? 0,
    water: p?.water ?? "",
    waterLevel: (p?.water_level ?? 2) as 1 | 2 | 3,
    humidity: p?.humidity ?? "",
    humidityLevel: (p?.humidity_level ?? 2) as 1 | 2 | 3,
    temperature: p?.temperature ?? "",
    origin: p?.origin ?? "",
    growerNote: p?.grower_note ?? "",
    seoTitle: p?.seo_title ?? null,
    seoDescription: p?.seo_description ?? null,
    variants: (["S", "M", "L"] as SizeId[]).map((size) => ({
      size,
      active: v(size)?.active ?? true,
      price: v(size)?.price ?? 0,
      compareAt: v(size)?.compare_at ?? null,
      stock: v(size)?.stock ?? 0,
      lowStockThreshold: v(size)?.low_stock_threshold ?? 5,
      sku: v(size)?.sku ?? "",
    })),
  };
}

export function PlantForm({
  plant,
  canEdit,
  canDelete,
  storefrontUrl,
}: {
  plant: PlantWithRelations | null;
  canEdit: boolean;
  canDelete: boolean;
  storefrontUrl: string;
}) {
  const initial = useMemo(() => fromRow(plant), [plant]);
  const [form, setForm] = useState<PlantInput>(initial);
  const [slugTouched, setSlugTouched] = useState(!!plant);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const isNew = !plant;
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof PlantInput>(key: K, value: PlantInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setVariant = (i: number, patch: Partial<PlantInput["variants"][number]>) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v, n) => (n === i ? { ...v, ...patch } : v)) }));

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ⌘S / Ctrl+S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onName = (name: string) =>
    setForm((f) => {
      const slug = slugTouched ? f.slug : slugify(name);
      const prefix = `VN-${slug.toUpperCase().slice(0, 18)}`;
      return { ...f, name, slug, variants: f.variants.map((v) => (plant || slugTouched ? v : { ...v, sku: slug ? `${prefix}-${v.size}` : "" })) };
    });

  const suggestPrices = () => {
    const base = form.variants.find((v) => v.size === form.naturalSize)?.price ?? 0;
    if (!base) return toast("error", `Set the ${sizeMeta[form.naturalSize].label} price first — other sizes are scaled from it.`);
    setForm((f) => ({ ...f, variants: f.variants.map((v) => (v.size === f.naturalSize ? v : { ...v, price: suggestedPrice(base, f.naturalSize, v.size) })) }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    start(async () => {
      const res = await savePlant(form);
      if (!res.ok) return toast("error", res.error);
      toast("success", isNew ? "Plant created — now add some photos." : "Saved. The storefront is updating.");
      if (isNew && res.data) router.replace(`/plants/${res.data.id}`);
      else router.refresh();
    });
  };

  const remove = () => {
    if (!plant || !confirm(`Delete ${plant.name}? Its photos are removed too. This can't be undone — archiving keeps the history.`)) return;
    start(async () => {
      const res = await deletePlant(plant.id);
      if (!res.ok) return toast("error", res.error);
      toast("success", "Plant deleted");
      router.replace("/plants");
    });
  };

  const seoTitle = form.seoTitle || `${form.name || "Plant name"} (${form.botanical || "Botanical name"}) — Buy Online | Vanam`;
  const seoDesc = form.seoDescription || form.blurb || "Add a short description — it doubles as the search-result snippet.";

  return (
    <form ref={formRef} onSubmit={submit}>
      <PageHeader
        eyebrow={isNew ? "New plant" : "Edit plant"}
        title={form.name || "Untitled plant"}
        description={
          <span className="flex flex-wrap items-center gap-3">
            <StatusPill status={form.status} />
            {!isNew && form.status === "published" && (
              <a href={`${storefrontUrl}/plants/${plant!.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-moss hover:underline">
                View on storefront <ExternalLink className="size-3.5" />
              </a>
            )}
            {!canEdit && <span className="text-sm">Read-only — your role can update stock from Inventory.</span>}
          </span>
        }
        actions={
          canEdit && (
            <>
              <Link href="/plants" className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-ink/60 hover:text-ink">
                Cancel
              </Link>
              <Button type="submit" loading={pending} disabled={!dirty && !isNew}>
                {isNew ? "Create plant" : dirty ? "Save changes" : "Saved"}
              </Button>
            </>
          )
        }
      />

      <fieldset disabled={!canEdit || pending} className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Card title="Basics">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" className="md:col-span-2">
                <input className="input" required value={form.name} onChange={(e) => onName(e.target.value)} placeholder="Monstera Deliciosa" />
              </Field>
              <Field label="URL slug" hint={<>vanam.in/plants/<b>{form.slug || "…"}</b>{!isNew && " — changing this breaks old links."}</>}>
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
              <Field label="Botanical name">
                <input className="input italic" value={form.botanical} onChange={(e) => set("botanical", e.target.value)} placeholder="Monstera deliciosa" />
              </Field>
              <Field label="Short description" className="md:col-span-2" counter={{ value: form.blurb.length, max: 400 }} hint="Shown on product cards and the plant page. One or two vivid sentences.">
                <textarea className="input" rows={3} value={form.blurb} onChange={(e) => set("blurb", e.target.value)} />
              </Field>
              <Field label="Badge" hint="Optional label on the photo, e.g. Bestseller, New, Rare.">
                <input className="input" maxLength={30} value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)} />
              </Field>
            </div>
          </Card>

          <Card title="Photos" description="The first photo is the main image. Drag to reorder; click a photo to set its focal point and alt text.">
            {plant ? (
              <ImageManager plantId={plant.id} plantName={form.name} images={plant.plant_images} canEdit={canEdit} />
            ) : (
              <p className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-sm text-ink/50">Create the plant first, then add photos here.</p>
            )}
          </Card>

          <Card
            title="Sizes, pricing & stock"
            description={`Prices in ₹, tax included. The ${sizeMeta[form.naturalSize].label.toLowerCase()} size is this plant's natural size and its listed price.`}
            actions={
              canEdit && (
                <Button type="button" variant="secondary" className="h-9 px-4" onClick={suggestPrices}>
                  <Sparkles className="size-4" /> Suggest prices
                </Button>
              )
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-ink/45">
                    <th className="pb-2 font-semibold">Size</th>
                    <th className="pb-2 font-semibold">On sale</th>
                    <th className="pb-2 font-semibold">Price</th>
                    <th className="pb-2 font-semibold">Compare at</th>
                    <th className="pb-2 font-semibold">Stock</th>
                    <th className="pb-2 font-semibold">Low at</th>
                    <th className="pb-2 font-semibold">SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {form.variants.map((v, i) => (
                    <tr key={v.size} className={cn("border-t border-line", !v.active && "opacity-50")}>
                      <td className="py-3 pr-3">
                        <p className="font-semibold">
                          {sizeMeta[v.size].label} {form.naturalSize === v.size && <span className="ml-1 text-xs text-moss">natural</span>}
                        </p>
                        <p className="text-xs text-ink/45">{sizeMeta[v.size].pot}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <Toggle checked={v.active} onChange={(x) => setVariant(i, { active: x })} label={`${v.size} on sale`} disabled={!canEdit} />
                      </td>
                      <td className="py-3 pr-3">
                        <input className="input w-28 tabular-nums" type="number" min={0} step={10} aria-label={`${v.size} price`} value={v.price || ""} onChange={(e) => setVariant(i, { price: Number(e.target.value) })} />
                      </td>
                      <td className="py-3 pr-3">
                        <input
                          className="input w-28 tabular-nums"
                          type="number"
                          min={0}
                          step={10}
                          aria-label={`${v.size} compare-at price`}
                          placeholder="—"
                          value={v.compareAt ?? ""}
                          onChange={(e) => setVariant(i, { compareAt: e.target.value ? Number(e.target.value) : null })}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <input className="input w-20 tabular-nums" type="number" min={0} aria-label={`${v.size} stock`} value={v.stock} onChange={(e) => setVariant(i, { stock: Number(e.target.value) })} />
                      </td>
                      <td className="py-3 pr-3">
                        <input className="input w-16 tabular-nums" type="number" min={0} aria-label={`${v.size} low-stock threshold`} value={v.lowStockThreshold} onChange={(e) => setVariant(i, { lowStockThreshold: Number(e.target.value) })} />
                      </td>
                      <td className="py-3">
                        <input className="input w-44 font-mono text-xs uppercase" aria-label={`${v.size} SKU`} value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value.toUpperCase() })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink/50">
              Customers pay size price + planter. Planter prices are managed under <Link href="/planters" className="underline">Planters</Link>. Compare-at shows as a struck-through price.
            </p>
          </Card>

          <Card title="Care details" description="Shown in 'Care at a glance' and the care accordion on the plant page.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Watering">
                <input className="input" value={form.water} onChange={(e) => set("water", e.target.value)} placeholder="Every 7–10 days, when the top 5 cm is dry" />
              </Field>
              <Field label="Watering need" group>
                <Segmented options={[...LEVELS]} value={form.waterLevel} onChange={(x) => set("waterLevel", x as 1 | 2 | 3)} disabled={!canEdit} />
              </Field>
              <Field label="Humidity">
                <input className="input" value={form.humidity} onChange={(e) => set("humidity", e.target.value)} placeholder="Loves 60%+ — mist in dry months" />
              </Field>
              <Field label="Humidity need" group>
                <Segmented options={[...LEVELS]} value={form.humidityLevel} onChange={(x) => set("humidityLevel", x as 1 | 2 | 3)} disabled={!canEdit} />
              </Field>
              <Field label="Temperature">
                <input className="input" value={form.temperature} onChange={(e) => set("temperature", e.target.value)} placeholder="18–30 °C" />
              </Field>
              <Field label="Origin">
                <input className="input" value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Rainforests of southern Mexico" />
              </Field>
              <Field label="From the grower" className="md:col-span-2" counter={{ value: form.growerNote.length, max: 600 }} hint="A personal note from your growers — shown as a large quote on the plant page.">
                <textarea className="input" rows={3} value={form.growerNote} onChange={(e) => set("growerNote", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Search engine listing" description="Leave blank to use the defaults built from the name and description.">
            <div className="mb-5 rounded-2xl bg-paper p-5">
              <p className="text-xs text-ink/50">vanam.in › plants › {form.slug || "…"}</p>
              <p className="mt-1 truncate text-lg text-[#1a0dab]">{seoTitle}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ink/70">{seoDesc}</p>
            </div>
            <div className="grid gap-4">
              <Field label="SEO title" counter={{ value: (form.seoTitle ?? "").length, max: 70 }}>
                <input className="input" maxLength={70} value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value || null)} />
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
              onChange={(x) => set("status", x)}
              disabled={!canEdit}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Live" },
                { value: "archived", label: "Archived" },
              ]}
            />
            <p className="mt-3 text-xs text-ink/50">
              {form.status === "published" ? "Visible on the storefront." : form.status === "draft" ? "Hidden from customers while you prepare it." : "Hidden and kept for records."}
            </p>
          </Card>

          <Card title="Attributes" description="Drive filters, collections and the plant finder quiz.">
            <div className="space-y-5">
              <Field label="Light" group>
                <Chips options={[...LIGHT]} value={form.light} onChange={(x) => set("light", x)} disabled={!canEdit} />
              </Field>
              <Field label="Placement" group>
                <Chips options={[...SPACE]} value={form.space} onChange={(x) => set("space", x)} disabled={!canEdit} />
              </Field>
              <Field label="Care level" group>
                <Segmented
                  options={[
                    { value: 1, label: "Easy" },
                    { value: 2, label: "Moderate" },
                    { value: 3, label: "Expert" },
                  ]}
                  value={form.care}
                  onChange={(x) => set("care", x as 1 | 2 | 3)}
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Natural size" group>
                <Segmented
                  options={[
                    { value: "S", label: "Small" },
                    { value: "M", label: "Medium" },
                    { value: "L", label: "Large" },
                  ]}
                  value={form.naturalSize}
                  onChange={(x) => set("naturalSize", x as SizeId)}
                  disabled={!canEdit}
                />
              </Field>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Pet safe</span>
                <Toggle checked={form.petSafe} onChange={(x) => set("petSafe", x)} label="Pet safe" disabled={!canEdit} />
              </div>
            </div>
          </Card>

          <Card title="Merchandising">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>
                  <span className="block text-sm font-semibold">Featured</span>
                  <span className="text-xs text-ink/50">Homepage bestsellers & menu</span>
                </span>
                <Toggle checked={form.featured} onChange={(x) => set("featured", x)} label="Featured" disabled={!canEdit} />
              </div>
              <Field label="Sort order" hint="Lower numbers appear first.">
                <input className="input w-28" type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rating">
                  <input className="input" type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} />
                </Field>
                <Field label="Reviews">
                  <input className="input" type="number" min={0} value={form.reviewCount} onChange={(e) => set("reviewCount", Number(e.target.value))} />
                </Field>
              </div>
              <p className="text-xs text-ink/45">Temporary: ratings will come from real customer reviews once reviews are connected.</p>
            </div>
          </Card>

          {!isNew && (
            <Card title="Summary">
              <dl className="space-y-2 text-sm">
                {form.variants
                  .filter((v) => v.active)
                  .map((v) => (
                    <div key={v.size} className="flex justify-between">
                      <dt className="text-ink/55">{sizeMeta[v.size].label}</dt>
                      <dd className="tabular-nums">
                        {formatINR(v.price)} · {v.stock} in stock
                      </dd>
                    </div>
                  ))}
              </dl>
            </Card>
          )}

          {canDelete && !isNew && (
            <Card title="Danger zone">
              <p className="mb-4 text-sm text-ink/55">Prefer archiving — it hides the plant but keeps its history.</p>
              <Button type="button" variant="danger" onClick={remove} loading={pending}>
                <Trash2 className="size-4" /> Delete plant
              </Button>
            </Card>
          )}
        </aside>
      </fieldset>
    </form>
  );
}
