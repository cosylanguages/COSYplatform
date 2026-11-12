-- Restrict lesson answer persistence to student accounts as well as to each
-- student's own rows. Frontend role checks are not an authorization boundary.
DROP POLICY IF EXISTS "Students read own lesson answers" ON public.lesson_answers;
CREATE POLICY "Students read own lesson answers"
  ON public.lesson_answers FOR SELECT TO authenticated
  USING (public.is_student() AND student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Students insert own lesson answers" ON public.lesson_answers;
CREATE POLICY "Students insert own lesson answers"
  ON public.lesson_answers FOR INSERT TO authenticated
  WITH CHECK (public.is_student() AND student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Students update own lesson answers" ON public.lesson_answers;
CREATE POLICY "Students update own lesson answers"
  ON public.lesson_answers FOR UPDATE TO authenticated
  USING (public.is_student() AND student_id = (SELECT auth.uid()))
  WITH CHECK (public.is_student() AND student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Students delete own lesson answers" ON public.lesson_answers;
CREATE POLICY "Students delete own lesson answers"
  ON public.lesson_answers FOR DELETE TO authenticated
  USING (public.is_student() AND student_id = (SELECT auth.uid()));
