# The speaking method: lego blocks that never leave the table

A proposal for how COSY should teach, written against the repository as it is today, not as we might
wish it were. The measurements below come from `npm run audit:recycling`
(`docs/RECYCLING_AUDIT.md`).

## Why this document exists

We already have 1,711 decks and 21,040 curriculum vocabulary items. What we do not have is a
mechanism that makes a learner *speak* them. The decks are self-contained: each opens its own topic,
introduces its own words, drills its own grammar, and closes. The next deck opens a different topic.

The numbers say the same thing:

- **21,040** vocabulary items are promised by the curricula; **9,423** appear in any deck at all.
- Of those, **3,258 (35%)** appear in exactly **one** deck — the one that introduced them.
- The `recycling` field exists on 1,542 decks but holds prose: *"Lessico del livello A2 e del modulo
  precedente"*. 130 decks say something that generic. Nothing downstream can check it, so nothing
  does.

A word met once, in a text about something else, and never asked about again, is passive knowledge
by construction. No amount of well-written slides fixes that if the *next* lesson doesn't ask.

## The model

Think of the language as a set of lego blocks, and the course as a build in progress where every
block you have placed stays on the table, visible, and gets picked up again.

**A block** is one unit a learner can say: a word, a collocation, a set phrase, an idiom, or a
grammar frame (`penso che + congiuntivo`, `if + past perfect, would have`). Not a paradigm, not a
word list — a thing you can put in a sentence.

Three laws, and they are laws rather than guidelines because each one is checkable:

**Law 1 — Introduce, then ask.** No block enters a lesson without a question that requires it,
in the same slide. Not "here are eight expressions", but "here are eight expressions and here are
eight questions, one each, and you answer them before the slide ends."

**Law 2 — Every lesson pays rent.** Every lesson must ask at least *k* questions whose answers
require blocks from earlier lessons. New material is the minority of the speaking time; retrieval is
the majority. If a lesson introduces nothing and only recombines, that is a good lesson, not a gap.

**Law 3 — Nothing retires.** A block is revisited on a schedule (below) until it has been used
unprompted at least twice in learner output. Presence in a deck is not the target; use is.

## The ladder of use

Most "recycling" in coursebooks is recognition dressed as practice. Five rungs, and a block must
climb:

| rung | what the learner does | what it looks like |
|---|---|---|
| 1 recognise | sees the block in input and understands it | reading/listening text |
| 2 recall | produces it from a cue, with the form given | gap-fill, "say this in Italian" |
| 3 produce | produces it from meaning alone | "how would you say you doubt it?" |
| 4 deploy | uses it inside a longer answer of their own | "tell me about a time…" |
| 5 reuse | uses it unprompted, in a *later* lesson, without a cue | free stage |

A course that stops at rung 2 is a workbook. Ours currently stops at 1–2 and calls it practice.
The target: **every block reaches rung 4 in its own lesson, and rung 5 within three later lessons.**

## Slide by slide

The ten-stage frame stays; what changes is who does the talking and which blocks appear.

| stage | today | with the method |
|---|---|---|
| 1 objective | states the can-do | states the can-do **and names the blocks being returned to** |
| 2 recycling | generic prose | **five retrieval questions, one per prior block**, chosen by schedule, not by theme |
| 3 vocabulary | list of new items | new items **each paired with its question**; learner answers before moving on |
| 4 pronunciation | drills sounds | drills them **inside sentences built from prior blocks** |
| 5 grammar | explains, then drills | introduces the frame, then **asks the question the frame makes answerable** |
| 6 reading/listening | a text on the topic | the text **contains ≥3 blocks from earlier lessons**, and comprehension questions that require them |
| 7 free production | a task | the task **cannot be completed without** new + named prior blocks |
| 8 errors | common mistakes | mistakes **from this lesson's actual output**, plus a trap built on a prior block |
| 9 adaptation | easier/harder | harder version = **more prior blocks**, not more new ones |
| 10 review/homework | "write ten lines using X" | "use these five blocks in five answers, record yourself, name the blocks you avoided" |

