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

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Founders can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

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
