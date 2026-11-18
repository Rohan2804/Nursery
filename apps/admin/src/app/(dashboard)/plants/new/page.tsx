import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { PlantForm } from "../PlantForm";

export const metadata = { title: "New plant" };

export default async function NewPlantPage() {
  await requireAdmin("manager");
  return <PlantForm plant={null} canEdit canDelete={false} storefrontUrl={env.storefrontUrl} />;
}
