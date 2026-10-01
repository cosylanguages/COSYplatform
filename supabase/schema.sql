-- Supabase Project Schema for COSYplatform Content Repository

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('founder', 'teacher', 'student')),
  language_access TEXT[] DEFAULT '{}',
  course_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lesson Content Table
CREATE TABLE IF NOT EXISTS lesson_content (
  lesson_id TEXT PRIMARY KEY,
  level TEXT,
  language TEXT,
  xml_content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;

-- Helper function to prevent RLS policy recursion on public.profiles
CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'founder'
  );
$$;

-- Automatic Onboarding Trigger Function for Auth Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, language_access, course_level)
  VALUES (NEW.id, 'student', '{}', NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth.users without profiles
INSERT INTO public.profiles (id, role, language_access)
SELECT id, 'student', '{}'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Founders can read all profiles"
  ON profiles FOR SELECT
  USING (public.is_founder());

CREATE POLICY "Founders can update profiles"
  ON profiles FOR UPDATE
  USING (public.is_founder())
  WITH CHECK (public.is_founder());

-- Lesson Content Policies
-- Founder reads everything
CREATE POLICY "Founders read all lesson content"
  ON lesson_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Teachers and Students read matching rows based on profile language_access & course_level
CREATE POLICY "Teachers and Students read entitled lesson content"
  ON lesson_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
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
