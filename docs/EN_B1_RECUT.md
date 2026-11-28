# English B1 re-cut — findings and options

Not applied. This records what the measurement found in `general-en-b1` and the three ways out,
so the decision can be made on evidence rather than on titles.

Evidence: `docs/B1_SLOT_ALIGNMENT.md`, `curriculums/en/general/B1.json`,
`roadmaps/general-en-b1.json`, the decks under `lessons/general-english-b1/`, and the English B1
manual shelf (`manuals/en/grammar/b1/topics`, 48 pages).

## 1. The course is 80 good lessons plus 40 mislabelled ones

| block | units | lessons | state |
|---|---|---|---|
| themed | 1–10 | 80 | real can-dos (*I can discuss a health problem and use the care system*) |
| legacy | 11 (*Additional Legacy Topics & Draft Lessons*) | 40 | titles and content do not match |

Against the grid: **10/13 slots**. Present: identity, work, media, environment, health, travel,
money, science, culture, ethics. Missing: society and law (t17), economy and business (t18),
language and register (t22).

## 2. The legacy bucket cannot be dissolved into the grid

The obvious move — reuse 15 of its 40 lessons for the three missing slots — fails on inspection.
Reading the 40 titles against the can-do each deck states, roughly three quarters pair a topic with
something unrelated, or with a bare grammar objective:

| lesson | title | what the deck actually teaches |
|---|---|---|
| 3 | Modern Nomads | I can discuss when healthy habits become unhealthy. |
| 4 | Gastro Tourism | I can talk about athletes' careers and past events. |
| 6 | How to Survive Family Holidays | I can describe body modification procedures. |
| 8 | Family Dynasty | I can discuss the skills workers will need. |
| 19 | Protecting Languages | I can give and respond to advice. |
| 31 | Eco Business | I can describe unusual foods using relative clauses. |
| 34 | Manners | I can compare places to live. |
| 39 | Elevator Pitch | Can evaluate environmental policies and hypothesize past and present consequences. |
| 40 | Success Stories | Can express environmental concerns, personal regrets, and policy desires. |

Ten of the forty state a grammar objective outright (*I can choose between all present tenses*,
*I can use every and each correctly*, *I can recognise clipped words*), so the bucket is a grammar
sequence wearing forty unrelated topic titles. Re-labelling those lessons as civic or business
units would recreate exactly the defect this work exists to remove: a theme the content does not
serve.

A lexical title/can-do comparison was tried as a shortcut and rejected: it scores *Professional
Sports* against *I can talk about athletes' careers* as a mismatch, because paraphrase shares no
words. The table above was produced by reading the decks, and that is the only method here that
survives a spot check.

## 3. The manual has nothing for the three missing slots either

The English B1 shelf holds 48 pages and every one is a grammar point (passives, conditionals,
modals, relatives, phrasal verbs…). There is no page for civic rights, for register and politeness,
or for business communication, so the three missing units cannot be built by pointing decks at
existing pages.

## 4. Options

| | what happens | cost | result |
|---|---|---|---|
| **A. Retire and author** | archive the 40 decks and roadmap entries, write three new units (ethics is present; society/law, economy/business, register) | 15 new decks, ~30 manual pages, three lexis sets; 40 decks archived | 13/13 at 95 lessons |
| **B. Repair in place** | retitle the 40 lessons to the can-dos their decks already teach, keep them as one grammar unit | 40 renames across curriculum, roadmap and deck files; no new content | 10/13, but honest: a grammar appendix that says it is one |
| **C. Hybrid** | retitle the 40 and mark the unit `isOptional: true` (grammar clinic), then author the three missing units | B's cost plus A's authoring | 13/13 plus an optional 20–40 lesson clinic |

## 5. Recommendation

**C, in that order.** Do B first because it is cheap and removes the lie in 40 titles: after it,
nothing in the catalogue claims to be about nomads when it teaches habits. Then decide whether the
grammar clinic stays in the catalogue or moves to an archive — `isOptional` already exists in the
roadmap schema, so keeping it costs nothing but shelf space.

A alone is tempting but it deletes 40 decks of real (if mis-titled) practice material, and the
English B1 manual would still need the same ~30 new pages before the three new units can be built.

## 6. What this says about the other languages

Russian B2 has the same legacy pattern (`Раздел 10: Подготовка к экзамену` plus a 40-lesson bucket
wearing section titles), and English B2 carries an identical bucket. The measurement to run before
any B2 re-cut is the same one used here: title ↔ can-do overlap per lesson. Where it is zero, the
unit is a grammar sequence and must be declared as one before it is themed.
