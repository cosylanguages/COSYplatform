-- pgTAP: teacher notes and the teacher view of a published Lesson Studio lesson.
-- File: supabase/tests/studio_teacher_notes.test.sql
BEGIN;

SELECT plan(14);

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
('aaaaaaaa-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'notes-founder@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'notes-student@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'notes-teacher@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'notes-teacher-fr@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000b1', 'founder', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000b2', 'student', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000b3', 'teacher', '{"en"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000b4', 'teacher', '{"fr"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;

INSERT INTO public.teacher_languages (user_id, language) VALUES ('aaaaaaaa-0000-0000-0000-0000000000b3', 'en'), ('aaaaaaaa-0000-0000-0000-0000000000b4', 'fr') ON CONFLICT DO NOTHING;

INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-notes-en-a2', 'en', 'a2', 'general', 'Notes course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('notes-ok', 'aaaaaaaa-0000-0000-0000-0000000000b1', 'Notes', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Notes","language":"English","level":"A2","blocks":[
 {"id":"n0","type":"teacher_note","text":"  Warm up for 5 minutes  "},
 {"id":"h","type":"heading","text":"Ordering"},
 {"id":"n1","type":"teacher_note","text":"Elicit: What would you like?"},
 {"id":"f1","type":"fill_blank","prompt":"___ a coffee","answers":["I'd like"]},
 {"id":"n2","type":"teacher_note","text":"Closing note"}]}$json$::jsonb),
('notes-only', 'aaaaaaaa-0000-0000-0000-0000000000b1', 'Notes', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Notes","language":"English","level":"A2","blocks":[{"id":"n","type":"teacher_note","text":"x"}]}$json$::jsonb),
('notes-blank', 'aaaaaaaa-0000-0000-0000-0000000000b1', 'Notes', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Notes","language":"English","level":"A2","blocks":[{"id":"t","type":"text","content":"a"},{"id":"n","type":"teacher_note","text":"   "}]}$json$::jsonb),
('notes-long', 'aaaaaaaa-0000-0000-0000-0000000000b1', 'Notes', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Notes","language":"English","level":"A2","blocks":[{"id":"t","type":"text","content":"a"},{"id":"n","type":"teacher_note","text":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b1');
SELECT lives_ok($$SELECT public.publish_lesson_studio_draft('notes-ok', 'studio-notes-en-a2', 1)$$, 'NOTES-1: a lesson with teacher notes publishes');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('notes-only', 'studio-notes-en-a2', 2)$$, NULL,
  'A lesson needs at least one block students can see.', 'NOTES-2: a lesson with only notes is refused');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('notes-blank', 'studio-notes-en-a2', 3)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'NOTES-3: a blank note is refused');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('notes-long', 'studio-notes-en-a2', 4)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'NOTES-4: a note over 2000 characters is refused');
RESET role;

INSERT INTO public.access_grants (user_id, student_id, course_id) VALUES ('aaaaaaaa-0000-0000-0000-0000000000b2', 'aaaaaaaa-0000-0000-0000-0000000000b2', 'studio-notes-en-a2');

SELECT ok(
  (SELECT jsonb_array_length(body::jsonb->'slides') = 2
      AND body !~ 'Warm up' AND body !~ 'Elicit' AND body !~ 'Closing'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:notes-ok'),
  'NOTES-5: notes are not slides and never appear in the student body'
);

SELECT is(
  (SELECT content::jsonb->'notes' FROM public.lesson_protected WHERE lesson_id = 'studio:notes-ok' AND kind = 'teacher-notes'),
  '[{"slide":0,"texts":["Warm up for 5 minutes"]},{"slide":1,"texts":["Elicit: What would you like?"]},{"slide":1,"texts":["Closing note"]}]'::jsonb,
  'NOTES-6: notes attach to the next slide; a trailing note goes with the last slide'
);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b3');
SELECT is(
  (SELECT public.get_studio_lesson_teacher_view('studio:notes-ok')->'answerKey'->0->>'blockId'),
  'f1',
  'NOTES-7: a teacher of the language gets the answer key'
);
SELECT is(
  jsonb_array_length(public.get_studio_lesson_teacher_view('studio:notes-ok')->'notes'),
  3,
  'NOTES-8: a teacher of the language gets the notes'
);
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b1');
SELECT is(
  jsonb_array_length(public.get_studio_lesson_teacher_view('studio:notes-ok')->'body'->'slides'),
  2,
  'NOTES-9: a founder gets the lesson body'
);
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b4');
SELECT throws_ok($$SELECT public.get_studio_lesson_teacher_view('studio:notes-ok')$$, '42501',
  'You do not have access to this lesson.', 'NOTES-10: a teacher of another language is refused');
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b2');
SELECT throws_ok($$SELECT public.get_studio_lesson_teacher_view('studio:notes-ok')$$, '42501',
  'Only teachers can view the teacher version of a lesson.', 'NOTES-11: a student with a grant is refused');
SELECT is(
  (SELECT count(*)::int FROM public.lesson_protected WHERE lesson_id = 'studio:notes-ok'),
  0,
  'NOTES-12: a student cannot read the protected rows directly'
);
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b1');
SELECT throws_ok($$SELECT public.get_studio_lesson_teacher_view('lessons/en/a1/x.json')$$, '22023',
  'This view is only for studio lessons.', 'NOTES-13: only studio lessons');
RESET role;

SET LOCAL role = anon;
SELECT throws_ok($$SELECT public.get_studio_lesson_teacher_view('studio:notes-ok')$$, '42501', NULL,
  'NOTES-14: anonymous callers cannot run it');
RESET role;

SELECT * FROM finish();
ROLLBACK;
