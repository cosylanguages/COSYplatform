# Protected Content Contract Specification

**Repository:** COSYplatform (Upstream Owner of Curriculum)
**Status:** Canonical Design Contract (Updated Architecture)
**Audience:** COSY Ecosystem (COSYplatform, COSYmanuals, COSYtools, COSYgames, COSYevents)

---

## Executive Summary & Guiding Principles

This contract establishes the security, data model, and access control architecture ensuring that **no paid or protected content is readable from static hosting or unauthorized client requests**. All lesson bodies, answer keys, teacher notes, workbooks, manuals, and session scripts are hosted in Supabase database tables and private Storage buckets guarded by Row Level Security (RLS). Public pages serve only lightweight, unprivileged shells and fetch non-sensitive preview metadata.

### Architectural Rules
1. **Upstream Ownership:** `COSYplatform` is the upstream canonical owner of all course roadmaps, lessons, and curriculum taxonomy. `COSYmanuals` and other ecosystem tools derive content from `COSYplatform`.
2. **Deduplication:** A unique lesson metadata record is stored exactly **ONCE** in the database (`lessons` table). If a lesson appears in multiple courses or tracks, it is linked via junction table `course_lessons`.
3. **Decoupled Content & Strict Separation (Leak Fix):**
   - **Metadata (`lessons`):** Holds non-sensitive lesson titles, summaries, language, and CEFR level.
   - **Sanitized Student Body (`lesson_student_content`):** Stores student-facing slide layout without embedded teacher notes or answer keys.
   - **Protected Content (`lesson_protected`):** Stores answer keys, teacher notes, paid session scripts, and manuals. **NEVER** accessible by students or anonymous users.
4. **Role Segregation:**
   - **Founder:** Full access across all tables, buckets, languages, and content kinds.
   - **Teacher:** Read access to student content and protected content (`lesson_protected`) for languages assigned in `teacher_languages`.
   - **Student:** Read access **ONLY** to sanitized student bodies (`lesson_student_content`) for courses explicitly granted via `access_grants` with strict CEFR level isolation (`c.cefr = l.cefr`). Answer keys and teacher notes in `lesson_protected` are **NEVER** readable by students.
   - **Anonymous / Public:** Read access **ONLY** to `course_preview` view (title, level, language, course, summary) and public metadata.

---

## 1. Database Schema & Tables

### 1.1 `profiles`
User profiles with assigned roles.

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'founder')),
    language_access TEXT[] DEFAULT '{}',
    course_level TEXT DEFAULT '*',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 `teacher_languages`
Maps teachers to languages they are authorized to teach.

```sql
CREATE TABLE IF NOT EXISTS public.teacher_languages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (teacher_id, language)
);
```

### 1.3 `courses`
Represents a structured course or curriculum track.

```sql
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,                 -- e.g. 'general-en-a1', 'spoken-en-b1'
    language TEXT NOT NULL,              -- ISO 639-1 code: 'en', 'fr', 'ru', 'es', 'el', etc.
    cefr TEXT NOT NULL,                  -- 'a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'
    course_type TEXT NOT NULL,           -- 'general', 'spoken', 'professional', 'travelling', 'relocation', 'exam', 'cinema', 'karaoke', 'discussion', 'pronunciation'
    title TEXT NOT NULL,                 -- e.g. 'General English A1 Elementary Roadmap'
    description TEXT,                    -- Short summary for public catalog preview
    total_lessons INT DEFAULT 0,
    is_public_preview BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.4 `access_grants`
Links students to authorized courses.

```sql
CREATE TABLE IF NOT EXISTS public.access_grants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);
```

### 1.5 `lessons` (Metadata Only)
Stores unique lesson metadata records across the ecosystem.

```sql
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,                 -- Canonical lesson ID: '<lang>:<cefr>:<slug>' (e.g., 'en:a1:nice-to-meet-you')
    language TEXT NOT NULL,              -- ISO 639-1 code
    cefr TEXT NOT NULL,                  -- 'a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'
    kind TEXT NOT NULL,                  -- 'lesson', 'roadmap-detail', 'answer-key', 'teacher-notes', 'workbook', 'manual', 'session-body'
    slug TEXT NOT NULL,                  -- e.g. 'nice-to-meet-you'
    title TEXT NOT NULL,
    summary TEXT,                        -- Public preview excerpt
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT lessons_kind_check CHECK (kind IN (
        'lesson', 'roadmap-detail', 'answer-key', 'teacher-notes', 'workbook', 'manual', 'session-body'
    ))
);
```

### 1.6 `lesson_student_content` (Sanitized Student Body)
Stores sanitized lesson bodies readable by authorized students.

```sql
CREATE TABLE IF NOT EXISTS public.lesson_student_content (
    lesson_id TEXT PRIMARY KEY REFERENCES public.lessons(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.7 `lesson_protected` (Answer Keys & Teacher Notes)
Stores answer keys, teacher notes, and paid session bodies. **STRICTLY PROHIBITED FROM STUDENTS.**

```sql
CREATE TABLE IF NOT EXISTS public.lesson_protected (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('answer-key', 'teacher-notes', 'session-body', 'manual')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.8 `course_lessons`
Junction table linking shared unique lessons to specific courses and sequence positions.

```sql
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    placement_id TEXT NOT NULL,          -- Stable placement ID: '<lang>:<cefr>:<course>:<unit>:<slug>'
    unit TEXT,                           -- e.g. 'Unit 1. Nice to meet you!'
    section_number INT DEFAULT 0,
    lesson_number INT NOT NULL,
    is_optional BOOLEAN DEFAULT false,
    is_milestone BOOLEAN DEFAULT false,
    is_exam BOOLEAN DEFAULT false,
    teacher_led BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'drafted',        -- 'planned', 'drafted', 'published'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (course_id, lesson_number),
    UNIQUE (course_id, placement_id)
);
```

---

## 2. Stable ID Schemes

Two stable ID formats support cross-repository referencing without tight coupling:

1. **Shared Lesson ID (`lessons.id`):** `<lang>:<cefr>:<slug>`
   - *Example:* `en:a1:nice-to-meet-you`
   - Uniquely identifies the single lesson record in `lessons`.

2. **Course Placement ID (`course_lessons.placement_id`):** `<lang>:<cefr>:<course>:<unit>:<slug>`
   - *Example:* `en:a1:general-en-a1:unit-1:nice-to-meet-you`
   - Uniquely identifies where a lesson sits inside a specific course roadmap sequence.

---

## 3. Public Preview View (`course_preview`)

Anonymous visitors and public catalog pages read only `course_preview`. This view excludes any bodies, answer keys, or teacher notes.

```sql
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
```

---

## 4. Row Level Security (RLS) Policies

### 4.1 `lesson_student_content` RLS
```sql
ALTER TABLE public.lesson_student_content ENABLE ROW LEVEL SECURITY;

-- Student access (granted course AND level match)
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

-- Teacher access (assigned language)
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

-- Founder full access
CREATE POLICY "Founder full access on lesson_student_content"
ON public.lesson_student_content FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);
```

### 4.2 `lesson_protected` RLS
```sql
ALTER TABLE public.lesson_protected ENABLE ROW LEVEL SECURITY;

