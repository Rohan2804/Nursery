import { notFound } from "next/navigation";
import { can, requireAdmin } from "@/lib/auth";
import { loadPlant } from "@/lib/data";
import { env } from "@/lib/env";
import { isPreview } from "@/lib/repo";
import { PlantForm } from "../PlantForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = /^[0-9a-f-]{36}$/.test(id) ? await loadPlant(id) : null;
  return { title: plant?.name ?? "Plant" };
}

export default async function EditPlantPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const plant = await loadPlant(id);
  if (!plant) notFound();
  // Keyed by updated_at so the form resets to fresh server data after each save.
  return <PlantForm key={plant.updated_at} plant={plant} canEdit={can(admin, "manager")} canDelete={can(admin, "owner")} storefrontUrl={env.storefrontUrl} preview={isPreview()} />;
}
