-- pgTAP: publishing every Lesson Studio block type, and keeping answers private.
-- File: supabase/tests/studio_publish_blocks.test.sql
BEGIN;

SELECT plan(18);

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

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('aaaaaaaa-0000-0000-0000-00000000000f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'studio-founder@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, language_access, course_level)
VALUES ('aaaaaaaa-0000-0000-0000-00000000000f', 'founder', '{"*"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;

INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-test-en-a2', 'en', 'a2', 'general', 'Studio test course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;

-- Drafts are inserted as the table owner; publishing runs as the founder.
INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('all-blocks', 'aaaaaaaa-0000-0000-0000-00000000000f', 'All blocks', 'English', 'A2', $json$
{"schemaVersion":1,"title":"All blocks","language":"English","level":"A2","blocks":[
 {"id":"b1","type":"text","content":"Hello"},
 {"id":"b2","type":"fill_blank","prompt":"___ a coffee","answers":["I'd like"]},
 {"id":"b3","type":"vocab_list","items":[{"word":"menu","definition":"list of dishes","example":"See the menu","teacherNote":"SECRET-NOTE"}]},
 {"id":"b4","type":"quiz","question":"Pick one","options":["red","green","blue"],"answer":"green"},
 {"id":"b5","type":"discussion","prompts":["Favourite food?"]},
 {"id":"b6","type":"essay","prompt":"Describe a meal"},
 {"id":"b7","type":"correction","pairs":[{"incorrect":"I goed home","correct":"I went home"}]}
]}$json$::jsonb),
('match-ok', 'aaaaaaaa-0000-0000-0000-00000000000f', 'Match ok', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Match ok","language":"English","level":"A2","blocks":[
 {"id":"m1","type":"matching","instructions":"Match country and capital.","pairs":[{"left":"France","right":"Paris"},{"left":"Italy","right":"Rome"}]}]}$json$::jsonb),
('match-dup', 'aaaaaaaa-0000-0000-0000-00000000000f', 'Match dup', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Match dup","language":"English","level":"A2","blocks":[
 {"id":"m1","type":"matching","pairs":[{"left":"a","right":"Same"},{"left":"b","right":" same "}]}]}$json$::jsonb),
('more-blocks', 'aaaaaaaa-0000-0000-0000-00000000000f', 'More blocks', 'English', 'A2', $json$
{"schemaVersion":1,"title":"More blocks","language":"English","level":"A2","blocks":[
 {"id":"f1","type":"fill_blank","prompt":"She ___ home.","answers":["went"],"bank":["went","goes","gone"]},
 {"id":"t1","type":"true_false","statements":[{"text":"The sun is a star.","answer":true},{"text":"Paris is in Spain.","answer":false}]},
 {"id":"w1","type":"word_order","sentences":["I would like a coffee"]},
 {"id":"s1","type":"sort_columns","columns":["Past","Present"],"items":[{"text":"went","column":"Past"},{"text":"goes","column":"Present"}]},
 {"id":"o1","type":"put_in_order","items":["Wake up","Have breakfast","Go to work"]}
]}$json$::jsonb),
('order-dup', 'aaaaaaaa-0000-0000-0000-00000000000f', 'Order dup', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Order dup","language":"English","level":"A2","blocks":[
 {"id":"o1","type":"put_in_order","items":["a","A ","b"]}]}$json$::jsonb),
('bad-quiz', 'aaaaaaaa-0000-0000-0000-00000000000f', 'Bad quiz', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Bad quiz","language":"English","level":"A2","blocks":[
 {"id":"q","type":"quiz","question":"x","options":["a"],"answer":"z"}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-00000000000f');

SELECT lives_ok(
  $$SELECT public.publish_lesson_studio_draft('all-blocks', 'studio-test-en-a2', 1)$$,
  'STUDIO-1: a lesson using all seven block types publishes'
);

SELECT throws_ok(
  $$SELECT public.publish_lesson_studio_draft('bad-quiz', 'studio-test-en-a2', 2)$$,
  NULL,
  'Draft contains an invalid or unsupported lesson block.',
  'STUDIO-2: a quiz whose answer is not one of its options is rejected'
);

SELECT lives_ok(
  $$SELECT public.publish_lesson_studio_draft('match-ok', 'studio-test-en-a2', 3)$$,
  'STUDIO-9: a matching lesson publishes'
);

SELECT throws_ok(
  $$SELECT public.publish_lesson_studio_draft('match-dup', 'studio-test-en-a2', 4)$$,
  NULL,
  'Draft contains an invalid or unsupported lesson block.',
  'STUDIO-10: matching with the same right-hand item twice is rejected'
);

SELECT lives_ok(
  $$SELECT public.publish_lesson_studio_draft('more-blocks', 'studio-test-en-a2', 5)$$,
  'STUDIO-13: true/false, word order, sorting, ordering and a word box publish'
);

SELECT throws_ok(
  $$SELECT public.publish_lesson_studio_draft('order-dup', 'studio-test-en-a2', 6)$$,
  NULL,
  'Draft contains an invalid or unsupported lesson block.',
  'STUDIO-14: an ordering block with a repeated item is rejected'
);

RESET role;

SELECT ok(
  (SELECT content::jsonb @> '{"answers":[
      {"blockId":"t1-1","acceptedAnswers":["True"]},{"blockId":"t1-2","acceptedAnswers":["False"]},
      {"blockId":"w1-1","acceptedAnswers":["I would like a coffee"]},
      {"blockId":"s1-1","acceptedAnswers":["Past"]},{"blockId":"s1-2","acceptedAnswers":["Present"]},
      {"blockId":"o1-1","acceptedAnswers":["Wake up"]},{"blockId":"o1-2","acceptedAnswers":["Have breakfast"]},{"blockId":"o1-3","acceptedAnswers":["Go to work"]}
    ]}'::jsonb
   FROM public.lesson_protected WHERE lesson_id = 'studio:more-blocks' AND kind = 'answer-key'),
  'STUDIO-15: true/false, word order, sorting and ordering answers are protected'
);

