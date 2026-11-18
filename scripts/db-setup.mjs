// Applies the schema and seed data to your Supabase database.
// Usage: npm run db:setup   (reads DATABASE_URL from apps/admin/.env.local)
import { existsSync, readFileSync, readdirSync } from "node:fs";
import postgres from "postgres";

const envFile = new URL("../apps/admin/.env.local", import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing. Add it to apps/admin/.env.local (Supabase → Project Settings → Database → Connection string).");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1, onnotice: () => {} });
const dir = new URL("../supabase/migrations/", import.meta.url);
const files = [
  ...readdirSync(dir).filter((f) => f.endsWith(".sql")).sort().map((f) => new URL(f, dir)),
  new URL("../supabase/seed.sql", import.meta.url),
];

try {
  for (const file of files) {
    process.stdout.write(`Applying ${file.pathname.split("/").slice(-2).join("/")} … `);
    await sql.unsafe(readFileSync(file, "utf8"));
    console.log("done");
  }
  const [{ count }] = await sql`select count(*)::int as count from public.plants`;
  console.log(`\n✓ Database ready — ${count} plants in the catalog.`);
} catch (err) {
  console.error("\n✗ Failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
