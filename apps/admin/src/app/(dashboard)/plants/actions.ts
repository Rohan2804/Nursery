"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { logActivity, publishChanges, run } from "@/lib/actions";
import { ActionError, assertRole } from "@/lib/auth";
import { repo } from "@/lib/repo";
import { PREVIEW_UPLOADS } from "@/lib/repo/preview";
import { isPreview } from "@/lib/repo";
import { plantSchema, type PlantInput } from "@/lib/schemas";

const uuid = z.string().uuid();

/** Create or update a plant and its three sizes. */
export async function savePlant(input: PlantInput) {
  return run(async () => {
    const admin = await assertRole("manager");
    const p = plantSchema.parse(input);
    const saved = await repo().savePlant(p);
    await logActivity(admin, p.id ? "update" : "create", "plant", saved.id, `${p.id ? "Updated" : "Created"} ${p.name} (${p.status})`);
    await publishChanges("/plants", `/plants/${saved.id}`);
    return saved;
  }, "Saved");
}

export async function setStatus(ids: string[], status: "draft" | "published" | "archived") {
  return run(async () => {
    const admin = await assertRole("manager");
    z.array(uuid).min(1).parse(ids);
    const names = await repo().setPlantStatus(ids, status);
    await logActivity(admin, "status", "plant", ids.length === 1 ? ids[0] : null, `Set ${names.join(", ")} to ${status}`);
    await publishChanges("/plants");
    return { count: names.length };
  }, `${ids.length} plant${ids.length === 1 ? "" : "s"} set to ${status}`);
}

export async function deletePlant(id: string) {
  return run(async () => {
    const admin = await assertRole("owner");
    const name = await repo().deletePlant(uuid.parse(id));
    await logActivity(admin, "delete", "plant", id, `Deleted ${name}`);
    await publishChanges("/plants");
  }, "Plant deleted");
}

/* ---------------- images ---------------- */

/** Records a photo already uploaded to Supabase Storage from the browser. */
export async function addImage(plantId: string, url: string, storagePath: string, alt: string) {
  return run(async () => {
    const admin = await assertRole("manager");
    const row = await repo().addImage(uuid.parse(plantId), { url: z.string().url().parse(url), storagePath, alt: alt.slice(0, 160) });
    await logActivity(admin, "image", "plant", plantId, `Added a photo to ${alt || "a plant"}`);
    await publishChanges(`/plants/${plantId}`);
    return row;
  });
}

const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as const;

/** Local preview only: saves the uploaded file into public/preview-uploads. */
export async function uploadPreviewImage(form: FormData) {
  return run(async () => {
    if (!isPreview()) throw new ActionError("Uploads go to Supabase Storage in this environment.");
    const admin = await assertRole("manager");
    const plantId = uuid.parse(form.get("plantId"));
    const alt = String(form.get("alt") ?? "").slice(0, 160);
    const file = form.get("file");
    if (!(file instanceof File)) throw new ActionError("No file received.");
    const ext = ALLOWED[file.type as keyof typeof ALLOWED];
    if (!ext) throw new ActionError("Use JPG, PNG, WebP or AVIF.");
    if (file.size > 8 * 1024 * 1024) throw new ActionError("Photos must be under 8 MB.");
    const path = `${plantId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await mkdir(join(PREVIEW_UPLOADS, plantId), { recursive: true });
    await writeFile(join(PREVIEW_UPLOADS, path), Buffer.from(await file.arrayBuffer()));
    const url = `${process.env.ADMIN_URL ?? "http://localhost:3001"}/preview-uploads/${path}`;
    const row = await repo().addImage(plantId, { url, storagePath: path, alt });
    await logActivity(admin, "image", "plant", plantId, `Added a photo to ${alt || "a plant"}`);
    await publishChanges(`/plants/${plantId}`);
    return row;
  });
}

export async function updateImage(id: string, patch: { alt?: string; focalX?: number; focalY?: number }) {
  return run(async () => {
    await assertRole("manager");
    const clamp = (n?: number) => (n === undefined ? undefined : Math.min(1, Math.max(0, n)));
    const plantId = await repo().updateImage(uuid.parse(id), { alt: patch.alt?.slice(0, 160), focalX: clamp(patch.focalX), focalY: clamp(patch.focalY) });
    await publishChanges(`/plants/${plantId}`);
  });
}

export async function reorderImages(plantId: string, ids: string[]) {
  return run(async () => {
    const admin = await assertRole("manager");
    await repo().reorderImages(uuid.parse(plantId), z.array(uuid).parse(ids));
    await logActivity(admin, "image", "plant", plantId, "Reordered photos");
    await publishChanges(`/plants/${plantId}`);
  });
}

export async function deleteImage(id: string) {
  return run(async () => {
    const admin = await assertRole("manager");
    const plantId = await repo().deleteImage(uuid.parse(id));
    await logActivity(admin, "image", "plant", plantId, "Removed a photo");
    await publishChanges(`/plants/${plantId}`);
  }, "Photo removed");
}
