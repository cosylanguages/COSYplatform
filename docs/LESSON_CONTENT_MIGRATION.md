# Protected lesson-content migration runbook

The protected-content migration is deliberately fail-closed. Do not merge the student resolver / server-side answer-checking changes until the intended lesson sources have been audited and a representative migrated lesson works end to end.

## 1. Prepare source files

The science curriculum source is already present in the repository's Git history on PR #13. Its full 10-slide lesson files are in commit `33c54bab8d9c12ff5bd3202c76069f1782207087`; the current PR branch files are sanitized, so use the historical source commit for migration preflight and extraction.

Fetch the PR branch (which also fetches its history) and confirm the source commit is available:

```sh
git fetch origin pull/13/head:refs/remotes/origin/pr/13
git cat-file -e 33c54bab8d9c12ff5bd3202c76069f1782207087^{commit}
```

The migration script accepts that Git commit as `--source`, reads the roadmap and lesson files from it, and writes only sanitized student bodies plus separately protected answer keys and teacher notes. Do not add the historical answer-bearing files back to the current branch or commit service-role credentials. Note that the old commit is part of public Git history, so its protected values must be treated as already disclosed; migration isolation prevents future student API responses from exposing those values but cannot undo the historical disclosure.

## 2. Run the dry-run preflight

Run a focused preflight for the new science course first, then run the full inventory preflight before a complete migration:

```sh
node scripts/ingest_roadmaps.js --source 33c54bab8d9c12ff5bd3202c76069f1782207087 --roadmap science-en-b2.json --dry-run
node scripts/ingest_roadmaps.js --source 33c54bab8d9c12ff5bd3202c76069f1782207087 --dry-run
```

Each preflight must report **zero missing sources and zero unsafe/unsupported sources** for its selected scope. Exit code 2 means the preflight is blocked. Do not bypass it or run a write-mode migration while either count is non-zero.

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
