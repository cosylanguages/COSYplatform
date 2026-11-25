# COSYplatform Repository Audit

**Date:** 2026-11-25
**Scope:** structure, product boundaries, content pipeline, access control, links/assets, dead code, documentation accuracy.
**Method:** repository scan, `npm run validate`, `npm run check:legacy-tables`, targeted remote URL checks, and manual review of runtime imports.

## 1. Verified baseline

- 23 HTML files: 11 platform pages at the root, 5 A1 curriculum previews, 4 templates, plus manual/reference documents.
- 26 shared JavaScript modules, 23 top-level scripts, 15 test files.
- 187 manifest courses: 36 active, 151 planned (`not_yet_available`), 13 languages, 3 with available courses (`en`, `fr`, `ru`).
- 60 roadmaps, 1,672 lesson slots: 1,135 active, 537 planned.
- 766 lesson files on disk (manifest metadata excluded), 5 not referenced by any roadmap.
- `npm run validate` passes: content integrity, lesson languages, protected keys, platform stats and the full test suite (82 tests).
- `npm run check:legacy-tables` fails by design. `index.html` and `lesson-resolver.js` still use `lesson_content`; do not drop the legacy tables.

## 2. Product boundary map

| Area | Files | Product | Isolation |
| --- | --- | --- | --- |
| Platform runtime | `index.html`, `login.html`, `profile.html`, `student.html`, `teacher.html`, `founder.html`, `classroom.html`, `lesson-studio.html`, `studio-results.html`, `404.html` | COSYplatform | Clear |
| Platform shared layer | `shared/js/*`, `shared/css/*`, `shared/i18n/*`, `shared/img/*`, `shared/styles/style.css` | COSYplatform | Used by platform pages only |
| Content source | `curriculums/`, `roadmaps/`, `lessons/`, `activities/`, `schemas/` | COSYplatform publish pipeline | Publicly readable (see finding P0) |
| Curriculum previews | `curriculums/*/general/A1.html` + `A1.js` | COSYplatform legacy preview | Orphan; no inbound runtime links |
| Templates | `templates/*` | Authoring examples | Placeholder links are intentional; logo path fixed |
| Manuals material | `teacher-guides/index.html`, `reference/manuals/` | COSYmanuals | Misplaced; no platform navigation links to it |
| Legacy hub | `hub.html` | Old platform hub | Orphan; referenced only by tests |
| CEFR research | `cefr/` | Research reference | Not loaded by the app |
| External products | COSYlanguages login, COSYdata vocabulary, COSYtools grammar, COSYmanuals | Separate products | Linked by URL only; no code imports |

`shared/js/tools-resolver.js`, `manuals-resolver.js` and `vocab-resolver.js` have no runtime import in this repository. They are integration helpers, not part of the deployed page load path. `vocab-index.js` is loaded lazily and is used.

## 3. Findings

### P0 — public repository exposes lesson source and teacher notes

The repository and GitHub Pages site are public. `lessons/` contains 766 lesson files; 93 of them contain `teacher_notes` with teacher scripts, CCQs and adaptation notes. All 93 are in `lessons/general-english-a2/`, with 908 occurrences. `scripts/check_protected_keys.js` blocks `answers`, `teacherNotes` and `answer-key`, but reports `teacher_notes` as an advisory because it also appears in curriculum metadata.

The live site is deployed by GitHub Pages from the `main` branch of a public user repository. Changing the repository to private may disable Pages unless the owner's plan supports private-repo Pages; that cannot be verified through the current token. Do not flip visibility without checking the deployment first.

The source pipeline also matters: `publish_to_supabase.js` writes the raw lesson body (including teacher notes) to `lesson_content` and a sanitized copy to `student_lesson_content`. Removing `teacher_notes` from the public source without a private master or protected-table migration would make future publishes overwrite the teacher view without notes.

This is not fixed by the code changes in this pass. The owner must choose one:

1. **Private repository:** fastest to stop new exposure, but verify Pages support first. Anything already committed remains in history and existing clones.
2. **Private content source, public site (recommended):** keep the app public, move `lessons/` masters and the publish source into private storage, keep only sanitized runtime metadata here, and update the publish workflow to read the private masters. This is the only option that avoids taking the live site down.
3. **Public content, remove teacher notes:** move the 93 A2 notes to a private master, strip them from public lesson files, and update `publish_to_supabase.js` so future publishes do not erase teacher notes from `lesson_content`. This is a partial fix while the public lesson bodies remain exposed.

The README and `docs/known-limitations.md` now state this accurately; the previous README claim that only application pages live here was false.

### P1 — active catalog course without a roadmap

