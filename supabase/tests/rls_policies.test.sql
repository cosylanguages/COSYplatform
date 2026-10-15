-- pgTAP RLS Security Test Suite for COSYplatform Protected Content Schema
-- File: supabase/tests/rls_policies.test.sql

BEGIN;

SELECT plan(15);

-- Setup test users & test data
-- Mock auth users in auth.users table or mock auth.uid() function

CREATE TEMP TABLE IF NOT EXISTS test_users (
    name TEXT PRIMARY KEY,
    id UUID NOT NULL
);

INSERT INTO test_users (name, id) VALUES
    ('founder_user', '11111111-1111-1111-1111-111111111111'),
    ('teacher_en_user', '22222222-2222-2222-2222-222222222222'),
    ('student_granted_user', '33333333-3333-3333-3333-333333333333'),
    ('student_ungranted_user', '44444444-4444-4444-4444-444444444444');

-- Seed Profiles
INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
    ('11111111-1111-1111-1111-111111111111', 'founder', '{"*"}', '*'),
    ('22222222-2222-2222-2222-222222222222', 'teacher', '{"en"}', '*'),
    ('33333333-3333-3333-3333-333333333333', 'student', '{"en"}', 'a1'),
    ('44444444-4444-4444-4444-444444444444', 'student', '{}', 'none');

-- Seed Teacher Languages
INSERT INTO public.teacher_languages (teacher_id, language) VALUES
    ('22222222-2222-2222-2222-222222222222', 'en');

-- Seed Courses
INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview) VALUES
    ('general-en-a1', 'en', 'a1', 'general', 'General English A1', 'Elementary course', 1, true),
    ('general-en-b1', 'en', 'b1', 'general', 'General English B1', 'Intermediate course', 1, true),
    ('general-fr-a1', 'fr', 'a1', 'general', 'General French A1', 'French elementary', 1, true);

-- Seed Access Grant (Student granted ONLY general-en-a1)
INSERT INTO public.access_grants (student_id, course_id) VALUES
    ('33333333-3333-3333-3333-333333333333', 'general-en-a1');

-- Seed Lessons
INSERT INTO public.lessons (id, language, cefr, kind, slug, title, summary) VALUES
    ('en:a1:nice-to-meet-you', 'en', 'a1', 'lesson', 'nice-to-meet-you', 'Nice to meet you!', 'Introductory greetings'),
    ('en:b1:b1-topic', 'en', 'b1', 'lesson', 'b1-topic', 'B1 Topic', 'Intermediate topic'),
    ('fr:a1:bonjour', 'fr', 'a1', 'lesson', 'bonjour', 'Bonjour!', 'French greetings');

-- Seed Course Lessons
INSERT INTO public.course_lessons (course_id, lesson_id, placement_id, unit, section_number, lesson_number, status) VALUES
    ('general-en-a1', 'en:a1:nice-to-meet-you', 'en:a1:general-en-a1:unit-1:nice-to-meet-you', 'Unit 1', 1, 1, 'published'),
    ('general-en-b1', 'en:b1:b1-topic', 'en:b1:general-en-b1:unit-1:b1-topic', 'Unit 1', 1, 1, 'published'),
    ('general-fr-a1', 'fr:a1:bonjour', 'fr:a1:general-fr-a1:unit-1:bonjour', 'Unit 1', 1, 1, 'published');

-- Seed Student Content
INSERT INTO public.lesson_student_content (lesson_id, body) VALUES
    ('en:a1:nice-to-meet-you', '<cosy-lesson><cosy-slide><p>Hello!</p></cosy-slide></cosy-lesson>'),
    ('en:b1:b1-topic', '<cosy-lesson><cosy-slide><p>B1 Content</p></cosy-slide></cosy-lesson>'),
    ('fr:a1:bonjour', '<cosy-lesson><cosy-slide><p>Bonjour</p></cosy-slide></cosy-lesson>');

