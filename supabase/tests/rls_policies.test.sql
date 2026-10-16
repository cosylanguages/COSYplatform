-- pgTAP RLS Security Test Suite for COSYplatform Protected Content Schema
-- File: supabase/tests/rls_policies.test.sql

BEGIN;

SELECT plan(20);

-- Setup test helper schema for auth mocking
CREATE SCHEMA IF NOT EXISTS tests;

CREATE OR REPLACE FUNCTION tests.authenticate_as(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', p_user_id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_user_id, 'role', 'authenticated')::text, true);
END;
$$;

CREATE OR REPLACE FUNCTION tests.clear_authentication()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claims', '', true);
END;
$$;

-- The helpers are invoked again after clear_authentication() switches to anon,
-- and authenticate_as() itself switches to authenticated for later assertions.
-- Grant only the test helper schema/functions; this file runs in the disposable
-- Supabase test database, not as a production migration.
GRANT USAGE ON SCHEMA tests TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tests TO anon, authenticated;

-- Setup test users & test data
CREATE TEMP TABLE IF NOT EXISTS test_users (
    name TEXT PRIMARY KEY,
    id UUID NOT NULL
);

INSERT INTO test_users (name, id) VALUES
    ('founder_user', '11111111-1111-1111-1111-111111111111'),
    ('teacher_en_user', '22222222-2222-2222-2222-222222222222'),
    ('student_granted_user', '33333333-3333-3333-3333-333333333333'),
    ('student_ungranted_user', '44444444-4444-4444-4444-444444444444');

-- Seed auth.users records to satisfy profiles foreign key
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'founder@cosy.platform', '', NOW(), NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teacher@cosy.platform', '', NOW(), NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student_a1@cosy.platform', '', NOW(), NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student_none@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Profiles
INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
    ('11111111-1111-1111-1111-111111111111', 'founder', '{"*"}', '*'),
    ('22222222-2222-2222-2222-222222222222', 'teacher', '{"en"}', '*'),
    ('33333333-3333-3333-3333-333333333333', 'student', '{"en"}', 'a1'),
    ('44444444-4444-4444-4444-444444444444', 'student', '{}', 'none')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;

-- Seed Teacher Languages
INSERT INTO public.teacher_languages (user_id, language) VALUES
    ('22222222-2222-2222-2222-222222222222', 'en')
ON CONFLICT DO NOTHING;

-- Seed Courses
INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview) VALUES
    ('general-en-a1', 'en', 'a1', 'general', 'General English A1', 'Elementary course', 1, true),
    ('general-en-b1', 'en', 'b1', 'general', 'General English B1', 'Intermediate course', 1, true),
    ('general-fr-a1', 'fr', 'a1', 'general', 'General French A1', 'French elementary', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Access Grant (Student granted ONLY general-en-a1)
INSERT INTO public.access_grants (user_id, course_id) VALUES
    ('33333333-3333-3333-3333-333333333333', 'general-en-a1')
ON CONFLICT DO NOTHING;

-- Seed Lessons
INSERT INTO public.lessons (id, language, cefr, kind, slug, title, summary) VALUES
    ('en:a1:nice-to-meet-you', 'en', 'a1', 'lesson', 'nice-to-meet-you', 'Nice to meet you!', 'Introductory greetings'),
    ('en:b1:b1-topic', 'en', 'b1', 'lesson', 'b1-topic', 'B1 Topic', 'Intermediate topic'),
    ('fr:a1:bonjour', 'fr', 'a1', 'lesson', 'bonjour', 'Bonjour!', 'French greetings')
ON CONFLICT (id) DO NOTHING;

-- Seed Course Lessons
INSERT INTO public.course_lessons (course_id, lesson_id, placement_id, unit, section_number, lesson_number, status) VALUES
    ('general-en-a1', 'en:a1:nice-to-meet-you', 'en:a1:general-en-a1:unit-1:nice-to-meet-you', 'Unit 1', 1, 1, 'published'),
    ('general-en-b1', 'en:b1:b1-topic', 'en:b1:general-en-b1:unit-1:b1-topic', 'Unit 1', 1, 1, 'published'),
    ('general-fr-a1', 'fr:a1:bonjour', 'fr:a1:general-fr-a1:unit-1:bonjour', 'Unit 1', 1, 1, 'published')
ON CONFLICT DO NOTHING;

-- Seed Student Content
INSERT INTO public.lesson_student_content (lesson_id, body) VALUES
    ('en:a1:nice-to-meet-you', '<cosy-lesson><cosy-slide><p>Hello!</p></cosy-slide></cosy-lesson>'),
    ('en:b1:b1-topic', '<cosy-lesson><cosy-slide><p>B1 Content</p></cosy-slide></cosy-lesson>'),
    ('fr:a1:bonjour', '<cosy-lesson><cosy-slide><p>Bonjour</p></cosy-slide></cosy-lesson>')
ON CONFLICT (lesson_id) DO NOTHING;

-- Seed Protected Content
INSERT INTO public.lesson_protected (lesson_id, kind, content) VALUES
    ('en:a1:nice-to-meet-you', 'answer-key', '{"q1": "hello"}'),
    ('en:a1:nice-to-meet-you', 'teacher-notes', 'Guide teacher through exercise'),
    ('fr:a1:bonjour', 'answer-key', '{"q1": "bonjour"}');


-- Seed student answers for RLS isolation checks.
INSERT INTO public.lesson_answers (student_id, lesson_id, field_key, value, is_correct) VALUES
  ('33333333-3333-3333-3333-333333333333', 'en:a1:nice-to-meet-you', 'q1', 'hello', true),
  ('44444444-4444-4444-4444-444444444444', 'en:a1:nice-to-meet-you', 'q1', 'bonjour', false)
ON CONFLICT (student_id, lesson_id, field_key) DO UPDATE
SET value = EXCLUDED.value, is_correct = EXCLUDED.is_correct;

-- TEST GROUP 1: Anonymous User
SELECT tests.clear_authentication();

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

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_answers',
    ARRAY[0],
    'TC-16 [PASS]: Anonymous cannot read student answers'
);


