import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "Password" };

export default async function PasswordPage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="Your account" title="Set your password" description={`Signed in as ${admin.email}.`} />
      <PasswordForm />
    </>
  );
}
