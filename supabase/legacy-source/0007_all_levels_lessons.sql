-- Allow lessons with level 'all' or '*' to be readable across all course levels.
DROP POLICY IF EXISTS "Teachers and founders read entitled lesson content"
  ON public.lesson_content;

CREATE POLICY "Teachers and founders read entitled lesson content"
  ON public.lesson_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'founder'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'teacher'
        AND (
          '*' = ANY(p.language_access)
          OR public.lesson_content.language = ANY(p.language_access)
          OR p.language_access IS NULL
        )
        AND (
          p.course_level IS NULL
          OR p.course_level = '*'
          OR LOWER(p.course_level) = LOWER(public.lesson_content.level)
          OR LOWER(public.lesson_content.level) IN ('all', '*')
        )
    )
  );

DROP POLICY IF EXISTS "Users read entitled student-safe lesson content"
  ON public.student_lesson_content;

CREATE POLICY "Users read entitled student-safe lesson content"
  ON public.student_lesson_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'founder'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('teacher', 'student')
        AND (
          '*' = ANY(p.language_access)
          OR public.student_lesson_content.language = ANY(p.language_access)
          OR p.language_access IS NULL
        )
        AND (
          p.course_level IS NULL
          OR p.course_level = '*'
          OR LOWER(p.course_level) = LOWER(public.student_lesson_content.level)
          OR LOWER(public.student_lesson_content.level) IN ('all', '*')
        )
    )
  );