-- Return to the test runner's session role before switching from anon to authenticated.
RESET ROLE;

-- TEST GROUP 2: Granted Student User
SELECT tests.authenticate_as('33333333-3333-3333-3333-333333333333'::UUID);

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
    'SELECT COUNT(*)::INTEGER FROM public.lesson_answers WHERE student_id = auth.uid()',
    ARRAY[1],
    'TC-17 [PASS]: Student can read their own saved answers'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_answers WHERE student_id = ''44444444-4444-4444-4444-444444444444''',
    ARRAY[0],
    'TC-18 [PASS]: Student cannot read another student''s saved answers'
);

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_student_content WHERE lesson_id = ''en:b1:b1-topic''',
    ARRAY[0],
    'TC-06 [PASS]: Granted Student CANNOT SELECT lesson_student_content for ungranted level (B1) (0 rows returned - level isolation enforced)'
);


-- TEST GROUP 3: Ungranted Student User
SELECT tests.authenticate_as('44444444-4444-4444-4444-444444444444'::UUID);

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
SELECT tests.authenticate_as('22222222-2222-2222-2222-222222222222'::UUID);

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

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_answers',
    ARRAY[0],
    'TC-19 [PASS]: Teacher cannot directly read private student answer rows'
);


-- TEST GROUP 5: Founder User
SELECT tests.authenticate_as('11111111-1111-1111-1111-111111111111'::UUID);

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

SELECT results_eq(
    'SELECT COUNT(*)::INTEGER FROM public.lesson_answers',
    ARRAY[0],
    'TC-20 [PASS]: Founder role does not bypass private student answer isolation'
);

SELECT * FROM finish();

ROLLBACK;
