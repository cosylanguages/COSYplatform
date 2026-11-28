# Russian B1: published

`general-ru-b1` is live: **65 decks** in `lessons/general-russian-b1/`, `roadmaps/general-ru-b1.json`, 13
modules of five lessons. Platform totals: **53/169 courses, 2629/3131 lesson slots, 2439 lesson files**.

## The grammar ids pointed a level down

34 of the 65 lessons had ids, and most cited A1 or A2 pages. The lesson on cause and concession cited
`ru-a1-soyuzy-prichiny-potomu-chto-tak-kak`; the one on participles in the news cited `ru-a1-prilagatelnye`.
B1 is where the participle system (active and passive, present and past, short forms), the gerund system,
the passive with an instrumental agent, the oblique numerals, the complex sentence and the reported speech
all get their real treatment — all of it sits on the B1 shelf.

`scripts/grammar-ids/wire_ru_b1.py` re-points every lesson: **136 ids over 55 unique points — 45 of the 47
B1 pages**, plus ten A2 pages where the B1 shelf has no equivalent (short adjectives, aspectual pairs, the
aspect of the past, *который*, the imperative with *пусть/давайте*, time conjunctions, negative pronouns with
prepositions, *должен*, the comparative). Six lessons carry three ids instead of two, because their topic
genuinely spans three pages — sports and habit, for instance, needs comparison, the comparative and
aspectual repetition.

## The same voice problems as A2, one level up

`scripts/content/normalize_ru_level.py` now handles every Russian level above A1, because the faults repeat:

| | as written | now |
|---|---|---|
| unit titles | `Раздел 1:`, three bare titles, and a thirteenth module numbered `Раздел 10` | `Модуль N. Sentence case` |
| vocabulary | 395 items in Title Case | lowercase |
| can-do | 16 bare infinitives | third person |
| homework | 14 notes in *ты* | formal |
| one `recycled:` line | `Carried over from A1: ...` | `Перенесено с A1: ...` |
| final exam "vocabulary" | `вся лексика уровня B1`, `трки-1 полный курс` | six real words: экзамен, сертификат, уровень, письмо, аудирование, говорение |

## Three fixes that reach back into A1 and A2

Building B1 exposed faults in the courses already published, so all three were rebuilt.

**The can-do voice was mixed inside A1.** 108 lessons read `Я могу приветствовать...` and 34 read
`Может приветствовать...`. All 144 now read `Может ...`, matching A2 and B1, and matching the CEFR habit of
writing descriptors in the third person. One B1 line had the opposite fault — `Демонстрирует полную
самостоятельность...` had been given a `Может` in front, producing `Может демонстрирует`; the script now
strips the prefix when the verb is already conjugated.

**`использовать 3 новых слов` was wrong Russian.** The objectives line hard-coded the genitive plural, so
every short vocabulary list printed an error — A1's opening unit has three-word lists, and the A2 and B1
finals now have six. The builder picks the form from the numeral: 1 слово, 3 слова, 6 слов, 21 слово.

**A1's first unit was in Title Case.** `Привет, Здравствуйте, Спасибо` became `привет, здравствуйте,
спасибо`, like the other 22 modules.

## Build

```bash
python3 scripts/grammar-ids/wire_ru_b1.py          # 65 lessons, 136 ids
python3 scripts/content/normalize_ru_level.py --level B1   # also A1, A2
python3 scripts/lesson-build/build_decks.py --lang ru --level b1 --write
npm run stats:build && npm run validate
```

`normalize_ru_level.py` is idempotent and reports counts; running it twice is a no-op.

## State of the 195 Russian decks

- **0 empty elements** across A1, A2 and B1.
- Latin-text sweep: A2 and B1 clean; A1 has six slides printing `Переведите «I like this book»:`, a quiz
  prompt that comes from a COSYmanuals page rather than from the platform.
- Every B1 lesson resolves to a manual page; no deck was built with a fallback.

## Still open

1. **Two B1 pages are unused**: `otnegalnye-mestoimeniya-nekovo-nechego` (некому, нечего) and
   `roditelnyy-padezh-chasti-s-predlogom-iz-za`. Nothing in the curriculum needs them; they argue for a
   B1 lesson on negative pronouns.
2. **`отнегальные` is a typo in the slug** of that page — it should be `otritsatelnye`. Renaming touches
   COSYmanuals and the registry, so it is a task of its own.
3. **A1 lesson titles keep their `1.1` prefixes** and mid-title capitals, unlike A2 and B1. Removing the
   prefix changes 131 slugs and therefore 131 lesson ids, which is not a cosmetic change.
4. **Russian B2, C1 and C2 are next.** All three curricula exist with 65 lessons each; B2 has 34 lessons
   with no ids, C1 has 65, C2 has 55.
