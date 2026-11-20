-- Supabase Project Schema for COSYplatform Content Repository
-- Migration 0001: Core Profiles and Lesson Content Tables

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('founder', 'teacher', 'student')),
  language_access TEXT[] DEFAULT '{}',
  course_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lesson Content Table
CREATE TABLE IF NOT EXISTS public.lesson_content (
  lesson_id TEXT PRIMARY KEY,
  level TEXT,
  language TEXT,
  xml_content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Founders can read all profiles" ON public.profiles;
CREATE POLICY "Founders can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Lesson Content Policies
-- Founder reads everything
DROP POLICY IF EXISTS "Founders read all lesson content" ON public.lesson_content;
CREATE POLICY "Founders read all lesson content"
  ON public.lesson_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Teachers and Students read matching rows based on profile language_access & course_level
DROP POLICY IF EXISTS "Teachers and Students read entitled lesson content" ON public.lesson_content;
CREATE POLICY "Teachers and Students read entitled lesson content"
  ON public.lesson_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('teacher', 'student')
        AND (
          '*' = ANY(p.language_access)
          OR lesson_content.language = ANY(p.language_access)
          OR p.language_access IS NULL
        )
        AND (
          p.course_level IS NULL
          OR p.course_level = '*'
          OR LOWER(p.course_level) = LOWER(lesson_content.level)
        )
    )
  );
