-- MatchMyInterview - Supabase SQL Setup
-- Run this entire script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  experience TEXT NOT NULL DEFAULT '0-2 yrs',
  coffee_balance INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invites table
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  channel_name TEXT NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('invite', 'refund', 'topup')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read all users (for the listing), write their own
CREATE POLICY "Anyone can read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies: Invites
CREATE POLICY "Users can read their own invites" ON public.invites FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create invites" ON public.invites FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update invites they received" ON public.invites FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- RLS Policies: Sessions
CREATE POLICY "Users can read their own sessions" ON public.sessions FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Service can insert sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update sessions" ON public.sessions FOR UPDATE USING (true);

-- RLS Policies: Transactions
CREATE POLICY "Users can read their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);

-- Enable Realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- Function: auto-expire invites and refund coffee
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
DECLARE
  inv RECORD;
BEGIN
  FOR inv IN
    SELECT id, sender_id FROM public.invites
    WHERE status = 'pending' AND expires_at < NOW()
  LOOP
    UPDATE public.invites SET status = 'expired' WHERE id = inv.id;
    UPDATE public.users SET coffee_balance = coffee_balance + 1 WHERE id = inv.sender_id;
    INSERT INTO public.transactions (user_id, type, amount, reason)
    VALUES (inv.sender_id, 'credit', 1, 'refund');
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the expire function every hour using pg_cron (enable pg_cron extension first in Supabase)
-- SELECT cron.schedule('expire-invites', '0 * * * *', 'SELECT expire_old_invites()');
