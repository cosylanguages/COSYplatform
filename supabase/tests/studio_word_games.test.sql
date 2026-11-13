-- pgTAP: Lesson Studio word-game blocks (hangman, anagram, word search).
-- File: supabase/tests/studio_word_games.test.sql
BEGIN;

SELECT plan(9);

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
('aaaaaaaa-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'words-founder@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000c2', 'founder', '{"*"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;
INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-words-en-a2', 'en', 'a2', 'general', 'Word games test course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('words-ok', 'aaaaaaaa-0000-0000-0000-0000000000c2', 'Words ok', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Words ok","language":"English","level":"A2","blocks":[
 {"id":"h","type":"hangman","words":[{"word":" Ёлка ","hint":" tree "},{"word":"don't"}]},
 {"id":"a","type":"anagram","words":[{"word":"cat","hint":"pet"}]},
 {"id":"w","type":"word_search","words":["apple","pear","plum"],"directions":"all"}
]}$json$::jsonb),
('words-hm-dup', 'aaaaaaaa-0000-0000-0000-0000000000c2', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"h","type":"hangman","words":[{"word":"Cat"},{"word":" cat "}]}]}$json$::jsonb),
('words-an-space', 'aaaaaaaa-0000-0000-0000-0000000000c2', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"a","type":"anagram","words":[{"word":"ice cream"}]}]}$json$::jsonb),
('words-ws-two', 'aaaaaaaa-0000-0000-0000-0000000000c2', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"w","type":"word_search","words":["apple","pear"]}]}$json$::jsonb),
('words-ws-long', 'aaaaaaaa-0000-0000-0000-0000000000c2', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"w","type":"word_search","words":["abcdefghijklm","pear","plum"]}]}$json$::jsonb),
('words-ws-dirs', 'aaaaaaaa-0000-0000-0000-0000000000c2', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"w","type":"word_search","words":["apple","pear","plum"],"directions":"diagonal"}]}$json$::jsonb),
('words-hm-digits', 'aaaaaaaa-0000-0000-0000-0000000000c2', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[
 {"id":"h","type":"hangman","words":[{"word":"1234"}]}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c2');
SELECT lives_ok(
  $$SELECT public.publish_lesson_studio_draft('words-ok', 'studio-words-en-a2', 1)$$,
  'WORDS-1: hangman, anagram and word search publish'
);
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('words-hm-dup', 'studio-words-en-a2', 2)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'WORDS-2: a repeated hangman word is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('words-an-space', 'studio-words-en-a2', 3)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'WORDS-3: an anagram word cannot contain spaces');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('words-ws-two', 'studio-words-en-a2', 4)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'WORDS-4: a word search needs at least 3 words');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('words-ws-long', 'studio-words-en-a2', 5)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'WORDS-5: a word search word cannot exceed 12 characters');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('words-ws-dirs', 'studio-words-en-a2', 6)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'WORDS-6: an unknown word search direction is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('words-hm-digits', 'studio-words-en-a2', 7)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'WORDS-7: a hangman word needs a letter');
RESET role;

SELECT ok(
  (SELECT body::jsonb->'slides'->0->'elements'->0->'words'->0->>'word' = 'Ёлка'
      AND body::jsonb->'slides'->0->'elements'->0->'words'->0->>'hint' = 'tree'
      AND body::jsonb->'slides'->1->'elements'->0->>'type' = 'anagram'
      AND body::jsonb->'slides'->2->'elements'->0->>'type' = 'word-search'
      AND body::jsonb->'slides'->2->'elements'->0->>'directions' = 'all'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:words-ok'),
  'WORDS-8: students get the trimmed words, hints and directions'
);

SELECT is(
  (SELECT count(*)::int FROM public.lesson_protected WHERE lesson_id = 'studio:words-ok'
     AND content::jsonb->'answers' <> '[]'::jsonb),
  0,
  'WORDS-9: word games carry no answer key'
);

SELECT * FROM finish();
ROLLBACK;
