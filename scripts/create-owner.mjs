// Creates the first admin (Owner) account. You type the password; it is never printed or stored in files.
// Usage: npm run admin:create-owner   (reads apps/admin/.env.local)
import { existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

const envFile = new URL("../apps/admin/.env.local", import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in apps/admin/.env.local");
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
const ask = (q) => new Promise((res) => rl.question(q, res));
const askHidden = (q) =>
  new Promise((res) => {
    const write = rl._writeToOutput;
    rl._writeToOutput = (s) => (s.includes(q) ? write.call(rl, s) : write.call(rl, ""));
    rl.question(q, (a) => {
      rl._writeToOutput = write;
      process.stdout.write("\n");
      res(a);
    });
  });

const email = (await ask("Owner email: ")).trim().toLowerCase();
const fullName = (await ask("Full name: ")).trim();
const password = await askHidden("Password (min 10 characters, hidden): ");
rl.close();

if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10) {
  console.error("Please use a valid email and a password of at least 10 characters.");
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { persistSession: false } });
const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
if (error) {
  console.error("✗ Could not create user:", error.message);
  process.exit(1);
}
const { error: roleError } = await supabase.from("admin_users").upsert({ user_id: data.user.id, email, full_name: fullName, role: "owner", active: true });
if (roleError) {
  console.error("✗ User created but role not saved:", roleError.message);
  process.exit(1);
}
console.log(`✓ Owner account created for ${email}. Sign in at the admin app.`);
