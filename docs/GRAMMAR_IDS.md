# Grammar IDs: COSYmanuals -> COSYplatform (first pass, English general A1-B1)

## Result
- 518 lessons, 330 grammar items (one lesson can have several).
- **210 high / 92 medium / 28 none.** Hand check of all 85 unique "high" pairs: about 5 weak or partial, so roughly 94% precise. Every medium item is in the review CSV.
- 125 lessons got `grammarIds` (high only) in `curriculums/en/general/*.json`. Validator: 0 unknown IDs.
- A2/B1 lessons are mostly title-only reading stories (121/141 and 100/120 have no grammar text), so only 6 and 8 of them got IDs. For those levels use `roadmaps/grammar-en-*.json`: ~98 of 248 titles map high, and many medium ones are right too (see `review-en-grammar-roadmaps.csv`).
- 58 manual pages are never referenced by A1-B1 lessons (orphans, listed in `report-en-general.json`).

## Registry problems found (fix before mapping other languages)
- 33 English entries are not grammar points: "Page Moved" stubs (`en-a1-en-be`, `en-a1-en-articles`, ...), part hubs (`part-1-...`), master guides, the language index. The matcher excludes them; the registry builder should too (or flag them `type: hub|stub`).
- Some pages sit at a level other than where they are taught (e.g. A1 pages for past simple irregulars that no A1 lesson uses).

## Schema additions (platform)
Curriculum lesson (additive, optional):
```json
{ "lesson": 12, "title": "...", "grammar": ["Used to for past habits"], "grammarIds": ["en-a2-used-to"] }
```
Lesson slide element (new type), rendered on the student page with the manuals embed:
```json
{ "type": "grammar-focus", "grammarId": "en-a2-used-to", "display": "embed" }
```
Student page renders `<div data-grammar-embed="en-a2-used-to"></div>` and loads
`https://cosylanguages.github.io/COSYmanuals/shared/js/grammar-embed.js`. The embed drops quiz and CCQ panels, so the teacher view should add a link to the full manual page.

## CI checks
- `scripts/grammar-ids/check_grammar_ids.py`: every `grammarIds` entry must exist in `data/grammar-points.json` (exit 1 otherwise).
- Next: report orphan grammar points per level, and lessons of type `gv` with neither text nor IDs.

## Run it
```
python3 scripts/grammar-ids/map_grammar_ids.py --manuals ../cosymanuals --platform ../cosyplatform --lang en --track general --levels A1 A2 B1 --out out
python3 scripts/grammar-ids/apply_mapping.py --platform ../cosyplatform --mapping out/mapping-en-general.json --out patched
python3 scripts/grammar-ids/check_grammar_ids.py --manuals ../cosymanuals --curricula patched
```
Limits: scoring is tuned on English. Other languages need their own synonym table, and Bashkir/Tatar etc. curricula are written in Russian while their manuals are in the target language, so those need a manual mapping or an LLM-assisted pass.

## Status by language (general track)

| Lang | Levels | Lessons with `grammarIds` | Items high / medium / none | Notes |
|---|---|---|---|---|
| en | A1-B1 | 150 of 518 | 210 / 91 / 29 | Many A2/B1 lessons are title-only reading stories with no grammar text; use `roadmaps/grammar-en-*.json` for those |
| fr | A1-C2 | 302 of 333 | 443 / 116 / 31 | B1-C2 manual titles match curriculum text almost word for word; A1 is the weak level |
| ru | A1-C2 | 260 of 333 | 183 / 242 / 161 | Manuals have few B1-C2 pages; many B1-C2 ids come from drafted decisions, not high-confidence matches |
| it | A1-B1 | 121 of 142 | 79 / 110 / 55 | A2 and B1 are now in scope (Italian stops at B1); A2 curriculum written, 13 units and 65 lessons; manuals have 77 pages |

### Other French tracks

High-confidence ids only (no drafted decisions). These curricula copy the manual page titles almost verbatim, so nearly every match is an exact title match.

