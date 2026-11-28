# Russian C1 and C2: published

`general-ru-c1` and `general-ru-c2` are live: **130 decks**, 65 each, 13 modules of five lessons per level.
Platform totals: **56/169 courses, 2824/3326 lesson slots, 2634 lesson files**.

With them the whole Russian shelf is published: A1 142, A2 65, B1 65, B2 65, C1 65, C2 65 — **467 decks**.

## C1 — no ids at all, and a shelf that reframes the grammar

C1 arrived with **zero grammar ids** and with one grammar phrase per lesson instead of a list, the only
Russian level shaped that way (`'Пассивные конструкции и возвратные глаголы'`, not `['…', '…']`). The C1
shelf holds 28 pages, and each of them is a C1-level reframing of something the learner already knows:

| the lesson's phrase | the C1 page that carries it |
|---|---|
| Пассивные конструкции и возвратные глаголы | `otrushenie-subyekta-i-passivnyy-distantsirovannyy-sintaksis` — agent removal, distancing syntax |
| Сослагательное наклонение вежливости | `slozhno-soslagatelnyy-sintaksis-diplomatii` — the complex subjunctive of diplomacy |
| Порядок слов и коммуникативная перспектива | `tema-rema-i-informatsionnaya-upakovka` — thematic-rhematic packaging |
| Периоды и симметрия | `sbalansirovannye-trekhchlennye-konstruktsii-trikolon` |
| Средства смягчения утверждения | `akademicheskoe-smyagchenie-hedging` |

`wire_ru_c1.py` gives every lesson the C1 page that reframes its point **and** the B2 or B1 page that teaches
the grammar underneath — a C1 lesson does not stop needing the rule it builds on, and that pairing is the
spiral the curriculum already implies. **130 ids, all 28 C1 pages used**, plus 24 B2, 6 B1 and 2 A2 pages.
Where the C1 shelf has no page for the point (indirect speech, purpose conjunctions), both ids are
lower-level pages rather than the nearest C1 device — the deck teaches the grammar honestly.

The curriculum's single phrase stays as it is: one `grammar` string, two ids.

## C2 — ten lessons with no grammar, nine with no vocabulary

C2 had ids on 10 of 65 lessons, **ten lessons with no `grammar` at all** (the opening lesson of each module)
and **nine lessons with no `vocabulary` key at all** — the ones built around a stylistic device, where the
word list had simply been left out. Both gaps produced broken decks: an empty blockquote on slide 3 and no
vocabulary to say out loud.

- `wire_ru_c2.py`: **130 ids, all 20 C2 pages used**, plus C1, B2 and B1 pages for the grammar underneath —
  deontic modality in statutes, epistemic modality in philosophy, extrapolation, scope of particles, the
  prosody of IK-6 and IK-7, dense legal nominalisation.
- The nine device lessons now have their metalanguage: *инверсия, ритм, каденция* for the inversion lesson;
  *модальность, гипотеза, ирония* for the modality lesson; *экстрапозиция, вынос, весомость* for the
  heavy-end lesson.

## The voice passes, and what C2 needed beyond them

`normalize_ru_level.py` handled both levels: 13 unit titles, 46 C2 can-do lines and 10 vocabulary lists, 55
homework notes to the formal imperative, the `Carried over from C1:` line that had stayed English (C1 and C2
now translate too), and the duplicate `Педантичный` in C2 7.1, which the script now removes instead of
refusing to run.

C1's 65 can-do lines were all bare infinitives (`описать дизайн исследования`) and became `Может описать…`.

## Build

```bash
python3 scripts/grammar-ids/wire_ru_c1.py                # 65 lessons, 130 ids
python3 scripts/grammar-ids/wire_ru_c2.py                # 65 lessons, 130 ids
python3 scripts/content/normalize_ru_level.py --level C1 # then --level C2
python3 scripts/lesson-build/build_decks.py --lang ru --level c1 --write
python3 scripts/lesson-build/build_decks.py --lang ru --level c2 --write
npm run stats:build && npm run validate
```

## State of the 467 Russian decks

- **0 empty elements** at any level.
- **0 English residue** except six A1 slides printing `Переведите «I like this book»:`, a prompt from a
  COSYmanuals page.
- Latin text in C2 is content, not leakage: *Amicus curiae, Prima facie, de facto, Ratio* are the vocabulary
  of the lessons on Latin expressions.
- Every lesson in every level resolves to a manual page.

## What is still thin at C1 and C2

1. **Reuse is high.** 65 C1 lessons over 28 pages means the strongest pages carry eight lessons each —
   agent removal and distancing syntax, and nominalisation in journalism, both appear eight times. A C1 shelf
   of 50 pages would let each lesson own its device.
2. **C1's `grammar` field is still one string per lesson.** The deck now shows two focuses because
   `grammarIds` has two, but the curriculum still records one point. Normalising it means deciding the second
   point of 65 lessons.
3. **C2's ten device lessons had no vocabulary** and now carry six metalanguage items each; a native-style
   C2 would give them idioms and collocations rather than device names.
4. Two B1 pages are still unused (`otnegalnye-mestoimeniya-nekovo-nechego`, `roditelnyy-padezh-chasti-s-predlogom-iz-za`),
   and the first has a typo in its slug: `отнегальные` should be `отрицательные`.
