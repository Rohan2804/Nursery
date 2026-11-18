"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; sent?: boolean } | undefined;

export async function signIn(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "That email and password don't match." };

  const { data: member } = await supabase.from("admin_users").select("active").eq("user_id", data.user.id).maybeSingle();
  if (!member?.active) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have admin access. Ask the owner to invite you." };
  }
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function sendReset(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter the email you use for the admin." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${env.adminUrl}/auth/callback?next=/settings/password` });
  // Same response whether or not the account exists, so emails can't be probed.
  return { sent: true };
}
