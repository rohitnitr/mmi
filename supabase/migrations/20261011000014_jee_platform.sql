-- JEE mock platform: complete schema from scratch. Safe to re-run.
-- Everything is SERVER-ONLY: RLS on, no client policies, no grants to anon/authenticated.
-- Answer keys live in their own table so questions can never leak the correct option.
begin;

create table if not exists public.jee_students (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  target_year int,
  show_name boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.jee_tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'full' check (kind in ('full','sectional','chapter')),
  duration_minutes int not null default 180 check (duration_minutes between 5 and 240),
  status text not null default 'draft' check (status in ('draft','live','closed')),
  opens_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.jee_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.jee_tests(id) on delete cascade,
  position int not null,
  subject text not null check (subject in ('Physics','Chemistry','Mathematics')),
  chapter text,
  topic text,
  qtype text not null check (qtype in ('mcq','numeric')),
  body text not null,
  options jsonb,
  marks smallint not null default 4,
  negative smallint not null default 1,
  unique (test_id, position)
);

create table if not exists public.jee_answer_keys (
  question_id uuid primary key references public.jee_questions(id) on delete cascade,
  correct text not null,
  solution text
);

create table if not exists public.jee_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_id uuid not null references public.jee_tests(id) on delete cascade,
  tier text not null check (tier in ('mock','analysis')),
  amount_paise int not null check (amount_paise > 0),
  status text not null default 'created' check (status in ('created','paid','failed','refunded')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  created_at timestamptz not null default now()
);
create unique index if not exists jee_purchases_one_paid
  on public.jee_purchases (user_id, test_id, tier) where status = 'paid';

create table if not exists public.jee_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_id uuid not null references public.jee_tests(id) on delete cascade,
  started_at timestamptz not null default now(),
  deadline_at timestamptz not null,
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','expired')),
  unique (user_id, test_id)
);

create table if not exists public.jee_answers (
  attempt_id uuid not null references public.jee_attempts(id) on delete cascade,
  question_id uuid not null references public.jee_questions(id) on delete cascade,
  response text,
  state text not null default 'not_answered'
    check (state in ('not_visited','not_answered','answered','marked','answered_marked')),
  time_spent_ms int not null default 0 check (time_spent_ms >= 0),
  bookmarked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create table if not exists public.jee_results (
  attempt_id uuid primary key references public.jee_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  test_id uuid not null references public.jee_tests(id) on delete cascade,
  marks int not null,
  correct int not null default 0,
  wrong int not null default 0,
  skipped int not null default 0,
  subject_marks jsonb,
  submitted_at timestamptz not null default now()
);
create index if not exists jee_results_test_marks on public.jee_results (test_id, marks desc, submitted_at);

-- Country-wide rank and percentile among everyone who submitted the same mock on this platform.
create or replace view public.jee_rankings as
select
  r.test_id,
  r.user_id,
  r.marks,
  rank() over (partition by r.test_id order by r.marks desc, r.submitted_at) as rank,
  count(*) over (partition by r.test_id) as attempts,
  round(coalesce(100 * (1 - percent_rank() over (partition by r.test_id order by r.marks desc)), 100)::numeric, 2) as percentile
from public.jee_results r;

-- Lock everything down
do $$
declare t text;
begin
  foreach t in array array['jee_students','jee_tests','jee_questions','jee_answer_keys','jee_purchases','jee_attempts','jee_answers','jee_results']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;
revoke all on public.jee_rankings from anon, authenticated;

commit;
notify pgrst, 'reload schema';

-- Verify (expect 9 rows, all true for the first 8):
-- select tablename, rowsecurity from pg_tables where tablename like 'jee_%' order by 1;
