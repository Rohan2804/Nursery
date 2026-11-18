"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { Button, Card, Field } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";

export function PasswordForm() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 10) return toast("error", "Use at least 10 characters.");
    if (pw !== confirm) return toast("error", "The passwords don't match.");
    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setSaving(false);
    if (error) return toast("error", error.message);
    toast("success", "Password updated");
    router.push("/");
  };

  return (
    <Card className="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password" hint="At least 10 characters.">
          <input className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        </Field>
        <Field label="Confirm password">
          <input className="input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </Field>
        <Button type="submit" loading={saving}>
          Save password
        </Button>
      </form>
    </Card>
  );
}
