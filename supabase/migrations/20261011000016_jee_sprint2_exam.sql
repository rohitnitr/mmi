-- Sprint 2: exam engine. Additive only. Safe to run more than once.
-- Adds an optional diagram per question and a tolerance for numerical answers, plus sanity checks.

alter table public.jee_questions    add column if not exists image_url text;
alter table public.jee_answer_keys  add column if not exists tolerance numeric not null default 0.01;

alter table public.jee_questions drop constraint if exists jee_questions_image_https;
alter table public.jee_questions add constraint jee_questions_image_https
  check (image_url is null or image_url ~ '^https://');

alter table public.jee_questions drop constraint if exists jee_questions_marks_sane;
alter table public.jee_questions add constraint jee_questions_marks_sane
  check (marks > 0 and negative >= 0);

alter table public.jee_answer_keys drop constraint if exists jee_answer_keys_tolerance_sane;
alter table public.jee_answer_keys add constraint jee_answer_keys_tolerance_sane
  check (tolerance >= 0);

create index if not exists jee_answers_attempt_state_idx on public.jee_answers (attempt_id, state);

-- Make sure the new columns stay server-only like the rest.
revoke all on public.jee_questions, public.jee_answer_keys from anon, authenticated;

notify pgrst, 'reload schema';
