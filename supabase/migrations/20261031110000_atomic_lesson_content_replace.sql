-- Atomically replace a lesson's sanitized student body and its protected
-- records. This prevents a failed ingestion from leaving new student content
-- paired with stale or missing answer keys.
CREATE OR REPLACE FUNCTION public.replace_lesson_content(
  p_lesson_id TEXT,
  p_body TEXT,
  p_protected JSONB DEFAULT '[]'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  protected_item JSONB;
  item_kind TEXT;
  item_content TEXT;
BEGIN
  IF p_lesson_id IS NULL OR btrim(p_lesson_id) = ''
     OR p_body IS NULL OR btrim(p_body) = '' THEN
    RAISE EXCEPTION 'lesson id and sanitized student body are required';
  END IF;

  IF p_protected IS NULL OR jsonb_typeof(p_protected) NOT IN ('array', 'null') THEN
    RAISE EXCEPTION 'protected content must be a JSON array';
  END IF;

  INSERT INTO public.lesson_student_content (lesson_id, body, updated_at)
  VALUES (p_lesson_id, p_body, NOW())
  ON CONFLICT (lesson_id) DO UPDATE
    SET body = EXCLUDED.body, updated_at = NOW();

  DELETE FROM public.lesson_protected WHERE lesson_id = p_lesson_id;

  FOR protected_item IN
    SELECT entry.value
    FROM jsonb_array_elements(COALESCE(NULLIF(p_protected, 'null'::jsonb), '[]'::jsonb)) AS entry(value)
  LOOP
    item_kind := protected_item ->> 'kind';
    item_content := protected_item ->> 'content';

    IF item_kind NOT IN ('answer-key', 'teacher-notes')
       OR item_content IS NULL OR btrim(item_content) = '' THEN
      RAISE EXCEPTION 'invalid protected content record for lesson %', p_lesson_id;
    END IF;

    INSERT INTO public.lesson_protected (lesson_id, kind, content)
    VALUES (p_lesson_id, item_kind, item_content);
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.replace_lesson_content(TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.replace_lesson_content(TEXT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.replace_lesson_content(TEXT, TEXT, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.replace_lesson_content(TEXT, TEXT, JSONB) TO service_role;

COMMENT ON FUNCTION public.replace_lesson_content(TEXT, TEXT, JSONB) IS
  'Atomically replaces one sanitized student lesson body and its protected answer/teacher-note records. Service-role only.';