The change is concentrated in stage 2 and stage 7: one is the retrieval engine, the other is where
retrieval is proven.

## The question-first rule

This is the single most useful authoring constraint, and it costs nothing to apply:

> **Write the question before the item.**

If you cannot write a question at the learner's level that the item answers, the item does not
belong in the lesson yet — or the lesson's level is wrong. This single rule kills three failure modes
at once: vocabulary lists that teach words no A1 learner can be asked about, grammar presented
because it exists rather than because it is needed, and "communication" slides that are really
translation exercises.

Worked examples, because the rule is easy to state and hard to apply:

**Vocabulary, Italian B1.** Item: *temo che* (I fear that). Bad: list it and give a translation.
Good: *"Cosa temi che succeda quest'estate?"* — the learner must answer with *temo che + congiuntivo*.
The item arrives as an answer to a real question, and the grammar it needs is already in the room.

**Grammar, Italian B1.** Point: *congiuntivo imperfetto*. Bad: conjugate *essere* and *avere* across
six persons. Good: *"Se potessi cambiare una cosa della tua città, cosa cambieresti?"* — the frame
appears because a question needs it, and the learner produces it to answer.

**Vocabulary, English B2.** Item: *to hedge* (diplomatic softening). Bad: define it. Good: *"Your
supplier has missed a deadline. Tell me it's a problem without saying it's a problem."* — the learner
reaches for *it seems*, *I'm afraid*, *we may have an issue*, and the item is a tool.

**Grammar, English B2.** Point: *fronting*. Good: *"Start your sentence with the thing that matters
most: your team, not the deadline."* Not "fronting is used for emphasis".

## The recycling schedule

A simple, mechanical schedule beats an editorial one, because it can be computed:

- **Lesson +1 and +2:** every block from the current lesson returns in stage 2, as a question.
- **Lesson +3 to +7:** the block returns once, at rung 4, inside a task on a different theme.
- **Lesson +8 onwards:** returns twice more, spaced, then the block is considered held.
- **Unit end:** a mixed retrieval task that samples across the whole unit — not a test, a conversation.

Picking *which* prior blocks is the one place a generator helps: given the chunk registry and the
schedule, choose the retrieval set so each lesson picks up blocks whose interval is due, preferring
ones that fit the lesson's theme so the practice is not a quiz.

## What has to change in the data

All additive; nothing here breaks a deck that lacks it.

```jsonc
// curriculum lesson
"chunks": [
  {"id": "cosydata:it:temo-che", "kind": "set-phrase", "text": "temo che", "rung": 4},
  {"id": "cosydata:it:cong-congiuntivo", "kind": "frame", "text": "temo che + congiuntivo", "rung": 3}
],
"returns": ["cosydata:it:penso-che", "cosydata:it:se-potessi"],  // scheduled by the generator
```

```jsonc
// deck slide element
{"type": "input", "prompt": "Cosa temi che succeda quest'estate?", "usesChunk": ["cosydata:it:temo-che"]}
```

Why ids from COSYdata rather than the literal string: the vocabulary manual and the dictionary are
already meant to be linked by id, and a string cannot be counted reliably across a language with
inflection. The id is what makes "was this used again?" a query rather than an opinion.

## What to measure

Three numbers, all computable today, none of them requiring a teacher to fill in a form:

| metric | definition | today | target |
|---|---|---|---|
| **orphan rate** | curriculum items appearing in exactly one deck | 35% | <10% |
| **retrieval density** | stage-2 questions whose answer needs a prior block, per lesson | ~0 | ≥5 |
| **reuse latency** | median number of lessons between introduction and first later use | >3 for orphans; 3 median overall | ≤3, with no orphans |

`npm run audit:recycling` computes the first and part of the third. Retrieval density needs the
`usesChunk` tags to be authored, which is why the data model comes before the audit.

## The capacity finding

Running the planner on Italian B1 turned an intuition into arithmetic. The course introduces **7.7
blocks per lesson**. Five returns each needs **2,378** returns; five questions per lesson provides
**320** slots. The schedule therefore honours 13% of the demand, and a 65-lesson course can hold
about **64 blocks** at that budget against the 500 it currently introduces.

