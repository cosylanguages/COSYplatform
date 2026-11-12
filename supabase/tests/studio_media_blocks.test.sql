-- pgTAP: Lesson Studio media blocks and the private lesson-media bucket.
-- File: supabase/tests/studio_media_blocks.test.sql
BEGIN;

SELECT plan(17);

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

-- founder b1, teacher b2, student with a grant b3, student without b4
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
('aaaaaaaa-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'media-founder@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'media-teacher@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'media-student@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'media-other@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000b1', 'founder', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000b2', 'teacher', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000b3', 'student', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000b4', 'student', '{"*"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;

INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-media-en-a2', 'en', 'a2', 'general', 'Media test course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;

-- Files already in storage (as the table owner, like an upload that has happened).
INSERT INTO storage.objects (bucket_id, name) VALUES
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000001.png'),
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000002.mp3'),
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000003.pdf'),
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000004.mp4'),
('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000009.png');

INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('media-ok', 'aaaaaaaa-0000-0000-0000-0000000000b1', 'Media ok', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Media ok","language":"English","level":"A2","blocks":[
 {"id":"i1","type":"image","path":"aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000001.png","alt":"A red bus","caption":"Fig 1"},
 {"id":"a1","type":"audio","path":"aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000002.mp3"},
 {"id":"p1","type":"pdf","path":"aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000003.pdf"},
 {"id":"v1","type":"video","path":"aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000004.mp4"},
 {"id":"v2","type":"video","embed":{"provider":"youtube","id":"dQw4w9WgXcQ"}}
]}$json$::jsonb),
('media-noalt', 'aaaaaaaa-0000-0000-0000-0000000000b1', 'No alt', 'English', 'A2', $json$
{"schemaVersion":1,"title":"No alt","language":"English","level":"A2","blocks":[
 {"id":"i1","type":"image","path":"aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000001.png"}]}$json$::jsonb),
('media-nofile', 'aaaaaaaa-0000-0000-0000-0000000000b1', 'No file', 'English', 'A2', $json$
{"schemaVersion":1,"title":"No file","language":"English","level":"A2","blocks":[
 {"id":"i1","type":"image","alt":"x","path":"aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-0000000000ff.png"}]}$json$::jsonb),
('media-both', 'aaaaaaaa-0000-0000-0000-0000000000b1', 'Both', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Both","language":"English","level":"A2","blocks":[
 {"id":"v1","type":"video","path":"aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000004.mp4","embed":{"provider":"youtube","id":"dQw4w9WgXcQ"}}]}$json$::jsonb),
('media-provider', 'aaaaaaaa-0000-0000-0000-0000000000b1', 'Provider', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Provider","language":"English","level":"A2","blocks":[
 {"id":"v1","type":"video","embed":{"provider":"dailymotion","id":"x1234567"}}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b1');
SELECT lives_ok(
  $$SELECT public.publish_lesson_studio_draft('media-ok', 'studio-media-en-a2', 1)$$,
  'MEDIA-1: picture, audio, PDF, uploaded video and a video embed publish'
);
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('media-noalt', 'studio-media-en-a2', 2)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'MEDIA-2: a picture without alt text is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('media-nofile', 'studio-media-en-a2', 3)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'MEDIA-3: a reference to a file that was never uploaded is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('media-both', 'studio-media-en-a2', 4)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'MEDIA-4: a video with both a file and a link is rejected');
SELECT throws_ok($$SELECT public.publish_lesson_studio_draft('media-provider', 'studio-media-en-a2', 5)$$, NULL,
  'Draft contains an invalid or unsupported lesson block.', 'MEDIA-5: a video from an unlisted provider is rejected');
RESET role;

SELECT is(
  (SELECT count(*)::int FROM public.lesson_media_refs WHERE lesson_id = 'studio:media-ok'),
  4,
  'MEDIA-6: the lesson records the four files it uses'
);

SELECT ok(
  (SELECT body::jsonb->'slides'->0->'elements'->0->>'type' = 'media'
      AND body::jsonb->'slides'->0->'elements'->0->>'kind' = 'image'
      AND body::jsonb->'slides'->0->'elements'->0->>'alt' = 'A red bus'
      AND body::jsonb->'slides'->4->'elements'->0->>'type' = 'video-embed'
      AND body::jsonb->'slides'->4->'elements'->0->>'provider' = 'youtube'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:media-ok'),
  'MEDIA-7: students get media and video-embed elements with provider and id only'
);

-- Only the third user has a grant to the course.
INSERT INTO public.access_grants (user_id, student_id, course_id)
VALUES ('aaaaaaaa-0000-0000-0000-0000000000b3', 'aaaaaaaa-0000-0000-0000-0000000000b3', 'studio-media-en-a2');

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b3');
SELECT is(
  (SELECT count(*)::int FROM storage.objects WHERE bucket_id = 'lesson-media'
     AND name = 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000001.png'),
  1,
  'MEDIA-8: a student with a grant can read a file the published lesson uses'
);
SELECT is(
  (SELECT count(*)::int FROM storage.objects WHERE bucket_id = 'lesson-media'
     AND name = 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000009.png'),
  0,
  'MEDIA-9: ...but not a file no lesson uses'
);
SELECT throws_ok(
  $$INSERT INTO storage.objects (bucket_id, name) VALUES ('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000b3/00000000-0000-4000-8000-000000000011.png')$$,
  '42501', NULL, 'MEDIA-10: a student cannot upload');
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b4');
SELECT is(
  (SELECT count(*)::int FROM storage.objects WHERE bucket_id = 'lesson-media'
     AND name = 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000001.png'),
  0,
  'MEDIA-11: a student without a grant cannot read the file'
);
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000b2');
SELECT lives_ok(
  $$INSERT INTO storage.objects (bucket_id, name) VALUES ('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000b2/00000000-0000-4000-8000-000000000012.png')$$,
  'MEDIA-12: a teacher can upload into their own folder');
SELECT throws_ok(
  $$INSERT INTO storage.objects (bucket_id, name) VALUES ('lesson-media', 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000013.png')$$,
  '42501', NULL, 'MEDIA-13: ...but not into someone else''s folder');
SELECT is(
  (SELECT count(*)::int FROM storage.objects WHERE bucket_id = 'lesson-media'
     AND name = 'aaaaaaaa-0000-0000-0000-0000000000b1/00000000-0000-4000-8000-000000000009.png'),
  0,
  'MEDIA-14: a teacher cannot read another author''s unpublished upload');
SELECT is(
  (SELECT count(*)::int FROM storage.objects WHERE bucket_id = 'lesson-media'
     AND name = 'aaaaaaaa-0000-0000-0000-0000000000b2/00000000-0000-4000-8000-000000000012.png'),
  1,
  'MEDIA-15: ...but can read their own');
RESET role;

SELECT is(
  (SELECT public FROM storage.buckets WHERE id = 'lesson-media'),
  false,
  'MEDIA-16: the bucket is private');

SELECT ok(
  (SELECT 'image/svg+xml' <> ALL (allowed_mime_types) AND 'text/html' <> ALL (allowed_mime_types)
     FROM storage.buckets WHERE id = 'lesson-media'),
  'MEDIA-17: SVG and HTML cannot be uploaded');

SELECT * FROM finish();
ROLLBACK;
