-- /jee "notify me" list. Server-only: RLS on, no policies, written by /api/jee/waitlist.
create table if not exists public.jee_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 5 and 254),
  email_key text generated always as (lower(btrim(email))) stored,
  target_exam text check (target_exam is null or char_length(target_exam) <= 40),
  consent boolean not null check (consent),
  source text, medium text, campaign text,
  created_at timestamptz not null default now(),
  constraint jee_waitlist_email_unique unique (email_key)
);
alter table public.jee_waitlist enable row level security;
notify pgrst, 'reload schema';
