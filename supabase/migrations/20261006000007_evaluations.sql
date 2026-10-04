-- Sprint 4: structured peer evaluations and the validation engine.
-- Every table here is server-written. Browsers get NO policies, so all reads
-- and writes go through the API routes (service role).

-- Validation thresholds live in one row, so they can be tightened later with a single UPDATE.
create table if not exists public.eval_settings (
  id boolean primary key default true check (id),
  min_evaluations         int          not null default 1,
  min_distinct_evaluators int          not null default 1,
  min_avg_rating          numeric(3,2) not null default 1.00,
  updated_at              timestamptz  not null default now()
);
insert into public.eval_settings (id) values (true) on conflict (id) do nothing;
alter table public.eval_settings enable row level security;

create table if not exists public.session_evaluations (
  id uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.sessions(id) on delete cascade,
  evaluator_id uuid not null references public.users(id)    on delete cascade,
  evaluatee_id uuid not null references public.users(id)    on delete cascade,
  communication   smallint not null check (communication   between 1 and 5),
  structure       smallint not null check (structure       between 1 and 5),
  knowledge       smallint not null check (knowledge       between 1 and 5),
  problem_solving smallint not null check (problem_solving between 1 and 5),
  overall         smallint not null check (overall         between 1 and 5),
  strengths    text check (strengths    is null or char_length(strengths)    <= 1000),
  improvements text check (improvements is null or char_length(improvements) <= 1000),
  created_at timestamptz not null default now(),
  constraint session_evaluations_not_self check (evaluator_id <> evaluatee_id),
  constraint session_evaluations_one_per_session unique (session_id, evaluator_id)
);
create index if not exists session_evaluations_evaluatee_idx on public.session_evaluations (evaluatee_id, created_at desc);
create index if not exists session_evaluations_evaluator_idx on public.session_evaluations (evaluator_id);
alter table public.session_evaluations enable row level security;

create table if not exists public.evaluation_skill_ratings (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.session_evaluations(id) on delete cascade,
  evaluatee_id  uuid not null references public.users(id) on delete cascade,
  evaluator_id  uuid not null references public.users(id) on delete cascade,
  skill     text not null check (char_length(skill) between 1 and 60),
  skill_key text generated always as (lower(btrim(skill))) stored,
  rating    smallint not null check (rating between 1 and 5),
  constraint evaluation_skill_unique unique (evaluation_id, skill_key)
);
create index if not exists evaluation_skill_ratings_evaluatee_idx on public.evaluation_skill_ratings (evaluatee_id, skill_key);
alter table public.evaluation_skill_ratings enable row level security;

-- One row per person per skill. Written only by recompute_skill_validations().
create table if not exists public.skill_validations (
  evaluatee_id    uuid not null references public.users(id) on delete cascade,
  skill_key       text not null,
  skill           text not null,
  rating_count    int  not null,
  evaluator_count int  not null,
  avg_rating      numeric(3,2) not null,
  is_validated    boolean not null,
  updated_at      timestamptz not null default now(),
  primary key (evaluatee_id, skill_key)
);
alter table public.skill_validations enable row level security;

-- The owner can read their own rows directly. Public display goes through the
-- server and only for profiles that chose to be public.
drop policy if exists "owner reads own validations" on public.skill_validations;
create policy "owner reads own validations" on public.skill_validations
  for select to authenticated using (evaluatee_id = auth.uid());

create or replace function public.recompute_skill_validations(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare s public.eval_settings%rowtype;
begin
  select * into s from public.eval_settings where id = true;

  insert into public.skill_validations
    (evaluatee_id, skill_key, skill, rating_count, evaluator_count, avg_rating, is_validated, updated_at)
  select
    r.evaluatee_id,
    r.skill_key,
    max(r.skill),
    count(*)::int,
    count(distinct r.evaluator_id)::int,
    round(avg(r.rating), 2),
    (count(*) >= s.min_evaluations
      and count(distinct r.evaluator_id) >= s.min_distinct_evaluators
      and avg(r.rating) >= s.min_avg_rating),
    now()
  from public.evaluation_skill_ratings r
  where r.evaluatee_id = p_user
  group by r.evaluatee_id, r.skill_key
  on conflict (evaluatee_id, skill_key) do update set
    skill           = excluded.skill,
    rating_count    = excluded.rating_count,
    evaluator_count = excluded.evaluator_count,
    avg_rating      = excluded.avg_rating,
    is_validated    = excluded.is_validated,
    updated_at      = now();
end;
$$;

-- Lesson from Sprint 2: public functions are callable by anyone unless revoked.
revoke execute on function public.recompute_skill_validations(uuid) from public, anon, authenticated;
grant  execute on function public.recompute_skill_validations(uuid) to service_role;

-- To tighten the rules later, run (then re-run the recompute for everyone):
--   update public.eval_settings set min_evaluations = 3, min_distinct_evaluators = 3, min_avg_rating = 4.0, updated_at = now();
--   select public.recompute_skill_validations(id) from public.users;
