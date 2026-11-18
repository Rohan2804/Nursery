import { toProduct } from "@vanam/catalog/db";
import { requireAdmin } from "@/lib/auth";
import { loadPlants } from "@/lib/data";
import { env } from "@/lib/env";
import { CollectionForm } from "../CollectionForm";

export const metadata = { title: "New collection" };

export default async function NewCollectionPage() {
  await requireAdmin("manager");
  const plants = (await loadPlants()).map(toProduct);
  return <CollectionForm collection={null} plants={plants} canEdit canDelete={false} storefrontUrl={env.storefrontUrl} />;
}
