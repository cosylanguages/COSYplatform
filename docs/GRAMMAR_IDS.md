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
| en | A1-B1 | 128 (A1 99, A2 15, B1 14) | 210 / 91 / 29 | A2/B1 lessons are mostly title-only; use `roadmaps/grammar-en-*.json` |
| fr | A1-C2 | 249 | 443 / 116 / 31 | B1-C2 manual titles match curriculum text almost word for word; A1 is the weak level |
| ru | A1-C2 | 143 (A1 92, A2 18, B1 13, B2 5, C1 7, C2 8) | 183 / 242 / 161 | Manuals have few B1-C2 pages, so most B1-C2 items are medium and need review |
| it | A1 | 79 | 79 / 110 / 55 | Only A1 is in scope (A2-C2 sit in `_out_of_scope`); manuals have 60 pages in total |

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
is validated against the registry. These are drafts: nothing has been applied to the curricula yet.

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
- Not yet done: the Lesson Studio editor has no palette entry for this element, and curriculum `grammarIds` are not yet turned into `grammar-focus` slides automatically.
- Known embed limitation: the manual's interactive widgets (for example "tap to see the correct form") are not active inside the embed.
