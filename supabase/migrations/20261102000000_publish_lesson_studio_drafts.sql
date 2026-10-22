-- Publish Studio lessons through COSY's canonical lesson tables.
-- Drafts remain private; only sanitized student content is written to lesson_student_content.
ALTER TABLE public.lesson_studio_drafts
  ADD COLUMN IF NOT EXISTS published_lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_lesson_number INTEGER,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS lesson_studio_drafts_published_course_idx
  ON public.lesson_studio_drafts (published_course_id, published_lesson_number)
  WHERE published_at IS NOT NULL;

DROP POLICY IF EXISTS "Authorized authors read matching Studio courses" ON public.courses;
CREATE POLICY "Authorized authors read matching Studio courses"
  ON public.courses FOR SELECT TO authenticated
  USING (
    public.can_author_lessons()
    AND (
      public.is_founder()
      OR EXISTS (
        SELECT 1 FROM public.teacher_languages tl
        WHERE (tl.user_id = auth.uid() OR tl.teacher_id = auth.uid())
          AND lower(tl.language) = lower(courses.language)
      )
    )
  );

CREATE OR REPLACE FUNCTION public.publish_lesson_studio_draft(
  p_draft_id TEXT,
  p_course_id TEXT,
  p_lesson_number INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draft public.lesson_studio_drafts%ROWTYPE;
  v_course public.courses%ROWTYPE;
  v_doc JSONB;
  v_student_blocks JSONB := '[]'::JSONB;
  v_answers JSONB := '[]'::JSONB;
  v_block JSONB;
  v_student_doc JSONB;
  v_lesson_id TEXT;
  v_slug TEXT;
  v_summary TEXT;
BEGIN
  IF auth.uid() IS NULL OR NOT public.can_author_lessons(auth.uid()) THEN
    RAISE EXCEPTION 'You are not authorized to publish lessons.';
  END IF;
  IF p_lesson_number IS NULL OR p_lesson_number < 1 THEN
    RAISE EXCEPTION 'Lesson number must be a positive integer.';
  END IF;

  SELECT * INTO v_draft
  FROM public.lesson_studio_drafts
  WHERE id = p_draft_id
    AND (owner_id = auth.uid() OR public.is_founder())
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft not found or access denied.';
  END IF;
  IF v_draft.published_at IS NOT NULL THEN
    RAISE EXCEPTION 'This draft has already been published. Duplicate publishing is disabled.';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found or unavailable.';
  END IF;
  IF NOT public.is_founder() AND NOT EXISTS (
    SELECT 1 FROM public.teacher_languages tl
    WHERE (tl.user_id = auth.uid() OR tl.teacher_id = auth.uid())
      AND lower(tl.language) = lower(v_course.language)
  ) THEN
    RAISE EXCEPTION 'You are not authorized to publish to this course language.';
  END IF;

  v_doc := v_draft.document;
  IF jsonb_typeof(v_doc) <> 'object'
     OR v_doc->>'schemaVersion' <> '1'
     OR jsonb_typeof(v_doc->'blocks') <> 'array'
     OR coalesce(trim(v_doc->>'title'), '') = '' THEN
    RAISE EXCEPTION 'Draft document is invalid. Save a valid Studio lesson before publishing.';
  END IF;
  IF lower(coalesce(v_doc->>'language', '')) <> lower(v_course.language)
     OR upper(coalesce(v_doc->>'level', '')) <> upper(v_course.cefr) THEN
    RAISE EXCEPTION 'Lesson language and level must match the selected course (% / %).',
      v_course.language, v_course.cefr;
  END IF;

  FOR v_block IN SELECT value FROM jsonb_array_elements(v_doc->'blocks')
  LOOP
    IF jsonb_typeof(v_block) <> 'object' OR coalesce(v_block->>'id', '') = '' THEN
      RAISE EXCEPTION 'Every lesson block must have an id.';
    ELSIF v_block->>'type' = 'text' AND jsonb_typeof(v_block->'content') = 'string' THEN
      v_student_blocks := v_student_blocks || jsonb_build_array(v_block - 'answers');
    ELSIF v_block->>'type' = 'fill_blank'
      AND jsonb_typeof(v_block->'prompt') = 'string'
      AND jsonb_typeof(v_block->'answers') = 'array' THEN
      v_student_blocks := v_student_blocks || jsonb_build_array(v_block - 'answers');
      v_answers := v_answers || jsonb_build_array(jsonb_build_object(
        'id', v_block->>'id',
        'answers', v_block->'answers'
      ));
    ELSE
      RAISE EXCEPTION 'Unsupported or invalid lesson block type: %', coalesce(v_block->>'type', '(missing)');
    END IF;
  END LOOP;

  v_lesson_id := v_draft.id;
  v_slug := trim(both '-' from regexp_replace(lower(v_draft.title), '[^a-z0-9]+', '-', 'g'));
  IF v_slug = '' THEN v_slug := 'studio-lesson'; END IF;
  v_summary := 'Created with COSY Lesson Studio';

  v_student_doc := jsonb_build_object(
    'schemaVersion', 1,
    'title', v_draft.title,
    'language', v_draft.language,
    'level', v_draft.level,
    'blocks', v_student_blocks
  );

  INSERT INTO public.lessons (id, language, cefr, kind, slug, title, summary, updated_at)
  VALUES (v_lesson_id, v_course.language, v_course.cefr, 'lesson', v_slug, v_draft.title, v_summary, NOW());

  INSERT INTO public.lesson_student_content (lesson_id, body, updated_at)
  VALUES (v_lesson_id, v_student_doc::TEXT, NOW());

  INSERT INTO public.lesson_protected (lesson_id, kind, content)
  VALUES (v_lesson_id, 'answer-key', v_answers::TEXT);

  INSERT INTO public.course_lessons (
    course_id, lesson_id, placement_id, unit, section_number, lesson_number,
    is_optional, is_milestone, is_exam, teacher_led, status
  )
  VALUES (
    v_course.id, v_lesson_id, v_lesson_id, 'COSY Lesson Studio', 0, p_lesson_number,
    false, false, false, false, 'published'
  );

  UPDATE public.courses
  SET total_lessons = (SELECT count(*) FROM public.course_lessons WHERE course_id = v_course.id),
      updated_at = NOW()
  WHERE id = v_course.id;

  UPDATE public.lesson_studio_drafts
  SET published_lesson_id = v_lesson_id,
      published_course_id = v_course.id,
      published_lesson_number = p_lesson_number,
      published_at = NOW(),
      updated_at = NOW()
  WHERE id = v_draft.id;

  RETURN jsonb_build_object(
    'lesson_id', v_lesson_id,
    'course_id', v_course.id,
    'course_title', v_course.title,
    'lesson_number', p_lesson_number,
    'published_at', NOW()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.publish_lesson_studio_draft(TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_lesson_studio_draft(TEXT, TEXT, INTEGER) TO authenticated;
