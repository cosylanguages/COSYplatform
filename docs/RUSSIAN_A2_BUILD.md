# Russian A2: published

`general-ru-a2` is live: **65 decks** in `lessons/general-russian-a2/`, `roadmaps/general-ru-a2.json`, 13
modules of five lessons. Platform totals: **52/169 courses, 2564/3066 lesson slots, 2374 lesson files**.

The curriculum existed and was already written in Russian — unlike A1, whose vocabulary was English. What it
lacked was a way to reach the manual, and a consistent voice.

## What had to be fixed

**The grammar ids pointed at A1.** Twenty-five of the 65 lessons had no `grammarIds` at all, and among the
forty that had them most cited the A1 shelf: the lesson on the past tense and aspect cited
`ru-a1-proshedshee-vremya` although the A2 shelf has its own `ru-a2-proshedshee-vremya-i-vid`. A2 is exactly
where aspect, the prefixed verbs of motion, the oblique cases of *который* and the conditionals get their
real treatment, so `scripts/grammar-ids/wire_ru_a2.py` re-points every lesson at the A2 page that teaches
it. The result is **131 ids over 57 unique pages**: 52 of the 55 A2 pages, plus five A1 pages for the points
the A2 shelf does not carry (accusative of direction, numerals plus genitive, *хотеть*, demonstratives,
possessives). Three of the 55 A2 pages remain unused.

**Three numbering schemes in one file.** `Раздел 1: ...` for the first nine modules, three bare titles
(`Учёба, образование и курсы`), and the thirteenth module numbered `Раздел 10`. All 13 now read
`Модуль N. Sentence case`, matching A1.

**Vocabulary in Title Case.** All 381 items were capitalised (`Вчера`, `Прошлым летом`) while A1 writes them
lowercase. Fifty lists were rewritten; acronyms (ТРКИ) and Latin level codes are untouched.

**Can-do statements in the bare infinitive.** Sixteen lessons read `описать свой учебный путь` where the
other 49 read `Может рассказать...`. All now open with `Может`; the one descriptive outlier in the final
review lesson became `Может уверенно общаться в стандартных ситуациях уровня A2 (ТРКИ-1)`.

**Homework addressed the learner as *ты*.** Fifteen authored notes read `Опиши свой учебный путь.` while
every other instruction in the course is formal. The leading imperative is now formal, through a small
verb table so nothing else is touched.

**One English line.** A lesson's `recycled:` read `Carried over from A1: ...`, which reached slide 2 as
`Уже известно: Carried over from A1: ...`; it now reads `Перенесено с A1: ...`.

## One builder change

Ten A2 pages have no checklist block — no self-check list for the cool-down slide, which left ten decks with
an empty blockquote. The builder now falls back to three scaffold sentences (what I understand, how I use the
words, what I can ask), written for all three languages it serves. It also fixes a doubled colon on slide 2:
`Уже известно: Повторение: ...` came from a recycled default that carried its own label; Italian had the same
bug plus `Ripasso di il livello A1`, and Greek the same redundancy.

## Build

```bash
python3 scripts/grammar-ids/wire_ru_a2.py          # 65 lessons, 131 ids
python3 scripts/content/normalize_ru_a2.py         # titles, case, can-do, homework, recycled
python3 scripts/lesson-build/build_decks.py --lang ru --level a2 --write
npm run stats:build && npm run validate
```

Both scripts are idempotent and refuse to run if a lesson is missing from their map.

## State of the 65 decks

- **0 empty elements**, 0 slides leaking Latin text.
- 5 lessons per module, ten slides each, the stages A1 uses.
- The A2 shelf's own weakness shows through: ten pages have no self-check, some have no example bank, and
  five of its 55 pages are never used by any lesson.

## Still open

1. **Ten A2 pages need a self-check section** — write them in COSYmanuals, then rebuild the decks (the
   deck copies the page at build time).
2. **Three A2 pages are unused**: `chislitelnye-sostavnye-i-drobi`, `kratkie-prichastiya-vvedenie` and
   `substantivirovannye-prilagatelnye`. Nothing in the A2 curriculum needs compound numerals, short
   participles or substantivised adjectives — they belong to B1, and the curriculum should either grow a
   lesson for them or the pages should move.
3. **Russian B1, B2, C1 and C2 have no curriculum**, so they stay hidden.
