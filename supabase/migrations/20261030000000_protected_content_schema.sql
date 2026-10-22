-- Migration: 20261030000000_protected_content_schema.sql
-- Description: COSYplatform Protected Curriculum Architecture & RLS Policies
-- Upstream Canonical Curriculum Owner: COSYplatform
--
-- ============================================================================
-- SHARED VS NEW OBJECTS HEADER:
-- ============================================================================
-- Shared Ecosystem Objects (Defined or referenced across COSYevents / COSYplatform):
--   1. public.profiles (Shared user table - added language_access, course_level)
--   2. public.teacher_languages (Shared language assignment - user_id, language)
--   3. public.access_grants (Shared entitlement table - user_id, course_id, expires_at)
--   4. public.session_content (Shared events content)
--
-- New COSYplatform Canonical Curriculum Objects:
--   1. public.courses (Curriculum tracks and metadata)
--   2. public.lessons (Canonical deduplicated lesson metadata)
--   3. public.lesson_student_content (Sanitized student-facing lesson body)
--   4. public.lesson_protected (Answer keys, teacher notes, paid session scripts)
--   5. public.course_lessons (Sequence placement junction table)
--   6. public.course_preview (Public catalog preview view)
--   7. public.is_founder(), public.is_teacher(), public.is_student() (SECURITY DEFINER helpers)
-- ============================================================================

-- 1. Shared Table Adaptation: `profiles`
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'founder')),
    display_name TEXT,
    ui_lang TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_access TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS course_level TEXT DEFAULT '*';