`exam-fr-b1`, `exam-fr-b2`, `exam-fr-c1` and `exam-fr-c2` had no roadmap file, but `index.html` tried to fetch `roadmaps/exam-fr-*.json` when a visitor opened them. Fixed by marking all four `not_yet_available` in `shared/js/auth-guard.js` and adding integrity check 5, which rejects any active manifest course without a local roadmap.

Four roadmaps remain outside the manifest: `general-en-a0`, `general-en-a0-a1-inspired`, `general-en-a1` and `science-en-b2`. They are planning/reference material, not catalog entries. This is intentional but should be documented before reuse.

### P1 — stale founder statistics

`data/platform-stats.json` reported 604 lesson files and 601 available lessons from an older snapshot. It now comes from `scripts/build-platform-stats.js`, reports 766 lesson files and 1,135 available slots, and `npm run stats:check` (also in CI) fails when the file drifts.

### P2 — broken links and missing assets

- All five `curriculums/*/general/A1.html` previews linked to `lesson.html`, `vocabulary-reference.html` and `grammar-reference.html`, none of which exist. Links now go to `student.html`, COSYdata vocabulary and COSYtools.
- Four templates referenced `images/logos/cosylanguages.png`, which does not exist. They now use `shared/img/logo.png`.
- `student.html` linked to `https://cosylanguages.github.io/`, which returns 404. It now links to the COSYlanguages product home.
- `profile.html`, `shared/js/access-rules.js`, `shared/js/auth-sso.js`, `shared/js/grammar-focus.js` and similar scan hits are string names, not broken file links.

### P2 — orphan pages and misplaced product material

- `hub.html` has no inbound runtime link; only tests read it.
- `teacher-guides/index.html` is a COSYmanuals manual hub hosted inside COSYplatform and has no platform link.
- The five A1 preview pages have no inbound runtime links.
- `curriculums/_archive/`, `scripts/legacy-source/` and the duplicate `.gitkeep` trees are retained as reference. None are loaded by the app.

These are safe to remove only after a product decision. They were not deleted in this audit because they are content/history, not broken runtime code.

### P2 — monolithic pages and global coupling

- `teacher.html` has 4,474 lines, `classroom.html` 4,085, `profile.html` 3,843 and `student.html` 3,057. Most markup, CSS and behaviour is inline; there is no bundler or ES-module boundary.
- Shared modules communicate through `window.Cosy*` globals (`CosyAuth`, `CosyI18n`, `CosyAccess`, `CosyLessons`, ...). This works and is tested, but it makes deletion and isolation checks manual.
- Do not split these pages as part of a content or security fix. Extract a module only when a concrete change needs it, and keep the existing `window` contracts until all consumers move together.

### P3 — repository hygiene

- Two tracked `.pyc` files were removed and `__pycache__/`, `*.py[cod]`, `.env*`, `supabase/.temp/`, `.pages-site/` and `.cosy/` are now ignored.
- `platform-stats.json` is now generated instead of hand-maintained.
- Translations had 19 missing catalog keys plus 2 language-toggle keys in `fr`, `ru`, `it` and `el`. All five dictionaries now have the same 481 keys.

### Documentation drift corrected

- `README.md`: replaced the false "application pages only / private database" claim.
- `docs/known-limitations.md`: replaced the retired `?key=` / `data/access-grants.json` model with Supabase Auth + RLS and the public-source limitation.
- `docs/architecture.md`: replaced the retired grant model; clarified that lesson resolution prefers Supabase.
- `docs/legacy-table-cleanup.md`, `docs/live-class-audit.md`, `docs/ecosystem-audit.md`, `docs/lesson-spec-a0-a1-general.md`: corrected line numbers, counts and script names that no longer exist.
- This file replaces the previous read-only audit, which described branches and files that no longer exist.

## 4. Deletion safety

| Candidate | Runtime references | Effect of deletion |
| --- | --- | --- |
| `hub.html` | None; tests only | No page breaks; update/remove two tests |
| `curriculums/*/general/A1.html` + `A1.js` | None | No page breaks; `A1.json` remains source |
| `teacher-guides/index.html` | None | No page breaks; manual content belongs to COSYmanuals |
| `shared/js/tools-resolver.js`, `manuals-resolver.js`, `vocab-resolver.js` | None | No page breaks; remove docs references too |
| `curriculums/_archive/`, `scripts/legacy-source/` | None | No runtime effect; loses historical reference |
| Duplicate `.gitkeep` files | None | No runtime effect |

## 5. Remaining recommendations

1. **Decide the public/private content boundary.** This is the only high-severity open item.
2. Decide whether `hub.html`, the A1 previews and `teacher-guides/index.html` are products or dead weight; remove them deliberately rather than leaving unreachable pages.
3. Add a full classroom DOM smoke test before changing its top bar or sidebar IDs.
4. Complete the legacy table migration (`lesson_content` → canonical tables) before dropping anything.
5. Keep `platform-stats.json` generated; do not hand-edit it.
