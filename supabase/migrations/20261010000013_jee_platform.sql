-- JEE mock-test platform. All tables are server-only: RLS on, NO client policies.
-- Only the API (service role) reads or writes them. Safe to run more than once.

create table if not exists public.jee_students (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text check (display_name is null or char_length(display_name) <= 40),
  age_band text check (age_band in ('under18','18plus')),
  consent_at timestamptz,
  leaderboard_opt_in boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.jee_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  mock_price_paise int not null default 1100 check (mock_price_paise >= 0),
  analysis_price_paise int not null default 2900 check (analysis_price_paise >= 0),
  status text not null default 'draft' check (status in ('draft','open','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.jee_tests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.jee_events(id) on delete cascade,
  title text not null,
  duration_minutes int not null check (duration_minutes > 0),
  marking jsonb not null default '{}'::jsonb,  -- set from the official bulletin, per test
  status text not null default 'draft' check (status in ('draft','ready','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.jee_questions (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (subject in ('Physics','Chemistry','Mathematics')),
  topic text not null,
  qtype text not null default 'mcq' check (qtype in ('mcq','numerical')),
  body text not null,
  options jsonb,
  difficulty text check (difficulty in ('easy','medium','hard')),
  source text,                                  -- where it came from, for licensing records
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Answer keys live apart so they can never be selected together with a question by mistake.
create table if not exists public.jee_answer_keys (
  question_id uuid primary key references public.jee_questions(id) on delete cascade,
  correct jsonb not null,
  explanation text
);

create table if not exists public.jee_test_questions (
  test_id uuid not null references public.jee_tests(id) on delete cascade,
  position int not null check (position > 0),
  question_id uuid not null references public.jee_questions(id),
  marks_correct numeric not null default 4,
  marks_wrong numeric not null default -1,
  primary key (test_id, position)
);

create table if not exists public.jee_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid references public.jee_events(id),
  kind text not null check (kind in ('mock','analysis','pass')),
  amount_paise int not null check (amount_paise >= 0),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,              -- unique: one payment can never grant access twice
  status text not null default 'created' check (status in ('created','paid','failed','refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.jee_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.jee_events(id) on delete cascade,
  has_exam boolean not null default false,
  has_analysis boolean not null default false,
  purchase_id uuid references public.jee_purchases(id),
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table if not exists public.jee_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_id uuid not null references public.jee_tests(id) on delete cascade,
  started_at timestamptz not null default now(),
  deadline_at timestamptz not null,             -- set by the server, never the browser
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','expired')),
  constraint jee_one_attempt unique (user_id, test_id)
);

create table if not exists public.jee_attempt_answers (
  attempt_id uuid not null references public.jee_attempts(id) on delete cascade,
  question_id uuid not null references public.jee_questions(id),
  selected jsonb,
  time_spent_sec int not null default 0,
  visits int not null default 0,
  changes int not null default 0,
  marked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create table if not exists public.jee_reports (
  attempt_id uuid primary key references public.jee_attempts(id) on delete cascade,
  score numeric not null,
  correct int not null default 0,
  wrong int not null default 0,
  skipped int not null default 0,
  accuracy numeric,
  metrics jsonb not null default '{}'::jsonb,   -- subject/topic/time breakdowns computed by code
  summary text,                                 -- optional AI wording, written from the numbers
  created_at timestamptz not null default now()
);

create index if not exists jee_attempts_test_idx on public.jee_attempts (test_id, status);
create index if not exists jee_purchases_user_idx on public.jee_purchases (user_id);
create index if not exists jee_answers_attempt_idx on public.jee_attempt_answers (attempt_id);

-- Rank and percentile per test, among submitted attempts. Percentile = share of attempts scored below.
create or replace view public.jee_leaderboard as
select a.test_id, a.user_id, r.score,
       rank() over (partition by a.test_id order by r.score desc) as rank,
       round(100.0 * (count(*) over (partition by a.test_id) - rank() over (partition by a.test_id order by r.score desc))
             / nullif(count(*) over (partition by a.test_id), 0), 2) as percentile
from public.jee_attempts a
join public.jee_reports r on r.attempt_id = a.id
where a.status = 'submitted';

revoke all on public.jee_leaderboard from anon, authenticated;

alter table public.jee_students        enable row level security;
alter table public.jee_events          enable row level security;
alter table public.jee_tests           enable row level security;
alter table public.jee_questions       enable row level security;
alter table public.jee_answer_keys     enable row level security;
alter table public.jee_test_questions  enable row level security;
alter table public.jee_purchases       enable row level security;
alter table public.jee_entitlements    enable row level security;
alter table public.jee_attempts        enable row level security;
alter table public.jee_attempt_answers enable row level security;
alter table public.jee_reports         enable row level security;

notify pgrst, 'reload schema';
