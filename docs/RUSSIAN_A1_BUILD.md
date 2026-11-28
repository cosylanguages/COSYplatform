# Russian A1: published

`general-ru-a1` is live: **142 decks** in `lessons/general-russian-a1/`, `roadmaps/general-ru-a1.json`, and
the manifest entry no longer carries `not_yet_available`. Platform totals move to **51/169 courses,
2499/3001 lesson slots, 2309 lesson files**.

## What had to be fixed first

**The vocabulary was English.** 102 of the 142 lessons carried a list like `supermarket, bakery, pharmacy`
under a Russian title; only modules 0 to 5 were written in Russian. `scripts/content/fill_ru_a1_vocabulary.py`
holds the replacement list per lesson, in the style the Russian modules already used: lowercase, no stress
marks, nouns in the nominative singular, verbs in the infinitive, adjectives in the masculine singular, six
words per lesson, chosen from the lesson's own theme so the vocabulary slide agrees with its manual page.
The curriculum now holds **868 words**, all Russian.

**The unit titles spoke three dialects.** `Раздел 0: Первые шаги (A0)`, `MODULE 1. ПЕРВЫЙ КОНТАКТ И ЛИЧНЫЙ
ПРОФИЛЬ` and `МОДУЛЬ 2. СЕМЬЯ И СОЦИАЛЬНЫЕ СВЯЗИ`. `scripts/content/normalize_ru_a1_titles.py` makes every
title `Модуль N. Sentence case`, and drops the A0 marker: the entry band is A1.

**The deck could not read the shelf.** Eleven of the 39 grammar pages the curriculum leans on were
parseable at first. The Russian pages write guided-discovery lines in a `<ul class="gv-lines">`, the rule in
a `<p class="gv-formula">` inside `<section class="gv">`, context examples in a titled
`<section class="examples">`, notes under `box mint` headings, mistakes as `wrong-line`/`right-line` pairs,
and reference tables whose first column is the example. Taught those, coverage is **38 of 39**.

**Every deck id would have collided.** `Привет и Добро пожаловать` slugged to `ru-a1----` until the
Cyrillic table went into `slug()`; it is now `ru-a1-privet-i-dobro-pozhalovat`.

## Build

```bash
COSY_MANUALS=/path/to/COSYmanuals python3 scripts/content/fill_ru_a1_vocabulary.py     # already applied
COSY_MANUALS=/path/to/COSYmanuals python3 scripts/content/normalize_ru_a1_titles.py    # already applied
COSY_MANUALS=/path/to/COSYmanuals python3 scripts/lesson-build/build_decks.py --lang ru --level a1 --write
npm run stats:build && npm run validate
```

Both content scripts are idempotent: they skip a lesson whose list or title is already right, and refuse to
run if a lesson holds an English list with no replacement given.

## State of the 142 decks

- **0 empty elements.** Before the table and vocabulary fallbacks the count was 43; after the table
  fallback alone, 2 (`noun-gender` has no example list on its page); the vocabulary fallback closes them.
- **6 slides carry an English sentence**, all the same manual quiz prompt, `Переведите «I like this
  book»:`. That lives in COSYmanuals, not here, and should become a sentence in Russian.
- Two pronunciation slides are generic: only 5 of the 142 lessons carry a `pronunciation:` note, so the
  rest fall back to the page's own pronunciation box, and where the page has none, to the scaffolding line.
- `noun-gender`'s page is the weakest on the shelf: a rule, an observation and a quiz, no examples.

## Audits

`npm run audit:monolingual` → `docs/MONOLINGUAL_AUDIT.md`: 111 of 5,149 lessons still have a fully foreign
vocabulary list — Armenian A1 55/55 and Georgian A1 55/55 (complete English shells, hidden and out of the
plan) and one lesson in Russian C2. Russian A1 is no longer among them.

`npm run audit:coverage` → `docs/COURSE_COVERAGE.md`: Russian A2 to C2 have no curriculum and no roadmap,
so they stay hidden; Russian A1 is the only published Russian course apart from the pronunciation series.
