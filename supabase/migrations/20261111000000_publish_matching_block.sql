-- Publish the Lesson Studio "matching" block.
-- A matching block is { id, type: 'matching', instructions?, pairs: [{ left, right }] }.
-- Students get one prompt per left item plus an input, and the right-hand items
-- as a shuffled bank in the instructions. The pairing itself (which right goes
-- with which left) goes to lesson_protected, never to students.
-- Same signature, grants and authorization checks as 20261108000000.

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
       OR block_doc->>'type' NOT IN ('text', 'fill_blank', 'vocab_list', 'quiz', 'discussion', 'essay', 'correction', 'matching')
       OR (block_doc->>'type' = 'text' AND jsonb_typeof(block_doc->'content') IS DISTINCT FROM 'string')
       OR (block_doc->>'type' = 'fill_blank' AND (
         jsonb_typeof(block_doc->'prompt') IS DISTINCT FROM 'string'
         OR jsonb_typeof(block_doc->'answers') IS DISTINCT FROM 'array'
         OR EXISTS (
           SELECT 1 FROM jsonb_array_elements(block_doc->'answers') AS answer_rows(answer_doc)
           WHERE jsonb_typeof(answer_doc) IS DISTINCT FROM 'string'
         )
       ))
       OR (block_doc->>'type' = 'vocab_list' AND (
         jsonb_typeof(block_doc->'items') IS DISTINCT FROM 'array'
         OR EXISTS (
           SELECT 1 FROM jsonb_array_elements(block_doc->'items') AS item_rows(item_doc)
           WHERE jsonb_typeof(item_doc) IS DISTINCT FROM 'object'
              OR jsonb_typeof(item_doc->'word') IS DISTINCT FROM 'string'
         )
       ))
       OR (block_doc->>'type' = 'quiz' AND (
         jsonb_typeof(block_doc->'question') IS DISTINCT FROM 'string'
         OR jsonb_typeof(block_doc->'options') IS DISTINCT FROM 'array'
         OR jsonb_typeof(block_doc->'answer') IS DISTINCT FROM 'string'
         OR EXISTS (
           SELECT 1 FROM jsonb_array_elements(block_doc->'options') AS option_rows(option_doc)
           WHERE jsonb_typeof(option_doc) IS DISTINCT FROM 'string'
         )
         OR NOT ((block_doc->'options') @> jsonb_build_array(block_doc->>'answer'))
       ))
       OR (block_doc->>'type' = 'discussion' AND (
         jsonb_typeof(block_doc->'prompts') IS DISTINCT FROM 'array'
         OR EXISTS (
           SELECT 1 FROM jsonb_array_elements(block_doc->'prompts') AS prompt_rows(prompt_doc)
           WHERE jsonb_typeof(prompt_doc) IS DISTINCT FROM 'string'
         )
       ))
       OR (block_doc->>'type' = 'essay' AND jsonb_typeof(block_doc->'prompt') IS DISTINCT FROM 'string')
       OR (block_doc->>'type' = 'matching' AND CASE
         WHEN jsonb_typeof(block_doc->'pairs') = 'array' THEN (
           jsonb_array_length(block_doc->'pairs') < 2
           OR EXISTS (
             SELECT 1 FROM jsonb_array_elements(block_doc->'pairs') AS pair_rows(pair_doc)
             WHERE jsonb_typeof(pair_doc) IS DISTINCT FROM 'object'
                OR jsonb_typeof(pair_doc->'left') IS DISTINCT FROM 'string'
                OR jsonb_typeof(pair_doc->'right') IS DISTINCT FROM 'string'
                OR NULLIF(trim(pair_doc->>'left'), '') IS NULL
                OR NULLIF(trim(pair_doc->>'right'), '') IS NULL
           )
           -- Right-hand items must be distinct, or the pairing is ambiguous.
           OR (SELECT count(DISTINCT lower(trim(p->>'right'))) FROM jsonb_array_elements(block_doc->'pairs') AS p)
              <> jsonb_array_length(block_doc->'pairs')
         )
         ELSE TRUE
       END)
       OR (block_doc->>'type' = 'correction' AND (
         jsonb_typeof(block_doc->'pairs') IS DISTINCT FROM 'array'
         OR EXISTS (
           SELECT 1 FROM jsonb_array_elements(block_doc->'pairs') AS pair_rows(pair_doc)
           WHERE jsonb_typeof(pair_doc) IS DISTINCT FROM 'object'
              OR jsonb_typeof(pair_doc->'incorrect') IS DISTINCT FROM 'string'
              OR jsonb_typeof(pair_doc->'correct') IS DISTINCT FROM 'string'
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
    ELSIF v_block->>'type' = 'vocab_list' THEN
      -- Only whitelisted fields reach students; any extra field stays in the draft.
      v_elements := jsonb_build_array(jsonb_build_object('type','vocab-cards','items',
        COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'word', i->>'word', 'definition', COALESCE(i->>'definition',''), 'example', COALESCE(i->>'example','')))
          FROM jsonb_array_elements(v_block->'items') AS items(i)), '[]'::JSONB)));
    ELSIF v_block->>'type' = 'quiz' THEN
      -- Options only. The correct answer goes to lesson_protected, never to students.
      v_elements := jsonb_build_array(jsonb_build_object('type','quiz','fieldKey',v_block->>'id',
        'question',v_block->>'question','options',v_block->'options'));
    ELSIF v_block->>'type' = 'discussion' THEN
      v_elements := jsonb_build_array(jsonb_build_object('type','discussion-prompts','prompts',v_block->'prompts'));
    ELSIF v_block->>'type' = 'essay' THEN
      v_elements := jsonb_build_array(
        jsonb_build_object('type','studio-prompt','content',v_block->>'prompt'),
        jsonb_build_object('type','essay'));
    ELSIF v_block->>'type' = 'correction' THEN
      -- Students see the incorrect sentence and type the fix; the fix is protected.
      v_elements := COALESCE((SELECT jsonb_agg(el ORDER BY ord, sub)
        FROM jsonb_array_elements(v_block->'pairs') WITH ORDINALITY AS pairs(pair, ord),
        LATERAL (VALUES
          (1, jsonb_build_object('type','studio-prompt','content',pair->>'incorrect')),
          (2, jsonb_build_object('type','studio-input','fieldKey',(v_block->>'id') || '-' || ord,
              'placeholder','Type the corrected sentence...','label','Correction ' || ord))
        ) AS parts(sub, el)), '[]'::JSONB);
    ELSIF v_block->>'type' = 'matching' THEN
      -- Instructions plus a deterministic shuffled bank of the right-hand items,
      -- then one prompt + input per left item. Pairings stay in the draft/protected key.
      v_elements := jsonb_build_array(jsonb_build_object('type','studio-prompt','content',
        COALESCE(NULLIF(trim(v_block->>'instructions'),''), 'Match each item with its pair.')
        || E'\n\nChoose from: '
        || (SELECT string_agg(p->>'right', ' · ' ORDER BY md5((v_block->>'id') || (p->>'right')))
              FROM jsonb_array_elements(v_block->'pairs') AS p)))
        || COALESCE((SELECT jsonb_agg(el ORDER BY ord, sub)
          FROM jsonb_array_elements(v_block->'pairs') WITH ORDINALITY AS pairs(pair, ord),
          LATERAL (VALUES
            (1, jsonb_build_object('type','studio-prompt','content',pair->>'left')),
            (2, jsonb_build_object('type','studio-input','fieldKey',(v_block->>'id') || '-' || ord,
                'placeholder','Type the matching item...','label','Match ' || ord))
          ) AS parts(sub, el)), '[]'::JSONB);
    ELSE RAISE EXCEPTION 'Unsupported lesson block type: %', v_block->>'type'; END IF;
    v_slides := v_slides || jsonb_build_array(jsonb_build_object(
      'id','slide-' || v_block_index,'title','Part ' || v_block_index,'stage','','elements',v_elements));
  END LOOP;

  v_student_body := jsonb_build_object('schemaVersion',1,'title',v_draft.title,'slides',v_slides);
  SELECT jsonb_build_object('schemaVersion',1,'answers',COALESCE(jsonb_agg(entry),'[]'::JSONB))
    INTO v_protected_answers
    FROM (
      SELECT jsonb_build_object('blockId',b->>'id','acceptedAnswers',b->'answers') AS entry
        FROM jsonb_array_elements(v_draft.document->'blocks') AS items(b)
        WHERE b->>'type' = 'fill_blank'
      UNION ALL
      SELECT jsonb_build_object('blockId',b->>'id','acceptedAnswers',jsonb_build_array(b->>'answer'))
        FROM jsonb_array_elements(v_draft.document->'blocks') AS items(b)
        WHERE b->>'type' = 'quiz'
      UNION ALL
      SELECT jsonb_build_object('blockId',(b->>'id') || '-' || ord,'acceptedAnswers',jsonb_build_array(pair->>'correct'))
        FROM jsonb_array_elements(v_draft.document->'blocks') AS items(b),
             jsonb_array_elements(b->'pairs') WITH ORDINALITY AS pairs(pair, ord)
        WHERE b->>'type' = 'correction'
      UNION ALL
      SELECT jsonb_build_object('blockId',(b->>'id') || '-' || ord,'acceptedAnswers',jsonb_build_array(pair->>'right'))
        FROM jsonb_array_elements(v_draft.document->'blocks') AS items(b),
             jsonb_array_elements(b->'pairs') WITH ORDINALITY AS pairs(pair, ord)
        WHERE b->>'type' = 'matching'
    ) AS answer_entries;

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
