-- pgTAP: stored check/game results for Lesson Studio lessons.
-- File: supabase/tests/studio_study_events.test.sql
BEGIN;

SELECT plan(22);

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
('aaaaaaaa-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'res-founder@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'res-student@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'res-teacher@cosy.platform', '', NOW(), NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-0000000000c4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'res-teacher-fr@cosy.platform', '', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, language_access, course_level) VALUES
('aaaaaaaa-0000-0000-0000-0000000000c1', 'founder', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000c2', 'student', '{"*"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000c3', 'teacher', '{"en"}', '*'),
('aaaaaaaa-0000-0000-0000-0000000000c4', 'teacher', '{"fr"}', '*')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, language_access = EXCLUDED.language_access, course_level = EXCLUDED.course_level;

INSERT INTO public.teacher_languages (user_id, language) VALUES ('aaaaaaaa-0000-0000-0000-0000000000c3', 'en'), ('aaaaaaaa-0000-0000-0000-0000000000c4', 'fr') ON CONFLICT DO NOTHING;

INSERT INTO public.courses (id, language, cefr, course_type, title, description, total_lessons, is_public_preview)
VALUES ('studio-res-en-a2', 'en', 'a2', 'general', 'Results course', 'Test', 1, false)
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.lesson_studio_drafts (id, owner_id, title, language, level, document) VALUES
('res-ok', 'aaaaaaaa-0000-0000-0000-0000000000c1', 'Results', 'English', 'A2', $json$
{"schemaVersion":1,"title":"Results","language":"English","level":"A2","blocks":[
 {"id":"f1","type":"fill_blank","prompt":"___ a coffee","answers":["I'd like"]},
 {"id":"f2","type":"fill_blank","prompt":"___ tea","answers":["I want"]}]}$json$::jsonb);

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c1');
SELECT public.publish_lesson_studio_draft('res-ok', 'studio-res-en-a2', 1);
RESET role;

INSERT INTO public.access_grants (user_id, student_id, course_id) VALUES ('aaaaaaaa-0000-0000-0000-0000000000c2', 'aaaaaaaa-0000-0000-0000-0000000000c2', 'studio-res-en-a2');

-- Student: one right, one blank (not recorded), then f2 right and then wrong (latest is wrong).
SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c2');
SELECT is(public.check_studio_answers('studio:res-ok', '{"f1":"I''d like","f2":""}'::jsonb), '{"f1":true,"f2":false}'::jsonb, 'EV-1: checking still returns true/false per field');
SELECT is((SELECT count(*)::int FROM public.study_events), 1, 'EV-2: only the answered field is recorded');
SELECT public.check_studio_answers('studio:res-ok', '{"f2":"I want"}'::jsonb);
SELECT public.check_studio_answers('studio:res-ok', '{"f2":"nope"}'::jsonb);
SELECT is((SELECT count(*)::int FROM public.study_events WHERE field_key = 'f2'), 2, 'EV-3: every answered check is kept, not only the latest');

SELECT lives_ok($$SELECT public.record_game_result('studio:res-ok', 'slide-1', 'hangman', 2, 3)$$, 'EV-4: a game result is saved');
SELECT throws_ok($$SELECT public.record_game_result('studio:res-ok', 'slide-1', 'poker', 1, 1)$$, '22023', 'Unknown game.', 'EV-5: an unknown game is refused');
SELECT throws_ok($$SELECT public.record_game_result('studio:res-ok', 'slide-1', 'hangman', 4, 3)$$, '22023', 'Invalid score.', 'EV-6: a score above the total is refused');
SELECT throws_ok($$SELECT public.record_game_result('studio:res-ok', 'x; drop', 'hangman', 1, 3)$$, '22023', 'Unknown slide.', 'EV-7: a malformed slide id is refused');
SELECT throws_ok($$SELECT public.record_game_result('lessons/en/a1/x.json', 'slide-1', 'hangman', 1, 3)$$, '22023', 'Results can only be saved for studio lessons.', 'EV-8: only studio lessons keep results');

SELECT is((SELECT count(*)::int FROM public.study_events), 4, 'EV-9: a student sees their own rows');
SELECT throws_ok($$INSERT INTO public.study_events (student_id, lesson_id, kind, field_key, correct) VALUES ('aaaaaaaa-0000-0000-0000-0000000000c2', 'studio:res-ok', 'check', 'f1', true)$$, '42501', NULL, 'EV-10: a student cannot insert rows directly');
SELECT throws_ok($$SELECT public.get_studio_lesson_results('studio:res-ok')$$, '42501', 'Only teachers can view student results.', 'EV-11: a student cannot read the results');
RESET role;

-- Teacher of the language reads results; the rows they cannot see directly.
SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c3');
SELECT is((SELECT count(*)::int FROM public.study_events), 0, 'EV-12: a teacher cannot read the raw rows');
SELECT is(public.get_studio_lesson_results('studio:res-ok')->'questions'->0->>'fieldKey', 'f2', 'EV-13: the hardest question is listed first');
SELECT is(public.get_studio_lesson_results('studio:res-ok')->'students'->0->>'attempts', '3', 'EV-14: attempts are counted per student');
SELECT is(public.get_studio_lesson_results('studio:res-ok')->'students'->0->'games'->0->>'best', '2', 'EV-15: game results are included');
SELECT is((public.get_studio_lesson_results('studio:res-ok')->>'gamesAreSelfReported')::boolean, true, 'EV-16: games are flagged as self-reported');
-- A teacher trying a lesson records nothing.
SELECT public.check_studio_answers('studio:res-ok', '{"f1":"I''d like"}'::jsonb);
SELECT public.record_game_result('studio:res-ok', 'slide-1', 'hangman', 1, 1);
RESET role;
SELECT is((SELECT count(*)::int FROM public.study_events), 4, 'EV-17: teacher practice is not recorded');

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c4');
SELECT throws_ok($$SELECT public.get_studio_lesson_results('studio:res-ok')$$, '42501', 'You do not have access to this lesson.', 'EV-18: a teacher of another language is refused');
RESET role;

SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c1');
SELECT is(jsonb_array_length(public.get_studio_lesson_results('studio:res-ok')->'students'), 1, 'EV-19: a founder can read results');
RESET role;

-- Student deletes their own history.
SELECT tests.studio_authenticate_as('aaaaaaaa-0000-0000-0000-0000000000c2');
DELETE FROM public.study_events;
SELECT is((SELECT count(*)::int FROM public.study_events), 0, 'EV-20: a student can delete their own history');
RESET role;

-- Retention: rows older than 12 months are purged.
INSERT INTO public.study_events (student_id, lesson_id, kind, field_key, correct, created_at) VALUES
('aaaaaaaa-0000-0000-0000-0000000000c2', 'studio:res-ok', 'check', 'f1', true, now() - interval '13 months'),
('aaaaaaaa-0000-0000-0000-0000000000c2', 'studio:res-ok', 'check', 'f1', true, now());
SELECT is(public.purge_old_study_events(), 1, 'EV-21: purge removes only rows older than 12 months');

SET LOCAL role = anon;
SELECT throws_ok($$SELECT public.get_studio_lesson_results('studio:res-ok')$$, '42501', NULL, 'EV-22: anonymous callers cannot run it');
RESET role;

SELECT * FROM finish();
ROLLBACK;
