-- ============================================================
-- MatchMyInterview — Blog Posts Table Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  title         text NOT NULL,
  excerpt       text NOT NULL,
  content       text NOT NULL,
  cover_image   text,
  author        text NOT NULL DEFAULT 'MMI Team',
  tags          text[] DEFAULT '{}',
  category      text NOT NULL DEFAULT 'Interview Tips',
  status        text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published')),
  read_time     integer DEFAULT 5,
  views         integer DEFAULT 0,
  published_at  timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can only read published posts
CREATE POLICY "Public read published posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Service role (used by admin API routes) bypasses RLS automatically.
-- No extra policy needed for admin writes.

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug);
-- Index for filtering by status + published_at
CREATE INDEX IF NOT EXISTS blog_posts_status_published_idx ON public.blog_posts (status, published_at DESC);
-- Index for category filtering
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON public.blog_posts (category);
