-- Migration 0002: Session Content Schema and Profile Extensions
-- Ported from COSYevents schema (scripts/schema.sql)

-- 1. Ensure `enrolled_sessions` column exists on `public.profiles`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'enrolled_sessions'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN enrolled_sessions text[] DEFAULT '{}';
  END IF;
END $$;

-- 2. Ensure `hosted_sessions` column exists on `public.profiles`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'hosted_sessions'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN hosted_sessions text[] DEFAULT '{}';
  END IF;
END $$;

-- 3. Create session_content table
CREATE TABLE IF NOT EXISTS public.session_content (
  session_id text PRIMARY KEY,
  full_notes text,
  recording_url text,
  updated_at timestamptz DEFAULT now()
);

-- 4. Enable Row Level Security
ALTER TABLE public.session_content ENABLE ROW LEVEL SECURITY;

-- 5. Clean up existing policies for idempotent re-execution
DROP POLICY IF EXISTS "Founder and hosts can view all session content" ON public.session_content;
DROP POLICY IF EXISTS "Founder and teachers can view all session content" ON public.session_content;
DROP POLICY IF EXISTS "Founders can view all session content" ON public.session_content;
DROP POLICY IF EXISTS "Hosts can view their own hosted sessions" ON public.session_content;
DROP POLICY IF EXISTS "Students view paid or enrolled sessions" ON public.session_content;
DROP POLICY IF EXISTS "Students can view their enrolled sessions" ON public.session_content;
DROP POLICY IF EXISTS "Founder and hosts can insert and update session content" ON public.session_content;
DROP POLICY IF EXISTS "Founder and teachers can insert and update session content" ON public.session_content;
DROP POLICY IF EXISTS "Founders and hosts can insert and update their own session content" ON public.session_content;

-- Policy 1: Founders can view all session content
CREATE POLICY "Founders can view all session content"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'founder'
    )
  );

-- Policy 2: Hosts can view their own hosted sessions
CREATE POLICY "Hosts can view their own hosted sessions"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'host'
        AND session_content.session_id = ANY(hosted_sessions)
    )
  );

-- Policy 3: Students can view their enrolled sessions
CREATE POLICY "Students can view their enrolled sessions"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'student'
        AND session_content.session_id = ANY(enrolled_sessions)
    )
  );

-- Policy 4: Founders and hosts can insert and update their own session content
CREATE POLICY "Founders and hosts can insert and update their own session content"
  ON public.session_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'founder'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'host'
        AND session_content.session_id = ANY(hosted_sessions)
    )
  );
