-- Sprint 2 close-out: stop anonymous callers from running internal functions.
-- Nothing in src/ calls these via rpc(), so no browser flow depends on them.
-- Roll back with: grant execute on function public.<name>() to anon, authenticated;

revoke execute on function public.expire_old_invites()   from public, anon, authenticated;
revoke execute on function public.simulate_online_users() from public, anon, authenticated;

-- Recommended after you check cron.job (see the guide): remove the fake-presence function.
-- drop function if exists public.simulate_online_users();
