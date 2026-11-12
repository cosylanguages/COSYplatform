-- Lesson media: pictures, audio, video and PDFs for Lesson Studio lessons.
--
-- * Private bucket 'lesson-media'. Nothing is public; students get short-lived signed
--   links, and only for files used by a lesson they may already read.
-- * Authors (founders and teachers, public.can_author_lessons()) upload into their own
--   folder: <their user id>/<uuid>.<ext>. They can replace/delete only their own files
--   (founders: any).
-- * No SVG (it can carry script) and no HTML. Bucket-level size and type limits apply on
--   top of the checks in the Studio.
-- * public.lesson_media_refs records which files a published lesson uses; it is what lets
--   a student read exactly those files, nothing else.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-media', 'lesson-media', false, 52428800,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif',
        'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/webm', 'audio/wav', 'audio/x-wav',
        'video/mp4', 'video/webm',
        'application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS public.lesson_media_refs (
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  PRIMARY KEY (lesson_id, path)
);
CREATE INDEX IF NOT EXISTS lesson_media_refs_path_idx ON public.lesson_media_refs (path);

-- Written only by publish_lesson_studio_draft (SECURITY DEFINER); no direct access.
ALTER TABLE public.lesson_media_refs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lesson_media_refs FROM PUBLIC, anon, authenticated;

-- Who may read a stored file: its author (or a founder), or anyone who may read a
-- published lesson that uses it. Other teachers' unpublished uploads stay private.
CREATE OR REPLACE FUNCTION public.can_read_lesson_media(p_path TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, storage
AS $$
  SELECT (public.can_author_lessons()
          AND ((storage.foldername(p_path))[1] = auth.uid()::text OR public.is_founder()))
      OR EXISTS (
        SELECT 1 FROM public.lesson_media_refs r
        WHERE r.path = p_path
          AND public.can_read_published_studio_lesson(r.lesson_id)
      );
$$;
REVOKE ALL ON FUNCTION public.can_read_lesson_media(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_read_lesson_media(TEXT) TO authenticated;

DROP POLICY IF EXISTS "Authors upload lesson media to their folder" ON storage.objects;
CREATE POLICY "Authors upload lesson media to their folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lesson-media'
    AND public.can_author_lessons()
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Read lesson media you are entitled to" ON storage.objects;
CREATE POLICY "Read lesson media you are entitled to"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lesson-media' AND public.can_read_lesson_media(name));

DROP POLICY IF EXISTS "Authors replace their own lesson media" ON storage.objects;
CREATE POLICY "Authors replace their own lesson media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'lesson-media' AND public.can_author_lessons()
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_founder())
  )
  WITH CHECK (
    bucket_id = 'lesson-media' AND public.can_author_lessons()
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_founder())
  );

DROP POLICY IF EXISTS "Authors delete their own lesson media" ON storage.objects;
CREATE POLICY "Authors delete their own lesson media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'lesson-media' AND public.can_author_lessons()
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_founder())
  );
