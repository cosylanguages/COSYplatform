-- Respect the legacy grant validity window for canonical and Studio lesson access.
ALTER TABLE public.access_grants ADD COLUMN IF NOT EXISTS valid_from DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.access_grants ADD COLUMN IF NOT EXISTS valid_until DATE;

CREATE OR REPLACE FUNCTION public.can_read_published_studio_lesson(p_lesson_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_lessons cl
    JOIN public.courses c ON c.id = cl.course_id
    WHERE cl.lesson_id = p_lesson_id
      AND cl.status = 'published'
      AND (
        public.is_founder()
        OR (public.is_teacher() AND EXISTS (
          SELECT 1 FROM public.teacher_languages tl
          WHERE (tl.user_id = auth.uid() OR tl.teacher_id = auth.uid())
            AND lower(tl.language) = lower(CASE lower(c.language)
          WHEN 'english' THEN 'en' WHEN 'french' THEN 'fr'
          WHEN 'italian' THEN 'it' WHEN 'russian' THEN 'ru'
          WHEN 'greek' THEN 'el' WHEN 'spanish' THEN 'es'
          ELSE c.language END)
        ))
        OR (public.is_student() AND EXISTS (
          SELECT 1 FROM public.access_grants ag
          WHERE (ag.user_id = auth.uid() OR ag.student_id = auth.uid())
            AND (ag.course_id = c.id OR ag.course = c.id)
            AND ag.valid_from <= CURRENT_DATE
            AND (ag.valid_until IS NULL OR ag.valid_until >= CURRENT_DATE)
            AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
        ))
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.list_published_studio_lessons(p_course_id TEXT)
RETURNS TABLE (lesson_id TEXT, title TEXT, lesson_number INTEGER, unit TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT l.id, l.title, cl.lesson_number, cl.unit
  FROM public.course_lessons cl
  JOIN public.lessons l ON l.id = cl.lesson_id
  JOIN public.courses c ON c.id = cl.course_id
  WHERE cl.course_id = p_course_id
    AND cl.status = 'published'
    AND cl.lesson_id LIKE 'studio:%'
    AND (
      public.is_founder()
      OR (public.is_teacher() AND EXISTS (
        SELECT 1 FROM public.teacher_languages tl
        WHERE (tl.user_id = auth.uid() OR tl.teacher_id = auth.uid())
          AND lower(tl.language) = lower(CASE lower(c.language)
          WHEN 'english' THEN 'en' WHEN 'french' THEN 'fr'
          WHEN 'italian' THEN 'it' WHEN 'russian' THEN 'ru'
          WHEN 'greek' THEN 'el' WHEN 'spanish' THEN 'es'
          ELSE c.language END)
      ))
      OR (public.is_student() AND EXISTS (
        SELECT 1 FROM public.access_grants ag
        WHERE (ag.user_id = auth.uid() OR ag.student_id = auth.uid())
          AND (ag.course_id = c.id OR ag.course = c.id)
          AND ag.valid_from <= CURRENT_DATE
          AND (ag.valid_until IS NULL OR ag.valid_until >= CURRENT_DATE)
          AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
      ))
    )
  ORDER BY cl.lesson_number;
$$;

DROP POLICY IF EXISTS "Student read lessons metadata for granted courses and levels" ON public.lessons;
CREATE POLICY "Student read lessons metadata for granted courses and levels"
ON public.lessons FOR SELECT
USING (
    public.is_student() AND EXISTS (
        SELECT 1 FROM public.access_grants ag
        JOIN public.courses c ON (c.id = ag.course_id OR c.id = ag.course)
        JOIN public.course_lessons cl ON cl.course_id = c.id
        WHERE (ag.user_id = auth.uid() OR ag.student_id = auth.uid())
          AND ag.valid_from <= CURRENT_DATE
          AND (ag.valid_until IS NULL OR ag.valid_until >= CURRENT_DATE)
          AND cl.lesson_id = lessons.id
          AND c.language = lessons.language
          AND c.cefr = lessons.cefr
          AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    )
);

DROP POLICY IF EXISTS "Student read student content for granted courses and level isolation" ON public.lesson_student_content;
CREATE POLICY "Student read student content for granted courses and level isolation"
ON public.lesson_student_content FOR SELECT
USING (
    public.is_student() AND EXISTS (
        SELECT 1 FROM public.access_grants ag
        JOIN public.courses c ON (c.id = ag.course_id OR c.id = ag.course)
        JOIN public.course_lessons cl ON cl.course_id = c.id
        JOIN public.lessons l ON l.id = lesson_student_content.lesson_id
        WHERE (ag.user_id = auth.uid() OR ag.student_id = auth.uid())
          AND ag.valid_from <= CURRENT_DATE
          AND (ag.valid_until IS NULL OR ag.valid_until >= CURRENT_DATE)
          AND cl.lesson_id = lesson_student_content.lesson_id
          AND c.language = l.language
          AND c.cefr = l.cefr
          AND l.kind IN ('lesson', 'workbook')
          AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    )
);
