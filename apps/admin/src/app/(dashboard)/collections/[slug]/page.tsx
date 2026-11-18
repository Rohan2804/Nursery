import { toCollection, toProduct } from "@vanam/catalog/db";
import { notFound } from "next/navigation";
import { can, requireAdmin } from "@/lib/auth";
import { loadCollections, loadPlants } from "@/lib/data";
import { env } from "@/lib/env";
import { CollectionForm } from "../CollectionForm";

export default async function EditCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin();
  const { slug } = await params;
  const [rows, plants] = await Promise.all([loadCollections(), loadPlants()]);
  const row = rows.find((r) => r.slug === slug);
  if (!row) notFound();
  return (
    <CollectionForm
      key={JSON.stringify(row)}
      collection={toCollection(row)}
      plants={plants.map(toProduct)}
      canEdit={can(admin, "manager")}
      canDelete={can(admin, "owner")}
      storefrontUrl={env.storefrontUrl}
    />
  );
}
