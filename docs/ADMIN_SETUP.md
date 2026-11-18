# Admin setup (Supabase)

The admin app (`apps/admin`, served at **admin.vanam.in**) manages the catalog in a Supabase database. The storefront reads the same database. Until it's configured, the storefront uses its built-in catalog and the admin shows a setup screen.

Allow about 15 minutes.

## 1. Create a Supabase project

1. Sign up at https://supabase.com and click **New project**.
2. Name it `vanam`, choose a strong database password (save it in your password manager) and pick the **Mumbai (ap-south-1)** region.
3. Wait for the project to finish provisioning.

## 2. Add the keys to `.env.local` files

These files stay on your machine and are git-ignored. Never paste keys into chat or commit them.

```bash
cp apps/admin/.env.example apps/admin/.env.local
cp apps/storefront/.env.example apps/storefront/.env.local
```

Fill them in from Supabase → **Project Settings**:

| Variable | Where to find it | Admin | Storefront |
| --- | --- | :-: | :-: |
| `NEXT_PUBLIC_SUPABASE_URL` | API → Project URL | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | API Keys → **Publishable** key (or legacy `anon`) | ✓ | ✓ |
| `SUPABASE_SECRET_KEY` | API Keys → **Secret** key (or legacy `service_role`) | ✓ | — |
| `DATABASE_URL` | Database → Connection string → URI (Session pooler) — replace `[YOUR-PASSWORD]` | ✓ | — |
| `REVALIDATE_SECRET` | Make one up: a long random string. **Same value in both files.** | ✓ | ✓ |

## 3. Create the tables and load the catalog

```bash
npm run db:setup
```

This applies `supabase/migrations/0001_catalog.sql` (tables, security rules, image storage) and `supabase/seed.sql` (today's 14 plants, 14 collections and 4 planters). It's safe to re-run; it never overwrites changes made in the admin.

> No terminal access to the database? Paste both SQL files, in that order, into Supabase → **SQL Editor** → Run.

## 4. Create your owner account

```bash
npm run admin:create-owner
```

Enter your email, name and a password (10+ characters; it's hidden as you type).

## 5. Configure auth emails

Supabase → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3001` (later `https://admin.vanam.in`)
- **Redirect URLs**: add `http://localhost:3001/auth/callback` and `https://admin.vanam.in/auth/callback`

These make team invitations and password-reset links work. For production, also set up custom SMTP (Authentication → Emails) — Supabase's built-in sender is rate-limited.

## 6. Run both apps

```bash
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3001

Sign in to the admin, change a price, and refresh the storefront — it updates immediately.

## Roles

| Role | Can do |
| --- | --- |
| **Staff** | View everything, update stock in Inventory |
| **Manager** | + edit plants, prices, photos, collections, planters, CSV import |
| **Owner** | + delete plants/collections, invite and manage the team |

These rules are enforced inside the database (row-level security), not just in the admin interface.

## Deploying on separate domains

Deploy each app as its own project (e.g. two Vercel projects pointing at this repo):

| App | Root directory | Domain | Env vars |
| --- | --- | --- | --- |
| Storefront | `apps/storefront` | `www.vanam.in` | storefront `.env.local` values + `NEXT_PUBLIC_SITE_URL` |
| Admin | `apps/admin` | `admin.vanam.in` | admin `.env.local` values, with `ADMIN_URL=https://admin.vanam.in` and `STOREFRONT_URL=https://www.vanam.in` |

The admin sends `noindex` and anti-framing headers. Consider restricting `admin.vanam.in` to your office IPs or behind Cloudflare Access for an extra layer.