-- 2. SECURITY DEFINER Helper Functions (Prevents RLS infinite recursion on profiles)
CREATE OR REPLACE FUNCTION public.is_founder(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND role = 'founder'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND role = 'teacher'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_student(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND role = 'student'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_founder(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_teacher(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_student(auth.uid());
$$;

-- 3. Shared Table Adaptation: `teacher_languages`
CREATE TABLE IF NOT EXISTS public.teacher_languages (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, language)
);

ALTER TABLE public.teacher_languages ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. New Table: `courses`
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    language TEXT NOT NULL,
    cefr TEXT NOT NULL,
    course_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    total_lessons INT DEFAULT 0,
    is_public_preview BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Shared Table Adaptation: `access_grants`
CREATE TABLE IF NOT EXISTS public.access_grants (
    grant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.access_grants ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.access_grants ADD COLUMN IF NOT EXISTS course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.access_grants ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Preserve existing grant expiry semantics when adapting the legacy access table.
UPDATE public.access_grants
SET expires_at = valid_until::timestamptz
WHERE expires_at IS NULL AND valid_until IS NOT NULL;

-- 6. New Table: `lessons` (Metadata Only - No sensitive bodies)
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,
    language TEXT NOT NULL,
    cefr TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('lesson', 'roadmap-detail', 'answer-key', 'teacher-notes', 'workbook', 'manual', 'session-body')),
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. New Table: `lesson_student_content` (Sanitized student body)
CREATE TABLE IF NOT EXISTS public.lesson_student_content (
    lesson_id TEXT PRIMARY KEY REFERENCES public.lessons(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. New Table: `lesson_protected` (Answer keys, teacher notes, paid session scripts)
CREATE TABLE IF NOT EXISTS public.lesson_protected (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('answer-key', 'teacher-notes', 'session-body', 'manual')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. New Table: `course_lessons` (Junction table with stable placement_id)
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    placement_id TEXT NOT NULL,
    unit TEXT,
    section_number INT DEFAULT 0,
    lesson_number INT NOT NULL,
    is_optional BOOLEAN DEFAULT false,
    is_milestone BOOLEAN DEFAULT false,
    is_exam BOOLEAN DEFAULT false,
    teacher_led BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'drafted',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (course_id, lesson_number),
    UNIQUE (course_id, placement_id)
);

-- 10. Public Course Preview View
CREATE OR REPLACE VIEW public.course_preview WITH (security_invoker = true) AS
SELECT
    c.id AS course_id,
    c.language,
    c.cefr,
    c.course_type,
    c.title AS course_title,
    c.description AS course_description,
    c.total_lessons,
    cl.lesson_number,
    cl.unit,
    cl.section_number,
    cl.placement_id,
    cl.is_optional,
    cl.is_milestone,
    cl.is_exam,
    cl.teacher_led,
    cl.status,
    l.id AS lesson_id,
    l.slug,
    l.title AS lesson_title,
    l.summary AS lesson_summary,
    l.kind
FROM public.courses c
JOIN public.course_lessons cl ON c.id = cl.course_id
JOIN public.lessons l ON cl.lesson_id = l.id
WHERE c.is_public_preview = true;

-- 11. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_student_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_protected ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies for idempotent re-runs
DROP POLICY IF EXISTS "Profiles readable by owner or founder" ON public.profiles;
DROP POLICY IF EXISTS "Founder full access on profiles" ON public.profiles;

DROP POLICY IF EXISTS "Teacher read own assigned languages" ON public.teacher_languages;
DROP POLICY IF EXISTS "Founder full access on teacher_languages" ON public.teacher_languages;

DROP POLICY IF EXISTS "Public preview courses readable by all" ON public.courses;
DROP POLICY IF EXISTS "Founder full access on courses" ON public.courses;

DROP POLICY IF EXISTS "Public preview course_lessons readable by all" ON public.course_lessons;
DROP POLICY IF EXISTS "Founder full access on course_lessons" ON public.course_lessons;

DROP POLICY IF EXISTS "Public preview lessons metadata readable by all" ON public.lessons;
DROP POLICY IF EXISTS "Teacher read lessons for assigned languages" ON public.lessons;
DROP POLICY IF EXISTS "Student read lessons metadata for granted courses and levels" ON public.lessons;
DROP POLICY IF EXISTS "Founder full access on lessons" ON public.lessons;

DROP POLICY IF EXISTS "Teacher read student content for assigned languages" ON public.lesson_student_content;
DROP POLICY IF EXISTS "Student read student content for granted courses and level isolation" ON public.lesson_student_content;
DROP POLICY IF EXISTS "Founder full access on lesson_student_content" ON public.lesson_student_content;

DROP POLICY IF EXISTS "Teacher read protected content for assigned languages" ON public.lesson_protected;
DROP POLICY IF EXISTS "Founder full access on lesson_protected" ON public.lesson_protected;

DROP POLICY IF EXISTS "Student read own access grants" ON public.access_grants;
DROP POLICY IF EXISTS "Founder full access on access_grants" ON public.access_grants;

-- 12. RLS Policies

-- Profiles
CREATE POLICY "Profiles readable by owner or founder"
ON public.profiles FOR SELECT
USING (
    id = auth.uid() OR public.is_founder()
);

CREATE POLICY "Founder full access on profiles"
ON public.profiles FOR ALL
USING (
    public.is_founder()
);

-- Teacher Languages
CREATE POLICY "Teacher read own assigned languages"
ON public.teacher_languages FOR SELECT
USING (
    user_id = auth.uid() OR teacher_id = auth.uid() OR public.is_founder()
);

CREATE POLICY "Founder full access on teacher_languages"
ON public.teacher_languages FOR ALL
USING (
    public.is_founder()
);

-- Courses
CREATE POLICY "Public preview courses readable by all"
ON public.courses FOR SELECT
USING (is_public_preview = true);

CREATE POLICY "Founder full access on courses"
ON public.courses FOR ALL
USING (
    public.is_founder()
);

-- Course Lessons
CREATE POLICY "Public preview course_lessons readable by all"
ON public.course_lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.courses c WHERE c.id = course_lessons.course_id AND c.is_public_preview = true
    )
);

CREATE POLICY "Founder full access on course_lessons"
ON public.course_lessons FOR ALL
USING (
    public.is_founder()
);

-- Lessons Metadata
CREATE POLICY "Public preview lessons metadata readable by all"
ON public.lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.course_lessons cl
        JOIN public.courses c ON c.id = cl.course_id
        WHERE cl.lesson_id = lessons.id AND c.is_public_preview = true
    )
);

CREATE POLICY "Teacher read lessons for assigned languages"
ON public.lessons FOR SELECT
USING (
    public.is_teacher() AND EXISTS (
        SELECT 1 FROM public.teacher_languages tl WHERE (tl.user_id = auth.uid() OR tl.teacher_id = auth.uid()) AND tl.language = lessons.language
    )
);

CREATE POLICY "Student read lessons metadata for granted courses and levels"
ON public.lessons FOR SELECT
USING (
    public.is_student() AND EXISTS (
        SELECT 1 FROM public.access_grants ag
        JOIN public.courses c ON (c.id = ag.course_id OR c.id = ag.course)
        JOIN public.course_lessons cl ON cl.course_id = c.id
        WHERE (ag.user_id = auth.uid() OR ag.student_id = auth.uid())
          AND cl.lesson_id = lessons.id
          AND c.language = lessons.language
          AND c.cefr = lessons.cefr
          AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    )
);

CREATE POLICY "Founder full access on lessons"
ON public.lessons FOR ALL
USING (
    public.is_founder()
);

-- Lesson Student Content (Sanitized Body)
CREATE POLICY "Teacher read student content for assigned languages"
ON public.lesson_student_content FOR SELECT
USING (
    public.is_teacher() AND EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.teacher_languages tl ON tl.language = l.language
        WHERE l.id = lesson_student_content.lesson_id AND (tl.user_id = auth.uid() OR tl.teacher_id = auth.uid())
    )
);

