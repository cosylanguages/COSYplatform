# Legacy publisher (from COSYplatform-source)

`publish_to_supabase.js` is the publisher the old content repository ran from GitHub Actions
(`publish-content.yml`, on every push to `lessons/**`). It writes the *old* tables
(`lesson_content`, `student_lesson_content`, ...). It is kept here for reference.

- It needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment. Use `--dry-run` first.
- **`--prune` deletes database lessons that are not in `lessons/`.** The public `lessons/` here holds
  only the sanitized student copies, so never run `--prune` against production from this repo.
- The old workflow is deliberately NOT recreated: it would publish automatically with a service-role key.
  The current ingestion path is `scripts/ingest_roadmaps.js` (see docs/INGESTION.md).
- Run the sanitizer before anything reaches a public file: `scripts/sanitize-student-lesson.js`.
