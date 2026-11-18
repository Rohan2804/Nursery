-- Vanam catalog schema: plants, sizes/stock, planters, images, collections, admin roles and activity log.
-- Run once in the Supabase SQL editor (or `npm run db:setup`). Safe to re-run: objects are created if missing.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- types
do $$ begin
  create type public.catalog_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.admin_role as enum ('staff', 'manager', 'owner');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- admin users & roles
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text not null default '',
  role       public.admin_role not null default 'staff',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Role ranking: owner > manager > staff. SECURITY DEFINER so policies can read admin_users without recursion.
create or replace function public.has_admin_role(min_role public.admin_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid()
      and a.active
      and array_position(enum_range(null::public.admin_role), a.role)
          >= array_position(enum_range(null::public.admin_role), min_role)
  );
$$;

-- ---------------------------------------------------------------- plants
create table if not exists public.plants (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name            text not null check (length(name) between 2 and 120),
  botanical       text not null default '',
  blurb           text not null default '',
  badge           text,
  status          public.catalog_status not null default 'draft',
  light           text[] not null default '{}' check (light <@ array['low','medium','bright','sun']),
  space           text[] not null default '{}' check (space <@ array['desk','floor','hanging','outdoor']),
  pet_safe        boolean not null default false,
  care            smallint not null default 1 check (care between 1 and 3),
  natural_size    text not null default 'M' check (natural_size in ('S','M','L')),
  rating          numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count    integer not null default 0 check (review_count >= 0),
  water           text not null default '',
  water_level     smallint not null default 2 check (water_level between 1 and 3),
  humidity        text not null default '',
  humidity_level  smallint not null default 2 check (humidity_level between 1 and 3),
  temperature     text not null default '',
  origin          text not null default '',
  grower_note     text not null default '',
  seo_title       text,
  seo_description text,
  featured        boolean not null default false,
  sort_order      integer not null default 100,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.plant_variants (
  id                  uuid primary key default gen_random_uuid(),
  plant_id            uuid not null references public.plants (id) on delete cascade,
  size                text not null check (size in ('S','M','L')),
  price               integer not null check (price >= 0),
  compare_at          integer check (compare_at is null or compare_at > price),
  stock               integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  sku                 text not null unique,
  active              boolean not null default true,
  updated_at          timestamptz not null default now(),
  unique (plant_id, size)
);

create table if not exists public.plant_images (
  id           uuid primary key default gen_random_uuid(),
  plant_id     uuid not null references public.plants (id) on delete cascade,
  url          text not null,
  storage_path text,
  alt          text not null default '',
  position     integer not null default 0,
  focal_x      real not null default 0.5 check (focal_x between 0 and 1),
  focal_y      real not null default 0.5 check (focal_y between 0 and 1),
  created_at   timestamptz not null default now()
);
create index if not exists plant_images_plant_idx on public.plant_images (plant_id, position);

create table if not exists public.planters (
  id         text primary key check (id ~ '^[a-z0-9-]+$'),
  label      text not null,
  note       text not null default '',
  price      integer not null default 0 check (price >= 0),
  swatch     text not null default '#1f2a22',
  active     boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.collections (
  slug            text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  grp             text not null default 'Need' check (grp in ('Type','Room','Light','Need')),
  title           text not null,
  short           text not null,
  description     text not null default '',
  intro           text not null default '',
  image_url       text not null default '',
  rules           jsonb not null default '{"match":"all"}',
  status          public.catalog_status not null default 'draft',
  seo_title       text,
  seo_description text,
  sort_order      integer not null default 0,
  updated_at      timestamptz not null default now()
);

create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users (id) on delete set null,
  user_email text,
  action     text not null,
  entity     text not null,
  entity_id  text,
  summary    text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

-- ---------------------------------------------------------------- updated_at triggers
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists plants_touch on public.plants;
create trigger plants_touch before update on public.plants for each row execute function public.touch_updated_at();
drop trigger if exists variants_touch on public.plant_variants;
create trigger variants_touch before update on public.plant_variants for each row execute function public.touch_updated_at();
drop trigger if exists collections_touch on public.collections;
create trigger collections_touch before update on public.collections for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- stock RPC (staff may change stock, not prices)
create or replace function public.set_stock(variant uuid, new_stock integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_role('staff') then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  if new_stock < 0 then
    raise exception 'stock cannot be negative' using errcode = '22023';
  end if;
  update public.plant_variants set stock = new_stock where id = variant;
end $$;

-- ---------------------------------------------------------------- row level security
alter table public.admin_users    enable row level security;
alter table public.plants         enable row level security;
alter table public.plant_variants enable row level security;
alter table public.plant_images   enable row level security;
alter table public.planters       enable row level security;
alter table public.collections    enable row level security;
alter table public.audit_log      enable row level security;

-- Helper: drop-and-create keeps this file re-runnable.
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public'
    and tablename in ('admin_users','plants','plant_variants','plant_images','planters','collections','audit_log')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Public storefront: read published catalog only.
create policy "public read published plants" on public.plants
  for select using (status = 'published' or public.has_admin_role('staff'));
create policy "public read variants of published plants" on public.plant_variants
  for select using (
    public.has_admin_role('staff')
    or (active and exists (select 1 from public.plants p where p.id = plant_id and p.status = 'published'))
  );
create policy "public read images of published plants" on public.plant_images
  for select using (
    public.has_admin_role('staff')
    or exists (select 1 from public.plants p where p.id = plant_id and p.status = 'published')
  );
create policy "public read planters" on public.planters
  for select using (active or public.has_admin_role('staff'));
create policy "public read published collections" on public.collections
  for select using (status = 'published' or public.has_admin_role('staff'));

-- Managers edit the catalog; owners can delete.
create policy "managers insert plants" on public.plants for insert with check (public.has_admin_role('manager'));
create policy "managers update plants" on public.plants for update using (public.has_admin_role('manager'));
create policy "owners delete plants"   on public.plants for delete using (public.has_admin_role('owner'));

create policy "managers write variants" on public.plant_variants for all
  using (public.has_admin_role('manager')) with check (public.has_admin_role('manager'));
create policy "managers write images" on public.plant_images for all
  using (public.has_admin_role('manager')) with check (public.has_admin_role('manager'));
create policy "managers write planters" on public.planters for all
  using (public.has_admin_role('manager')) with check (public.has_admin_role('manager'));

create policy "managers insert collections" on public.collections for insert with check (public.has_admin_role('manager'));
create policy "managers update collections" on public.collections for update using (public.has_admin_role('manager'));
create policy "owners delete collections"   on public.collections for delete using (public.has_admin_role('owner'));

-- Team: everyone on the team sees the team list; only owners change it (done server-side with the secret key).
create policy "staff read team" on public.admin_users for select using (public.has_admin_role('staff') or user_id = auth.uid());
create policy "owners manage team" on public.admin_users for all
  using (public.has_admin_role('owner')) with check (public.has_admin_role('owner'));

-- Activity log: staff read it and append their own entries; nobody edits history.
create policy "staff read activity" on public.audit_log for select using (public.has_admin_role('staff'));
create policy "staff append activity" on public.audit_log for insert
  with check (public.has_admin_role('staff') and user_id = auth.uid());

-- ---------------------------------------------------------------- image storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('plant-images', 'plant-images', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read plant images" on storage.objects;
drop policy if exists "managers upload plant images" on storage.objects;
drop policy if exists "managers update plant images" on storage.objects;
drop policy if exists "managers delete plant images" on storage.objects;

create policy "public read plant images" on storage.objects for select using (bucket_id = 'plant-images');
create policy "managers upload plant images" on storage.objects for insert
  with check (bucket_id = 'plant-images' and public.has_admin_role('manager'));
create policy "managers update plant images" on storage.objects for update
  using (bucket_id = 'plant-images' and public.has_admin_role('manager'));
create policy "managers delete plant images" on storage.objects for delete
  using (bucket_id = 'plant-images' and public.has_admin_role('manager'));

-- ---------------------------------------------------------------- grants
grant usage on schema public to anon, authenticated;
grant select on public.plants, public.plant_variants, public.plant_images, public.planters, public.collections to anon, authenticated;
grant insert, update, delete on public.plants, public.plant_variants, public.plant_images, public.planters, public.collections to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;
grant select, insert on public.audit_log to authenticated;
grant execute on function public.set_stock(uuid, integer) to authenticated;
grant execute on function public.has_admin_role(public.admin_role) to anon, authenticated;
