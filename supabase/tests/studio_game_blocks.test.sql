-- pgTAP: Lesson Studio study-game blocks (flashcards, memory match).
-- File: supabase/tests/studio_game_blocks.test.sql
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
('aaaaaaaa-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'games-founder@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000c1', 'founder', '{"*"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;
INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-games-en-a2', 'en', 'a2', 'general', 'Games test course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('games-ok', 'aaaaaaaa-0000-0000-0000-0000000000c1', 'Games ok', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Games ok","language":"English","level":"A2","blocks":[
 {"id":"fc","type":"flashcards","cards":[{"front":"  hola ","back":"hello"},{"front":"adios","back":"bye"}]},
 {"id":"mm","type":"memory_match","pairs":[{"a":"cat","b":"gato"},{"a":"dog","b":"perro"},{"a":"house","b":"casa"}]}
]}$json$::jsonb),
('games-dup', 'aaaaaaaa-0000-0000-0000-0000000000c1', 'Games dup', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Games dup","language":"English","level":"A2","blocks":[
 {"id":"mm","type":"memory_match","pairs":[{"a":"cat","b":"gato"},{"a":"dog","b":" CAT "},{"a":"x","b":"y"}]}]}$json$::jsonb),
('games-two', 'aaaaaaaa-0000-0000-0000-0000000000c1', 'Games two', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Games two","language":"English","level":"A2","blocks":[
 {"id":"mm","type":"memory_match","pairs":[{"a":"cat","b":"gato"},{"a":"dog","b":"perro"}]}]}$json$::jsonb),
('games-empty', 'aaaaaaaa-0000-0000-0000-0000000000c1', 'Games empty', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Games empty","language":"English","level":"A2","blocks":[
 {"id":"fc","type":"flashcards","cards":[]}]}$json$::jsonb),
('games-blank', 'aaaaaaaa-0000-0000-0000-0000000000c1', 'Games blank', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Games blank","language":"English","level":"A2","blocks":[
 {"id":"fc","type":"flashcards","cards":[{"front":"a","back":"  "}]}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c1');
SELECT lives_ok(
  $$SELECT public.publish_lesson_studio_draft('games-ok', 'studio-games-en-a2', 1)$$,
  'GAMES-1: flashcards and memory match publish'
);
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('games-dup', 'studio-games-en-a2', 2)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GAMES-2: a memory game with a repeated word is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('games-two', 'studio-games-en-a2', 3)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GAMES-3: a memory game needs at least 3 pairs');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('games-empty', 'studio-games-en-a2', 4)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GAMES-4: an empty flashcard deck is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('games-blank', 'studio-games-en-a2', 5)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GAMES-5: a flashcard with a blank side is rejected');
RESET role;

SELECT ok(
  (SELECT body::jsonb->'slides'->0->'elements'->0->>'type' = 'flashcards'
      AND body::jsonb->'slides'->0->'elements'->0->'cards'->0->>'front' = 'hola'
      AND body::jsonb->'slides'->1->'elements'->0->>'type' = 'memory-match'
      AND jsonb_array_length(body::jsonb->'slides'->1->'elements'->0->'pairs') = 3
   FROM public.lesson_student_content WHERE lesson_id = 'studio:games-ok'),
  'GAMES-6: students get the deck (trimmed) and the memory pairs'
);

SELECT is(
  (SELECT count(*)::int FROM public.lesson_protected WHERE lesson_id = 'studio:games-ok'
     AND content::jsonb->'answers' <> '[]'::jsonb),
  0,
  'GAMES-7: games carry no answer key'
);

SELECT ok(
  (SELECT strpos(body, '"memory_match"') = 0 AND strpos(body, '"cards":null') = 0
   FROM public.lesson_student_content WHERE lesson_id = 'studio:games-ok'),
  'GAMES-8: no authoring-only block names leak into the student body'
);

SELECT * FROM finish();
ROLLBACK;
