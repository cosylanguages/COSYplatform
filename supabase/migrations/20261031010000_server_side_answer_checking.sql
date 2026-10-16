-- Server-side exercise answer checking.
--
-- The student-facing lesson body must not contain correct-answer metadata.
-- Store answer keys as JSON in lesson_protected.content, for example:
--   {"q1":"hello","q2":["good morning","morning"]}
-- This RPC returns only a boolean; it never returns the protected key.
CREATE OR REPLACE FUNCTION public.check_lesson_answer(
  p_lesson_id TEXT,
  p_field_key TEXT,
  p_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  answer_doc JSONB;
  expected JSONB;
  expected_value TEXT;
  submitted TEXT;
  is_authorized BOOLEAN;
  resolved_lesson_id TEXT;
  candidate_count INTEGER;
  lesson_slug TEXT;
BEGIN
  -- Fail closed for unauthenticated users and malformed requests.
  IF auth.uid() IS NULL
     OR p_lesson_id IS NULL OR length(p_lesson_id) > 256
     OR p_field_key IS NULL OR length(p_field_key) > 128
     OR p_value IS NULL OR length(p_value) > 4000 THEN
    RETURN FALSE;
  END IF;

  -- Only students with an active grant for the course containing this lesson
  -- may submit checks. Do not trust a client-supplied student ID or role.
  -- The classroom passes roadmap paths (e.g. lessons/course/slug.json),
  -- while protected tables use canonical lesson IDs. Resolve only a unique,
  -- RLS-eligible lesson matching either exact ID or slug.
  lesson_slug := regexp_replace(
    split_part(p_lesson_id, '/', array_length(string_to_array(p_lesson_id, '/'), 1)),
    E'\\\\.(json|xml)$',
    '',
    'i'
  );

  SELECT count(DISTINCT l.id)::INTEGER, min(l.id)
    INTO candidate_count, resolved_lesson_id
  FROM public.profiles p
  JOIN public.access_grants ag
    ON (ag.user_id = p.id OR ag.student_id = p.id)
  JOIN public.courses c ON c.id = COALESCE(ag.course_id, ag.course)
  JOIN public.course_lessons cl ON cl.course_id = c.id
  JOIN public.lessons l ON l.id = cl.lesson_id
  WHERE p.id = auth.uid()
    AND p.role = 'student'
    AND (l.id = p_lesson_id OR l.slug = lesson_slug)
    AND l.kind IN ('lesson', 'workbook')
    AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    AND (p.language_access = '{}' OR '*' = ANY(p.language_access) OR l.language = ANY(p.language_access))
    AND (p.course_level = '*' OR lower(p.course_level) = lower(l.cefr));

  IF COALESCE(candidate_count, 0) <> 1 OR resolved_lesson_id IS NULL THEN
    RETURN FALSE;
  END IF;

  submitted := lower(regexp_replace(btrim(p_value), '[[:space:]]+', ' ', 'g'));
  submitted := replace(replace(replace(submitted, '’', ''''), '‘', ''''), 'ʼ', '''');

  -- Answer-key documents are protected rows and are never returned to the caller.
  FOR answer_doc IN
    SELECT lp.content::jsonb
    FROM public.lesson_protected lp
    WHERE lp.lesson_id = resolved_lesson_id
      AND lp.kind = 'answer-key'
  LOOP
    expected := answer_doc -> p_field_key;
    IF expected IS NULL THEN
      CONTINUE;
    END IF;

    IF jsonb_typeof(expected) = 'array' THEN
      FOR expected_value IN SELECT jsonb_array_elements_text(expected)
      LOOP
        IF EXISTS (
          SELECT 1
          FROM regexp_split_to_table(expected_value, '[[:space:]]*[/|][[:space:]]*') AS alt(value)
          WHERE lower(regexp_replace(btrim(alt.value), '[[:space:]]+', ' ', 'g')) = submitted
        ) THEN
          RETURN TRUE;
        END IF;
      END LOOP;
    ELSIF jsonb_typeof(expected) = 'string' THEN
      expected_value := expected #>> '{}';
      IF EXISTS (
        SELECT 1
        FROM regexp_split_to_table(expected_value, '[[:space:]]*[/|][[:space:]]*') AS alt(value)
        WHERE lower(regexp_replace(btrim(alt.value), '[[:space:]]+', ' ', 'g')) = submitted
      ) THEN
        RETURN TRUE;
      END IF;
    END IF;
  END LOOP;

  RETURN FALSE;
EXCEPTION
  WHEN invalid_text_representation THEN
    -- A malformed protected key must not leak details or cause an answer reveal.
    RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.check_lesson_answer(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_lesson_answer(TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.check_lesson_answer(TEXT, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.check_lesson_answer(TEXT, TEXT, TEXT) IS
  'Checks a student answer against protected JSON answer keys and returns only a boolean. Student lesson content must not embed answer keys.';
,
    '',
    'i'
  );

  SELECT count(DISTINCT l.id)::INTEGER, min(l.id)
    INTO candidate_count, resolved_lesson_id
  FROM public.profiles p
  JOIN public.access_grants ag
    ON (ag.user_id = p.id OR ag.student_id = p.id)
  JOIN public.courses c ON c.id = COALESCE(ag.course_id, ag.course)
  JOIN public.course_lessons cl ON cl.course_id = c.id
  JOIN public.lessons l ON l.id = cl.lesson_id
  WHERE p.id = auth.uid()
    AND p.role = 'student'
    AND (l.id = p_lesson_id OR l.slug = lesson_slug)
    AND l.kind IN ('lesson', 'workbook')
    AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    AND (p.language_access = '{}' OR '*' = ANY(p.language_access) OR l.language = ANY(p.language_access))
    AND (p.course_level = '*' OR lower(p.course_level) = lower(l.cefr));

  IF COALESCE(candidate_count, 0) <> 1 OR resolved_lesson_id IS NULL THEN
    RETURN FALSE;
  END IF;

  submitted := lower(regexp_replace(btrim(p_value), '[[:space:]]+', ' ', 'g'));
  submitted := replace(replace(replace(submitted, '’', ''''), '‘', ''''), 'ʼ', '''');

  -- Answer-key documents are protected rows and are never returned to the caller.
  FOR answer_doc IN
    SELECT lp.content::jsonb
    FROM public.lesson_protected lp
    WHERE lp.lesson_id = resolved_lesson_id
      AND lp.kind = 'answer-key'
  LOOP
    expected := answer_doc -> p_field_key;
    IF expected IS NULL THEN
      CONTINUE;
    END IF;

    IF jsonb_typeof(expected) = 'array' THEN
      FOR expected_value IN SELECT jsonb_array_elements_text(expected)
      LOOP
        IF EXISTS (
          SELECT 1
          FROM regexp_split_to_table(expected_value, '[[:space:]]*[/|][[:space:]]*') AS alt(value)
          WHERE lower(regexp_replace(btrim(alt.value), '[[:space:]]+', ' ', 'g')) = submitted
        ) THEN
          RETURN TRUE;
        END IF;
      END LOOP;
    ELSIF jsonb_typeof(expected) = 'string' THEN
      expected_value := expected #>> '{}';
      IF EXISTS (
        SELECT 1
        FROM regexp_split_to_table(expected_value, '[[:space:]]*[/|][[:space:]]*') AS alt(value)
        WHERE lower(regexp_replace(btrim(alt.value), '[[:space:]]+', ' ', 'g')) = submitted
      ) THEN
        RETURN TRUE;
      END IF;
    END IF;
  END LOOP;

  RETURN FALSE;
EXCEPTION
  WHEN invalid_text_representation THEN
    -- A malformed protected key must not leak details or cause an answer reveal.
    RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.check_lesson_answer(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_lesson_answer(TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.check_lesson_answer(TEXT, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.check_lesson_answer(TEXT, TEXT, TEXT) IS
  'Checks a student answer against protected JSON answer keys and returns only a boolean. Student lesson content must not embed answer keys.';
