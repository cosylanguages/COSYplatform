-- Persist student answers with strict per-student row-level security.
-- This table is intentionally keyed by the lesson identifier used by the
-- classroom client (which may be a lesson file path, not lessons.id).
CREATE TABLE IF NOT EXISTS public.lesson_answers (
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  value TEXT,
  is_correct BOOLEAN,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, lesson_id, field_key)
);

-- Keep deployments that already created the table manually compatible.
ALTER TABLE public.lesson_answers ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.lesson_answers ADD COLUMN IF NOT EXISTS lesson_id TEXT;
ALTER TABLE public.lesson_answers ADD COLUMN IF NOT EXISTS field_key TEXT;
ALTER TABLE public.lesson_answers ADD COLUMN IF NOT EXISTS value TEXT;
ALTER TABLE public.lesson_answers ADD COLUMN IF NOT EXISTS is_correct BOOLEAN;
ALTER TABLE public.lesson_answers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS lesson_answers_student_lesson_field_uidx
  ON public.lesson_answers (student_id, lesson_id, field_key);

ALTER TABLE public.lesson_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students read own lesson answers" ON public.lesson_answers;
CREATE POLICY "Students read own lesson answers"
  ON public.lesson_answers FOR SELECT TO authenticated
  USING (student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Students insert own lesson answers" ON public.lesson_answers;
CREATE POLICY "Students insert own lesson answers"
  ON public.lesson_answers FOR INSERT TO authenticated
  WITH CHECK (student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Students update own lesson answers" ON public.lesson_answers;
CREATE POLICY "Students update own lesson answers"
  ON public.lesson_answers FOR UPDATE TO authenticated
  USING (student_id = (SELECT auth.uid()))
  WITH CHECK (student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Students delete own lesson answers" ON public.lesson_answers;
CREATE POLICY "Students delete own lesson answers"
  ON public.lesson_answers FOR DELETE TO authenticated
  USING (student_id = (SELECT auth.uid()));

REVOKE ALL ON public.lesson_answers FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_answers TO authenticated;
