-- pgTAP: Lesson Studio crossword block.
-- File: supabase/tests/studio_crossword.test.sql
BEGIN;

SELECT plan(8);

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
('aaaaaaaa-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cw-founder@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000c3', 'founder', '{"*"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;
INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-cw-en-a2', 'en', 'a2', 'general', 'Crossword test course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('cw-ok', 'aaaaaaaa-0000-0000-0000-0000000000c3', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"c","type":"crossword","entries":[{"word":" Ёлка ","clue":" tree "},{"word":"лес","clue":"forest"},{"word":"гора","clue":"mountain"}]}]}$json$::jsonb),
('cw-two', 'aaaaaaaa-0000-0000-0000-0000000000c3', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"c","type":"crossword","entries":[{"word":"cat","clue":"pet"},{"word":"act","clue":"do"}]}]}$json$::jsonb),
('cw-noclue', 'aaaaaaaa-0000-0000-0000-0000000000c3', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"c","type":"crossword","entries":[{"word":"cat"},{"word":"act","clue":"do"},{"word":"tea","clue":"drink"}]}]}$json$::jsonb),
('cw-dup', 'aaaaaaaa-0000-0000-0000-0000000000c3', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"c","type":"crossword","entries":[{"word":"cat","clue":"pet"},{"word":" CAT","clue":"do"},{"word":"tea","clue":"drink"}]}]}$json$::jsonb),
('cw-space', 'aaaaaaaa-0000-0000-0000-0000000000c3', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"c","type":"crossword","entries":[{"word":"ice cream","clue":"cold"},{"word":"act","clue":"do"},{"word":"tea","clue":"drink"}]}]}$json$::jsonb),
('cw-long', 'aaaaaaaa-0000-0000-0000-0000000000c3', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"c","type":"crossword","entries":[{"word":"abcdefghijklmnop","clue":"x"},{"word":"act","clue":"do"},{"word":"tea","clue":"drink"}]}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c3');
SELECT lives_ok($$SELECT public.publish_lesson_studio_draft('cw-ok', 'studio-cw-en-a2', 1)$$, 'CW-1: a crossword publishes');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('cw-two', 'studio-cw-en-a2', 2)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'CW-2: needs at least 3 entries');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('cw-noclue', 'studio-cw-en-a2', 3)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'CW-3: every entry needs a clue');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('cw-dup', 'studio-cw-en-a2', 4)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'CW-4: a repeated word is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('cw-space', 'studio-cw-en-a2', 5)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'CW-5: a word cannot contain spaces');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('cw-long', 'studio-cw-en-a2', 6)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'CW-6: a word cannot exceed 15 characters');
RESET role;

SELECT ok(
  (SELECT body::jsonb->'slides'->0->'elements'->0->>'type' = 'crossword'
      AND body::jsonb->'slides'->0->'elements'->0->'entries'->0->>'word' = 'Ёлка'
      AND body::jsonb->'slides'->0->'elements'->0->'entries'->0->>'clue' = 'tree'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:cw-ok'),
  'CW-7: students get the trimmed entries'
);

SELECT is(
  (SELECT count(*)::int FROM public.lesson_protected WHERE lesson_id = 'studio:cw-ok'
     AND content::jsonb->'answers' <> '[]'::jsonb),
  0,
  'CW-8: a crossword carries no answer key'
);

SELECT * FROM finish();
ROLLBACK;
