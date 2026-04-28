-- MatchMyInterview V2 Migration
-- Run this in Supabase SQL Editor (safe to run on existing tables)

-- Add new profile fields to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'Software / IT';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS target_role TEXT NOT NULL DEFAULT '';

-- Add note field to invites
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '';

-- Update RLS policies to allow reading all users (for matching)
DROP POLICY IF EXISTS "Anyone can read users" ON public.users;
CREATE POLICY "Anyone can read users" ON public.users FOR SELECT USING (true);

-- Allow service role to update coffee_balance (needed for payment)
DROP POLICY IF EXISTS "Service can update users" ON public.users;
CREATE POLICY "Service can update users" ON public.users FOR UPDATE USING (true);
