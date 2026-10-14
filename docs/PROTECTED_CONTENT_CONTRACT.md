# Protected Content Contract Specification

**Repository:** COSYplatform (Upstream Owner of Curriculum)
**Status:** Canonical Design Contract
**Audience:** COSY Ecosystem (COSYplatform, COSYmanuals, COSYtools, COSYgames, COSYevents)

---

## Executive Summary & Guiding Principles

This contract establishes the security, data model, and access control architecture ensuring that **no paid or protected content is readable from static hosting**. All lesson bodies, answer keys, teacher notes, workbooks, manuals, and session scripts are hosted in Supabase database tables and private Storage buckets guarded by Row Level Security (RLS). Public pages serve only lightweight, unprivileged shells and fetch non-sensitive preview metadata.

### Architectural Rules
1. **Upstream Ownership:** `COSYplatform` is the upstream canonical owner of all course roadmaps, lessons, and curriculum taxonomy. `COSYmanuals` and other ecosystem tools derive content from `COSYplatform`.
2. **Deduplication:** A unique lesson is stored exactly **ONCE** in the database (`lessons` table). If a lesson appears in multiple courses or tracks, it is linked via junction table `course_lessons`.
3. **Role Segregation:**
   - **Founder:** Full access across all tables, buckets, languages, and content kinds.
   - **Teacher:** Read access to full lesson bodies, answer keys, and teacher notes for languages assigned in `teacher_languages`.
   - **Student:** Read access **ONLY** to sanitized student bodies (`student_lesson_content` / `lessons` kind `lesson` or `workbook`) for courses explicitly granted via `access_grants`. Answer keys, teacher notes, and paid session bodies are **NEVER** readable by students or anonymous users.
   - **Anonymous / Public:** Read access **ONLY** to `course_preview` view (title, level, language, course, summary) and public metadata.

---

## 1. Database Schema & Tables

### 1.1 `courses`
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

### 1.2 `lessons`
Stores unique lesson records once across the entire ecosystem.

```sql
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,                 -- Canonical lesson ID: '<lang>:<cefr>:<slug>' (e.g., 'en:a1:nice-to-meet-you')
    language TEXT NOT NULL,              -- ISO 639-1 code
    cefr TEXT NOT NULL,                  -- 'a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'
    kind TEXT NOT NULL,                  -- 'lesson', 'roadmap-detail', 'answer-key', 'teacher-notes', 'workbook', 'manual', 'session-body'
    slug TEXT NOT NULL,                  -- e.g. 'nice-to-meet-you'
    title TEXT NOT NULL,
    summary TEXT,                        -- Public preview excerpt
    body TEXT,                           -- Full XML/JSON content (Protected)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT lessons_kind_check CHECK (kind IN (
        'lesson', 'roadmap-detail', 'answer-key', 'teacher-notes', 'workbook', 'manual', 'session-body'
    ))
);
```

### 1.3 `course_lessons`
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

To support canonical cross-repository referencing without tight coupling or path brittleness, two stable ID formats are defined:

1. **Shared Lesson ID (`lessons.id`):** `<lang>:<cefr>:<slug>`
   - *Example:* `en:a1:nice-to-meet-you`
   - Represents the single, deduplicated lesson entity in `lessons`.

2. **Course Placement ID (`course_lessons.placement_id`):** `<lang>:<cefr>:<course>:<unit>:<slug>`
   - *Example:* `en:a1:general-en-a1:unit-1:nice-to-meet-you`
   - Uniquely identifies where a lesson sits inside a specific course roadmap sequence.

---

## 3. Public Preview View (`course_preview`)

Anonymous visitors and public pages read only `course_preview`. This view excludes `lessons.body`, `answer-key`, and `teacher-notes`.

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

### 4.1 `courses` RLS
```sql
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Public preview policy
CREATE POLICY "Public preview courses readable by all"
ON public.courses FOR SELECT
USING (is_public_preview = true);

-- Founder management policy
CREATE POLICY "Founder full access on courses"
ON public.courses FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'founder'
    )
);
```

### 4.2 `lessons` RLS
```sql
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Founder full access
CREATE POLICY "Founder full access on lessons"
ON public.lessons FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'founder'
    )
);

-- Teacher access (for assigned languages)
CREATE POLICY "Teacher read access for assigned languages"
ON public.lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'
    ) AND (
        EXISTS (
            SELECT 1 FROM public.teacher_languages tl
            WHERE tl.teacher_id = auth.uid() AND tl.language = lessons.language
        )
    )
);

-- Student access (granted courses, excludes answer keys & teacher notes)
CREATE POLICY "Student read access for granted courses"
ON public.lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'student'
    ) AND (
        lessons.kind IN ('lesson', 'workbook')
    ) AND EXISTS (
        SELECT 1 FROM public.access_grants ag
        JOIN public.course_lessons cl ON ag.course_id = cl.course_id
        WHERE ag.student_id = auth.uid()
          AND cl.lesson_id = lessons.id
          AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    )
);
```

