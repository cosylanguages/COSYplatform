-- pgTAP: Lesson Studio grammar focus block (a COSYmanuals grammar point, by id).
-- File: supabase/tests/studio_grammar_focus.test.sql
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
('aaaaaaaa-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'gf-founder@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000d1', 'founder', '{"*"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;
INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-gf-en-a2', 'en', 'a2', 'general', 'Grammar focus test course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('gf-ok', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"g","type":"grammar_focus","grammarId":"  en-a2-used-to "}]}$json$::jsonb),
('gf-full', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"g","type":"grammar_focus","grammarId":"en-a2-used-to","title":" Look back ","display":"link"}]}$json$::jsonb),
('gf-badid', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"g","type":"grammar_focus","grammarId":"Used To"}]}$json$::jsonb),
('gf-num', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"g","type":"grammar_focus","grammarId":5}]}$json$::jsonb),
('gf-missing', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"g","type":"grammar_focus"}]}$json$::jsonb),
('gf-long', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'x', 'English', 'A2', jsonb_build_object('schemaVersion',1,'title','x','language','English','level','A2',
  'blocks', jsonb_build_array(jsonb_build_object('id','g','type','grammar_focus','grammarId','en-a2-' || repeat('a', 100))))),
('gf-display', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"g","type":"grammar_focus","grammarId":"en-a2-used-to","display":"popup"}]}$json$::jsonb),
('gf-title', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'x', 'English', 'A2', jsonb_build_object('schemaVersion',1,'title','x','language','English','level','A2',
  'blocks', jsonb_build_array(jsonb_build_object('id','g','type','grammar_focus','grammarId','en-a2-used-to','title',repeat('t', 121))))),
('gf-hyphen', 'aaaaaaaa-0000-0000-0000-0000000000d1', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"g","type":"grammar-focus","grammarId":"en-a2-used-to"}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000d1');
SELECT lives_ok($$SELECT public.publish_lesson_studio_draft('gf-ok', 'studio-gf-en-a2', 1)$$, 'GF-1: a grammar focus block publishes');
SELECT lives_ok($$SELECT public.publish_lesson_studio_draft('gf-full', 'studio-gf-en-a2', 2)$$, 'GF-2: a grammar focus block with title and link display publishes');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('gf-badid', 'studio-gf-en-a2', 3)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GF-3: an id that is not <lang>-<level>-<slug> is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('gf-num', 'studio-gf-en-a2', 4)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GF-4: the id must be a string');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('gf-missing', 'studio-gf-en-a2', 5)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GF-5: the id is required');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('gf-long', 'studio-gf-en-a2', 6)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GF-6: an id longer than 100 characters is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('gf-display', 'studio-gf-en-a2', 7)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GF-7: display must be embed or link');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('gf-title', 'studio-gf-en-a2', 8)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GF-8: a title longer than 120 characters is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('gf-hyphen', 'studio-gf-en-a2', 9)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'GF-9: the block type is grammar_focus, not grammar-focus');
RESET role;

SELECT ok(
  (SELECT body::jsonb->'slides'->0->'elements'->0->>'type' = 'grammar-focus'
      AND body::jsonb->'slides'->0->'elements'->0->>'grammarId' = 'en-a2-used-to'
      AND body::jsonb->'slides'->0->'elements'->0->>'display' = 'embed'
      AND NOT (body::jsonb->'slides'->0->'elements'->0 ? 'title')
   FROM public.lesson_student_content WHERE lesson_id = 'studio:gf-ok'),
  'GF-10: students get the trimmed id, the default display, and no empty title'
);
SELECT ok(
  (SELECT body::jsonb->'slides'->0->'elements'->0->>'title' = 'Look back'
      AND body::jsonb->'slides'->0->'elements'->0->>'display' = 'link'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:gf-full'),
  'GF-11: students get the trimmed title and the link display'
);

SELECT * FROM finish();
ROLLBACK;