-- NO POLICY FOR STUDENTS OR ANON! (STRICTLY DENIED)

-- Teacher access (assigned language)
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

-- Founder full access
CREATE POLICY "Founder full access on lesson_protected"
ON public.lesson_protected FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'founder'
    )
);
```

---

## 5. RLS Test Matrix (Validation Suite)

| Test ID | Role | Target Operation | Target Table / View | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Anonymous | `SELECT *` | `course_preview` | **PASS:** Returns titles, lesson metadata, summaries. |
| **TC-02** | Anonymous | `SELECT *` | `lesson_student_content` | **FAIL (0 rows):** Access denied by RLS. |
| **TC-03** | Anonymous | `SELECT *` | `lesson_protected` | **FAIL (0 rows):** Access denied by RLS. |
| **TC-04** | Student (Granted A1) | `SELECT body` | `lesson_student_content (A1)` | **PASS:** Returns sanitized body for granted course & level. |
| **TC-05** | Student (Granted A1) | `SELECT *` | `lesson_protected` | **FAIL (0 rows):** Strictly hidden from students. |
| **TC-06** | Student (Granted A1) | `SELECT body` | `lesson_student_content (B1)` | **FAIL (0 rows):** Level isolation enforced (`c.cefr = l.cefr`). |
| **TC-07** | Student (Ungranted) | `SELECT body` | `lesson_student_content` | **FAIL (0 rows):** Access denied by RLS. |
| **TC-08** | Student (Ungranted) | `SELECT *` | `lesson_protected` | **FAIL (0 rows):** Access denied by RLS. |
| **TC-09** | Teacher ('en') | `SELECT body` | `lesson_student_content ('en')` | **PASS:** Returns student body for assigned language. |
| **TC-10** | Teacher ('en') | `SELECT content` | `lesson_protected ('en')` | **PASS:** Returns answer keys and teacher notes for assigned language. |
| **TC-11** | Teacher ('en') | `SELECT body` | `lesson_student_content ('fr')` | **FAIL (0 rows):** Unassigned language restricted by RLS. |
| **TC-12** | Teacher ('en') | `SELECT content` | `lesson_protected ('fr')` | **FAIL (0 rows):** Unassigned language restricted by RLS. |
| **TC-13** | Founder | `SELECT *` | `lesson_student_content` | **PASS:** Unrestricted access across all languages/levels. |
| **TC-14** | Founder | `SELECT *` | `lesson_protected` | **PASS:** Unrestricted access across all languages/levels. |
| **TC-15** | Founder | `SELECT / INSERT` | `courses` | **PASS:** Unrestricted management access. |

---

## 6. Pilot: `general-en-a1` Ingestion & Public Preview

The pilot course `general-en-a1` is seeded via `scripts/seed_pilot.js`.
- Public repository file `roadmaps/general-en-a1.json` stores sequence metadata, titles, and levels only.
- Lesson bodies, sanitized student views, and protected answer keys/teacher notes are read from git-ignored local content folders and seeded directly into Supabase tables (`courses`, `lessons`, `course_lessons`, `lesson_student_content`, `lesson_protected`).

---

## 7. Ingestion Plan for 54 Roadmaps & Science Lessons (PR #13)

### 7.1 Batch Ingestion Pipeline (`scripts/ingest_roadmaps.js`)
1. **Parser Execution:** `scripts/ingest_roadmaps.js` reads each file in `roadmaps/*.json` (supporting `--dry-run`).
2. **Course & Lesson Extraction:** Extracts metadata for `courses`, deduplicates unique lessons across roadmaps (`lessons.id`), and generates stable placement IDs (`course_lessons.placement_id`).
3. **Content Separation:** Sanitizes student bodies into `lesson_student_content` and protected notes/answers into `lesson_protected`.

### 7.2 Ingestion Plan for PR #13 Science Lessons
- **Constraint:** PR #13 must **not** be merged, touched, or edited by automated agents.
- **Procedure:**
  1. Once PR #13 is reviewed and merged by the repository owner in due course, run `scripts/ingest_roadmaps.js` over the newly added XML/JSON files.
  2. The parser will extract `<cosy-teacher-notes>` tags and answer keys into protected `lesson_protected` table records.
  3. The public preview view will immediately expose only lesson titles and summaries, maintaining 100% protection of answer keys and paid session materials.