| questions per lesson | returns per block | blocks a 65-lesson course can hold |
|---|---|---|
| 5 | 5 | 64 |
| 10 | 5 | 128 |
| 15 | 5 | 192 |
| 15 | 3 | 320 |

This is the mechanical explanation for the 35% orphan rate: the item load is several times what any
plausible retrieval slot can sustain. There are only three honest responses, and they are a decision
for the course design, not for the generator:

1. **Cut the load.** Fewer new blocks per lesson, more reuse. A lesson can carry about one new block
   per five questions of retrieval budget.
2. **Grow the slot.** A longer stage 2 (10-15 questions) roughly doubles or triples capacity, at the
   cost of time elsewhere in the 60-minute frame.
3. **Triage.** Mark some blocks `hold` (recycled on schedule) and others `recognise` (met once on
   purpose, never returned). Recognise-only blocks are legitimate — a reading text needs words the
   learner will not produce — but they must be *chosen*, not the accidental remainder.

## Failure modes, and the guard for each

**Fake recycling.** The word appears in an instruction ("use *temo che* in a sentence"), so the
metric is satisfied and nothing was produced. Guard: only count an occurrence that is inside a
question the learner answers, which is why `usesChunk` attaches to *prompts*, not to text.

**Over-stuffing.** A well-meaning author returns 20 blocks to stage 2 and the lesson becomes a test.
Guard: a hard cap — five retrieval questions per lesson, chosen by schedule, and the rest wait.

**Level creep.** Recycling pushes vocabulary upward: returning C1 blocks in a B1 lesson is not
recycling, it is a different course. Guard: a block may only return in a lesson whose level is at or
above its own, and no more than one level above.

**Drill drift.** The easiest way to "ask a question about the grammar" is a transformation exercise.
Guard: stage 2 and 7 questions must have more than one defensible answer.

**Silent divergence.** Decks are generated from manuals; editing a deck by hand makes it drift from
its source. Guard: the same rule we already learned — change the manual or the curriculum, then
rebuild.

## Order of work

1. **Chunk registry, one course.** Done for Italian B1: `npm run chunks:build -- --course general-it-b1`
   writes `data/chunks/general-it-b1.json`, 500 blocks in 65 lessons. Only 21% resolve to COSYdata
   ids; the rest carry provisional `pending:` ids so planning is not blocked. Report:
   `docs/CHUNK_REGISTRY_general-it-b1.md`.
2. **Retrieval generator, read-only.** Done: `npm run chunks:plan -- --course general-it-b1` prints
   the plan and writes `docs/RETRIEVAL_PLAN_general-it-b1.md`. It immediately produced the finding
   that decides the rest of this work — see the capacity section below.
3. **Rewrite stage 2 on one unit.** Done for lessons 2-5 of Italian B1:
   `docs/PILOT_RETRIEVAL_IT_B1_UNIT1.md`. 28 questions, each tied to a block id, applied to the
   curriculum and the decks. Read as a learner it works, with one flaw the planner must fix: lesson
   3 got eight past-tense questions because lessons 1 and 2 were both about the past, so a variety
   constraint (no more than two returns of one kind per lesson) is needed before scaling.
4. **Measure, then widen.** Orphan rate and retrieval density on that unit, then the course, then the
   language, then the rest.
5. **Only then** touch the builders, so the pattern is in the generator rather than in 1,711 files.

## Open decisions

- **Grammar-led or theme-led.** This document assumes themes lead and grammar is threaded through
  them, because that is the only arrangement where retrieval is natural. Greek is currently
  grammar-led (see `docs/GREEK_CAN_DO_PROPOSALS.md`). If grammar-led is the house style, the lego
  model still works but the retrieval sets must be built across the grammar spine, which is a
  different generator.
- **How much new material per lesson.** The proposal above implies a lower new-item count than today
  (fewer words, more reuse). That is a real trade-off: fewer items per lesson, better held.
- **Whether stage 2 is spoken aloud.** Retrieval read silently is recognition; the method only works
  if stage 2 is answered out loud, in class or into a recording. That is a delivery decision, not a
  content one.
