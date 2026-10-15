-- COSYplatform Protected Content Contract Migration
-- Upstream Owner: COSYplatform
-- Schema version: 20260330000000

-- 1. Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'founder')),
    language_access TEXT[] DEFAULT '{}',
    course_level TEXT DEFAULT '*',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Teacher Languages Mapping
CREATE TABLE IF NOT EXISTS public.teacher_languages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (teacher_id, language)
);

-- 3. Courses Table
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

-- 4. Access Grants Table
CREATE TABLE IF NOT EXISTS public.access_grants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);

-- 5. Lessons Metadata Table (No sensitive body content)
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

-- 6. Lesson Student Content Table (Sanitized bodies for students)
CREATE TABLE IF NOT EXISTS public.lesson_student_content (
    lesson_id TEXT PRIMARY KEY REFERENCES public.lessons(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Lesson Protected Content Table (Answer keys, teacher notes, paid session bodies - Strictly hidden from students/anon)
CREATE TABLE IF NOT EXISTS public.lesson_protected (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('answer-key', 'teacher-notes', 'session-body', 'manual')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Course Lessons Junction Table
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

-- 9. Public Course Preview View
CREATE OR REPLACE VIEW public.course_preview AS
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

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_student_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_protected ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies

-- Profiles Policies
CREATE POLICY "Profiles readable by owner or founder"
ON public.profiles FOR SELECT
USING (
    id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

CREATE POLICY "Founder full access on profiles"
ON public.profiles FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

-- Teacher Languages Policies
CREATE POLICY "Teacher read own assigned languages"
ON public.teacher_languages FOR SELECT
USING (
    teacher_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

CREATE POLICY "Founder full access on teacher_languages"
ON public.teacher_languages FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

-- Courses Policies
CREATE POLICY "Public preview courses readable by all"
ON public.courses FOR SELECT
USING (is_public_preview = true);

CREATE POLICY "Founder full access on courses"
ON public.courses FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

-- Course Lessons Policies
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
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

-- Lessons Metadata Policies
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
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'
    ) AND EXISTS (
        SELECT 1 FROM public.teacher_languages tl WHERE tl.teacher_id = auth.uid() AND tl.language = lessons.language
    )
);

CREATE POLICY "Student read lessons metadata for granted courses and levels"
ON public.lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'student'
    ) AND EXISTS (
        SELECT 1 FROM public.access_grants ag
        JOIN public.courses c ON c.id = ag.course_id
        JOIN public.course_lessons cl ON cl.course_id = c.id
        WHERE ag.student_id = auth.uid()
          AND cl.lesson_id = lessons.id
          AND c.language = lessons.language
          AND c.cefr = lessons.cefr
          AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    )
);

CREATE POLICY "Founder full access on lessons"
ON public.lessons FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

-- Lesson Student Content Policies (Sanitized Body)
CREATE POLICY "Teacher read student content for assigned languages"
ON public.lesson_student_content FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'
    ) AND EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.teacher_languages tl ON tl.language = l.language
        WHERE l.id = lesson_student_content.lesson_id AND tl.teacher_id = auth.uid()
    )
);

CREATE POLICY "Student read student content for granted courses and level isolation"
ON public.lesson_student_content FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'student'
    ) AND EXISTS (
        SELECT 1 FROM public.access_grants ag
        JOIN public.courses c ON c.id = ag.course_id
        JOIN public.course_lessons cl ON cl.course_id = c.id
        JOIN public.lessons l ON l.id = lesson_student_content.lesson_id
        WHERE ag.student_id = auth.uid()
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
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

-- Lesson Protected Content Policies (Answer Keys / Teacher Notes / Session Bodies)
-- NOTE: No policies granted to students or anonymous users!
CREATE POLICY "Teacher read protected content for assigned languages"
ON public.lesson_protected FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'
    ) AND EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.teacher_languages tl ON tl.language = l.language
        WHERE l.id = lesson_protected.lesson_id AND tl.teacher_id = auth.uid()
    )
);

CREATE POLICY "Founder full access on lesson_protected"
ON public.lesson_protected FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

-- Access Grants Policies
CREATE POLICY "Student read own access grants"
ON public.access_grants FOR SELECT
USING (
    student_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);

CREATE POLICY "Founder full access on access_grants"
ON public.access_grants FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);
