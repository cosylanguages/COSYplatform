# Legacy database definitions (from COSYplatform-source)

Reference copies of `migrations/0001`-`0009` and `schema.sql` from the old content repository.
They define objects the live app still uses and that no migration in `../migrations/` creates:

tables `lesson_content`, `student_lesson_content`, `session_content`, `manual_content`, `lesson_notes`,
`cms_page_overrides`; functions `handle_new_user`, `join_lesson_note`, `save_lesson_note`.

**Do not move these into `../migrations/` and do not run them against the live database.** They were
applied long ago; re-running could fail or reset policies. They exist so the definitions are
version-controlled. Turning them into proper, idempotent migrations is a separate, reviewed step.
