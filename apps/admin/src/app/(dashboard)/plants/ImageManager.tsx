"use client";

import type { ImageRow } from "@vanam/catalog/db";
import { Reorder } from "framer-motion";
import { GripVertical, ImagePlus, Loader2, Star, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import { Button, Field } from "@/components/ui";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/browser";
import { addImage, deleteImage, reorderImages, updateImage, uploadPreviewImage } from "./actions";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_MB = 8;

export function ImageManager({ plantId, plantName, images, canEdit, preview }: { plantId: string; plantName: string; images: ImageRow[]; canEdit: boolean; preview?: boolean }) {
  const [items, setItems] = useState(images);
  const [uploading, setUploading] = useState(0);
  const [editing, setEditing] = useState<ImageRow | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => setItems(images), [images]);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const bad = list.find((f) => !ACCEPT.includes(f.type) || f.size > MAX_MB * 1024 * 1024);
    if (bad) return toast("error", `${bad.name}: use JPG, PNG, WebP or AVIF under ${MAX_MB} MB.`);
    setUploading(list.length);
    if (preview) {
      // Local preview: the server saves the file into public/preview-uploads.
      for (const file of list) {
        const form = new FormData();
        form.set("plantId", plantId);
        form.set("alt", plantName);
        form.set("file", file);
        const res = await uploadPreviewImage(form);
        if (!res.ok) toast("error", res.error);
        setUploading((n) => n - 1);
      }
      setUploading(0);
      toast("success", list.length === 1 ? "Photo added" : `${list.length} photos added`);
      return router.refresh();
    }
    const supabase = createClient();
    for (const file of list) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${plantId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("plant-images").upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (error) {
        toast("error", `Upload failed: ${error.message}`);
        continue;
      }
      const url = supabase.storage.from("plant-images").getPublicUrl(path).data.publicUrl;
      const res = await addImage(plantId, url, path, plantName);
      if (!res.ok) toast("error", res.error);
      setUploading((n) => n - 1);
    }
    setUploading(0);
    toast("success", list.length === 1 ? "Photo added" : `${list.length} photos added`);
    router.refresh();
  };

  const persistOrder = async () => {
    const ids = items.map((i) => i.id);
    if (ids.join() === images.map((i) => i.id).join()) return;
    const res = await reorderImages(plantId, ids);
    if (!res.ok) return toast("error", res.error);
    toast("success", "Photo order saved");
    router.refresh();
  };

  return (
    <div>
      {items.length > 0 && (
        <Reorder.Group axis="x" values={items} onReorder={canEdit ? setItems : () => {}} className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {items.map((img, i) => (
            <Reorder.Item
              key={img.id}
              value={img}
              dragListener={canEdit}
              onDragEnd={persistOrder}
              className="group relative w-36 shrink-0 cursor-grab active:cursor-grabbing"
            >
              <button type="button" onClick={() => setEditing(img)} className="block w-full" aria-label={`Edit photo ${i + 1}`}>
                <div className={cn("relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper ring-offset-2", i === 0 && "ring-2 ring-forest-700")}>
                  <img src={img.url} alt={img.alt} draggable={false} className="size-full object-cover" style={{ objectPosition: `${img.focal_x * 100}% ${img.focal_y * 100}%` }} />
                  {canEdit && (
                    <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg bg-white/85 opacity-0 transition-opacity group-hover:opacity-100">
                      <GripVertical className="size-4" />
                    </span>
                  )}
                </div>
              </button>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-ink/55">
                {i === 0 ? (
                  <>
                    <Star className="size-3 fill-brass text-brass" /> Main photo
                  </>
                ) : (
                  `Photo ${i + 1}`
                )}
              </p>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {canEdit && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
          }}
          className={cn(
            "mt-3 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
            dragOver ? "border-forest-700 bg-lime/20" : "border-line",
          )}
        >
          {uploading > 0 ? (
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="size-4 animate-spin" /> Uploading {uploading} photo{uploading === 1 ? "" : "s"}…
            </p>
          ) : (
            <>
              <ImagePlus className="size-6 text-moss" />
              <p className="mt-2 text-sm">
                Drop photos here or{" "}
                <button type="button" onClick={() => input.current?.click()} className="font-semibold text-moss underline underline-offset-4">
                  browse
                </button>
              </p>
              <p className="mt-1 text-xs text-ink/45">JPG, PNG, WebP or AVIF · up to {MAX_MB} MB · portrait 4:5 looks best</p>
            </>
          )}
          <input
            ref={input}
            type="file"
            accept={ACCEPT.join(",")}
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) upload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {editing && <ImageEditor image={editing} canEdit={canEdit} onClose={() => setEditing(null)} />}
    </div>
  );
}

/** Click anywhere on the photo to set the focal point used when it's cropped on the storefront. */
function ImageEditor({ image, canEdit, onClose }: { image: ImageRow; canEdit: boolean; onClose: () => void }) {
  const [focal, setFocal] = useState({ x: image.focal_x, y: image.focal_y });
  const [alt, setAlt] = useState(image.alt);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    const res = await updateImage(image.id, { alt, focalX: focal.x, focalY: focal.y });
    setSaving(false);
    if (!res.ok) return toast("error", res.error);
    toast("success", "Photo updated");
    router.refresh();
    onClose();
  };

  const remove = async () => {
    if (!confirm("Remove this photo? It is deleted from storage too.")) return;
    setSaving(true);
    const res = await deleteImage(image.id);
    setSaving(false);
    if (!res.ok) return toast("error", res.error);
    toast("success", "Photo removed");
    router.refresh();
    onClose();
  };

  const pos = `${focal.x * 100}% ${focal.y * 100}%`;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Edit photo">
      <div className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative grid max-h-[92svh] w-full max-w-4xl gap-6 overflow-y-auto rounded-3xl bg-white p-6 md:grid-cols-[1.3fr_1fr]">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-paper">
          <X className="size-4" />
        </button>
        <div>
          <p className="eyebrow mb-3 text-moss">{canEdit ? "Click to set the focal point" : "Photo"}</p>
          <div
            className={cn("relative overflow-hidden rounded-2xl bg-paper", canEdit && "cursor-crosshair")}
            onClick={(e) => {
              if (!canEdit) return;
              const r = e.currentTarget.getBoundingClientRect();
              setFocal({ x: +((e.clientX - r.left) / r.width).toFixed(3), y: +((e.clientY - r.top) / r.height).toFixed(3) });
            }}
          >
            <img src={image.url} alt={alt} className="block w-full" draggable={false} />
            <span className="pointer-events-none absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.35)]" style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }} />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="eyebrow mb-3 text-moss">Storefront crops</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["4/5", "Card"],
              ["1/1", "Thumb"],
              ["16/9", "Banner"],
            ].map(([ratio, label]) => (
              <div key={label}>
                <div className="overflow-hidden rounded-xl bg-paper" style={{ aspectRatio: ratio }}>
                  <img src={image.url} alt="" className="size-full object-cover" style={{ objectPosition: pos }} />
                </div>
                <p className="mt-1 text-center text-[0.65rem] text-ink/50">{label}</p>
              </div>
            ))}
          </div>
          <Field label="Alt text" hint="Describe the photo for screen readers and image search." className="mt-6">
            <input className="input" value={alt} maxLength={160} onChange={(e) => setAlt(e.target.value)} disabled={!canEdit} />
          </Field>
          {canEdit && (
            <div className="mt-auto flex items-center justify-between gap-3 pt-6">
              <Button type="button" variant="ghost" className="text-danger" onClick={remove} disabled={saving}>
                <Trash2 className="size-4" /> Remove
              </Button>
              <Button type="button" onClick={save} loading={saving}>
                Save photo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
