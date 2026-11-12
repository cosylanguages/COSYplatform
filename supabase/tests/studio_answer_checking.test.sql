-- pgTAP: checking Lesson Studio answers on the server without exposing the key.
-- File: supabase/tests/studio_answer_checking.test.sql
BEGIN;

SELECT plan(11);

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
('aaaaaaaa-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'answer-founder@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'answer-student@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'answer-other@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000a1', 'founder', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000a2', 'student', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000a3', 'student', '{"*"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;

INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-answer-en-a2', 'en', 'a2', 'general', 'Answer check course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('answer-check', 'aaaaaaaa-0000-0000-0000-0000000000a1', 'Answer check', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Answer check","language":"English","level":"A2","blocks":[
 {"id":"f1","type":"fill_blank","prompt":"___ a coffee","answers":["I'd like","I would like"]},
 {"id":"t1","type":"true_false","statements":[{"text":"The sun is a star.","answer":true},{"text":"Paris is in Spain.","answer":false}]}
]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000a1');
SELECT lives_ok(
  $$SELECT public.publish_lesson_studio_draft('answer-check', 'studio-answer-en-a2', 1)$$,
  'ANSWER-0: the test lesson publishes'
);
RESET role;

-- Only the second user has a grant to the course containing the lesson.
INSERT INTO public.access_grants (user_id, student_id, course_id)
VALUES ('aaaaaaaa-0000-0000-0000-0000000000a2', 'aaaaaaaa-0000-0000-0000-0000000000a2', 'studio-answer-en-a2');

SELECT is(
  public.studio_normalize_answer('  I’d   LIKE a Coffee. '),
  'i''d like a coffee',
  'ANSWER-1: comparison ignores case, spacing, curly apostrophes and trailing punctuation'
);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000a1');
SELECT is(
  public.check_studio_answers('studio:answer-check', '{"f1":"i would LIKE","t1-1":"True","t1-2":"True"}'::jsonb),
  '{"f1":true,"t1-1":true,"t1-2":false}'::jsonb,
  'ANSWER-2: a founder gets right/wrong per field'
);

SELECT is(
  public.check_studio_answers('studio:answer-check', '{"f1":"   ","zz":"x"}'::jsonb),
  '{"f1":false}'::jsonb,
  'ANSWER-3: an empty answer is wrong and unknown fields are not reported'
);

SELECT ok(
  (SELECT bool_and(jsonb_typeof(value) = 'boolean')
     FROM jsonb_each(public.check_studio_answers('studio:answer-check', '{"f1":"nope","t1-1":"x"}'::jsonb))),
  'ANSWER-4: the result holds only booleans, never the key'
);
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000a2');
SELECT is(
  public.check_studio_answers('studio:answer-check', '{"f1":"I''d like"}'::jsonb),
  '{"f1":true}'::jsonb,
  'ANSWER-5: a student with a grant to the course can check answers'
);
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000a3');
SELECT throws_ok(
  $$SELECT public.check_studio_answers('studio:answer-check', '{"f1":"I''d like"}'::jsonb)$$,
  '42501',
  'You do not have access to this lesson.',
  'ANSWER-6: a student without a grant is refused'
);

SELECT throws_ok(
  $$SELECT public.check_studio_answers('lessons/en/a1/x.json', '{}'::jsonb)$$,
  '22023',
  'Answers can only be checked for studio lessons.',
  'ANSWER-7: only studio lessons can be checked'
);

SELECT throws_ok(
  $$SELECT public.check_studio_answers('studio:answer-check', '[1]'::jsonb)$$,
  '22023',
  'Answers must be an object with at most 200 fields.',
  'ANSWER-8: answers must be an object'
);
RESET role;

SET LOCAL role = anon;
SELECT throws_ok(
  $$SELECT public.check_studio_answers('studio:answer-check', '{"f1":"x"}'::jsonb)$$,
  '42501',
  NULL,
  'ANSWER-9: signed-out visitors cannot call the check'
);
RESET role;

SELECT is(
  (SELECT has_function_privilege('authenticated', 'public.check_studio_answers(text,jsonb)', 'execute')),
  true,
  'ANSWER-10: signed-in users may call the check'
);

SELECT * FROM finish();
ROLLBACK;
