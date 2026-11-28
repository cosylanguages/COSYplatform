# Russian A1: the decks are built, the words are not Russian

## What exists now

`curriculums/ru/general/A1.json` has 23 modules and 142 lessons, and the manual shelf `manuals/ru/grammar/a1`
has 115 pages. `scripts/lesson-build/build_decks.py --lang ru --level a1 --write` builds **142 decks** in
`lessons/general-russian-a1/` and `roadmaps/general-ru-a1.json`, with no lesson skipped for want of a page.

The course is **not published**. `general-ru-a1` is still `not_yet_available` in the manifest, because a
third of the vocabulary in the curriculum is English (see below).

## What had to be added

- **The Russian frame in `manual_page.py`.** The Russian shelf writes pages in an older shape than the
  C1/C2 French ones: guided-discovery lines in a `<ul class="gv-lines">` rather than an `<ol>`, the rule in a
  `<p class="gv-formula">` inside a `<section class="gv">`, context examples in a titled
  `<section class="examples">`, notes in `div.box.mint` headings (Что вы замечаете, Обрати внимание,
  Почему это важно, Думайте как носитель, Замечание о произношении), mistakes as `wrong-line`/`right-line`
  pairs, and reference tables that put the example in the first column and the note in the second.
  With those read, **38 of the 39 grammar pages the curriculum uses produce examples and a rule**; the
  holdout is `noun-gender`, which has no example list at all.
- **Russian in the builder.** A `ru` scaffold of 70 strings (the deck must be written in Russian, not
  translated at render time), `SETTINGS['ru']` for the folder and track, `EXAMPLE_LABEL['ru']`, and a
  Cyrillic transliteration table in `slug()`: without it every Russian title collapsed to `ru-a1----`.
- **A language guard.** 113 lessons carry `recycled: "Module 1 foundational progression"` in English. A
  curriculum field in the wrong language now falls back to the Russian scaffolding sentence instead of
  appearing on slide 2.
- **`scripts/grammar-ids/wire_ru_a1.py`**: nine lessons named their grammar in free text only and had no
  `grammarIds`. They now point at pages that exist, which takes the curriculum to 253 ids over 39 unique
  points.

## The blocker

`npm run audit:monolingual` counts a vocabulary list as foreign only when **every** item in it is foreign.
Russian A1 fails in **102 of 142 lessons**:

| lesson | vocabulary as written |
|---|---|
| 6.1 Типы магазинов и места покупок | supermarket, bakery, pharmacy, shop, store |
| 6.2 Категории товаров и наличие | product, food, clothes, medicine, book |
| 6.3 Деньги, валюта и цены | money, price, cost, euro, dollar |

Only 40 lessons have Russian vocabulary. The lesson titles, the grammar strings and the teacher notes are
Russian; the vocabulary is an English list waiting to be translated. The same defect reaches the decks:
**99 of 142 carry Latin words** in a slide, and 43 reading slides had no examples until the table fallback
was added (2 still do).

That makes the remaining work translation, not engineering: roughly 800 vocabulary items across 102
lessons, each of which should be chosen from the lesson's own manual page rather than translated word for
word from the English list — `чита́ю` and `кни́га` belong in lesson 1 of module 2, but `supermarket` in
module 6 should become `суперма́ркет`, `пека́рня`, `апте́ка`, and the stress marks the shelf uses.

## Platform-wide, from the same audit

213 of 5,149 lessons across all curricula have a fully foreign vocabulary list. Russian A1 is 102 of them;
Armenian A1 is 55 of 55 and Georgian A1 is 55 of 55 — those two are complete English shells, hidden and out
of the plan, so nothing ships. Russian C2 has one.

## Reproducing

```bash
COSY_MANUALS=/path/to/COSYmanuals \
  python3 scripts/lesson-build/build_decks.py --lang ru --level a1 --write
npm run audit:monolingual   # -> docs/MONOLINGUAL_AUDIT.md
npm run stats:build
```

`validate` passes with the decks in place: 123 tests, plus 4 new ones for the Russian frame
(`tests/manual-page-ru.test.js`).
