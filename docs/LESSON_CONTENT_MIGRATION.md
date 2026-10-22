# Protected lesson-content migration runbook

The protected-content migration is deliberately fail-closed. Do not merge the student resolver / server-side answer-checking changes until the intended lesson sources have been audited and a representative migrated lesson works end to end.

## 1. Prepare source files

The ingestion script combines tracked roadmap JSON files with roadmap files from the selected source. This supports migrating a roadmap from an unmerged curriculum branch without merging that branch into main.

For a git ref, fetch it locally first so git show and git ls-tree can read it. For example:

```sh
git fetch origin pull/13/head:refs/remotes/origin/pr/13
```

Keep private or git-ignored lesson source folders outside the public repository. Do not commit service-role keys or protected answer keys into public roadmap/lesson files.

## 2. Run the dry-run preflight

```sh
node scripts/ingest_roadmaps.js --source origin/pr/13 --dry-run
```

The preflight must report **zero missing sources and zero unsafe/unsupported sources**. Exit code 2 means the preflight is blocked. Do not bypass it or run a write-mode migration while either count is non-zero.

- JSON lesson bodies have answer fields, correctness flags, teacher notes, and explanations removed from the student payload.
- Supported JSON exercise answers are stored separately as JSON under lesson_protected.kind = answer-key, keyed to the classroom's stable generated field IDs.
- Teacher notes and explanations are stored separately as protected records.
- Legacy XML containing answer/correctness metadata is intentionally rejected until a structural parser can split it safely. Regex-only deletion is not an acceptable migration.
- The write path requires SUPABASE_SERVICE_ROLE_KEY; the public anon key is never used for ingestion writes.

## 3. Validate a disposable Supabase environment

Apply the migrations and seed the test database in an isolated project, then check all of these before production:

1. Anonymous users cannot read lesson_student_content or lesson_protected.
2. Granted students can read only their sanitized lesson body and cannot read answer keys or teacher notes.
3. Ungranted students and students outside the granted language/level cannot load lesson bodies or call answer checking successfully.
4. Assigned teachers and founders can access the protected content their roles authorize.
5. The RPC returns only a boolean, never the key or teacher notes.
6. Representative XML and JSON lessons render correctly; correct and incorrect responses work; saved answers still restore and reset.
7. Row counts for courses, lesson metadata, student bodies, placements, and protected records reconcile with the preflight summary.

Do not treat a successful ingestion command alone as proof of authorization correctness. Run the Supabase RLS tests and verify a representative lesson using real role-specific test accounts.

## 4. Production migration

Only after the dry run is clean and disposable-environment checks pass should an operator with approved access run the migration against production. Take a backup first, review the summary, and keep student lesson loading fail-closed if any content is missing. Do not make production changes directly from a development chat session.
