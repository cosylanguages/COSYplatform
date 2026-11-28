# English C1 and C2: published

`general-en-c1` and `general-en-c2` are live: **159 decks** — 94 at C1, 65 at C2. Platform totals after them:
**58/169 courses, 2983/3420 lesson slots, 2793 lesson files**.

English is now published A1 to C2 in the general track: A1 180, A2 93, B1 120, B2 121, C1 94, C2 65.

## C1 — a roadmap that pointed at 64 decks that did not exist

`roadmaps/general-en-c1.json` held **65 entries and one built deck**. It was the legacy course — `Opposites
attract`, `Unit 1. Identity`, `lessonFile: lessons/english-c1/opposites-attract.xml` — while
`curriculums/en/general/C1.json` had moved on: eight modules, 94 lessons, and the forty legacy topics folded
into unit 8 as *Additional Legacy Topics & Draft Lessons*.

So the course had a roadmap of a course it no longer was. `build_en_b2_decks.py --level c1` rebuilds both
from the curriculum: 94 decks in `lessons/general-english-c1/`, a roadmap in curriculum order, the legacy
topics now sitting at the end of the course instead of being dropped. The old XML and JSON are still in
`lessons/english-c1/`; C1 was hidden in the manifest, so no learner progress depended on the old numbering.

### 29 lessons had a grammar phrase and no id

The seven vocabulary openers, all seven *Advanced Grammar* and all seven *Seminar & Debate* lessons carried
`grammar` strings but no `grammarIds`, and seven legacy lessons in unit 8 cited nothing. Most C1 phrases are
the shelf page's own title in other words, so `wire_en_c1.py` is nearly literal:

| the curriculum says | the page |
|---|---|
| Advanced Hedging & Academic Stance Devices (It is widely acknowledged that…) | `advanced-hedging-and-academic-stance-devices` |
| Mandative Subjunctive in Formal Legislation (It is imperative that the law be ratified) | `mandative-subjunctive-in-formal-legislation-and-mandates` |
| Cohesion, Ellipsis & Lexical Substitution to eliminate redundancy | `cohesion-ellipsis-and-lexical-substitution` |

Two are not literal: nominalisation has no C1 page (it lives on B2), and the seven legacy lessons teach
aspect, the future and the infinitive/gerund systems — A2 and B2 topics — so they cite the page that really
teaches them. **124 ids, 0 lessons left without one.**

## C2 — a complete curriculum with no ids and no roadmap

Thirteen modules of five lessons, the same shape as the Russian C2 course, and **no lesson cited a page**, so
nothing had ever been built and there was no roadmap at all. `wire_en_c2.py` gives **130 ids over all 20 C2
pages** plus C1 spirals: litotes and double negatives for the philosophy module, end-weight and heavy-NP shift
for the cybernetics module, exact scope control for the precision module, extraposition of clausal subjects,
redundant infinitive and gerund clauses, register switching, parenthetical qualification.

## Why the C1 decks first came out 55 empty

The build produced 94 decks with an empty *Reading, listening and comprehension* block in 55 of them. The
cause is markup, not content: **18 of the 26 C1 pages wrap their examples in `<div class="examples">`**, a
`div` rather than a `section`, and `manual_page.parse` only looked for a section. The B2 pages use the section
frame, which is why the B1 and B2 decks had never shown the fault.

Three fixes, all of them guards rather than rewrites:

1. `manual_page.parse` now falls back to `<div class="examples">`.
2. Two pages (`inversion-after-negative…`, `mixed-conditionals…`) carry their form table as a table the parser
   does not read; the deck now falls back to the examples for its form line.
3. `confusing-grammar-guide` is an index page — no examples, no table, no rule — and now falls back to its
   checklist, so its three consolidation decks (C2 module 13, C1 mastery) are not empty.

Rebuilding B1 and B2 with the same parser changed exactly two decks, both for the better: `as-as` had been
reading its subtitle where the real rule lives, and now teaches *as … as* instead of *as as*.

## Build

```bash
python3 scripts/grammar-ids/wire_en_c1.py                                  # 29 lessons, 124 ids
python3 scripts/grammar-ids/wire_en_c2.py                                  # 65 lessons, 130 ids
python3 scripts/lesson-build/build_en_b2_decks.py --level c1 --write
python3 scripts/lesson-build/build_en_b2_decks.py --level c2 --write
npm run stats:build && npm run validate
```

## State of the English general track

- **0 empty elements** across all 159 new decks.
- Every C1 and C2 lesson resolves to a manual page; all 26 C1 pages and all 20 C2 pages are used.
- `npm run audit:monolingual` — no English level on the list.

## What is still open

1. **Vocabulary case is mixed across English levels**: 194 of 1203 B2 items, 174 of 903 C1 and 193 of 553 C2
   begin with a capital. Some are proper nouns and some are not, so a blanket lowercase pass would damage
   *Shakespearean* and *Latinate*. This needs a proper-noun allowlist, not a transform.
2. **English A2 leaves 81 curriculum lessons unscheduled.** The 93-entry course is built — a speaking-lab
   course with progress tests — but the curriculum holds 141. That gap is a scheduling decision.
3. **The other English tracks are still hidden and unbuilt**: exam B1–C2, professional B1–C2, relocation
   A2–C1, travelling A1–B1, spoken C2, discussion C2 (whose curriculum is empty). Each needs its own roadmaps.
4. **French tracks**: the six general levels are complete; exam B1–C2 and professional B1–C2 have ids but no
   roadmaps, spoken has six levels of 30 with ids, travelling three of 20.