| Track | Levels | Lessons with `grammarIds` | Items high / medium / none |
|---|---|---|---|
| fr/spoken | A1-C2 | 180 of 180 | 317 / 8 / 1 |
| fr/professional | B1-C2 | 96 of 96 | 191 / 1 / 0 |
| fr/travelling | A1-B1 | 60 of 60 | 118 / 1 / 2 |

### Spanish, German, Portuguese (general A1)

These curricula are tiny (8-9 lessons each, A1 only), so coverage is small: es 5, de 1, pt 3 lessons got a high-confidence id (9 in total). The matcher uses its default tokenizer for them, so wording that differs from the page title (e.g. German "Verb sein (Präsens)") is missed rather than mismatched; a language-specific tokenizer would raise coverage. Medium matches are not applied. Review files: `docs/grammar-id-review/*-{es,de,pt}-general.*`.

### Greek (el/general A1-A2)

A Greek tokenizer was added to the matcher (accent folding, final sigma, suffix stemming). 88 of 142 lessons get `grammarIds` from high-confidence matches (26 unique item-to-page links, all checked by hand; many lessons repeat the same grammar items). 112 medium matches are NOT applied: many are wrong (e.g. demonstrative pronouns matched to personal pronouns) and Greek has 60 A1 manual pages and 19 A2 pages; A2 is now in scope because Greek stops at A2. Review files: `docs/grammar-id-review/*-el-general.*`.

### Other Russian tracks

Russian has only 296 manual pages, so most items have no page to point to. Only high-confidence matches were applied, after removing 13 that were clearly wrong (e.g. «Идите прямо» matched «Прямая и косвенная речь»; symptom and hotel phrases matched «У меня есть...»). Medium matches are NOT applied: they need a native-speaker review. The saved `review-ru-<track>.csv` files still list the unfiltered matches.

| Track | Lessons with `grammarIds` | Items matched (high, after filtering) / total |
|---|---|---|
| ru/spoken | 48 of 180 | ~50 / 326 |
| ru/professional | 9 of 96 | ~9 / 192 |
| ru/travelling | 7 of 60 | ~8 / 121 |

`fr/pronunciation` is deliberately skipped: its lessons teach sounds, not grammar points (1 of 38 items matched with high confidence). Review files: `docs/grammar-id-review/{mapping,review,report}-fr-<track>.*`. The 10 medium/none items have no id yet.

The counts include ids that come from the drafted decisions below. Re-create them with
`python3 scripts/grammar-ids/apply_drafts.py --platform . --lang en --lang fr --lang ru --lang it`.

Review `review-<lang>-general.csv` before applying more IDs. Two columns matter:
`reviewer_decision` is for the human reviewer and is left empty; `draft_decision`, `draft_ids` and
`draft_note` hold decisions drafted by Claude for every medium row (see "Draft decisions" below).

### Correction (lesson keys)

The first versions of `map_grammar_ids.py` and `apply_mapping.py` identified a lesson by its `code`,
`slug` or `lesson` number. Those are not unique: in French A2-C2, Russian A2+ and part of English
A2/B1 the lesson number restarts in every unit (French B1: 50 lessons, 5 distinct keys), so several
lessons received the IDs of another lesson. Lessons are now identified by position
(`u<unit>-l<lesson>`, always unique), the matcher asserts that no key repeats, and `apply_mapping.py`
replaces any existing `grammarIds` instead of keeping them. A1 files were never affected because they
have unique `code` fields.

### Draft decisions for medium rows

`decisions-<lang>.json` lists, for every distinct medium pair, a drafted decision:
`accept` (proposed page is right), `accept+` (right, and more pages apply), `replace` (use the listed
pages instead) or `reject` (the manuals have no suitable page; most rejects are real gaps, for example
no page on possessive adjectives, "Let's...", weather, or payment prepositions). Every id in the drafts
is validated against the registry. `scripts/grammar-ids/apply_drafts.py` applies them: a lesson gets the ids of its high-confidence items plus the drafted ids of its medium items (a `reject` adds nothing). These are drafts written without a native-speaker check; edit `reviewer_decision` / the decisions files and re-run the script to change them.

## The `grammar-focus` lesson element (implemented)

Add it to any slide's `elements` to show a COSYmanuals grammar point by id:

