-- JEE payments v2: one paid purchase = one attempt, repeat purchases allowed, upgrades grant nothing extra.
-- Backward compatible with the code currently on production. Run BEFORE deploying the new code.
begin;

-- 1) Allow buying the same test again. Double-processing stays impossible: razorpay_payment_id is UNIQUE.
drop index if exists public.jee_purchases_one_paid;

-- 2) What each purchase grants.
alter table public.jee_purchases add column if not exists attempts_granted smallint not null default 1
  check (attempts_granted between 0 and 1);
alter table public.jee_purchases add column if not exists paid_at timestamptz;

-- 3) Existing analysis upgrades (the 38 rupee kind) must not count as an extra attempt.
update public.jee_purchases set attempts_granted = 0
where tier = 'analysis' and amount_paise = 3800 and razorpay_order_id not like 'admin_grant_%';

create index if not exists jee_purchases_user_test_status on public.jee_purchases (user_id, test_id, status);
commit;
notify pgrst, 'reload schema';

-- Reconciliation: orders still 'created' after 15 minutes (a payment may have been taken but not recorded)
-- select id, user_id, test_id, tier, amount_paise, razorpay_order_id, created_at
-- from jee_purchases where status = 'created' and created_at < now() - interval '15 minutes' order by created_at desc;
