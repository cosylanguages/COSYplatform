# Course coverage

Manifest entries: **169**. The declared plan is in `data/course-plan.json`.
There is no standalone A0 level: the entry band is one A1 course covering A0-A1.

## The plan, course by course

| course | level | manifest id | entry named | visible | lessons on disk | state |
|---|---|---|---|---|---|---|
| en/general | A1 | general-en-a1 | A1 | yes | 180/180 | visible, complete |
| en/general | A2 | general-en-a2 | A2 | yes | 93/93 | visible, complete |
| en/general | B1 | general-en-b1 | B1 | yes | 120/120 | visible, complete |
| en/general | B2 | general-en-b2 | B2 | yes | 121/121 | visible, complete |
| en/general | C1 | general-en-c1 | C1 | no | 1/65 | hidden |
| en/general | C2 | general-en-c2 | C2 | no | — | hidden |
| fr/general | A1 | general-fr-a1 | A1 | yes | 142/142 | visible, complete |
| fr/general | A2 | general-fr-a2 | A2 | yes | 65/65 | visible, complete |
| fr/general | B1 | general-fr-b1 | B1 | yes | 65/65 | visible, complete |
| fr/general | B2 | general-fr-b2 | B2 | yes | 65/65 | visible, complete |
| fr/general | C1 | general-fr-c1 | C1 | yes | 65/65 | visible, complete |
| fr/general | C2 | general-fr-c2 | C2 | yes | 65/65 | visible, complete |
| ru/general | A1 | general-ru-a1 | A1 | no | — | hidden |
| ru/general | A2 | general-ru-a2 | A2 | no | — | hidden |
| ru/general | B1 | general-ru-b1 | B1 | no | — | hidden |
| ru/general | B2 | general-ru-b2 | B2 | no | — | hidden |
| ru/general | C1 | general-ru-c1 | C1 | no | — | hidden |
| ru/general | C2 | general-ru-c2 | C2 | no | — | hidden |
| it/general | A1 | general-it-a1 | A1 | yes | 65/65 | visible, complete |
| it/general | A2 | general-it-a2 | A2 | yes | 65/65 | visible, complete |
| it/general | B1 | general-it-b1 | B1 | yes | 65/65 | visible, complete |
| el/general | A1 | general-el-a1 | A1 | yes | 65/65 | visible, complete |
| el/general | A2 | general-el-a2 | A2 | yes | 65/65 | visible, complete |

## Decisions already applied

- A0-named entries in the manifest: **1** (visible: 0), all retired starters kept for their decks.
- The English entry band resolves to **general-en-a1** (180/180 lessons, visible).

### Planned courses that are not fully delivered

- **en/general C1** — hidden
- **en/general C2** — hidden
- **ru/general A1** — hidden
- **ru/general A2** — hidden
- **ru/general B1** — hidden
- **ru/general B2** — hidden
- **ru/general C1** — hidden
- **ru/general C2** — hidden

## The entry band has two names

These languages expose the same band twice. Since there is no A0 level, one of the
two must be the visible entry course; the other is either the same course renamed or a
second series that has to be merged or retired.

- **en**: `general-en-a1` (a1, 180/180 lessons) and `vocabulary-en-a1`, `general-en-a0-a1`
- **en**: `general-en-a2` (a2, 93/93 lessons) and `phrasal-verbs-en-a2`, `vocabulary-en-a2`
- **en**: `general-en-b1` (b1, 120/120 lessons) and `phrasal-verbs-en-b1`, `vocabulary-en-b1`
- **en**: `general-en-b2` (b2, 121/121 lessons) and `phrasal-verbs-en-b2`

## Nothing behind the entry

**23** manifest entries have no curriculum, no roadmap and no lessons: they are
placeholders for work not started. Harmless while hidden, but they inflate every count of
"courses" the platform claims.

Of those, **0** are named A0: none.
No language has an A0 curriculum file, and the entry band is A1, so these entries name a level
that does not exist. They are the strongest candidates for removal.

## Written but unbuilt

**69** hidden entries have a curriculum and no roadmap, so the syllabus exists
and the course cannot be opened. This is the largest real gap in the plan, and the cheapest to
start closing: the thinking is done, only the decks are missing.

