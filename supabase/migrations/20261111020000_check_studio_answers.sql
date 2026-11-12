-- Answer checking for Lesson Studio lessons.
-- Students send what they typed/picked; the server answers true/false per field.
-- The answer key itself is never returned. Access mirrors who may read the lesson:
-- founders, teachers of the lesson's language, and students with a valid grant to a
-- course containing the lesson (same predicates as the lesson_student_content and
-- lesson_protected policies in 20261030000000).

-- Forgiving comparison: case, repeated spaces, curly apostrophes and trailing
-- . ! ? … are ignored. Everything else (including accents) must match.
CREATE OR REPLACE FUNCTION public.studio_normalize_answer(p_text TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $f$
  SELECT trim(both ' ' FROM regexp_replace(
           regexp_replace(lower(translate(coalesce(p_text, ''), E'’‘´`', '''''''')), '\s+', ' ', 'g'),
           '[.!?…]+\s*$', ''))
$f$;

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

  v_allowed := public.is_founder()
    OR EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.teacher_languages tl ON tl.language = l.language
      WHERE l.id = p_lesson_id AND public.is_teacher()
        AND (tl.user_id = v_uid OR tl.teacher_id = v_uid)
    )
    OR (public.is_student() AND EXISTS (
      SELECT 1 FROM public.access_grants ag
      JOIN public.courses c ON (c.id = ag.course_id OR c.id = ag.course)
      JOIN public.course_lessons cl ON cl.course_id = c.id
      JOIN public.lessons l ON l.id = p_lesson_id
      WHERE (ag.user_id = v_uid OR ag.student_id = v_uid)
        AND ag.valid_from <= CURRENT_DATE
        AND (ag.valid_until IS NULL OR ag.valid_until >= CURRENT_DATE)
        AND cl.lesson_id = p_lesson_id
        AND c.language = l.language
        AND c.cefr = l.cefr
        AND l.kind IN ('lesson', 'workbook')
        AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    ));
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
  RETURN COALESCE((
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
END;
$$;

REVOKE ALL ON FUNCTION public.studio_normalize_answer(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.check_studio_answers(TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_studio_answers(TEXT, JSONB) TO authenticated;
