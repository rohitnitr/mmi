-- Hide user emails from the public users table.
-- Safe with BOTH old and new app code (no column drop). Real emails stay in auth.users.

begin;

-- 1) Private backup (RLS on, no policies, no grants: only the service role / SQL editor can read it)
create table if not exists public.users_email_backup (
  id uuid primary key,
  email text,
  backed_up_at timestamptz not null default now()
);
alter table public.users_email_backup enable row level security;
revoke all on table public.users_email_backup from anon, authenticated;

insert into public.users_email_backup (id, email)
select id, email from public.users where email is not null
on conflict (id) do nothing;

-- 2) Blank the public copies
update public.users set email = null where email is not null;

-- 3) Keep them blank, even if old code tries to write one
create or replace function public.users_strip_email()
returns trigger
language plpgsql
as $$
begin
  new.email := null;
  return new;
end;
$$;

drop trigger if exists users_strip_email_trg on public.users;
create trigger users_strip_email_trg
  before insert or update on public.users
  for each row execute function public.users_strip_email();

commit;

notify pgrst, 'reload schema';

-- Verify (expect 0):
--   select count(*) filter (where email is not null) as still_exposed from public.users;
-- Backup rows:
--   select count(*) from public.users_email_backup;

-- LATER, only after dev is merged to main and production no longer references users.email:
--   alter table public.users drop column email;
--   drop trigger if exists users_strip_email_trg on public.users;
--   drop function if exists public.users_strip_email();
