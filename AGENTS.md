# Agent instructions for COSYplatform

## Repo facts
- COSYplatform is the content repository hosting interactive curriculums, course roadmaps, teacher guides, reference materials, student workbooks, and interactive lesson markup files.
- Canonical curriculums live in `curriculums/{iso}/{track}/{LEVEL}.json`.
- Course sequence manifests live in `roadmaps/` (`<track>-<lang>-<level>.json`).
- Pre-publish lesson source slides live under `lessons/` in JSON or XML format.
- Canonical CEFR reference lives in `cefr/` (`cefr/CEFR_Universal_Master.md`).

## Commands (run all before finishing; all must pass)
```bash
npm ci
npm run validate
npm run check:cefr
```

## Editing rules
1. Only change files inside the task scope. Do not modify unrelated files.
2. Keep JSON formatting identical to existing files: UTF-8, 2-space indent, trailing newline, existing key order.
3. Never rename or delete an existing `id` without fixing every reference across the codebase.

## Content-security rule
- This is a public repository. Production lesson materials (including teacher notes, speech scripts, and answer key overlays) are gated and served live from Supabase (see the warning in `README.md`).
- Do not add teacher notes, speech scripts, or answer keys beyond what already exists in the public pre-publish sources.

## CEFR rules
- Valid `level` values stored in data are `A1`, `A2`, `B1`, `B2`, `C1`, and `C2`.
- There is **NO** `A0` level. The A0–A1 band is stored as level `A1` with sublevel `"start"`.
- Valid `sublevel` values are `null`, `"start"`, and `"p"`.
- Descriptor IDs must be lowercase (e.g. `in-conv-b1`, `lis-ov-a1s`).
- `cefr/data/*.json` is generated: edit `cefr/CEFR_Universal_Master.md`, then run `python3 scripts/build-cefr-json.py` and commit both.

## PR rules
- One task per PR.
- Branch name format: `jules/<task-id>` (e.g., `jules/C01`).
- Title format: `[<task-id>] <short summary>`.
- PR description must list:
  1. What changed (files added, moved, or updated).
  2. Exact commands run with their results.
  3. Any questions or items needing review.
- Note: There is no root `CHANGELOG.md` in this repository; do not create one.
