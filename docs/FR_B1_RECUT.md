# French B1 re-cut — proposal

Goal: bring `general-fr-b1` to the 13-slot grid (`cefr/data/unit-slots.json`) without adding,
removing or rewriting a single lesson. This document is the proposal; nothing here is applied yet.

Measured with `python3 scripts/slot-alignment.py --level B1`; evidence files in
`docs/B1_SLOT_ALIGNMENT.md`, `docs/vocab-id-map/mapping-general-fr-b1.json`,
`docs/vocab-id-map/backlog-general-fr-b1.json`.

## 1. What the course actually is

| block | units | lessons | lesson titles | deck `canDo` |
|---|---|---|---|---|
| communicative | 3–13 | 55 | *Rédiger un CV*, *Analyser un article de presse*, *Le changement climatique…* | *Je peux analyser un article et repérer son parti pris* |
| grammar-led | 1–2 | 10 | *Le subjonctif présent*, *L'expression de la cause*, *Le discours rapporté* | *Je peux exprimer la nécessité et la volonté avec le subjonctif présent* |
| administrative | 11 | 5 | *Les droits du consommateur*, *Logement et contrat de location*, *Impôts et services publics* | *Je peux faire valoir mes droits de consommateur* |

All 65 decks already carry a `Je peux …` can-do, so the lessons are not blank: the ten grammar
lessons simply state a grammar objective instead of a communicative one.

Against the grid the course covers **10 of 13 slots**. Missing: identity (t01), money (t06), ethics
(t21). Duplicated: t22 in units 1, 2 and 13; t17 in units 6 and 11.

## 2. The principle: a grammar point is not a topic

Units 1–2 are not surplus lessons — they are the grammar toolkit of two macros the grid asks for:

| unit | its five lessons | what that toolkit serves |
|---|---|---|
| 1 | subjunctive of necessity and volition, cause/consequence, opposition/concession, subjunctive of emotion, unreal hypothesis | **deliberating a dilemma**: weigh, concede, imagine consequences → t21 |
| 2 | subjunctive of doubt, argument connectors, pluperfect chronology, compound relatives, reported speech | **narrating and positioning a life story**: sequence, quote, qualify → t01 |
| 11 | consumer rights, rental contract, taxes and public services, civic engagement, environmental responsibility | **money, rights and procedures** → t06, with t17 secondary |

The labels were wrong, not the content. Unit 1 is an ethics unit wearing an "opinions" label;
unit 2 is a life-story unit wearing a "discourse modulators" label; unit 11 is a money unit wearing
a "citizenship" label — and unit 6 keeps the citizenship slot.

## 3. The re-cut (phase 1, unit level only)

| unit | title now | proposed title | theme | macro-function |
|---|---|---|---|---|
| 1 | Nuancer sa pensée et exprimer des opinions | Éthique et dilemmes : peser, concéder, trancher | t22 → **t21** | peser un dilemme, concéder un point et justifier une position |
| 2 | Modulateurs de discours et débat d'idées | Mon parcours : raconter, nuancer, se situer | t22 → **t01** | raconter son parcours, rapporter des propos et nuancer son image |
| 11 | Droits, consommation et vie citoyenne | Argent, droits et démarches | t17 → **t06** (t17) | défendre ses droits, comprendre un contrat et une facture |

Units 3–10, 12 and 13 keep their titles, themes and lessons. Result: **13 of 13 slots covered**,
55 lesson titles untouched, 0 new lessons, 0 deleted lessons.

## 4. Applying it

The pass is written and dry-run only until `--write`:

```bash
python3 scripts/apply-recut.py --course general-fr-b1          # prints 3 / 15 / 15, exit 1
python3 scripts/apply-recut.py --course general-fr-b1 --write  # applies all three places
npm run slots:report                                           # refresh the coverage reports
```

Declared in `scripts/data/recut-general-fr-b1.json`; `tests/apply-recut.test.js` proves the three
places move together, that undeclared units are untouched, that key order is preserved and that a
second run is a no-op.

## 5. Blast radius

A unit title appears in three committed places, all updated by the same scripted pass:

| place | entries to update |
|---|---|
| `curriculums/fr/general/B1.json` | 3 units: `title`, `theme`, `macroFunction` |
| `roadmaps/general-fr-b1.json` | 15 `unit` strings (5 lessons per unit) |
| `lessons/general-french-b1/*.json` | 15 `unit` fields |

No lesson file is renamed, no lesson id changes, no slide changes. `data/platform-stats.json`
counts lessons, not titles, so it does not move.

## 6. Phase 2 (deferred, needs approval)

The ten lessons of units 1–2 still say *Le subjonctif présent — Nécessité et volonté* as a title,
so the course reads as grammar even where the macro is now ethical or biographical. Phase 2 renames
those ten lessons to can-dos and keeps the grammar as the focus, e.g.

| lesson | title now | proposed |
|---|---|---|
| 1.1 | Le subjonctif présent — Nécessité et volonté | Peser une décision : ce qu'il faut, ce que je veux |
| 1.3 | L'expression de l'opposition et de la concession | Concéder pour mieux argumenter |
| 1.5 | Exprimer l'hypothèse irréelle au présent | Et si c'était autrement ? Conseils et reproches |
| 2.3 | Le plus-que-parfait et la chronologie du passé | Raconter ma vie : ce qui s'était passé avant |
| 2.5 | Le discours rapporté au passé et concordance des temps | Rapporter ce qu'on m'a dit |

Cost: 10 lesson renames, which rename 10 deck files and change 10 ids in the roadmap
(`fr-b1-le-subjonctif-present-…` → `fr-b1-peser-une-decision-…`). That is the first step that
breaks links, so it stays behind an explicit decision.

## 7. What the dictionary gets out of it

Backlog of items that exist in the curriculum but not in COSYdata, by theme:

| theme | items | |
|---|---|---|
| t22 | 99 | two opinion units' worth of vocabulary |
| t17 | 65 | two civic units |
| t08/t10/t13/t15/t16/t18/t19/t20 | 29–37 each | one unit each |
| **t01, t06, t21** | **0** | no unit, so no vocabulary demand was ever expressed |

Creating the three units creates the demand: roughly 30–35 items per theme, about 100 new entries
in COSYdata, which is also where the missing B1 manual pages come from.

## 8. One open design question

The grid has no dedicated "argue and debate" slot, yet arguing is the core B1 can-do. The re-cut
above distributes it: debate is the *mode* of t21 (dilemma), t22 (essay, unit 13) and most of units
3–13. The alternative is to give opinion its own slot and move something else out. My
recommendation is not to add a fourteenth unit: a 13-slot level keeps the languages comparable, and
"express and defend an opinion" is the frame of every other unit rather than a topic.
