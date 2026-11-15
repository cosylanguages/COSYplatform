-- Student results for Lesson Studio lessons: what teachers see about how students did.
--
-- public.study_events is an append-only log, written ONLY by the functions below (nobody can
-- insert or update it directly):
--   kind 'check'  one row per answered field each time a student presses "Check answers".
--                 Correctness is decided by the server (check_studio_answers), so it cannot be forged.
--   kind 'game'   one row per finished game, reported by the student's browser. The games run on the
--                 student's device with no answer key, so these scores are SELF-REPORTED and are
--                 shown to teachers as such.
-- Empty answers are not recorded. Teachers and founders who try a lesson are not recorded.
--
-- Privacy:
--   * a student can read and delete their own rows; deleting the account deletes them too
--   * teachers and founders read results only through get_studio_lesson_results(), which applies the
--     same gate as reading the lesson (a teacher of the course's language, or a founder). The schema
--     has no teacher-to-student link, so every teacher of that language sees that lesson's results
--   * rows older than 12 months are deleted (purge_old_study_events), opportunistically on writes
--   * a student can store at most 2000 rows per lesson

CREATE TABLE IF NOT EXISTS public.study_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL CHECK (left(lesson_id, 7) = 'studio:'),
  kind TEXT NOT NULL CHECK (kind IN ('check', 'game')),
  field_key TEXT NOT NULL CHECK (char_length(field_key) BETWEEN 1 AND 80),
  correct BOOLEAN,
  score INTEGER,
  total INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT study_events_shape CHECK (
    (kind = 'check' AND correct IS NOT NULL AND score IS NULL AND total IS NULL)
    OR (kind = 'game' AND correct IS NULL AND score IS NOT NULL AND total IS NOT NULL
        AND score >= 0 AND total >= 1 AND total <= 100 AND score <= total)
  )
);

CREATE INDEX IF NOT EXISTS study_events_lesson_idx ON public.study_events (lesson_id, created_at);
CREATE INDEX IF NOT EXISTS study_events_student_idx ON public.study_events (student_id, lesson_id);
CREATE INDEX IF NOT EXISTS study_events_created_idx ON public.study_events (created_at);

