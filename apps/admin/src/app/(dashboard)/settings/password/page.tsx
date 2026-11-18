import { PageHeader } from "@/components/ui";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { isPreview } from "@/lib/repo";
import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "Password" };

export default async function PasswordPage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="Your account" title="Set your password" description={`Signed in as ${admin.email}.`} />
      {isPreview() ? (
        <Card className="max-w-md">
          <p className="text-sm text-ink/65">Passwords aren&rsquo;t used in local preview. Once Supabase is connected, everyone sets their own password here.</p>
        </Card>
      ) : (
        <PasswordForm />
      )}
    </>
  );
}