```json
{ "type": "grammar-focus", "grammarId": "en-a2-used-to" }
{ "type": "grammar-focus", "grammarId": "en-a2-used-to", "title": "Look back" }
{ "type": "grammar-focus", "grammarId": "en-a2-used-to", "display": "link" }
```

- `display: "embed"` (default) renders the manual's explanation through the COSYmanuals grammar embed (shadow DOM, fetched from GitHub Pages). `display: "link"` renders only a link to the manual page.
- An "open in COSYmanuals" link is always shown, so the lesson still works if the embed cannot load.
- An id that is not well-formed renders a small "unavailable" note; an id with no manual page shows the embed's own "unavailable" message.
- Implementation: `shared/js/grammar-focus.js`, used by `student.html` and `teacher.html`. Tests: `tests/grammar-focus.test.js` (also checks every `grammarIds` entry in `curriculums/` is well-formed).
- Lesson Studio has a `＋ Grammar Focus` palette entry. Its editor loads the COSYmanuals registry and lets the author search by name or id, filter by language and CEFR level, and select the grammar point. A manual id field remains available under "Use a grammar point ID directly".
- Still not automatic: curriculum `grammarIds` are not yet turned into `grammar-focus` slides.
- Known embed limitation: the manual's interactive widgets (for example "tap to see the correct form") are not active inside the embed.

## Generating grammar-focus slides from existing lesson links

Lesson files already carry `links.grammar[].topic_id` (the manual page slug). `scripts/grammar-ids/add_grammar_focus.py` turns those links into a real "Grammar Focus" slide with one `grammar-focus` element per topic, placed right after the lesson's input slide:

```
python3 scripts/grammar-ids/add_grammar_focus.py --manuals ../cosymanuals --lessons lessons [--dry-run]
```

- Resolution: same level first, then the nearest higher level (A0 lessons use the A1 manual page).
- Re-running adds nothing twice. Files are only rewritten if their compact-JSON formatting can be reproduced exactly.
- Applied to 40 English lessons in total (`general-english-a0`, `general-english-a1`): 25 by direct slug match, 10 through the alias file and 5 through the newly written pages. The 10 alias lessons were linked through `scripts/grammar-ids/topic-aliases.json`: their lesson `topic_id` differs from the manual page slug (e.g. `frequency-adverbs` -> `en-a1-adverbs-frequency`, `can-ability` -> `en-a1-can-cant`). The 5 remaining topics (`possessive-adjectives`, `how-much-cost`, `sequence-words`, `impersonal-it`, `work-collocations`) had no manual page; the pages were written in COSYmanuals (draft, awaiting teacher review) and are linked through the same alias file.
- Only English lessons carry these links today. The fr/ru/it/el curricula have `grammarIds`, but there are no lesson files for them yet, so there is nothing to generate.

## Lesson Studio: Grammar Focus block

Teachers can add a Grammar Focus block in Lesson Studio (`＋ Grammar Focus`). The picker loads `COSYmanuals/data/grammar-points.json` and defaults to the lesson language and level. The author can filter by language and CEFR level, search by title, subtitle or id, and choose a point from the list. A manual id field remains available under "Use a grammar point ID directly". The author can also add an optional title and choose to show the explanation or only a link. The preview uses the same rendering as the student page.

Rolling it out is a two-step change, in this order:

1. Apply `supabase/migrations/20261123000000_publish_grammar_focus_block.sql` to the Supabase project (migrations are applied by hand; no workflow does it). It adds the block type `grammar_focus` to `publish_lesson_studio_draft`, validates it (id format `<lang>-<level>-<slug>`, at most 100 characters; optional title up to 120; display `embed` or `link`), and gives students `{type: "grammar-focus", grammarId, title?, display}`, which `student.html` already renders.
2. Then merge the front-end change (`lesson-studio.html`, `shared/js/lesson-studio.js`). If it goes live first, publishing a lesson that contains the block fails with "Draft contains an invalid or unsupported lesson block."

The migration is a copy of the newest definition of the function (`20261117000000`) with three small edits. `supabase/tests/studio_grammar_focus.test.sql` covers it (11 checks). The block stores only the id, never the manual's text.

