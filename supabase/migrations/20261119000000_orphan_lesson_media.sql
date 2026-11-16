-- Find uploaded lesson media that nothing uses any more, so it can be cleaned up.
--
-- A file counts as unused when ALL are true:
--   * it is in the 'lesson-media' bucket and older than p_min_age_days (default 14, minimum 1),
--     so a file just uploaded into a draft that is not saved yet is not touched;
--   * no published lesson lists it (public.lesson_media_refs);
--   * no saved Studio draft mentions its path.
--
-- This function only LISTS. Deleting is done with the Storage API (scripts/cleanup_lesson_media.js),
-- because deleting rows from storage.objects in SQL would leave the stored files behind.
-- Callable by founders and by the service role only.
CREATE OR REPLACE FUNCTION public.list_orphan_lesson_media(p_min_age_days INTEGER DEFAULT 14)
RETURNS TABLE (name TEXT, size_bytes BIGINT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  IF NOT (public.is_founder() OR COALESCE(auth.role(), '') = 'service_role') THEN
    RAISE EXCEPTION 'Only founders can list unused media.' USING ERRCODE = '42501';
  END IF;
  IF p_min_age_days IS NULL OR p_min_age_days < 1 THEN
    RAISE EXCEPTION 'Minimum age must be at least 1 day.' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT o.name::TEXT,
         COALESCE((o.metadata->>'size')::BIGINT, 0),
         o.created_at
    FROM storage.objects o
   WHERE o.bucket_id = 'lesson-media'
     AND o.created_at < now() - make_interval(days => p_min_age_days)
     AND NOT EXISTS (SELECT 1 FROM public.lesson_media_refs r WHERE r.path = o.name)
     AND NOT EXISTS (SELECT 1 FROM public.lesson_studio_drafts d WHERE strpos(d.document::text, o.name) > 0)
   ORDER BY o.created_at;
END;
$$;
REVOKE ALL ON FUNCTION public.list_orphan_lesson_media(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_orphan_lesson_media(INTEGER) TO authenticated, service_role;
