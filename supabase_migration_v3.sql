-- V3 Migration: Add email column for user identity integrity
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Optional: update RLS to allow users to see others' public profiles
-- (run previous migrations first if not already done)
