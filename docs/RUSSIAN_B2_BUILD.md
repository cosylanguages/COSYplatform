# Russian B2: published

`general-ru-b2` is live: **65 decks** in `lessons/general-russian-b2/`, `roadmaps/general-ru-b2.json`, 13
modules of five lessons. Platform totals: **54/169 courses, 2694/3196 lesson slots, 2504 lesson files**.

## The ids pointed two levels down, or were missing

31 of the 65 lessons had ids, and those mostly cited B1 or A1 pages: the lesson on participles in
journalistic prose cited `ru-b1-stradatelnye-prichastiya-nastoyashchego-i-proshedshego`, and the one on
investment forecasts cited `ru-a1-budushchee-vremya`. **Thirty-four lessons, including the whole of modules
10, 11 and 12, had no ids at all.** B2 is where nominalisation, the stylistic word order, the conditional
with *бы*, the distancing constructions, the comparative syntax and the written-register phraseology live.

`scripts/grammar-ids/wire_ru_b2.py` gives every lesson its pair: **131 ids over 57 unique points — all 36 B2
pages**, plus 21 B1 and A2 pages for the grammar the B2 shelf leaves to the level below (the passive with an
instrumental agent, short participles, the gerund phrase, purpose conjunctions, time conjunctions, the
conditional with *если*, the bare subjunctive). This is the first Russian level whose shelf is used in full.

## The same voice passes, one level up

`normalize_ru_level.py --level B2` applied the six fixes described in `RUSSIAN_B1_BUILD.md`: 13 unit titles
to `Модуль N.`, 395 vocabulary items to lowercase, 16 can-do lines to the third person, 8 homework notes to
the formal imperative, one English `recycled:` line, and the final exam's placeholder "vocabulary"
(`ВСЯ лексика уровня B2`, `Все грамматические конструкции B2`) replaced by six real words.

## One builder change

`build_decks.py` accepted only `--level a1|a2|b1`, and its per-language `previous` phrase — the word that
fills `Уже известно: {previous}.` when a lesson carries no `recycled:` — existed only for `a1`. B2 hit both:
the argument was rejected, and a lesson without a `recycled:` line would have raised `KeyError`. Both now
cover every level from A1 to C2, in Italian, Greek and Russian.

## Build

```bash
python3 scripts/grammar-ids/wire_ru_b2.py                 # 65 lessons, 131 ids
python3 scripts/content/normalize_ru_level.py --level B2
python3 scripts/lesson-build/build_decks.py --lang ru --level b2 --write
npm run stats:build && npm run validate
```

## State of the 260 Russian decks

- **0 empty elements** across A1, A2, B1 and B2.
- Latin-text sweep: A2, B1 and B2 clean; A1 still has six slides printing `Переведите «I like this book»:`,
  a prompt that comes from a COSYmanuals page rather than from the platform.
- Every B2 lesson resolves to a manual page.

## What C1 and C2 need

Both curricula exist and both are invisible, but they are a different job from B1 and B2:

1. **C1 stores `grammar` as a single string per lesson, not a list.** A2, B1 and C2 all use a list of
   phrases; C1 has exactly one point per lesson (`'Пассивные конструкции и возвратные глаголы'`). The
   builder and the id matcher both accept it, but a deck only gets one grammar focus where every other
   level gets two, and the curriculum understates what a C1 lesson teaches. Either the field is normalised
   to a list of two points (a content decision per lesson) or the deck keeps one.
2. **C2 has 10 lessons with no `grammar` at all** and 55 with a list. The ten are the vocabulary-led
   lessons in modules 1 to 4 and the final review.
3. **C2 had a duplicate vocabulary item** in 7.1 (`Педантичный` twice); `normalize_ru_level.py` now removes
   repeats rather than refusing to run.
4. C1 has 28 pages on its shelf and C2 has 20, against 65 lessons each — both shelves will need new pages,
   not just re-pointing, before the decks can be built the way B2's were.
