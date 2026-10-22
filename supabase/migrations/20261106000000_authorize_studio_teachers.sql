-- Align Lesson Studio author checks with the canonical profiles role model.
-- The repository's clean-install migrations do not define lesson_authors.
CREATE OR REPLACE FUNCTION public.can_author_lessons_for_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_founder(p_user_id) OR public.is_teacher(p_user_id);
$$;

REVOKE ALL ON FUNCTION public.can_author_lessons_for_user(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.can_author_lessons()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.can_author_lessons_for_user(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.can_author_lessons() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_author_lessons() TO authenticated;
