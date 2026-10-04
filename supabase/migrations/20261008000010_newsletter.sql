-- 010: Real newsletter signups (the old sidebar form only pretended to subscribe).
-- Server-only: RLS on, no policies, so only the service role can read or write.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254),
  source text not null default 'blog',
  created_at timestamptz not null default now()
);
create unique index if not exists newsletter_email_lower_idx on public.newsletter_subscribers (lower(email));
alter table public.newsletter_subscribers enable row level security;
