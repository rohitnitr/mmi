-- Sprint 5: tighten peer-validation thresholds.
-- DO NOT run until you are ready: with these values a skill needs
-- 3 ratings from 3 different peers averaging >= 4.0 to count as validated.
update public.eval_settings
   set min_evaluations = 3,
       min_distinct_evaluators = 3,
       min_avg_rating = 4.00,
       updated_at = now()
 where id = true;

-- Recompute every user's skill_validations with the new thresholds.
select public.recompute_skill_validations(id) from public.users;
