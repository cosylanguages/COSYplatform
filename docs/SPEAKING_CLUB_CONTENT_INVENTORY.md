# Speaking Club and lesson-library content inventory

## Scope

This inventory covers the complete lesson library referenced by the current `security/server-side-answer-checking` branch, not a science-only migration. The source collection includes Speaking Club material (including cinema/discussion topics), language and skills courses, and any science topics that are part of that same collection.

## Repository snapshot

- **54 roadmap JSON files** are present under `roadmaps/`.
- Those roadmaps contain **601 `lessonFile` references** across their sequence entries. This is a reference count, not a count of unique lesson assets; paths may be reused between roadmaps.
- The roadmap references include JSON and XML sources under `lessons/` (for example, `lessons/spoken-en/` and `lessons/discussion-en/`).
- The current PR branch tree does **not** contain a `lessons/` source directory. The references therefore cannot be assumed to resolve from the checked-out branch alone. Sources must be found in an approved archive, Git ref, or local source directory and verified before migration.
- Several roadmap files are preview/planning shells with few or no `lessonFile` references. Roadmap count must not be treated as the number of available lesson bodies.

## Read-only production snapshot

The connected production database was inspected with read-only queries. No production data or schema was changed.

| Table | Rows | Interpretation |
| --- | ---: | --- |
| `lesson_content` | 1,329 | Legacy lesson body records |
| `student_lesson_content` | 494 | Legacy student lesson records |
| `lesson_student_content` | 0 | New sanitized student-body table is empty |
| `lesson_protected` | 0 | New protected answer/teacher-note table is empty |
| `courses` | 53 | Course records already exist |
| `course_lessons` | 0 | New course-to-lesson placements are empty |

The legacy tables have different row counts, so they must not be assumed to be interchangeable or to cover the same lessons. A safe transition needs an ID-level reconciliation of roadmaps, legacy rows, and approved source files. The report deliberately does not include lesson bodies, answers, teacher notes, or student data.

## Required reconciliation before merge

1. Resolve all 601 roadmap references from approved sources; report missing paths and duplicate/reused source paths separately.
2. Compare normalized lesson IDs across roadmap entries, `lesson_content`, and `student_lesson_content`. Do not infer equivalence from row counts alone.
3. For every resolvable source, classify format (JSON/XML/other), parse status, and whether answer keys, correctness flags, explanations, or teacher notes are present.
4. Produce a coverage report with one outcome per source: safely separable, already student-safe, missing, duplicate/conflicting, or requires manual review. Unsupported XML answer metadata must remain blocked rather than be stripped by regex.
5. Test the complete content transition in a disposable Supabase project. Verify that student bodies render and authorized/unauthorized access behaves correctly, and that answer checking returns only a boolean.
6. Only after approval and successful validation should an operator consider a production migration. No production writes are authorized by this inventory.

## Current release blocker

PR #18 makes student lesson loading fail closed against `lesson_student_content`, but that table is empty in production. Until a verified compatibility path or a fully reconciled general-library migration is ready, deploying the resolver would leave existing lessons unavailable to students. Keep PR #18 unmerged. No science-only migration should be run.
