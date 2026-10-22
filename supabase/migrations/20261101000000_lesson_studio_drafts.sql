-- COSY Lesson Studio drafts are isolated from published/legacy lesson content.
-- This table is intentionally not used by the student lesson renderer.
CREATE TABLE IF NOT EXISTS public.lesson_studio_drafts (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  document JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lesson_studio_drafts_owner_updated_idx
  ON public.lesson_studio_drafts (owner_id, updated_at DESC);

ALTER TABLE public.lesson_studio_drafts ENABLE ROW LEVEL SECURITY;

-- Match the existing COSY authoring rule: founder or a user explicitly listed in lesson_authors.
CREATE OR REPLACE FUNCTION public.can_author_lessons_for_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $
  SELECT public.is_founder(p_user_id) OR EXISTS (
    SELECT 1 FROM public.lesson_authors la WHERE la.user_id = p_user_id
  );
$;

REVOKE ALL ON FUNCTION public.can_author_lessons_for_user(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.can_author_lessons()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $
  SELECT public.can_author_lessons_for_user(auth.uid());
$;

DROP POLICY IF EXISTS "Authors read own Studio drafts" ON public.lesson_studio_drafts;
CREATE POLICY "Authors read own Studio drafts"
  ON public.lesson_studio_drafts FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_founder());

DROP POLICY IF EXISTS "Authorized authors create Studio drafts" ON public.lesson_studio_drafts;
CREATE POLICY "Authorized authors create Studio drafts"
  ON public.lesson_studio_drafts FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.can_author_lessons());

DROP POLICY IF EXISTS "Authorized authors update Studio drafts" ON public.lesson_studio_drafts;
CREATE POLICY "Authorized authors update Studio drafts"
  ON public.lesson_studio_drafts FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_founder())
  WITH CHECK (owner_id = auth.uid() AND public.can_author_lessons());

DROP POLICY IF EXISTS "Authorized authors delete Studio drafts" ON public.lesson_studio_drafts;
CREATE POLICY "Authorized authors delete Studio drafts"
  ON public.lesson_studio_drafts FOR DELETE TO authenticated
  USING ((owner_id = auth.uid() AND public.can_author_lessons()) OR public.is_founder());

REVOKE ALL ON public.lesson_studio_drafts FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_studio_drafts TO authenticated;
REVOKE ALL ON FUNCTION public.can_author_lessons() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_author_lessons() TO authenticated;
