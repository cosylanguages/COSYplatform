-- pgTAP: listing unused lesson media (public.list_orphan_lesson_media).
-- File: supabase/tests/lesson_media_orphans.test.sql
BEGIN;

SELECT plan(7);

CREATE SCHEMA IF NOT EXISTS tests;
CREATE OR REPLACE FUNCTION tests.studio_authenticate_as(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claim.sub', p_user_id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_user_id, 'role', 'authenticated')::text, true);
END;
$$;
GRANT USAGE ON SCHEMA tests TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tests TO authenticated;

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
('aaaaaaaa-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'orph-founder@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'orph-student@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'orph-teacher@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000d4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'orph-teacher-fr@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000d1', 'founder', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000d2', 'student', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000d3', 'teacher', '{"en"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000d4', 'teacher', '{"fr"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;

INSERT INTO public.teacher_languages (user_id, language) VALUES ('aaaaaaaa-0000-0000-0000-0000000000d3', 'en'), ('aaaaaaaa-0000-0000-0000-0000000000d4', 'fr') ON CONFLICT DO NOTHING;

INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-orph-en-a2', 'en', 'a2', 'general', 'Orphan course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;


-- 01 published, 02 in a saved draft only, 03 too new, 04 unused, 05 unused
INSERT INTO storage.objects (bucket_id, name, created_at, metadata) VALUES
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000d1/00000000-0000-4000-8000-000000000001.png', now() - interval '30 days', '{"size": 1000}'),
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000d1/00000000-0000-4000-8000-000000000002.png', now() - interval '30 days', '{"size": 2000}'),
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000d1/00000000-0000-4000-8000-000000000003.png', now() - interval '2 days', '{"size": 3000}'),
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000d1/00000000-0000-4000-8000-000000000004.png', now() - interval '30 days', '{"size": 4000}'),
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000d1/00000000-0000-4000-8000-000000000005.png', now() - interval '40 days', '{"size": 5000}');

INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('orph-pub', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'Pub', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Pub","language":"English","level":"A2","blocks":[
 {"id":"i1","type":"image","path":"aaaaaaaa-0000-0000-0000-0000000000d1/00000000-0000-4000-8000-000000000001.png","alt":"A bus"}]}$json$::jsonb),
('orph-draft', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'Draft only', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Draft only","language":"English","level":"A2","blocks":[
 {"id":"i1","type":"image","path":"aaaaaaaa-0000-0000-0000-0000000000d1/00000000-0000-4000-8000-000000000002.png","alt":"A tram"}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000d1');
SELECT public.publish_lesson_studio_draft('orph-pub', 'studio-orph-en-a2', 1);

SELECT is(
  (SELECT array_agg(right(name, 6) ORDER BY name) FROM public.list_orphan_lesson_media()),
  ARRAY['04.png', '05.png'],
  'ORPH-1: only old files that no lesson and no draft uses are listed'
);
SELECT is((SELECT sum(size_bytes)::int FROM public.list_orphan_lesson_media()), 9000, 'ORPH-2: sizes are reported');
SELECT is((SELECT count(*)::int FROM public.list_orphan_lesson_media(1)), 3, 'ORPH-3: a shorter minimum age includes newer unused files');
SELECT throws_ok($$SELECT * FROM public.list_orphan_lesson_media(0)$$, '22023', 'Minimum age must be at least 1 day.', 'ORPH-4: the minimum age cannot be 0');
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000d3');
SELECT throws_ok($$SELECT * FROM public.list_orphan_lesson_media()$$, '42501', 'Only founders can list unused media.', 'ORPH-5: a teacher is refused');
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000d2');
SELECT throws_ok($$SELECT * FROM public.list_orphan_lesson_media()$$, '42501', 'Only founders can list unused media.', 'ORPH-6: a student is refused');
RESET role;

SET LOCAL role = anon;
SELECT throws_ok($$SELECT * FROM public.list_orphan_lesson_media()$$, '42501', NULL, 'ORPH-7: anonymous callers cannot run it');
RESET role;

SELECT * FROM finish();
ROLLBACK;