-- Seed Protected Content
INSERT INTO public.lesson_protected (lesson_id, kind, content) VALUES
    ('en:a1:nice-to-meet-you', 'answer-key', '{"q1": "hello"}'),
    ('en:a1:nice-to-meet-you', 'teacher-notes', 'Guide teacher through exercise'),
    ('fr:a1:bonjour', 'answer-key', '{"q1": "bonjour"}');


-- TEST GROUP 1: Anonymous User
SET LOCAL ROLE anon;

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.course_preview',
    ARRAY[3],
    'TC-01 [PASS]: Anonymous can SELECT course_preview metadata'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_student_content',
    ARRAY[0],
    'TC-02 [PASS]: Anonymous CANNOT SELECT lesson_student_content (0 rows returned)'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_protected',
    ARRAY[0],
    'TC-03 [PASS]: Anonymous CANNOT SELECT lesson_protected (0 rows returned)'
);


-- TEST GROUP 2: Granted Student User
SET LOCAL auth.uid = '33333333-3333-3333-3333-333333333333';
SET LOCAL ROLE authenticated;

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_student_content WHERE lesson_id = ''en:a1:nice-to-meet-you''',
    ARRAY[1],
    'TC-04 [PASS]: Granted Student can SELECT lesson_student_content for granted course & level (A1)'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_protected WHERE lesson_id = ''en:a1:nice-to-meet-you''',
    ARRAY[0],
    'TC-05 [PASS]: Granted Student CANNOT SELECT lesson_protected (0 rows returned - answer key / teacher notes hidden)'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_student_content WHERE lesson_id = ''en:b1:b1-topic''',
    ARRAY[0],
    'TC-06 [PASS]: Granted Student CANNOT SELECT lesson_student_content for ungranted level (B1) (0 rows returned - level isolation enforced)'
);


-- TEST GROUP 3: Ungranted Student User
SET LOCAL auth.uid = '44444444-4444-4444-4444-444444444444';
SET LOCAL ROLE authenticated;

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_student_content',
    ARRAY[0],
    'TC-07 [PASS]: Ungranted Student CANNOT SELECT lesson_student_content (0 rows returned)'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_protected',
    ARRAY[0],
    'TC-08 [PASS]: Ungranted Student CANNOT SELECT lesson_protected (0 rows returned)'
);


-- TEST GROUP 4: Teacher Assigned to English ('en')
SET LOCAL auth.uid = '22222222-2222-2222-2222-222222222222';
SET LOCAL ROLE authenticated;

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_student_content WHERE lesson_id LIKE ''en:%''',
    ARRAY[2],
    'TC-09 [PASS]: Teacher can SELECT lesson_student_content for assigned language (en)'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_protected WHERE lesson_id LIKE ''en:%''',
    ARRAY[2],
    'TC-10 [PASS]: Teacher can SELECT lesson_protected (answer keys & teacher notes) for assigned language (en)'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_student_content WHERE lesson_id LIKE ''fr:%''',
    ARRAY[0],
    'TC-11 [PASS]: Teacher CANNOT SELECT lesson_student_content for unassigned language (fr)'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_protected WHERE lesson_id LIKE ''fr:%''',
    ARRAY[0],
    'TC-12 [PASS]: Teacher CANNOT SELECT lesson_protected for unassigned language (fr)'
);


-- TEST GROUP 5: Founder User
SET LOCAL auth.uid = '11111111-1111-1111-1111-111111111111';
SET LOCAL ROLE authenticated;

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_student_content',
    ARRAY[3],
    'TC-13 [PASS]: Founder has unrestricted SELECT on lesson_student_content across all languages and levels'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_protected',
    ARRAY[3],
    'TC-14 [PASS]: Founder has unrestricted SELECT on lesson_protected across all languages and levels'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.courses',
    ARRAY[3],
    'TC-15 [PASS]: Founder has unrestricted access to all course records'
);

SELECT * FROM finish();

ROLLBACK;
