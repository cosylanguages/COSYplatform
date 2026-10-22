-- Harden Studio publication: caller RLS, private author checks, safe preview view.
ALTER VIEW public.course_preview SET (security_invoker = true);

CREATE OR REPLACE FUNCTION public.can_author_lessons_for_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_founder(p_user_id) OR EXISTS (
    SELECT 1 FROM public.lesson_authors la WHERE la.user_id = p_user_id
  );
$$;
REVOKE ALL ON FUNCTION public.can_author_lessons_for_user(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_founder(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_teacher(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_student(UUID) FROM PUBLIC, anon, authenticated;

-- Drop policies before removing the old default-argument function overload.
DROP POLICY IF EXISTS "Authors read own Studio drafts" ON public.lesson_studio_drafts;
DROP POLICY IF EXISTS "Authorized authors create Studio drafts" ON public.lesson_studio_drafts;
DROP POLICY IF EXISTS "Authorized authors update Studio drafts" ON public.lesson_studio_drafts;
DROP POLICY IF EXISTS "Authorized authors delete Studio drafts" ON public.lesson_studio_drafts;

CREATE OR REPLACE FUNCTION public.publish_lesson_studio_draft(
  p_draft_id TEXT, p_course_id TEXT, p_lesson_number INTEGER
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_draft public.lesson_studio_drafts%ROWTYPE;
  v_course public.courses%ROWTYPE;
  v_lesson_id TEXT;
  v_student_body JSONB;
  v_protected_answers JSONB;
  v_slides JSONB := '[]'::JSONB;
  v_block JSONB;
  v_elements JSONB;
  v_block_index INTEGER := 0;
  v_slug TEXT;
BEGIN
  IF v_user_id IS NULL OR NOT public.can_author_lessons_for_user(v_user_id) THEN
    RAISE EXCEPTION 'You are not authorized to publish lessons.';
  END IF;
  IF p_lesson_number IS NULL OR p_lesson_number < 1 THEN
    RAISE EXCEPTION 'Lesson number must be a positive integer.';
  END IF;
  SELECT * INTO v_draft FROM public.lesson_studio_drafts
    WHERE id = p_draft_id AND (owner_id = v_user_id OR public.is_founder(v_user_id));
  IF NOT FOUND THEN RAISE EXCEPTION 'Draft not found or access denied.'; END IF;
  IF jsonb_typeof(v_draft.document) IS DISTINCT FROM 'object'
     OR v_draft.document->>'schemaVersion' IS DISTINCT FROM '1'
     OR jsonb_typeof(v_draft.document->'blocks') IS DISTINCT FROM 'array'
     OR NULLIF(trim(v_draft.document->>'title'), '') IS NULL THEN
    RAISE EXCEPTION 'Draft document is not a valid COSY Studio lesson.';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_draft.document->'blocks') AS block_rows(block_doc)
    WHERE jsonb_typeof(block_doc) IS DISTINCT FROM 'object'
       OR NULLIF(block_doc->>'id', '') IS NULL
       OR block_doc->>'type' NOT IN ('text', 'fill_blank')
       OR (block_doc->>'type' = 'text' AND jsonb_typeof(block_doc->'content') IS DISTINCT FROM 'string')
       OR (block_doc->>'type' = 'fill_blank' AND (
         jsonb_typeof(block_doc->'prompt') IS DISTINCT FROM 'string'
         OR jsonb_typeof(block_doc->'answers') IS DISTINCT FROM 'array'
         OR EXISTS (
           SELECT 1 FROM jsonb_array_elements(block_doc->'answers') AS answer_rows(answer_doc)
           WHERE jsonb_typeof(answer_doc) IS DISTINCT FROM 'string'
         )
       ))
  ) THEN
    RAISE EXCEPTION 'Draft contains an invalid or unsupported lesson block.';
  END IF;
  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Course not found.'; END IF;
  IF lower(CASE lower(v_course.language)
       WHEN 'english' THEN 'en' WHEN 'french' THEN 'fr'
       WHEN 'italian' THEN 'it' WHEN 'russian' THEN 'ru'
       WHEN 'greek' THEN 'el' WHEN 'spanish' THEN 'es'
       ELSE v_course.language END)
     <> lower(CASE lower(v_draft.language)
       WHEN 'english' THEN 'en' WHEN 'french' THEN 'fr'
       WHEN 'italian' THEN 'it' WHEN 'russian' THEN 'ru'
       WHEN 'greek' THEN 'el' WHEN 'spanish' THEN 'es'
       ELSE v_draft.language END)
     OR upper(v_course.cefr) <> upper(v_draft.level) THEN
    RAISE EXCEPTION 'Course language and level must match the lesson.';
  END IF;
  IF NOT public.is_founder(v_user_id) AND NOT EXISTS (
    SELECT 1 FROM public.teacher_languages tl
    WHERE (tl.user_id = v_user_id OR tl.teacher_id = v_user_id)
      AND lower(tl.language) = lower(CASE lower(v_course.language)
        WHEN 'english' THEN 'en' WHEN 'french' THEN 'fr'
        WHEN 'italian' THEN 'it' WHEN 'russian' THEN 'ru'
        WHEN 'greek' THEN 'el' WHEN 'spanish' THEN 'es'
        ELSE v_course.language END)
  ) THEN RAISE EXCEPTION 'You are not authorized to publish to this course.'; END IF;

  v_lesson_id := 'studio:' || regexp_replace(p_draft_id, '^studio:', '');
  v_slug := trim(both '-' from regexp_replace(lower(v_draft.title), '[^a-z0-9]+', '-', 'g'));
  IF v_slug = '' THEN v_slug := 'studio-lesson'; END IF;

  FOR v_block IN SELECT value FROM jsonb_array_elements(v_draft.document->'blocks')
  LOOP
    v_block_index := v_block_index + 1;
    IF v_block->>'type' = 'text' THEN
      v_elements := jsonb_build_array(jsonb_build_object('type','studio-text','content',v_block->>'content'));
    ELSIF v_block->>'type' = 'fill_blank' THEN
      v_elements := jsonb_build_array(
        jsonb_build_object('type','studio-prompt','content',v_block->>'prompt'),
        jsonb_build_object('type','studio-input','fieldKey',v_block->>'id',
          'placeholder','Type your answer...','label','Answer ' || v_block_index));
    ELSE RAISE EXCEPTION 'Unsupported lesson block type: %', v_block->>'type'; END IF;
    v_slides := v_slides || jsonb_build_array(jsonb_build_object(
      'id','slide-' || v_block_index,'title','Part ' || v_block_index,'stage','','elements',v_elements));
  END LOOP;

  v_student_body := jsonb_build_object('schemaVersion',1,'title',v_draft.title,'slides',v_slides);
  SELECT jsonb_build_object('schemaVersion',1,'answers',
    COALESCE(jsonb_agg(jsonb_build_object('blockId',b->>'id','acceptedAnswers',b->'answers')
      ) FILTER (WHERE b->>'type' = 'fill_blank'),'[]'::JSONB))
    INTO v_protected_answers
    FROM jsonb_array_elements(v_draft.document->'blocks') AS items(b);

  INSERT INTO public.lessons (id,language,cefr,kind,slug,title,summary)
  VALUES (v_lesson_id,v_draft.language,v_draft.level,'lesson',v_slug,v_draft.title,'Created in COSY Lesson Studio')
  ON CONFLICT (id) DO UPDATE SET language=EXCLUDED.language,cefr=EXCLUDED.cefr,
    kind=EXCLUDED.kind,slug=EXCLUDED.slug,title=EXCLUDED.title,summary=EXCLUDED.summary,updated_at=NOW();

  INSERT INTO public.lesson_student_content (lesson_id,body,updated_at)
  VALUES (v_lesson_id,v_student_body::TEXT,NOW())
  ON CONFLICT (lesson_id) DO UPDATE SET body=EXCLUDED.body,updated_at=NOW();

  DELETE FROM public.lesson_protected WHERE lesson_id=v_lesson_id AND kind='answer-key';
  INSERT INTO public.lesson_protected (lesson_id,kind,content)
  VALUES (v_lesson_id,'answer-key',v_protected_answers::TEXT);

  INSERT INTO public.course_lessons (course_id,lesson_id,placement_id,unit,section_number,lesson_number,
    is_optional,is_milestone,is_exam,teacher_led,status)
  VALUES (p_course_id,v_lesson_id,'studio:' || p_draft_id,'COSY Lesson Studio',0,p_lesson_number,
    false,false,false,false,'published')
  ON CONFLICT (course_id,placement_id) DO UPDATE SET lesson_id=EXCLUDED.lesson_id,
    unit=EXCLUDED.unit,section_number=EXCLUDED.section_number,lesson_number=EXCLUDED.lesson_number,status='published';

  UPDATE public.lesson_studio_drafts SET published_lesson_id=v_lesson_id,published_at=NOW(),updated_at=NOW()
    WHERE id=p_draft_id;
  RETURN v_lesson_id;
END;
$$;


REVOKE ALL ON FUNCTION public.publish_lesson_studio_draft(TEXT,TEXT,INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_lesson_studio_draft(TEXT,TEXT,INTEGER) TO authenticated;

DROP FUNCTION IF EXISTS public.can_author_lessons(UUID);

CREATE OR REPLACE FUNCTION public.can_author_lessons()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.can_author_lessons_for_user(auth.uid());
$$;
REVOKE ALL ON FUNCTION public.can_author_lessons() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_author_lessons() TO authenticated;

CREATE POLICY "Authors read own Studio drafts"
  ON public.lesson_studio_drafts FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_founder());

CREATE POLICY "Authorized authors create Studio drafts"
  ON public.lesson_studio_drafts FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.can_author_lessons());

CREATE POLICY "Authorized authors update Studio drafts"
  ON public.lesson_studio_drafts FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_founder())
  WITH CHECK ((owner_id = auth.uid() AND public.can_author_lessons()) OR public.is_founder());

CREATE POLICY "Authorized authors delete Studio drafts"
  ON public.lesson_studio_drafts FOR DELETE TO authenticated
  USING ((owner_id = auth.uid() AND public.can_author_lessons()) OR public.is_founder());