ALTER TABLE public.study_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own study events" ON public.study_events;
CREATE POLICY "Students read own study events"
  ON public.study_events FOR SELECT TO authenticated
  USING (student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Students delete own study events" ON public.study_events;
CREATE POLICY "Students delete own study events"
  ON public.study_events FOR DELETE TO authenticated
  USING (student_id = (SELECT auth.uid()));

REVOKE ALL ON public.study_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.study_events TO authenticated;

-- Keep the log to 12 months. Called by the writers below about once in a hundred writes.
CREATE OR REPLACE FUNCTION public.purge_old_study_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.study_events WHERE created_at < NOW() - INTERVAL '12 months';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
REVOKE ALL ON FUNCTION public.purge_old_study_events() FROM PUBLIC, anon, authenticated;

-- check_studio_answers: unchanged answers, plus a record of each answered field.
CREATE OR REPLACE FUNCTION public.check_studio_answers(p_lesson_id TEXT, p_answers JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_key JSONB;
  v_allowed BOOLEAN;
  v_result JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Sign in to check answers.' USING ERRCODE = '28000';
  END IF;
  IF p_lesson_id IS NULL OR left(p_lesson_id, 7) <> 'studio:' THEN
    RAISE EXCEPTION 'Answers can only be checked for studio lessons.' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(p_answers) IS DISTINCT FROM 'object'
     OR (SELECT count(*) FROM jsonb_object_keys(p_answers)) > 200 THEN
    RAISE EXCEPTION 'Answers must be an object with at most 200 fields.' USING ERRCODE = '22023';
  END IF;

  -- The same gate that decides who may read the published lesson body.
  v_allowed := public.can_read_published_studio_lesson(p_lesson_id);
  IF NOT v_allowed THEN
    RAISE EXCEPTION 'You do not have access to this lesson.' USING ERRCODE = '42501';
  END IF;

  SELECT content::jsonb INTO v_key
    FROM public.lesson_protected
   WHERE lesson_id = p_lesson_id AND kind = 'answer-key'
   LIMIT 1;
  IF v_key IS NULL OR jsonb_typeof(v_key->'answers') IS DISTINCT FROM 'array' THEN
    RETURN '{}'::JSONB;
  END IF;

  -- Only fields that have a key are reported; the key is never returned.
  v_result := COALESCE((
    SELECT jsonb_object_agg(a.key, EXISTS (
        SELECT 1
          FROM jsonb_array_elements(v_key->'answers') AS e,
               jsonb_array_elements_text(e->'acceptedAnswers') AS acc
         WHERE e->>'blockId' = a.key
           AND public.studio_normalize_answer(acc) = public.studio_normalize_answer(a.value #>> '{}')
           AND public.studio_normalize_answer(a.value #>> '{}') <> ''
    ))
    FROM jsonb_each(p_answers) AS a
    WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(v_key->'answers') AS e WHERE e->>'blockId' = a.key)
  ), '{}'::JSONB);

  -- Record answered fields for students (not for teachers or founders trying the lesson).
  IF NOT (public.is_founder() OR public.is_teacher())
     AND (SELECT count(*) FROM public.study_events WHERE student_id = v_uid AND lesson_id = p_lesson_id) < 2000 THEN
    INSERT INTO public.study_events (student_id, lesson_id, kind, field_key, correct)
    SELECT v_uid, p_lesson_id, 'check', r.key, r.value::BOOLEAN
      FROM jsonb_each_text(v_result) AS r
     WHERE char_length(r.key) <= 80
       AND public.studio_normalize_answer(p_answers->>r.key) <> '';
    IF random() < 0.01 THEN PERFORM public.purge_old_study_events(); END IF;
  END IF;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.check_studio_answers(TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_studio_answers(TEXT, JSONB) TO authenticated;

-- A student's browser reports a finished game. Self-reported: there is no answer key to check against.
CREATE OR REPLACE FUNCTION public.record_game_result(
  p_lesson_id TEXT, p_slide_id TEXT, p_game TEXT, p_score INTEGER, p_total INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Sign in to save results.' USING ERRCODE = '28000';
  END IF;
  IF p_lesson_id IS NULL OR left(p_lesson_id, 7) <> 'studio:' THEN
    RAISE EXCEPTION 'Results can only be saved for studio lessons.' USING ERRCODE = '22023';
  END IF;
  IF p_game IS NULL OR p_game NOT IN ('hangman', 'anagram', 'wordsearch', 'crossword', 'memory', 'flashcards') THEN
    RAISE EXCEPTION 'Unknown game.' USING ERRCODE = '22023';
  END IF;
  IF p_slide_id IS NULL OR p_slide_id !~ '^slide-[0-9]{1,3}$' THEN
    RAISE EXCEPTION 'Unknown slide.' USING ERRCODE = '22023';
  END IF;
  IF p_score IS NULL OR p_total IS NULL OR p_total < 1 OR p_total > 100 OR p_score < 0 OR p_score > p_total THEN
    RAISE EXCEPTION 'Invalid score.' USING ERRCODE = '22023';
  END IF;
  IF NOT public.can_read_published_studio_lesson(p_lesson_id) THEN
    RAISE EXCEPTION 'You do not have access to this lesson.' USING ERRCODE = '42501';
  END IF;
  -- Teachers and founders trying a lesson are not students: nothing to record.
  IF public.is_founder() OR public.is_teacher() THEN
    RETURN;
  END IF;
  IF (SELECT count(*) FROM public.study_events WHERE student_id = v_uid AND lesson_id = p_lesson_id) >= 2000 THEN
    RETURN;
  END IF;
  INSERT INTO public.study_events (student_id, lesson_id, kind, field_key, score, total)
  VALUES (v_uid, p_lesson_id, 'game', p_slide_id || ':' || p_game, p_score, p_total);
  IF random() < 0.01 THEN PERFORM public.purge_old_study_events(); END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.record_game_result(TEXT, TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_game_result(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

-- Each student's most recent check of each field. Internal: only get_studio_lesson_results calls it.
CREATE OR REPLACE FUNCTION public.studio_latest_checks(p_lesson_id TEXT)
RETURNS TABLE (student_id UUID, field_key TEXT, correct BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $f$
  SELECT DISTINCT ON (e.student_id, e.field_key) e.student_id, e.field_key, e.correct
    FROM public.study_events e
   WHERE e.lesson_id = p_lesson_id AND e.kind = 'check'
   ORDER BY e.student_id, e.field_key, e.created_at DESC, e.id DESC
$f$;
REVOKE ALL ON FUNCTION public.studio_latest_checks(TEXT) FROM PUBLIC, anon, authenticated;

-- What a teacher sees: per question, and per student. Same gate as the teacher view of the lesson.
CREATE OR REPLACE FUNCTION public.get_studio_lesson_results(p_lesson_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_questions JSONB;
  v_students JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to view results.' USING ERRCODE = '28000';
  END IF;
  IF p_lesson_id IS NULL OR left(p_lesson_id, 7) <> 'studio:' THEN
    RAISE EXCEPTION 'Results are only kept for studio lessons.' USING ERRCODE = '22023';
  END IF;
  IF NOT (public.is_founder() OR public.is_teacher()) THEN
    RAISE EXCEPTION 'Only teachers can view student results.' USING ERRCODE = '42501';
  END IF;
  IF NOT public.can_read_published_studio_lesson(p_lesson_id) THEN
    RAISE EXCEPTION 'You do not have access to this lesson.' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'fieldKey', q.field_key, 'students', q.students, 'correct', q.correct, 'attempts', q.attempts)
           ORDER BY (q.correct::NUMERIC / q.students) ASC, q.field_key), '[]'::JSONB)
    INTO v_questions
    FROM (
      SELECT l.field_key,
             count(*) AS students,
             count(*) FILTER (WHERE l.correct) AS correct,
             (SELECT count(*) FROM public.study_events e
               WHERE e.lesson_id = p_lesson_id AND e.kind = 'check' AND e.field_key = l.field_key) AS attempts
        FROM public.studio_latest_checks(p_lesson_id) l
       GROUP BY l.field_key
    ) q;

  SELECT COALESCE(jsonb_agg(s.row ORDER BY s.last_active DESC), '[]'::JSONB)
    INTO v_students
    FROM (
      SELECT x.last_active,
             jsonb_build_object(
               'studentId', x.student_id,
               'name', p.display_name,
               'answered', COALESCE((SELECT count(*) FROM public.studio_latest_checks(p_lesson_id) l WHERE l.student_id = x.student_id), 0),
               'correct', COALESCE((SELECT count(*) FROM public.studio_latest_checks(p_lesson_id) l WHERE l.student_id = x.student_id AND l.correct), 0),
               'attempts', (SELECT count(*) FROM public.study_events e
                             WHERE e.student_id = x.student_id AND e.lesson_id = p_lesson_id AND e.kind = 'check'),
               'lastActive', x.last_active,
               'games', COALESCE((
                 SELECT jsonb_agg(jsonb_build_object('slide', split_part(g.field_key, ':', 1), 'game', split_part(g.field_key, ':', 2),
                                                     'plays', g.plays, 'best', g.best, 'total', g.total) ORDER BY g.field_key)
                   FROM (
                     SELECT e.field_key, count(*) AS plays, max(e.score) AS best, max(e.total) AS total
                       FROM public.study_events e
                      WHERE e.student_id = x.student_id AND e.lesson_id = p_lesson_id AND e.kind = 'game'
                      GROUP BY e.field_key
                   ) g), '[]'::JSONB)
             ) AS row
        FROM (
          SELECT student_id, max(created_at) AS last_active
            FROM public.study_events WHERE lesson_id = p_lesson_id
           GROUP BY student_id
           ORDER BY max(created_at) DESC
           LIMIT 200
        ) x
        LEFT JOIN public.profiles p ON p.id = x.student_id
    ) s;

  RETURN jsonb_build_object(
    'questions', v_questions,
    'students', v_students,
    'gamesAreSelfReported', TRUE,
    'retentionMonths', 12);
END;
$$;
REVOKE ALL ON FUNCTION public.get_studio_lesson_results(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_studio_lesson_results(TEXT) TO authenticated;