| course | level | curriculum |
|---|---|---|
| exam-en-b1 | B1 | yes |
| exam-en-b2 | B2 | yes |
| exam-en-c1 | C1 | yes |
| exam-en-c2 | C2 | yes |
| exam-fr-b1 | B1 | yes |
| exam-fr-b2 | B2 | yes |
| exam-fr-c1 | C1 | yes |
| exam-fr-c2 | C2 | yes |
| general-ba-a1 | A1 | yes |
| general-ba-b2 | B2 | yes |
| general-br-a1 | A1 | yes |
| general-br-a2 | A2 | yes |
| general-br-b1 | B1 | yes |
| general-br-b2 | B2 | yes |
| general-de-a2 | A2 | yes |
| general-de-b1 | B1 | yes |
| general-de-b2 | B2 | yes |
| general-de-c1 | C1 | yes |
| general-es-a2 | A2 | yes |
| general-es-b1 | B1 | yes |
| general-es-b2 | B2 | yes |
| general-es-c1 | C1 | yes |
| general-hy-a1 | A1 | yes |
| general-hy-c1 | C1 | yes |
| general-ka-a1 | A1 | yes |
| general-ka-c1 | C1 | yes |
| general-pt-a2 | A2 | yes |
| general-pt-b1 | B1 | yes |
| general-pt-b2 | B2 | yes |
| general-pt-c1 | C1 | yes |
| general-tt-a1 | A1 | yes |
| general-tt-b2 | B2 | yes |
| professional-en-b1 | B1 | yes |
| professional-en-b2 | B2 | yes |
| professional-en-c1 | C1 | yes |
| professional-en-c2 | C2 | yes |
| professional-fr-b1 | B1 | yes |
| professional-fr-b2 | B2 | yes |
| professional-fr-c1 | C1 | yes |
| professional-fr-c2 | C2 | yes |
| professional-ru-b1 | B1 | yes |
| professional-ru-b2 | B2 | yes |
| professional-ru-c1 | C1 | yes |
| professional-ru-c2 | C2 | yes |
| relocation-en-a2 | A2 | yes |
| relocation-en-b1 | B1 | yes |
| relocation-en-b2 | B2 | yes |
| relocation-en-c1 | C1 | yes |
| spoken-en-c2 | C2 | yes |
| spoken-fr-a1 | A1 | yes |
| spoken-fr-a2 | A2 | yes |
| spoken-fr-b1 | B1 | yes |
| spoken-fr-b2 | B2 | yes |
| spoken-fr-c1 | C1 | yes |
| spoken-fr-c2 | C2 | yes |
| spoken-ru-a1 | A1 | yes |
| spoken-ru-a2 | A2 | yes |
| spoken-ru-b2 | B2 | yes |
| spoken-ru-c1 | C1 | yes |
| spoken-ru-c2 | C2 | yes |
| travelling-en-a1 | A1 | yes |
| travelling-en-a2 | A2 | yes |
| travelling-en-b1 | B1 | yes |
| travelling-fr-a1 | A1 | yes |
| travelling-fr-a2 | A2 | yes |
| travelling-fr-b1 | B1 | yes |
| travelling-ru-a1 | A1 | yes |
| travelling-ru-a2 | A2 | yes |
| travelling-ru-b1 | B1 | yes |

## Visible but outside the plan

Published courses whose track or language is not in the plan. They are not wrong, but they are
not decided either: each should be either added to the plan or hidden.

| course | level | lessons |
|---|---|---|
| spoken-en-b1 | B1 | 226/306 |
| cinema-en-b1 | B1 | 106/106 |
| general-de-a1 | A1 | 65/65 |
| general-es-a1 | A1 | 65/65 |
| general-pt-a1 | A1 | 65/65 |
| spoken-en-c1 | C1 | 43/75 |
| spoken-en-b2 | B2 | 36/69 |
| discussion-en-b1 | B1 | 28/28 |
| spoken-en-a1 | A1 | 27/49 |
| pronunciation-fr-a1 | A1 | 18/18 |
| discussion-en-b2 | B2 | 15/15 |
| pronunciation-fr-a2 | A2 | 10/10 |
| pronunciation-fr-b1 | B1 | 10/10 |
| pronunciation-fr-b2 | B2 | 10/10 |
| discussion-en-a2 | A2 | 8/8 |
| pronunciation-en-a1 | A1 | 8/8 |
| discussion-en-c1 | C1 | 7/7 |
| pronunciation-en-a2 | A2 | 6/6 |
| pronunciation-en-b1 | B1 | 6/6 |
| pronunciation-fr-c2 | C2 | 6/6 |
| spoken-en-a2 | A2 | 6/74 |
| pronunciation-en-b2 | B2 | 5/5 |
| pronunciation-fr-c1 | C1 | 5/5 |
| pronunciation-ru-a1 | A1 | 5/5 |
| pronunciation-ru-a2 | A2 | 5/5 |
| cinema-fr-b1 | B1 | 4/4 |
| cinema-ru-b1 | B1 | 3/3 |
| pronunciation-en-c1 | C1 | 3/3 |
| pronunciation-ru-b1 | B1 | 3/3 |
| pronunciation-en-c2 | C2 | 2/2 |
| introductory-english | INTRODUCTORY-ENGLISH | 1/6 |
| pronunciation-ru-b2 | B2 | 1/1 |
| pronunciation-ru-c1 | C1 | 1/1 |
| pronunciation-ru-c2 | C2 | 1/1 |
| spoken-ru-b1 | B1 | 1/1 |

## Hidden, outside the plan

111 entries are not yet available and outside the plan. That is the intended
default for work not started, so nothing here needs a decision.

Languages with a hidden general track: ba, br, de, el, en, es, hy, it, ka, pt, tt

## Decisions taken, and what is left

Taken: the A0 level is gone. Thirteen A0 placeholders were removed (twelve `general-*-a0` plus
`grammar-en-a0`), because no language has an A0 curriculum. The only A0-named entry left is the
retired `general-en-a0-a1` starter, hidden and kept for its 48 decks. The English entry band is
now the 180-lesson `general-en-a1`, and `general-en-c1` is hidden until built - which removed 65
lesson slots from the "available" count that never had files behind them.

Left open:

1. **Russian is written and invisible.** Six curricula exist (A1 has 142 lessons) and none has a
   roadmap, so all six entries are hidden. This is the biggest planned gap with the least work
   left in front of it: the syllabus is done.
2. **35 visible courses sit outside the plan** (pronunciation, spoken, cinema, discussion, and
   the single-level German, Spanish, Portuguese courses). Each is either added to the plan or
   hidden; leaving them visible-but-unplanned is how the manifest drifted in the first place.

## What this cannot tell you

- whether a lesson's content is any good, only whether the file exists;
- whether a visible course is listed in the plan by accident or by decision;
- whether the A0-A1 and A1 series teach the same thing: that needs a curriculum diff, and the
  two curricula are `curriculums/<lang>/general/A0.json` and `A1.json`.

