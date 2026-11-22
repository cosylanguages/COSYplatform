# Legacy Supabase table cleanup

**Status: blocked. Do not drop `lesson_content` or `student_lesson_content` yet.**

The ecosystem audit originally proposed dropping both tables after running
`scripts/ingest_roadmaps.js`. The precondition is not met: live code still reads
or writes them.

## Current references

Run `npm run check:legacy-tables` for the authoritative list. At the time of
writing it reports:

| Location | Use |
| --- | --- |
| `shared/js/lesson-resolver.js:141` | `saveLessonToSupabase()` upserts into `lesson_content`. |
| `teacher.html:3037` | Calls `CosyLessons.saveLessonToSupabase()` after editing a lesson. |
| `shared/js/lesson-resolver.js:101` | Falls back to `student_lesson_content` / `lesson_content` for legacy `lessons/` paths. |
| `index.html:556,570` | Reads `lesson_content` for the public catalog preview. |

The canonical tables are `lessons`, `lesson_student_content` and
`lesson_protected`. `scripts/ingest_roadmaps.js` populates them, and
`shared/js/lesson-resolver.js` already prefers them. The legacy paths remain as
fallbacks and as the teacher save target.

## Migration path

1. Replace `saveLessonToSupabase()` with the service-role
   `replace_lesson_content(p_lesson_id, p_body, p_protected)` RPC, or write to
   `lessons` + `lesson_student_content` + `lesson_protected` directly. The
   browser must not hold a service-role key; route the write through an Edge
   Function or a founder-only RPC.
2. Point the `index.html` preview at `lesson_student_content` (or the `lessons`
   body) instead of `lesson_content`.
3. Remove the legacy fallback in `lesson-resolver.js` once every roadmap
   `lessonFile` resolves through the canonical tables.
4. Run `npm run check:legacy-tables` until it exits 0.
5. Run `node scripts/ingest_roadmaps.js` and verify the counts:
   ```sql
   SELECT
     (SELECT count(*) FROM public.courses) AS courses,
     (SELECT count(*) FROM public.lessons) AS lessons,
     (SELECT count(*) FROM public.course_lessons) AS course_lessons,
     (SELECT count(*) FROM public.lesson_student_content) AS student_bodies;
   ```
6. Take a database backup, then drop the tables in a maintenance window:
   ```sql
   BEGIN;
   DROP TABLE IF EXISTS public.student_lesson_content;
   DROP TABLE IF EXISTS public.lesson_content;
   COMMIT;
   ```
   Do not use `CASCADE`. If the drop fails because a view or function depends on
   the table, migrate or remove that dependency first.

## Why this is a separate change

Dropping the tables before the call sites move would break teacher lesson saves
and the public catalog preview. The check script makes the precondition
explicit, so a future cleanup cannot silently skip it.