CREATE POLICY "Student read student content for granted courses and level isolation"
ON public.lesson_student_content FOR SELECT
USING (
    public.is_student() AND EXISTS (
        SELECT 1 FROM public.access_grants ag
        JOIN public.courses c ON (c.id = ag.course_id OR c.id = ag.course)
        JOIN public.course_lessons cl ON cl.course_id = c.id
        JOIN public.lessons l ON l.id = lesson_student_content.lesson_id
        WHERE (ag.user_id = auth.uid() OR ag.student_id = auth.uid())
          AND cl.lesson_id = lesson_student_content.lesson_id
          AND c.language = l.language
          AND c.cefr = l.cefr
          AND l.kind IN ('lesson', 'workbook')
          AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    )
);

CREATE POLICY "Founder full access on lesson_student_content"
ON public.lesson_student_content FOR ALL
USING (
    public.is_founder()
);

-- Lesson Protected Content (Answer Keys / Teacher Notes) - Hidden from students/anon
CREATE POLICY "Teacher read protected content for assigned languages"
ON public.lesson_protected FOR SELECT
USING (
    public.is_teacher() AND EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.teacher_languages tl ON tl.language = l.language
        WHERE l.id = lesson_protected.lesson_id AND (tl.user_id = auth.uid() OR tl.teacher_id = auth.uid())
    )
);

CREATE POLICY "Founder full access on lesson_protected"
ON public.lesson_protected FOR ALL
USING (
    public.is_founder()
);

-- Access Grants
CREATE POLICY "Student read own access grants"
ON public.access_grants FOR SELECT
USING (
    user_id = auth.uid() OR student_id = auth.uid() OR public.is_founder()
);

CREATE POLICY "Founder full access on access_grants"
ON public.access_grants FOR ALL
USING (
    public.is_founder()
);


-- Explicit API privileges for newly-created canonical curriculum objects.
-- RLS policies still determine which rows each caller can see.
GRANT SELECT ON public.courses, public.course_lessons, public.lessons, public.course_preview TO anon, authenticated;
GRANT SELECT ON public.lesson_student_content, public.lesson_protected TO authenticated;