---

## 5. Table Mapping & Merges

| Existing / Legacy Table | Proposed Mapping / Strategy |
| :--- | :--- |
| `lesson_content` / `student_lesson_content` | Migrated into `public.lessons` with `kind = 'lesson'` or `kind = 'manual'`. `student_lesson_content` view is generated dynamically stripping `<cosy-teacher-notes>` and answer keys. |
| `lesson_answers` | Retained as user activity state (`student_id`, `lesson_id`, `field_key`, `answer`). RLS restricts access to `student_id = auth.uid()` or assigned teacher via `teacher_students`. |
| `lesson_submissions` | Retained for student essay/audio uploads. RLS restricts write to student, read to student and assigned teacher/founder. |
| `teacher_students` | Retained as explicit linking table between teachers and students. Also used by `teacher_languages` for language-scoped assignment. |
| `manual_content` (COSYmanuals) | Integrated into `lessons` table with `kind = 'manual'`. |
| `session_content` (COSYevents) | Integrated into `lessons` table with `kind = 'session-body'`. |
| `access_grants` | Retained as central entitlement table (`student_id`, `course_id`, `expires_at`). |
| `session_grants` | Merged into `access_grants` or mapped as `course_id = 'session:<session_id>'`. |

---

## 6. Pilot: `general-en-a1` Roadmap & Lessons Integration

### 6.1 `courses` Entry
```sql
INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES (
    'general-en-a1',
    'en',
    'a1',
    'general',
    'General English A1 Elementary Roadmap',
    'Elementary English course focusing on foundational grammar, vocabulary, and everyday communication.',
    63,
    true
) ON CONFLICT (id) DO UPDATE SET total_lessons = 63;
```

### 6.2 Sample Shared `lessons` Entries
```sql
INSERT INTO public.lessons (id, language, cefr, kind, slug, title, summary, body)
VALUES
('en:a1:nice-to-meet-you', 'en', 'a1', 'lesson', 'nice-to-meet-you', 'Nice to meet you!', 'Introduction to greetings, personal pronouns, and basic self-introductions.', '<cosy-lesson title="Nice to meet you!"><cosy-slide id="s1" title="Greetings"><p>Hello! What is your name?</p></cosy-slide></cosy-lesson>'),
('en:a1:more-about-me', 'en', 'a1', 'lesson', 'more-about-me', 'More about me', 'Talking about age, nationality, and hometown.', '<cosy-lesson title="More about me"><cosy-slide id="s1" title="Background"><p>Where are you from?</p></cosy-slide></cosy-lesson>'),
('en:a1:family-exchange', 'en', 'a1', 'lesson', 'family-exchange', 'Family exchange', 'Vocabulary for family members and possessive nouns.', '<cosy-lesson title="Family exchange"><cosy-slide id="s1" title="Family"><p>Who is in your family?</p></cosy-slide></cosy-lesson>')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary;
```

### 6.3 `course_lessons` Linkage
```sql
INSERT INTO public.course_lessons (course_id, lesson_id, placement_id, unit, section_number, lesson_number, status)
VALUES
('general-en-a1', 'en:a1:nice-to-meet-you', 'en:a1:general-en-a1:unit-1:nice-to-meet-you', 'Unit 1. Nice to meet you!', 1, 5, 'drafted'),
('general-en-a1', 'en:a1:more-about-me', 'en:a1:general-en-a1:unit-1:more-about-me', 'Unit 1. Nice to meet you!', 1, 6, 'drafted'),
('general-en-a1', 'en:a1:family-exchange', 'en:a1:general-en-a1:unit-1:family-exchange', 'Unit 1. Nice to meet you!', 1, 7, 'drafted')
ON CONFLICT (course_id, lesson_number) DO NOTHING;
```

---

## 7. Ingestion Plan for 54 Roadmaps & Science Lessons (PR #13)

