-- pgTAP: Lesson Studio section heading block.
-- File: supabase/tests/studio_heading.test.sql
BEGIN;

SELECT plan(6);

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
('aaaaaaaa-0000-0000-0000-0000000000c4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hd-founder@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000c4', 'founder', '{"*"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;
INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-hd-en-a2', 'en', 'a2', 'general', 'Heading test course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('hd-ok', 'aaaaaaaa-0000-0000-0000-0000000000c4', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"h","type":"heading","text":"  Past simple ","subtitle":" Regular verbs "}]}$json$::jsonb),
('hd-blank', 'aaaaaaaa-0000-0000-0000-0000000000c4', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"h","type":"heading","text":"   "}]}$json$::jsonb),
('hd-long', 'aaaaaaaa-0000-0000-0000-0000000000c4', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"h","type":"heading","text":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}]}$json$::jsonb),
('hd-sub', 'aaaaaaaa-0000-0000-0000-0000000000c4', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"h","type":"heading","text":"a","subtitle":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}]}$json$::jsonb),
('hd-num', 'aaaaaaaa-0000-0000-0000-0000000000c4', 'x', 'English', 'A2', $json$
{"schemaVersion":1,"title":"x","language":"English","level":"A2","blocks":[{"id":"h","type":"heading","text":5}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c4');
SELECT lives_ok($$SELECT public.publish_lesson_studio_draft('hd-ok', 'studio-hd-en-a2', 1)$$, 'HD-1: a heading publishes');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('hd-blank', 'studio-hd-en-a2', 2)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'HD-2: a blank heading is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('hd-long', 'studio-hd-en-a2', 3)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'HD-3: a heading cannot exceed 120 characters');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('hd-sub', 'studio-hd-en-a2', 4)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'HD-4: a subtitle cannot exceed 200 characters');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('hd-num', 'studio-hd-en-a2', 5)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'HD-5: heading text must be a string');
RESET role;

SELECT ok(
  (SELECT body::jsonb->'slides'->0->'elements'->0->>'type' = 'studio-heading'
      AND body::jsonb->'slides'->0->'elements'->0->>'content' = 'Past simple'
      AND body::jsonb->'slides'->0->'elements'->0->>'subtitle' = 'Regular verbs'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:hd-ok'),
  'HD-6: students get the trimmed heading and subtitle'
);

SELECT * FROM finish();
ROLLBACK;
