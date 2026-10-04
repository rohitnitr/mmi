-- 004: Profile 2.0 + skills. New tables only; nothing existing is altered.
-- Profile details live in "profiles" (not "users") because users is readable by everyone.

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create or replace function public.enforce_row_limit() returns trigger language plpgsql as $$
declare lim int := tg_argv[0]::int; cnt int;
begin
  execute format('select count(*) from %I.%I where user_id = $1', tg_table_schema, tg_table_name) into cnt using new.user_id;
  if cnt >= lim then raise exception 'Limit of % rows reached for %', lim, tg_table_name; end if;
  return new;
end $$;

-- ---------- profiles (1:1 with users) ----------
create table if not exists public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text, headline text, bio text, location text, avatar_url text,
  linkedin_url text, github_url text, website_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_len check (char_length(display_name) <= 60),
  constraint profiles_headline_len check (char_length(headline) <= 120),
  constraint profiles_bio_len check (char_length(bio) <= 800),
  constraint profiles_location_len check (char_length(location) <= 80),
  constraint profiles_avatar_https check (avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 400)),
  constraint profiles_linkedin_https check (linkedin_url is null or (linkedin_url ~ '^https://' and char_length(linkedin_url) <= 200)),
  constraint profiles_github_https check (github_url is null or (github_url ~ '^https://' and char_length(github_url) <= 200)),
  constraint profiles_website_https check (website_url is null or (website_url ~ '^https://' and char_length(website_url) <= 200))
);
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
alter table public.profiles enable row level security;
drop policy if exists "Read public or own profile" on public.profiles;
create policy "Read public or own profile" on public.profiles for select to anon, authenticated using (is_public or auth.uid() = user_id);
drop policy if exists "Insert own profile row" on public.profiles;
create policy "Insert own profile row" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Update own profile row" on public.profiles;
create policy "Update own profile row" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Delete own profile row" on public.profiles;
create policy "Delete own profile row" on public.profiles for delete to authenticated using (auth.uid() = user_id);

-- ---------- skills catalog (read-only for users) ----------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  created_at timestamptz not null default now()
);
create unique index if not exists skills_name_lower_idx on public.skills (lower(name));
alter table public.skills enable row level security;
drop policy if exists "Anyone can read skills" on public.skills;
create policy "Anyone can read skills" on public.skills for select to anon, authenticated using (true);

-- ---------- self-declared skills ----------
-- IMPORTANT: this table holds SELF-DECLARED data only. Validation scores must live in a separate,
-- server-written table (Sprint 4) so users can never set their own validation.
create table if not exists public.user_skills (
  user_id uuid not null references public.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  self_level text check (self_level in ('Beginner','Intermediate','Advanced')),
  created_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);
drop trigger if exists user_skills_limit on public.user_skills;
create trigger user_skills_limit before insert on public.user_skills for each row execute function public.enforce_row_limit(15);

create table if not exists public.user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) <= 100),
  description text check (char_length(description) <= 500),
  url text check (url is null or (url ~ '^https://' and char_length(url) <= 200)),
  created_at timestamptz not null default now()
);
drop trigger if exists user_projects_limit on public.user_projects;
create trigger user_projects_limit before insert on public.user_projects for each row execute function public.enforce_row_limit(8);

create table if not exists public.user_education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  institution text not null check (char_length(institution) <= 120),
  degree text check (char_length(degree) <= 100),
  field text check (char_length(field) <= 100),
  start_year int check (start_year between 1950 and 2100),
  end_year int check (end_year between 1950 and 2100),
  created_at timestamptz not null default now(),
  check (start_year is null or end_year is null or end_year >= start_year)
);
drop trigger if exists user_education_limit on public.user_education;
create trigger user_education_limit before insert on public.user_education for each row execute function public.enforce_row_limit(5);

-- RLS for the three child tables: owner full access; everyone can read rows of PUBLIC profiles
do $$
declare t text;
begin
  foreach t in array array['user_skills','user_projects','user_education'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Read own or public" on public.%I', t);
    execute format('create policy "Read own or public" on public.%I for select to anon, authenticated using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.user_id = %I.user_id and p.is_public))', t, t);
    execute format('drop policy if exists "Insert own" on public.%I', t);
    execute format('create policy "Insert own" on public.%I for insert to authenticated with check (auth.uid() = user_id)', t);
    execute format('drop policy if exists "Update own" on public.%I', t);
    execute format('create policy "Update own" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('drop policy if exists "Delete own" on public.%I', t);
    execute format('create policy "Delete own" on public.%I for delete to authenticated using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ---------- avatar storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users update own avatar" on storage.objects;
create policy "Users update own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete own avatar" on storage.objects;
create policy "Users delete own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- skill catalog seed ----------
insert into public.skills (name, category) values
 ('JavaScript','Software Engineering'),('TypeScript','Software Engineering'),('React','Software Engineering'),('Node.js','Software Engineering'),
 ('Python','Software Engineering'),('Java','Software Engineering'),('C++','Software Engineering'),('SQL','Data & Analytics'),
 ('System Design','Software Engineering'),('Data Structures & Algorithms','Software Engineering'),('REST APIs','Software Engineering'),
 ('Git','Software Engineering'),('Docker','Software Engineering'),('AWS','Software Engineering'),('Testing','Software Engineering'),
 ('Excel','Data & Analytics'),('Power BI','Data & Analytics'),('Tableau','Data & Analytics'),('Statistics','Data & Analytics'),
 ('Machine Learning','Data & Analytics'),('Data Visualization','Data & Analytics'),('ETL','Data & Analytics'),('A/B Testing','Data & Analytics'),('Analytics','Data & Analytics'),
 ('Case Interviews','Consulting'),('Strategy','Consulting'),('Problem Solving','Consulting'),('Market Sizing','Consulting'),('Stakeholder Management','Consulting'),('Presentation Skills','Consulting'),
 ('Financial Modeling','Finance'),('Valuation','Finance'),('Accounting','Finance'),('Risk Analysis','Finance'),('Credit Risk','Finance'),('Investment Analysis','Finance'),('Financial Reporting','Finance'),
 ('Product Sense','Product'),('Metrics','Product'),('Prioritization','Product'),('Roadmapping','Product'),('User Research','Product'),('Product Strategy','Product'),
 ('Quantitative Aptitude','Government'),('Logical Reasoning','Government'),('General Studies','Government'),('Current Affairs','Government'),('English','Government'),('Essay Writing','Government'),('Polity','Government'),
 ('SEO','Marketing'),('Content Marketing','Marketing'),('Performance Marketing','Marketing'),('Brand Strategy','Marketing'),('Social Media','Marketing'),('Growth Marketing','Marketing'),('Email Marketing','Marketing'),
 ('Communication','General'),('Leadership','General'),('Teamwork','General'),('Time Management','General'),('Public Speaking','General')
on conflict do nothing;