### 7.1 Batch Ingestion Pipeline for 54 `roadmaps/*.json`
1. **Parser Execution:** Write an automated script (`scripts/ingest_roadmaps.py`) that reads each file in `roadmaps/*.json`.
2. **Course Extraction:** Extract `curriculumId` / filename as `course_id`, determine `language` and `cefr` from ID suffix (e.g. `spoken-en-b1` -> `lang=en`, `cefr=b1`, `type=spoken`).
3. **Lesson Deduplication & Insertion:**
   - For each sequence item, check if `lessonFile` exists.
   - Construct canonical `lessons.id` (`<lang>:<cefr>:<slug>`).
   - Upsert row into `lessons` table with `kind='lesson'`.
   - Insert row into `course_lessons` linking `course_id` to `lesson_id` with `placement_id`.
4. **Sanitization Filter:** Run XML/JSON parser during body ingestion to automatically split teacher notes (`<cosy-teacher-notes>`) and answer keys (`<cosy-input-item>`, `correct="true"`) into `kind='teacher-notes'` and `kind='answer-key'` child records if decoupled storage is required.

### 7.2 Ingestion Plan for Open PR #13 Science Lessons
- **Constraint:** PR #13 must **not** be merged, edited, or closed.
- **Procedure:**
  1. Once PR #13 is reviewed and merged by the repository owner in due course, run `scripts/ingest_roadmaps.py` over the newly added XML files.
  2. The parser will extract `<cosy-teacher-notes>` tags and answer keys into protected `teacher-notes` and `answer-key` tables/kinds.
  3. The public preview view will immediately expose only the lesson title and summary, maintaining 100% protection of answer keys and paid session materials.

---

## 8. Duplicate Lesson Identification Across Roadmaps

Analysis of the 54 roadmap files identified shared lessons across different tracks and levels that must be stored as single records in `lessons`:

### 8.1 Spoken & Cinema Identical XML Files
- `lessons/spoken-en/index.xml`: Shared across `spoken-en-a2.json`, `spoken-en-b1.json`, and `spoken-en-b2.json` (used as challenge template).
- `lessons/spoken-en/4-day-work-week.xml`: Shared between `spoken-en-b1.json` and `discussion-en-b1.json`.

### 8.2 Grammar Topics Shared Across A0 and A1
- **To Be (Negative Forms):** `grammar-en-a0.json` (`ge-a0-to-be-negative-forms`) & `grammar-en-a1.json` (`ge-a1-to-be-negative-forms`). -> Canonical ID: `en:a0-a1:to-be-negative-forms`
- **To Be (Past Forms):** `grammar-en-a0` & `grammar-en-a1`.
- **There is / There are:** `grammar-en-a0` & `grammar-en-a1`.
- **Some / Any / No:** `grammar-en-a0` & `grammar-en-a1`.
- **Superlative Degree:** `grammar-en-a0` & `grammar-en-a1`.
- **Word Order:** `grammar-en-a0` & `grammar-en-a1`.

### 8.3 Multi-Level Spoken / Cinema Lessons (Tiered Adapters)
The following topics have Intermediate, Upper-Intermediate, or Proficiency variants that share base vocabulary/media but differ by CEFR level:
- *Roman Holiday* (`spoken-en/roman-holiday-intermediate.xml` & `spoken-en/roman-holiday-upper-intermediate.xml`)
- *The Devil Wears Prada* (`the-devil-wears-prada-intermediate.xml` & `the-devil-wears-prada-upper-intermediate.xml`)
- *Step-Mom* (`stepmom-intermediate.xml` & `stepmom-upper-intermediate.xml`)
- *The Guilt of Moving Abroad* (`guilt-moving-abroad-intermediate.xml` & `guilt-moving-abroad-proficiency.xml`)

---

## 9. RLS Test Cases (Validation Suite)

To verify the security of the contract, the following positive and negative test cases must pass:

| Test ID | Role | Target Operation | Target Table / View | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Anonymous | `SELECT *` | `course_preview` | **PASS:** Returns course titles, lesson titles, summaries. No bodies/keys. |
| **TC-02** | Anonymous | `SELECT body` | `lessons` | **FAIL (0 rows):** Access denied by RLS. |
| **TC-03** | Student | `SELECT body` | `lessons (kind='lesson')` | **PASS:** Returns body for granted courses. |
| **TC-04** | Student | `SELECT body` | `lessons (kind='teacher-notes')` | **FAIL (0 rows):** Access denied by RLS filter `kind IN ('lesson', 'workbook')`. |
| **TC-05** | Teacher | `SELECT body` | `lessons (kind='teacher-notes')` | **PASS:** Returns notes if teacher has matching entry in `teacher_languages`. |
| **TC-06** | Teacher | `SELECT body` | `lessons (unassigned lang)` | **FAIL (0 rows):** Restricted by `teacher_languages` check. |
| **TC-07** | Founder | `SELECT / INSERT / UPDATE` | All tables | **PASS:** Unrestricted access across all content. |