SELECT ok(
  (SELECT body NOT LIKE '%acceptedAnswers%' AND body NOT LIKE '%"statements"%'
          AND body NOT LIKE '%"sentences"%' AND body NOT LIKE '%"columns"%'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:more-blocks'),
  'STUDIO-16: student content carries no answers or authoring fields for the new blocks'
);

SELECT ok(
  (SELECT body::jsonb->'slides'->2->'elements'->0->>'content' NOT LIKE '%I / would / like / a / coffee%'
          AND body::jsonb->'slides'->2->'elements'->0->>'content' LIKE 'Put the words in order: %'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:more-blocks'),
  'STUDIO-17: word order words are shuffled, never in the original order'
);

SELECT ok(
  (SELECT body::jsonb->'slides'->0->'elements'->0->>'content' LIKE '%Word box: %'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:more-blocks'),
  'STUDIO-18: the word box is shown to students'
);

SELECT ok(
  (SELECT content::jsonb @> '{"answers":[{"blockId":"m1-1","acceptedAnswers":["Paris"]},{"blockId":"m1-2","acceptedAnswers":["Rome"]}]}'::jsonb
   FROM public.lesson_protected WHERE lesson_id = 'studio:match-ok' AND kind = 'answer-key'),
  'STUDIO-11: the matching pairing is stored in the protected answer key'
);

SELECT ok(
  (SELECT body NOT LIKE '%"pairs"%' AND body NOT LIKE '%acceptedAnswers%'
          AND (body::jsonb->'slides'->0->'elements'->0->>'content' LIKE '%Choose from: Paris · Rome%'
               OR body::jsonb->'slides'->0->'elements'->0->>'content' LIKE '%Choose from: Rome · Paris%')
   FROM public.lesson_student_content WHERE lesson_id = 'studio:match-ok'),
  'STUDIO-12: students get a shuffled bank and no pairing'
);

SELECT ok(
  (SELECT jsonb_array_length(body::jsonb->'slides') FROM public.lesson_student_content WHERE lesson_id = 'studio:all-blocks') = 7,
  'STUDIO-3: student content has one slide per block'
);

SELECT ok(
  (SELECT body NOT LIKE '%"answer"%' AND body NOT LIKE '%acceptedAnswers%'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:all-blocks'),
  'STUDIO-4: student content carries no answer fields'
);

SELECT ok(
  (SELECT body NOT LIKE '%I went home%' AND body NOT LIKE '%SECRET-NOTE%'
   FROM public.lesson_student_content WHERE lesson_id = 'studio:all-blocks'),
  'STUDIO-5: corrections and extra vocabulary fields never reach students'
);

SELECT ok(
  (SELECT content::jsonb @> '{"answers":[{"blockId":"b4","acceptedAnswers":["green"]}]}'::jsonb
   FROM public.lesson_protected WHERE lesson_id = 'studio:all-blocks' AND kind = 'answer-key'),
  'STUDIO-6: the quiz answer is stored in the protected answer key'
);

SELECT ok(
  (SELECT content::jsonb @> '{"answers":[{"blockId":"b7-1","acceptedAnswers":["I went home"]}]}'::jsonb
   FROM public.lesson_protected WHERE lesson_id = 'studio:all-blocks' AND kind = 'answer-key'),
  'STUDIO-7: the correction is stored in the protected answer key'
);

SELECT ok(
  (SELECT content::jsonb @> '{"answers":[{"blockId":"b2","acceptedAnswers":["I''d like"]}]}'::jsonb
   FROM public.lesson_protected WHERE lesson_id = 'studio:all-blocks' AND kind = 'answer-key'),
  'STUDIO-8: fill-in-the-blank answers are still protected'
);

SELECT * FROM finish();

ROLLBACK;
