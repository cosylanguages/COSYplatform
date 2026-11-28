# Vocabulary IDs: COSYdata -> COSYplatform (first pass, French B1)

## Result

- 520 vocabulary items across the 65 lessons of `general-fr-b1`.
- **107 resolved (19 %)**: 97 exact headword matches and 10 short-ended variants
  (`nuancer`/`nuancé`, `droit`/`droits`).
- **413 items have no COSYdata entry.** They are either to be authored in the dictionary or
  replaced in the curriculum; the review sheet carries one row per item with an empty `decision`
  column.
- 75 of the 107 resolved items sit at a level other than B1, almost all at A2. That is expected :
  a B1 lesson recycles A2 words. It is recorded so the level review can tell "recycled
  deliberately" from "mis-levelled".

Why so low: COSYdata holds 278 French B1 entries of which 164 are idioms, so only 114 non-idiom
items exist for a 65-lesson level, and its B1 files are organised by part of speech, not by theme.
The curriculum was written independently, so the two lexicons overlap only by accident. Numbers per
language and level are in `docs/cefr-syllabus-and-vocabulary-architecture.md`.

## Schema additions (platform, additive and optional)

Unit:
```json
{ "unit": 4, "title": "Médias, société de l'information et réseaux",
  "theme": "t15", "secondaryThemes": ["t16"],
  "macroFunction": "analyser les médias et défendre la liberté d'expression" }
```

Lesson:
```json
{ "lesson": 1, "title": "...", "vocabulary": ["Exiger"],
  "vocabularyIds": ["fr:exiger:verb"],
  "recycledIds": ["fr-b1-il-faut-que-subjonctif"],
  "grammarThreads": ["T3"] }
```

`theme` uses the ids of `cefr/data/themes.json` (t01–t22); `grammarThreads` uses T1–T14 from the
architecture doc. Absent fields mean "not mapped yet", so nothing existing breaks.

## Artifacts

`docs/vocab-id-map/mapping-<course>.json`:
```json
{ "course": "general-fr-b1", "lang": "fr", "level": "B1",
  "summary": { "items": 520, "exact": 97, "normalized": 0, "related": 10,
               "missing": 413, "resolved_pct": 19, "different_level": 75 },
  "lessons": {
    "fr/general/B1/u01-l01": {
      "code": "FR-B1-001",
      "items": [
        { "text": "Exiger", "status": "exact", "id": "fr:exiger:verb", "level": "A2",
          "alternatives": [] },
        { "text": "Réserves", "status": "related", "id": null, "level": null,
          "alternatives": [{ "id": "fr:réserver:verb", "word": "réserver", "level": "A0" }] }
      ] } } }
```

Statuses: `exact` (same headword), `normalized` (after dropping a leading article or diacritics),
`related` (one form is the other plus an inflectional ending — reviewer decides), `missing`.

`docs/vocab-id-map/review-<course>.csv` carries the same data as a sheet with an empty `decision`
column, one row per item.

## Workflow

```bash
# 1. generate (read-only on COSYdata and on the curriculum)
python3 scripts/build-vocab-id-map.py --cosydata ../COSYdata --course general-fr-b1 --write
#    any course id works: general-fr-a1, general-en-b2, ...

# 2. review: fill `decision` in review-general-fr-b1.csv
#    accept id | accept alternative <id> | author new entry | replace item

# 3. write the accepted ids into `vocabularyIds` (not yet automated)
```

## CI checks

- `tests/curriculum-metadata.test.js`: every `theme`/`secondaryThemes` id exists in
  `cefr/data/themes.json`, `vocabularyIds` and `grammarThreads` match their patterns, and the
  committed metadata does not drift from `scripts/data/unit-metadata.json`.
- `tests/vocab-id-map.test.js`: the mapping artifact is internally consistent (counts, statuses,
  ids, lesson keys, CSV row count).
- `npm run audit:lexicon`: cross-repository report (needs the COSYdata and COSYmanuals checkouts).

## Applying unit metadata

`scripts/data/unit-metadata.json` declares theme and macro-function per unit. The applier only
inserts keys, keeps every existing field and value, and preserves the file formatting:

```bash
python3 scripts/apply-unit-metadata.py          # report drift on every declared course
python3 scripts/apply-unit-metadata.py --write  # apply
```

French general is done: 88 units across A1–C2, 264 inserted lines, 0 deletions. Other languages
have no entry in the map yet, so they are reported as "no metadata" rather than wrong.

## Status by course

| Course | Levels | Items | Resolved | Note |
|---|---|---|---|---|
| fr general | A1 | 1 135 | 74 % | unit themes applied |
| fr general | A2 | 520 | 38 % | unit themes applied |
| fr general | B1 | 520 | 19 % | unit themes applied, first pilot |
| fr general | B2 | 520 | 7 % | unit themes applied |
| fr general | C1 | 520 | 12 % | unit themes applied |
| fr general | C2 | 463 | 9 % | unit themes applied |
| en general | B1 | 1 193 | 83 % | unit themes applied, legacy bucket excluded |
| ru general | B1 | 515 | 15 % | unit themes applied |

French general is now themed end to end (88 units: A1 23, A2–C2 13 each) and every level has a
review sheet. The fall is not French-specific: A1/A2 vocabulary is concrete and the dictionary
covers it; from B1 the dictionary holds idioms and part-of-speech buckets instead of themes.
English B1 (83 %) is the exception because its curriculum was drawn from the same source as the
dictionary; Russian B1 (15 %) is the other extreme, and its `related` count is 0 because Russian
inflection does not fit the Latin prefix+suffix rule — the matcher stays silent rather than guess.

## Open decisions before scaling

- Standard level size (65 lessons everywhere vs. English at 120–141).
- Idiom quota (≈160 per level today vs. 60–80 at B1 / 120 at B2 / 150 at C1).
- Whether `related` matches may be accepted in bulk, or every one needs a human decision.
