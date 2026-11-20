-- SQL Migration 0002: COSYevents Session Content Extension
-- Reuses COSYplatform's Supabase project and profiles table.
--
-- ARCHITECTURE & ASSUMPTIONS NOTE ON ROLES & PERMISSIONS:
-- 1. Supported Profile Roles: 'founder', 'teacher', 'student'.
-- 2. Teacher Access Assumption: Event hosting is an activity performed by teachers, tracked via `hosted_sessions`.
--    'teacher' profiles can view and update `session_content` where `session_id` is assigned to their `hosted_sessions` array.
-- 3. Separation of Session Arrays:
--    - `hosted_sessions` (text[]) tracks session IDs assigned to teachers for facilitation & recording updates.
--    - `enrolled_sessions` (text[]) tracks session IDs purchased or enrolled in by students for viewing notes.
--    These columns are deliberately separate because teacher-access (facilitation) and student-access (paid-viewer)
--    represent distinct domain reasons for access.

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
DROP POLICY IF EXISTS "Teachers can view their own hosted sessions" ON public.session_content;
DROP POLICY IF EXISTS "Students view paid or enrolled sessions" ON public.session_content;
DROP POLICY IF EXISTS "Students can view their enrolled sessions" ON public.session_content;
DROP POLICY IF EXISTS "Founder and hosts can insert and update session content" ON public.session_content;
DROP POLICY IF EXISTS "Founder and teachers can insert and update session content" ON public.session_content;
DROP POLICY IF EXISTS "Founders and hosts can insert and update their own session content" ON public.session_content;
DROP POLICY IF EXISTS "Founders and teachers can insert and update their own session content" ON public.session_content;

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

-- Policy 2: Teachers can view their own hosted sessions
CREATE POLICY "Teachers can view their own hosted sessions"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
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

-- Policy 4: Founders and teachers can insert and update their own session content
CREATE POLICY "Founders and teachers can insert and update their own session content"
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
        AND profiles.role = 'teacher'
        AND session_content.session_id = ANY(hosted_sessions)
    )
  );
