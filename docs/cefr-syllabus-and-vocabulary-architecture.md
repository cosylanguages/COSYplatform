# CEFR syllabus and vocabulary architecture

Scope: how COSYdata (dictionary), COSYmanuals (grammar / vocabulary / communication manuals) and
COSYplatform (curricula and decks) should describe levels A0–C2 for English, French, Russian,
Italian (A0–B1) and Greek (A0–A2), so that the three repositories describe the *same* word and the
*same* level, in a modern, necessity-led order rather than a copy of the traditional A1→C2 list.

Status (2026-11-28): phase 1 has started. The optional curriculum fields (`theme`,
`secondaryThemes`, `macroFunction`, `vocabularyIds`, `recycledIds`, `grammarThreads`) exist in the
schema, French general A1–C2 carries unit themes (88 units), and the vocabulary id maps for all
six French levels are generated.
See `docs/VOCAB_IDS.md`.

This document is a design + gap report. Part 1 records what the three repositories actually contain
today (measured, not estimated). Part 2 summarises the external reference inventories worth
following. Parts 3–8 define the architecture: vocabulary placement, grammar threads, unit and
lesson naming, cross-course reuse. Part 9 is the remediation backlog, Part 10 the implementation
order.

---

## 1. Measured baseline

Snapshots used: `COSYplatform` @ `d8736bd`, `COSYdata` `main` (2026-11-27), `COSYmanuals` `main`
(2026-11-28). Counting method: JSON entries read from `vocabulary/<iso>/<band>/**/*.json`
(index files excluded), manual pages counted from `manuals/<iso>/<section>/<level>/topics/*.html`,
curriculum numbers from `curriculums/<iso>/<track>/<LEVEL>.json`.

### 1.1 COSYdata: supply per language and level

| lang | A0 | A0–A1 | A1 | A2 | B1 | B2 | C1 | C2 | total |
|---|---|---|---|---|---|---|---|---|---|
| en | 4 | 1 686 | 52 | 3 083 | 2 693 | 2 280 | 1 811 | 1 163 | 12 772 |
| fr | 36 | 1 605 | 32 | 972 | 278 | 210 | 187 | 301 | 3 621 |
| ru | 7 | 736 | 40 | 1 277 | 266 | 228 | 183 | 290 | 3 027 |
| it | 9 | 1 234 | 37 | 935 | 760 | 225 | 186 | 296 | 3 682 |
| el | 3 | 925 | 41 | 314 | 111 | 70 | 26 | 141 | 1 631 |

The id schema is `<lang>:<slug>:<form>` (`en:pros-and-cons:phrase`), with `level`, `levels[]`,
`form` (noun, verb, adjective, adverb, phrase, idiom, number, pronoun, preposition, determiner,
conjunction, article), `theme`, `sub_theme`, `definitions[]`, `examples[]`, `transcription`,
`domain` (spoken / professional / relocation …), `tags`. Multi-level membership already exists
(412 entries in the English A0–A1 band, 497 in B1), so a word *can* sit at two levels today.

**The critical shape difference.** English keeps a theme per file at every level (`b1/politics.json`,
`b1/collocations.json`, `c1/rhetoric.json`). French, Russian, Italian and Greek collapse at B1 and
above into part-of-speech buckets (`noun.json`, `verb.json`, `adjective.json`, `idiom.json`,
`phrase.json`) plus `home/` and `work.json`. Most of what those buckets contain is a fixed idiom
quota of about 160 items per level:

| lang / level | entries | of which idioms | non-idiom content |
|---|---|---|---|
| fr B1 | 278 | 164 | 114 |
| fr B2 | 210 | 163 | 47 |
| fr C1 | 187 | 160 | 27 |
| fr C2 | 301 | 156 | 145 |
| ru B1 | 266 | 160 | 106 |
| ru B2 | 228 | 160 | 68 |
| ru C1 | 183 | 159 | 24 |
| ru C2 | 290 | 152 | 138 |
| it B1 | 760 | 292 | 468 |
| it B2 | 225 | 157 | 68 |
| el B1 | 111 | 0 | 111 |
| el B2 | 70 | 0 | 70 |

Idiom sets do not overlap between levels (b1∩b2 = 0 in French, Russian and Italian, the three
languages that have idiom banks), so this is not duplication — it is a quota: about 160 idioms
per level, whatever the level's real needs.

Theme spread at B1 confirms the hole. French B1 has `housing` 45, `work` 16, `environment` 7,
`descriptors` 5, `technology` 4, `geography` 4 and nothing else outside `general`/`communication`.
There is **no** education, health, media, politics, science, emotions, society, family or business
vocabulary at B1 — while the French B1 curriculum has units on media, ecology, society, art,
economy, science, public health, consumer rights, mobility and the francophone world.

Other measured defects:

- 47 distinct `theme` values, several overlapping (`food` / `food_drink` / `food-drink`,
  `health` / `health-medicine`, `leisure` / `leisure-activities`, `noun` / `common_nouns`).
  English A2 has both `food.json` (3 entries) and `food_drink.json` (5) and `food-drink.json` (15).
- Greek has no idioms at any level (`form: idiom` count 0); its 141 C2 entries are mostly
  adjectives and verbs.
- `level` inside a folder sometimes disagrees with the folder (English A2 folder holds 11 B1 and
  1 B2 entries), which is intended for multi-level items but is not declared as such.

### 1.2 COSYmanuals: page counts and density

| lang | grammar pages (a1/a2/b1/b2/c1/c2) | vocabulary pages | communication pages |
|---|---|---|---|
| en | 81 / 47 / 48 / 47 / 26 / 20 = 269 | 185 | 114 |
| fr | 194 / 202 / 246 / 209 / 129 / 121 = 1 101 | 106 | 60 |
| ru | 115 / 55 / 47 / 36 / 28 / 20 = 301 | 67 | 62 |
| it | 29 / 36 / 41 / – / – / – = 106 | 29 | 17 |
| el | 56 / 45 / – / – / – / – = 101 | 27 | 17 |

- Grammar pages are written for all French levels (1 101), for English to C2, for Russian to C2,
  for Italian to B1 and for Greek to A2. That matches the intended publication ceiling.
- Vocabulary manual pages are **not independent content**: they are generated from COSYdata.
  French B1 has 7 pages holding 238 entries for 278 data entries; Russian B2 has 5 pages holding
  205 for 228. Where COSYdata is thin, the manual is thin — the B1+ problem is inherited, not
  separate.
- Manual vocabulary pages carry **no COSYdata identifier**. A generated page has
  `data-key="adjectives"`, `<strong class="word">indépendant</strong>`, a definition and an
  example, and nothing that points back to `fr:indépendant:adjective`. Grep for
  `lang:slug:form` across `manuals/**/*.html` returns zero hits. The link the ecology needs —
  "ids from COSYdata are extracted into the vocabulary manual" — does not exist yet.
- Vocabulary page density is high per page (French A1 15 entries/page, B1 34, C2 57; Russian C2 88),
  so a manual page is a bucket, not a lesson unit. There is no mapping from a page to a unit.
- Grammar topics are assigned to exactly one level. Only 1 French slug, 6 English slugs and 1
  Russian slug appear at more than one level, so the manuals encode "a grammar point is taught
  once" — the opposite of the spiral the courses need.

### 1.3 COSYplatform: courses, lessons and per-lesson load

- `data/platform-stats.json`: 52/182 courses available, 2 470/2 859 lesson slots, 2 167 lesson
  files on disk, 6 unlinked files.
- 48 lesson files are already referenced by two roadmaps (all in `general-en-a0` ↔
  `general-en-a0-a1`), so cross-course reuse exists but only as an A0 duplicate.
- Course sizes are not comparable across languages: English A1 180 lessons, A2 141, B1 120,
  B2 121, C1 94, C2 65; French and Russian 142 at A1 and 65 at every level above; Italian and
  Greek 65 at each level. 16 (A1), 46 (A2), 40 (B1), 40 (B2) and 40 (C1) of the English lessons
  sit in units called *Additional Legacy Topics & Draft Lessons* — 30–40 % of the course.
- The `vocabulary` array is quota-filled, not selected from the dictionary. French, Russian,
  Italian and Greek curricula carry exactly 8 items per lesson (520 per 65-lesson level), English
  A2–C1 carry about 10, A1 6.8, C2 7.1. This is half of the 10–20 core items + 5–10 chunks that
  `docs/lesson-spec-a0-a1-general.md` requires.
- **Vocabulary overlap with COSYdata is the headline number.** Matching each curriculum item
  against the dictionary of the same language (exact form, case-folded):

| lang | A1 | A2 | B1 | B2 | C1 | C2 |
|---|---|---|---|---|---|---|
| en | 97 % | 84 % | 83 % | 80 % | 74 % | 61 % |
| fr | 74 % | 38 % | 19 % | 6 % | 12 % | 9 % |
| ru | 25 % | 25 % | 14 % | 6 % | 11 % | 7 % |
| it | 69 % | 51 % | 25 % | – | – | – |
| el | 39 % | 28 % | – | – | – | – |

Across every track and every level, 13 226 of 26 530 curriculum vocabulary items resolve (50 %).

Russian figures survive a crude 5-character stem match (26 / 29 / 18 / 8 / 12 / 9 %), so they are
not an artefact of inflection. In plain terms: a French B2 lesson teaches 15 of every 16 items
that the dictionary does not contain, and one that it does. English is the only language where the
curriculum and the dictionary describe nearly the same lexicon, and even there the match decays
to 61 % at C2.
- Grammar references are healthy in one direction: all 3 556 `grammarIds` used across all tracks
  (3 361 of them in the five languages in scope) resolve to an existing manual page. In the other
  direction the manuals are under-used: 300 of the 1 878 pages in the five languages are
  referenced by no curriculum (English 84, French 73, Russian 143, Italian 0, Greek 0).
  English C2 is the worst case: 65 lessons, 0 grammar ids, 20 orphan pages.
- Recycling is declared but not wired. Every lesson carries a `recycled` string (100 % of lessons
  in all five languages), but it is templated: 51 distinct strings across 65 French B1 lessons,
  mostly one identical "Carried over from A2: …" sentence, and 21 across 120 English B1 lessons.
  Measured by ids, distinct grammar ids repeated from the previous level are English 12 (A2) /
  9 / 18 / 0 / 0; Russian 21 / 9 / 12 / 0 / 0; Italian 23 / 13; Greek 15; **French 1 / 0 / 0 / 0 /
  0**. So the prose claims recycling, the ids do not, and nobody revisits a point with a
  *deeper* rule.
- Naming is inconsistent between languages at the same level: French A2/B1 unit titles are
  can-do sentences ("Raconter ses souvenirs et événements passés"), English A2/B1 are topic noun
  phrases ("Personal Profiles, Upbringing & Life History"), Italian and Greek B-level units are
  grammar labels ("Il congiuntivo presente", "Άρθρα, γένος και πληθυντικός"). English B2/C1/C2,
  French B2/C1/C2 and Russian B2/C1/C2 unit titles are near-literal translations of each other
  (geopolitics, economics, rhetoric, poetics), so the three C-level courses differ in language
  only, not in syllabus intent.
- Lesson ids are unbounded: `fr-c2-transformations-de-registres-syntaxiques-complexes-a-travers-6-niveaux-de-langue`
  is 92 characters, wrapping a grammar description, not a can-do.

### 1.4 What this means

Four breakages, in order of impact:

1. **COSYdata stops being a thematic dictionary after A2** for FR/RU/IT/EL. B1+ is a POS dump
   plus an idiom quota.
2. **The curriculum and the dictionary are two parallel lexicons** (6–38 % overlap in FR/RU/IT/EL,
   decaying in EN).
3. **The vocabulary manual is a copy, not a link** — no id, no theme contract, no per-unit mapping.
4. **Grammar is single-assignment**, so the courses cannot spiral, and the curriculum's only
   recycling is accidental cross-level references.

---

## 2. External reference inventories (what to follow, what to reject)

The point of this section is calibration, not copying: every list below is a *source of a level
judgement* to be recorded on an entry, never a syllabus to reproduce.

### 2.1 Cross-cutting

- **CEFR (Council of Europe 2001) and the Companion Volume (2020).** The 2020 volume adds
  mediation, online interaction and plurilingual/pluricultural competence, and rephrases
  descriptors as "can do". COSYplatform already mirrors this in `cefr/data/` (63 scales, 344
  descriptors, 22 themes). Use those 22 themes as the canonical syllabus grid; they are
  level-differentiated (`t05 Food and drink`: A1 "basic food, ordering, likes" → C2 "food politics,
  sensory language"), which is exactly the spiral the units need.
- **Frequency + dispersion beats "level of the list"**. A word that a B1 learner needs in order to
  perform a B1 can-do belongs in B1 even if the classical list puts it at C1. Record frequency
  (Zipf/SUBTLEX-style), dispersion across domains, and the can-do that first needs it; derive the
  level, do not assert it.

### 2.2 English

- **English Vocabulary Profile (EVP, English Profile programme, Cambridge).** The most useful
  artefact: A1–C2 level per *sense*, not per word, with part of speech. Its known weakness is
  exactly the modern-usability point: technical and digital senses are often labelled late.
- **CEFR-J Wordlist** (Tokyo University of Foreign Studies). A1.1/A1.2/A1.3 sub-bands inside A1,
  useful because our A0–A1 band is 142 lessons, far more than a single A1 step.
- **Oxford 3000 / Oxford 5000** (CEFR-tagged), **Cambridge KET/PET/FCE/CAE/CPE wordlists**,
  **NGSL/NAWL**. Use Oxford/NGSL as the frequency spine, Cambridge lists as exam alignment.
- Size benchmarks: A1 ≈ 1 000, A2 ≈ 2 000, B1 ≈ 3 000, B2 ≈ 4 000, C1 ≈ 5 000–6 000,
  C2 ≈ 7 500+ word families (Milton 2009 and the Cambridge size discussions). Treat as ceiling
  guidance, not as a quota to hit.
- Coursebook shapes worth matching: *English File* (12 Files × 4 lessons + Practical English),
  *Navigate* (12 units), *Speakout* (8–10 units), *Outcomes*, *Solutions*, and the
  *English Vocabulary in Use* ladder (Elementary → Advanced, 100 two-page units). All of them are
  **can-do led with a grammar focus per lesson**, which is already the COSY lesson frame.

### 2.3 French

- **Beacco et al., *Niveau A1.1 / A1 / A2 / B1 / B2 pour le français*** (Didier, the "référentiels").
  These are the closest thing to an official French inventory: functions, notions, grammar and
  lexicon per level, built for FLE. Use them as the reference for what a French A2/B1 must be able
  to *do* — they are function-led, not word-count led.
- **Référentiel des contenus d'apprentissage du FLE** (CIEP/Français des affaires) and the
  **DELF/DALF référentiels** for exam alignment.
- **Français fondamental** (Gougenheim 1954, verified this session): first degree ≈ 1 475 words
  (270 grammar words + 380 nouns + 200 verbs + 100 adjectives + 50 others), second degree
  ≈ 1 700 words — the historical "core". Useful as the A1/A2 floor, not as a ceiling.
- **Lexique 3** (New & Pallier) for frequency; **Vocabulaire progressif du français** (CLE) for the
  thematic progression shape.
- Coursebooks: *Édito*, *Cosmopolite*, *Tendances*, *Défi*, *Inspire*, *Alter Ego+*, *Saison*;
  exam: *ABC DELF*. Their B1 shape (8–10 units, each with a "dossier" theme, a grammar double-page
  and a "vie quotidienne / société" spread) is a good model for the FR B1 rebuild.

### 2.4 Russian

- **ТРКИ / TORFL state standards** (МГУ, СПбГУ, РУДН, Институт Пушкина): ТЭУ (A1), ТБУ (A2),
  ТРКИ-1 (B1), ТРКИ-2 (B2), ТРКИ-3 (C1), ТРКИ-4 (C2), each with an official lexical minimum
  (the standard minima are commonly cited as ≈ 780 / 1 300 / 2 300 / 5 000–6 000 / 10 000+ /
  20 000 units; treat the upper figures as indicative). The **grammar requirements** in these
  standards are the real syllabus, and they are *cumulative*: cases, aspect and verbs of motion
  appear at every level with new functions.
- **Лексические минимумы по РКИ** (Андрюшина и др., Златоуст) — the practical lists.
- Coursebooks: *Поехали!*, *Дорога в Россию*, *Жили-были (28 уроков)*, *Вперёд!*, *Точка Ру*.
  Note the shape: Russian courses put grammar first (a lesson = one case function or one aspect
  contrast), because the language cannot be spoken without case government from day one. Greek
  and Italian B1 courses have the same property. This is why a "topic-only" unit title fails for
  Russian and Greek and works for English.

### 2.5 Italian

- **Profilo della lingua italiana. Livelli A1–B2** (Lo Duca, 2006) — the Italian inventory of
  functions, notions, grammar and lexicon per level; the reference for A1–B2. For B1 it is more
  granular than the CEFR itself.
- **De Mauro, Vocabolario di base (VdB)** — verified this session: about 7 000 words, in three
  bands (fondamentale ≈ 2 000, alto uso ≈ 2 750, alta disponibilità ≈ 2 300). VdB is the natural
  "defining vocabulary" for Italian A1–B2.
- **LIF** (Lessico di frequenza dell'italiano) and **Nuovo vocabolario di base** (2016) for
  frequency updates.
- Coursebooks: *Nuovo Espresso* (1–3 for A1–B1), *Al dente*, *Chiaro!*, *Dieci*, *Nuovo Contatto*.
  They are unit-per-communicative-goal with a strong "grammatica" spread — again close to the
  COSY 10-slide frame.

### 2.6 Greek

- **Κέντρο Ελληνικής Γλώσσας (ΚΕΓ) — Πιστοποίηση Ελληνομάθειας**, levels Α1–Γ2, with published
  exam specifications and sample papers. This is the only official Greek level inventory; the
  portal `greek-language.gr` is reachable and holds the certification section.
- **Προγράμματα σπουδών για τη διδασκαλία της ελληνικής ως ξένης/δεύτερης γλώσσας** for the
  school-side progression.
- Coursebooks: *Κλικ στα ελληνικά* (Α1–Β2), *Ταξίδι στην Ελλάδα* (1–3), *Ελληνικά τώρα*,
  *Επικοινωνήστε ελληνικά*. Greek courses are grammar-led early (aspect, clitics, genitive) and
  vocabulary-led late; a Greek A1–A2 that pretends otherwise will not work.
- Since Greek stops at A2, only the Α1/Α2 specifications and the first two coursebook levels are
  in scope. The B1–C2 COSYdata Greek folders exist but are out of the planned catalogue; they
  should be marked as such rather than counted as supply.

---

## 3. Principles for a modern, necessity-led CEFR

1. **Can-do first, list second.** An item is placed at the level of the *first can-do that needs
   it*, then adjusted by difficulty. A C1 list entry that a B1 learner needs to talk about work
   moves down; a frequent word with no A2 communicative use stays up.
2. **One entry, several levels.** Use `levels[]` as the norm for anything recycled. A word
   introduced at A2 and reactivated at B1 keeps one id and one page, with per-level example sets.
3. **Difficulty is a property of the word, not of the theme.** Score every entry on
   frequency (Zipf), dispersion, morphological transparency (cognate / international word /
   loanword), polysemy, derivational productivity, and concreteness. The score decides whether an
   item can enter half a level earlier or later.
4. **Monolingual by design.** No L1 gloss, so definitions must be written inside a controlled
   defining vocabulary. Target: every definition at A0–B1 uses only items from the A1–A2 core
   (~1 500 lemmas). This is the Longman/VdB idea applied to all five languages, and it is
   checkable by script.
5. **Visuals and examples carry meaning.** For concrete nouns and actions, the image is the
   gloss; for abstract nouns, a collocation or a short scenario is. Avoid circular definitions.
6. **Spiral grammar.** A grammar thread recurs at three or more levels with a new *moment*
   (introduce → extend → contrast → nuance → style). Repetition is the design, not a defect.
7. **Register honesty.** B1 does not need bureaucratic or literary vocabulary; C1 does not need
   tourist survival phrases. The `domain` field already separates spoken / professional /
   relocation; add `register` (neutral, informal, formal, literary, technical) and filter by it.
8. **Modern lexicon enters early when its use is universal.** Digital life, remote work, mental
   health, sustainability, misinformation, AI literacy are A2–B1 communicative needs now, even
   where older lists put them at C1.

### 3.1 The modern shifts to encode explicitly

| item group | classical placement | proposed | reason |
|---|---|---|---|
| app, platform, online, upload, stream, podcast, playlist | B1–B2 | A2 | needed to describe daily life |
| remote work, commute, burnout, wellbeing, work-life balance | B2–C1 | B1 | B1 workplace unit |
| sustainability, carbon footprint, recycling, renewable | C1 | B1 | B1 environment unit already exists |
| misinformation, fake news, algorithmic feed, deepfake, AI | C1–C2 | B1–B2 | media literacy is a B1 can-do |
| identity, inclusion, stereotype, bias | C1 | B2 | B2 society unit |
| litigation, jurisprudence, statute, tort | C1 | C1 (keep) | specialist, not everyday |
| notwithstanding, hereby, aforesaid | C1 | C1/C2 (keep, mark formal) | register-bound |
| idiom quota (≈160/level in FR/RU/IT) | uniform | 60–80 at B1, 120 at B2, 150 at C1 | B1 learners need chunks, not idioms |

---

## 4. Vocabulary architecture

### 4.1 Level targets

Assuming the standard mould of 13 units × 5 lessons = 65 lessons of 60 minutes (≈ 65 contact
hours) and 142 lessons at A1 (≈ 140 hours), the defensible load is:

| level | lessons | new items / lesson | chunks / lesson | net new per level | cumulative |
|---|---|---|---|---|---|
| A0–A1 | 142 | 8–10 | 3–4 | 1 200–1 500 | ≈ 1 500 |
| A2 | 65 | 12–14 | 4–5 | 800–950 | ≈ 2 400 |
| B1 | 65 | 14–16 | 5–6 | 900–1 050 | ≈ 3 400 |
| B2 | 65 | 15–18 | 5–6 | 1 000–1 150 | ≈ 4 500 |
| C1 | 65 | 18–20 | 6 | 1 150–1 300 | ≈ 5 800 |
| C2 | 65 | 20–24 | 6 | 1 300–1 550 | ≈ 7 300 |

This lands on the external benchmarks (EVP/Oxford for English, VdB ≈ 7 000 for Italian,
ТРКИ-1 ≈ 2 300 for Russian B1, Beacco's B1 notion lists for French) without copying any of them.
It also doubles the current load of 8 items per lesson and brings the curriculum inside the
A0–A1 lesson spec.

### 4.2 Recycling quota

- Every lesson recycles 30 % of its slots from earlier lessons: 10 % from the previous lesson,
  10 % from 3–5 lessons back, 10 % from 8–12 lessons back.
- Every unit ends with a consolidation lesson that reuses the unit's items in a new task.
- Every level re-enters 40–50 % of the previous level's core items, with new collocations.
- Each lesson's final task produces the artefact the next lesson opens with (a profile, a message,
  a plan, a booking), so a course reads as one project chain rather than 65 separate lessons.
- Implement as `recycledFrom: [lessonId, …]` on the lesson and `recycled: "…"` (already in the
  schema) at paragraph level; validate that the quota is met.

### 4.3 COSYdata schema additions

Additive only, so existing consumers keep working:

```jsonc
{
  "id": "fr:licenciement:noun",
  "levels": ["B1", "B2"],          // first introduction + reactivation
  "introduced": "B1",              // replaces the meaning of the scalar level
  "frequency": { "zipf": 3.9, "dispersion": 0.86, "source": "Lexique3" },
  "difficulty": { "score": 2.1, "cognate": false, "polysemy": 2, "abstractness": 0.7 },
  "register": ["formal", "professional"],
  "defining_level": "B1",          // level of the words used in the definition
  "manual_refs": ["fr/vocabulary/b1/topics/work-and-employment"],
  "first_needed_by": [{ "course": "general-fr-b1", "unit": 3, "lesson": "negocier-une-rupture" }],
  "spiral_of": "fr:emploi:noun"    // optional: this item deepens an earlier one
}
```

`level` stays as the scalar for backwards compatibility and is derived from `introduced`.

### 4.4 Placement algorithm

```
score = 0.45*zipf_norm + 0.20*dispersion + 0.15*(1-abstractness)
      + 0.10*cognate + 0.10*morphological_transparency
      - 0.15*polysemy_load
      + 0.25*can_do_necessity        // 0 / 0.5 / 1 from the first can-do that needs it
```

Then:

- `can_do_necessity = 1` overrides: the item enters at the level of that can-do even if the score
  is lower.
- `register` formal/literary pushes one level up unless the can-do is exam/advanced.
- Items already used in a deck at level *n* are auto-labelled level *n* (the curriculum is
  evidence of use).
- Anything left over with no can-do and low score stays in the level its frequency implies.

The algorithm is auditable: it produces a table of `id, current level, proposed level, delta,
reason`. Human review then touches only the deltas, which is far cheaper than re-levelling 25 000
entries by hand.

### 4.5 Theme grid (22 themes × 6 levels)

The platform's `cefr/data/themes.json` already gives a level-by-level gloss for each theme (for
example `t15 Media and technology`: A1 "devices, basic apps" → C2 "digital ethics, platform
power"). Use it as the unit skeleton, and require every unit to declare `theme: "t15"` plus a
sub-theme. Then COSYdata can be queried as "give me the t15 items at B1" — which is impossible
today for FR/RU/IT/EL because the B1 files are POS buckets.

Recommended quota per theme per level (items, excluding chunks):

| level | items/theme | themes/level | total |
|---|---|---|---|
| A0–A1 | 60–80 | 20 | 1 300 |
| A2 | 60–70 | 14 | 900 |
| B1 | 65–80 | 14 | 1 000 |
| B2 | 75–90 | 13 | 1 050 |
| C1 | 90–100 | 13 | 1 250 |
| C2 | 110–120 | 12 | 1 400 |

Not every theme gets a unit at every level: `t08 Health and body` is strong at A1–B2 and thin at
C2; `t21 Values, ethics, beliefs` is thin at A1–A2 and strong at C1–C2. That is what the
`themes.json` glosses already say.

### 4.6 Cross-language comparability

Same theme, different item counts, because the languages differ in what one item costs:

- Russian: one verb can require an aspect pair and case government, so 1 000 "items" is more
  learning than 1 000 English items. Reduce Russian item counts by ~10 % and add aspect pairs as
  linked entries (`aspect_pair: "ru:закрыть:verb"`).
- Greek: derivational families are dense; group by family (`δουλειά / δουλεύω / εργασία`) and
  count the family once.
- French: gender and agreement make each noun more expensive; keep the count but add
  `gender`, `plural_form` and a required article in the example.
- Italian: same as French, plus verb conjugation classes.
- English: highest item count because morphology is cheap.

---

## 5. Grammar architecture

### 5.1 Threads instead of a single-assignment list

Fourteen threads, each running across levels. A "moment" is one manual page with a `level_role`:

| # | thread | A0–A1 | A2 | B1 | B2 | C1 | C2 |
|---|---|---|---|---|---|---|---|
| T1 | reference & noun phrase | articles, gender, number, demonstratives | quantifiers, partitives | pronoun systems (y/en, ne/ci) | generic reference | textual reference | stylistic ellipsis |
| T2 | tense & aspect | present, basic past | perfect, narrative past | pluperfect, aspect contrasts | past of past, future in the past | remote/narrative tenses | literary tense use |
| T3 | modality & stance | can, must, want | should, have to, may | subjunctive intro, conditional | epistemic modals, hedging | evidentiality | rhetorical stance |
| T4 | condition & hypothesis | real if | first conditional | second/third conditional | mixed, alternatives to if | inverted conditionals | literary/legal hypotheses |
| T5 | subordination & linking | and, but, because | when, if, so | concession, purpose, cause | contrast, participle clauses | dense nominal linking | parataxis/rhetorical linking |
| T6 | relative & nominalisation | who/which | that/where | relative pronouns (dont, lequel, который) | non-defining, reduced relatives | nominalisation | complex nominal style |
| T7 | voice & information structure | – | passive intro | passive in processes | impersonal, cleft | fronting, inversion | marked syntax |
| T8 | comparison & degree | big/bigger | comparatives, superlatives | modifiers, equality | nuanced comparison | evaluative degree | rhetorical comparison |
| T9 | quantification | numbers, some/any | much/many, few/little | quantifier scope | approximation | precise/hedged quantity | – |
| T10 | space & time | prepositions, cases 1–2 | cases 3–4, time expressions | cases 5–6, abstract prepositions | metaphorical space | – | – |
| T11 | verb complementation | basic patterns | gerund/infinitive, reflexives | pronominal verbs, valency | complex patterns | idiomatic valency | rare patterns |
| T12 | discourse & register | greetings, politeness | connectors, opinions | argument connectors, reported speech | cohesion, register shift | rhetoric, irony | genre style |
| T13 | word formation | – | compounds, basic derivation | productive affixes | abstract derivation | neologism, nuance | creative formation |
| T14 | pronunciation–grammar interface | stress, rhythm | liaison/sandhi | intonation & meaning | weak forms | prosodic focus | delivery style |

### 5.2 Where repetition is required, per language

| thread | EN | FR | RU | IT | EL |
|---|---|---|---|---|---|
| T1 | A1→A2→B1 | A1→A2→B1 | A1→A2→B1 | A1→A2→B1 | A1→A2 |
| T2 | A1→A2→B1→B2 | A2→B1→B2 | A1→A2→B1→B2 | A2→B1 | A2 |
| T3 | A2→B1→B2 | B1→B2→C1 | B1→B2 | B1 | A2 |
| T4 | A2→B1→B2→C1 | A2→B1→B2 | A2→B1→B2 | A2→B1 | A2 |
| T5 | A2→B1→B2 | A2→B1→B2 | A2→B1→B2 | B1 | A2 |
| T6 | A2→B1→B2 | A2→B1 | A1→B1→B2 | A2→B1 | A2 |
| T7 | A2→B1→B2 | A2→B1→B2 | B1→B2 | A2→B1 | A2 |
| T12 | A2→B1→B2→C1 | A2→B1→B2→C1 | A2→B1→B2→C1 | A2→B1 | A2 |
| T10 (cases) | – | – | A1→A2→B1→B2 | – | A1→A2 |
| T2 (aspect) | – | – | A1→A2→B1→B2 | A2→B1 | A1→A2 |

Those are the intentional repeats. Concretely, the Russian accusative has four moments:
direct object (A1), time expressions (A2), with prepositions in abstract senses (B1), and
stylistic choice vs genitive (B2). All four must exist as separate pages, linked as one thread.
The same holds for the French subjunctive (B1 introduction → B2 past subjunctive → C1 literary
imperfect subjunctive) and the English perfect (A2 experience → B1 result/continuation → B2
narrative → C1 modal perfect).

### 5.3 Consequences for COSYmanuals

- Add to the grammar registry (`data/grammar-points.json`) and every topic page:
  `thread` (T1–T14), `level_role` (`introduce|extend|contrast|nuance|style`), `prereq` (id or
  null), `next` (id or null). This makes the spiral explicit and lets the curriculum ask for
  "the B2 moment of T2".
- Stop generating near-duplicate slugs for a repeat. Prefer `fr-b2-subjonctif-passe` over a
  paraphrase of `fr-b1-subjonctif-present`, with `thread: T3` and `prereq: fr-b1-…`.
- The 300 orphan pages are not waste: they are the unfilled moments of the threads. Before
  writing anything new, run the thread map against the existing pages and fill the gaps.
- English C2 has 65 lessons and no grammar ids. Either wire the 20 existing C2 pages (they are
  orphaned today) or accept that C2 units are genre/mediation-led and give them a
  `grammar: []` + `discourse: [...]` focus instead of an empty slot.

---

### 5.4 Core grammar moments per language

`↻` marks a deliberate return to an earlier moment with a new rule or a new function (the page is
new; the thread is the same).

**English**

- A1: be / have got; present simple; present continuous; past simple regular + irregular;
  going to / will; can; a/an/the; plurals; countable/uncountable + some/any; prepositions of time
  and place; comparatives and superlatives; frequency adverbs; imperatives; possessive 's.
- A2: past continuous; present perfect (ever/never/for/since); used to; past perfect (intro);
  first conditional; second conditional (intro); must/have to/should; may/might; passive
  (present/past); reported speech (intro); defining relative clauses; gerund/infinitive;
  too/enough; so/such.
- B1: present perfect vs past simple ↻; present perfect continuous; narrative tenses ↻;
  third conditional; second conditional ↻; passive in all tenses ↻; reported speech ↻
  (statements and questions); non-defining relatives; modals of deduction (present);
  question tags; indirect questions; although/despite/unless.
- B2: mixed conditionals ↻; alternatives to *if*; passive reporting (*it is said*); causative
  *have/get something done*; inversion after negative adverbials; cleft sentences and fronting;
  participle clauses; reduced relatives; modals of deduction in the past ↻; future in the past;
  hedging; mandative subjunctive; discourse markers.
- C1: emphasis and inversion ↻ (extended); nominalisation; ellipsis and substitution; modal
  perfects ↻; conditional inversion ↻; impersonal constructions; evidentiality; dense concession
  ↻; aspectual nuance (*was to have*); rhetorical questions.
- C2: stylistic inversion ↻; marked word order; literary tenses; semantic prosody; complex noun
  groups; genre-specific syntax; irony and understatement; structures driven by translation.

**French**

- A1: présent; être/avoir; articles définis/indéfinis; genre et nombre; ne…pas; questions;
  adjectifs (accord, place); possessifs; démonstratifs; passé composé (intro); futur proche;
  impératif; prépositions de lieu; pronoms sujets; *on*.
- A2: passé composé vs imparfait (intro ↻); imparfait; futur simple; conditionnel de politesse;
  pronoms COD/COI; *y* / *en*; comparatif et superlatif; partitif; relatifs *qui/que/où*;
  plus-que-parfait (intro); *si* + présent; impératif + pronoms.
- B1: subjonctif présent ↻ (introduce); cause et conséquence; opposition et concession
  (*bien que* ↻); discours rapporté et concordance ↻; plus-que-parfait ↻; relatifs composés;
  conditionnel présent ↻ + *si* + imparfait; gérondif; passif; *en/y* ↻; doubles pronoms;
  troisième type (intro).
- B2: subjonctif passé ↻; subjonctif vs indicatif ↻; troisième conditionnel ↻ et mélanges;
  passif impersonnel ↻; nominalisation; concession avancée (*encore que, quand bien même*);
  discours indirect libre (intro); connecteurs logiques ↻; *c'est… qui/que*; participe présent.
- C1: subjonctif imparfait (littéraire); concordance avancée; tournures impersonnelles;
  nominalisation ↻; registre et syntaxe; modalisation et hedging; concession rhétorique ↻;
  passif stylistique ↻; ellipse; ponctuation.
- C2: subjonctif imparfait et plus-que-parfait ↻; inversion stylistique; phrase polyphonique;
  variations de registre; figures (chiasme, litote, prétérition); syntaxe de la démonstration;
  néologie et création lexicale.

**Russian**

- A1: nominative; prepositional (location); accusative (direct object); genitive (possession,
  absence); dative (intro: age, *нужно*); instrumental (intro: *с* + instr.); present; past;
  future; aspect (intro); imperative; possessive pronouns; adjective agreement; plural;
  numerals 1–4.
- A2: all six cases ↻ with new functions; aspect ↻ (paired use in past and future); unprefixed
  verbs of motion (*идти/ехать*); comparative and superlative; short adjectives (intro);
  conditional with *бы*; *чтобы* ↻; time and date expressions; reflexive verbs; aspect in the
  imperative.
- B1: cases ↻ (abstract and prepositional uses); aspect ↻ in narrative; prefixed verbs of motion;
  participles (active/passive, present/past, intro); *причастный оборот*; *деепричастие*;
  reported speech; introductory words; conjunctions of cause and concession; short adjectives ↻;
  degrees of comparison ↻.
- B2: participles ↻ and punctuation; *деепричастие* ↻; passive and reflexive ↻; word order and
  information structure (intro); nominalisation (*отглагольные существительные*); aspect ↻
  (stylistic choice); complex sentence ↻; modalisers ↻; *должен/следует*.
- C1: marked word order ↻; participles ↻ in condensed style; nominal style; aspect ↻ (nuance);
  particles; ellipsis; register; complex conjunctions.
- C2: stylistic syntax; inversion and archaic turns; authorial punctuation; phraseology;
  translation-driven structures.

**Italian** (A1–B1 in scope; B2 listed only so the dictionary does not lose the thread)

- A1: presente; essere/avere; articoli; genere e numero; aggettivi; possessivi; preposizioni
  semplici e articolate; passato prossimo (intro); futuro (intro); imperativo; pronomi diretti;
  *c'è / ci sono*.
- A2: passato prossimo vs imperfetto (intro ↻); imperfetto; passato prossimo ↻; futuro ↻;
  condizionale presente; pronomi indiretti; *ne / ci*; comparativi; relatifs *che/cui*;
  periodo ipotetico di 1° tipo; *molto/troppo*; imperativo + pronomi.
- B1: congiuntivo presente; congiuntivo passato, imperfetto, trapassato; concordanza dei tempi;
  periodo ipotetico di 2° e 3° tipo; pronomi combinati; *si* impersonale e passivante;
  gerundio e participio; connettivi testuali; discorso indiretto; relative al congiuntivo;
  ordine delle parole e enfasi.
- (B2): congiuntivo ↻ (sfumature); periodo ipotetico ↻ (misto); passivo ↻; nominalizzazione;
  registro; connettivi ↻; discorso indiretto libero; forme marcate.

**Greek** (A1–A2 in scope)

- A1: sounds and alphabet; είμαι/έχω; articles, gender, plural; present; negation *δεν*;
  questions; numbers and time; accusative and genitive (intro); adjectives; clitics (intro);
  future in *θα*; aorist (intro); imperative (intro); adverbs of place.
- A2: aorist ↻ (irregular verbs); imperfect; perfect (*παρακείμενος*); pluperfect (intro);
  punctual and durative future; subjunctive in *να* ↻; imperative ↻; clitics ↻ (all persons);
  comparatives; relative clauses; conditionals (1st and 2nd); passive voice (intro); adverbs and
  connectors.

---

## 6. Unit and lesson naming

### 6.1 Rules

1. **Unit title = domain + macro-function, sentence case, no "MODULE n." prefix.** The unit
   number is a field, not part of the name. Example: *Home and neighbours — describing where I
   live and what I need*.
2. **Lesson title = the can-do, verb-led, ≤ 6 words.** Example: *Describe my flat to a landlord*.
   The language focus goes in a `focus` subtitle, not in the title.
3. **Lesson id = kebab-case of the can-do, ≤ 40 characters, 3–6 words.** Not the grammar
   (`fr-c2-transformations-de-registres-…` → `fr-c2-changer-de-registre`).
4. **Same slot, same function, local phrasing.** Level *n*, unit *k*, lesson *j* has the same
   communicative job in every language; the wording is native, not translated:
   - EN *Small talk at work* / FR *La pause café : parler de tout et de rien* /
     RU *Разговоры на работе* / IT *Due chiacchiere in ufficio* / EL *Κουβέντα στο γραφείο*.
5. **Grammar-led titles are allowed only where grammar is the product** (Italian/Greek B1 units,
   Russian case units). There, name the *function* the grammar serves: *Il congiuntivo presente —
   esprimere opinione e dubbio*, not *Il congiuntivo presente*.
6. **No legacy bucket units.** Anything called *Additional Legacy Topics & Draft Lessons* must be
   dissolved into a theme unit or retired.

### 6.2 Fixes implied by the measurements

| issue | evidence | fix |
|---|---|---|
| C-level clone courses | measured: RU B2 mirrors FR B2 on 7 of 13 slot positions and shares its theme vocabulary; EN B2 is independently ordered (3 of 10) and still carries a 40-lesson legacy bucket | rewrite by theme + can-do per language; keep the theme grid, drop the mirrored titles. The clone problem is real for RU B2–C2, weak for EN |
| EN legacy units | 16/46/40/40/40 lessons in bucket units | dissolve into the 22-theme grid or retire |
| FR/RU 65 vs EN 120–141 | course sizes | set the standard to 65 per level (A1 142) and retire the surplus, or formally declare EN "extended" |
| FR unit titles are can-do, EN are nouns | A2/B1 | adopt rule 1 platform-wide |
| IT/EL grammar labels | B1/A1–A2 | adopt rule 5 |
| A0 duplicate courses | `general-en-a0` and `general-en-a0-a1` share 48 files | A0 is a sub-band (`sublevel: "start"`), not a separate course id |

### 6.3 Worked example: the B1 unit map

Same 13 slots in every language, native wording, one theme and one macro-function per unit. The
five lessons inside a unit always run input → lexis → grammar moment → skills → consolidation,
so unit *k* lesson *j* is the same pedagogical moment everywhere.

| # | theme | macro-function | EN | FR | RU | IT |
|---|---|---|---|---|---|---|
| 1 | t01 | talk about who I am now | Who I am now: life story and self-image | Mon parcours : raconter et nuancer | Мой путь: рассказать о себе | Il mio percorso: raccontarsi |
| 2 | t13 | apply and be interviewed | Applying and interviewing | Candidater et passer un entretien | Резюме и собеседование | Candidarsi e sostenere un colloquio |
| 3 | t15 | judge what I read online | News, feeds and fact-checking | Info, réseaux et esprit critique | Новости, соцсети, критическое мышление | Notizie, social e spirito critico |
| 4 | t19 | argue for a greener choice | Climate action in my city | Agir pour le climat près de chez soi | Экология города и мой выбор | Ambiente e scelte quotidiane |
| 5 | t08 | explain a problem to a doctor | Health, habits and the system | Santé, habitudes et système de soins | Здоровье, привычки и медицина | Salute, abitudini e servizi |
| 6 | t10 | sort out a trip problem | Travel problems and mobility | Voyager, se déplacer, gérer un imprévu | Поездка: транспорт и проблемы | Viaggiare e risolvere imprevisti |
| 7 | t06 | complain and get a refund | Money, bills and consumer rights | Argent, factures et droits du consommateur | Деньги, счета и права потребителя | Soldi, bollette e diritti |
| 8 | t20 | explain how something works | Science and innovation in daily life | Sciences et innovations au quotidien | Наука и технологии в жизни | Scienza e innovazione quotidiana |
| 9 | t16 | recommend and review | Arts, heritage and reviews | Arts, patrimoine et critique | Искусство, наследие и отзыв | Arte, patrimonio e recensioni |
| 10 | t21 | take a position on a dilemma | Ethics, dilemmas and decisions | Éthique, dilemmes et décisions | Этика, дилеммы и решения | Etica, dilemmi e decisioni |
| 11 | t17 | understand a rule and contest it | Rules, rights and civic life | Règles, droits et vie citoyenne | Правила, права и гражданская жизнь | Regole, diritti e vita civile |
| 12 | t18 | discuss a budget or a market | Budgets, markets and consumption | Budget, marchés et consommation | Бюджет, рынки и потребление | Bilancio, mercati e consumi |
| 13 | t22 | adapt my register | Language, register and communication | Langue, registre et francophonie | Язык, стиль и русскоязычный мир | Lingua, registro e italofonia |

The actual state of that grid is measured in `docs/B1_SLOT_ALIGNMENT.md` (regenerate with
`python3 scripts/slot-alignment.py --level B1 --write`). Result on 2026-11-28: EN, FR and RU B1 all
cover 10 of 13 slots. All three lack the identity slot (t01) and the ethics slot (t21); French also
lacks money (t06), Russian lacks travel (t10), English lacks civic life, budgets and register
(t17, t18, t22). French and Russian each spend three units on t22 and two on t17, so the gap is
duplication as much as absence. The English legacy bucket (40 lessons, unit 11) carries no theme.
Italian is the worst case and confirms rule 5: seven of its thirteen B1 units are grammar labels
(congiuntivo presente, congiuntivo nel passato, ipotesi e possibilità, discorso indiretto, pronomi,
descrizione), so only 6 units could be themed and the course covers 5 of the 13 slots. Greek has no B1 course
yet, so the grid cannot be applied there; its A2 course has the same 6-of-13 shape, and its A1
course (sounds, articles, verbs in the present) has no topical unit at all.

B2 shows the drift the grid is meant to prevent (`docs/B2_SLOT_ALIGNMENT.md`): against the same 13
themes, EN B2 covers 7, RU B2 6 and FR B2 5 — and FR B2 has no work, health, travel, money,
environment, culture or identity unit at all, spending four units on t17 and three on t22 instead.
The B2 courses were written as "advanced topics" lists, not as a second pass over the same
domains, which is exactly what has to change.

`docs/FR_B1_RECUT.md` records a re-cut that has now been applied: French B1 units 1, 2 and 11 were
retitled and re-themed (ethics, life story, money and rights), which takes that course to **13/13
slots with no lesson, deck file or id changed** — the only complete course in the platform. The ten
grammar-led lessons of units 1-2 are the phase-2 part, because renaming them renames deck files.

This keeps the useful part of the current French B1 map and fixes the three defects: the English
slot titles stop being noun phrases, the Russian and Italian maps stop being grammar labels, and
B2/C1/C2 no longer repeat these titles verbatim in translation — each higher level returns to the
same themes with a new macro-function (B2: *evaluate and argue*; C1: *mediate and critique*;
C2: *style and interpretation*).

### 6.4 The A0–A1 shape

The 142 A0–A1 lessons are 22 theme modules, of which the first five (first contact, family,
objects, home, food) are the A0 sub-band and the rest A1. Keep that split explicit:

- `sublevel: "start"` on modules 1–5 (≈ 40 lessons), `sublevel: null` on modules 6–22.
- The 22 module titles follow rule 1; the 16 "legacy" English lessons must be distributed here or
  retired.
- A1 re-enters every A0 theme once (one lesson per module) before introducing new material, which
  is the first spiral turn and the reason A1 is twice the size of A2–C2.

---

## 7. Cross-course reuse

The same grammar page and the same vocabulary theme must serve several courses; only the task
changes. Model it explicitly:

- **Spine**: `general` defines the canonical order for each level.
- **Satellites** (`spoken`, `professional`, `travelling`, `relocation`, `exam`, `pronunciation`)
  reference spine lessons for shared input, and add a scenario overlay: a `professional` lesson on
  negotiating reuses the B1 conditional page and the B1 work theme, but with a workplace task.
- **Reuse by reference, not by copy.** A lesson file is referenced by more than one roadmap (48
  already are). Add `sharedWith: ["spoken-fr-b1"]` to the roadmap entry and a `variants` block in
  the lesson JSON (task, register, duration) instead of duplicating the deck.
- **Contract for a reused lesson**: same `grammarIds`, same `vocabulary` ids, different
  `cando`, `practice` and `teacher_notes`. If the vocabulary ids differ, it is a different lesson,
  not a reuse.
- **Exam tracks** reuse the spine plus past-paper task types; they must not introduce new grammar.

This also fixes the current structural problem that `pronunciation` curricula exist but no
pronunciation course is launched: pronunciation lessons can be attached to the spine units as
satellite lessons rather than living in an orphan folder.

---

## 8. The vocabulary-manual ↔ COSYdata contract

What "linked" should mean, concretely:

1. **Every vocabulary manual page declares its source.** Front matter:

   ```jsonc
   { "lang": "fr", "level": "B1", "theme": "t13",
     "cosydata_files": ["vocabulary/fr/b1/work.json"],
     "entry_ids": ["fr:licenciement:noun", "fr:entretien-embauche:noun", "..."] }
   ```
2. **Every rendered entry carries its id** — `data-vocab-id="fr:licenciement:noun"` on the card,
   so the page can highlight a word, deep-link to the dictionary and feed the exercises.
3. **The page is generated, not authored twice.** The generator writes both HTML and the sidecar
   JSON from COSYdata; the manual repo never holds a private copy of the entry.
4. **The reverse link exists too**: `manual_refs` on the COSYdata entry, so the dictionary page can
   say "seen in Lexique B1 · Travail".
5. **Coverage is a build check**: for each level, `entries_in_manual == entries with level in
   COSYdata`, and every curriculum `vocabulary` string resolves to an id. Today that check would
   fail at 6–51 % for FR/RU/IT/EL; after the rebuild it should be ≥ 95 %.

That single contract turns three parallel lists into one lexicon with three views, which is the
stated goal of the ecosystem.

---

## 9. Remediation backlog (ordered by impact)

### 9.1 COSYdata

| priority | work | size |
|---|---|---|
| P0 | Re-theme FR/RU/IT/EL B1–C2: replace POS buckets with theme files, keep idioms as `form: idiom` inside the theme | 4 langs × 4 levels × 12 themes ≈ 190 files |
| P0 | Fill the missing themes per level (the 4.5 quotas). Counting the real idiom banks as chunks, FR B1–C2 needs ≈ 3 700 more items; counting only core items, ≈ 4 400. Russian ≈ 3 500 / ≈ 4 000. Italian B1 ≈ 550, B2 ≈ 950. Greek B1–C2 is out of scope: mark it unpublished rather than filling it | 4 langs |
| P0 | Fix curriculum↔dictionary mismatch. Unique items taught by the curricula but absent from the dictionary: FR 1 628 of 2 352, RU 1 909 of 2 262, IT 641 of 1 122, EL 488 of 693, EN 905 of 3 203. Each one is either added to COSYdata or replaced by a dictionary item | 5 571 unique |
| P1 | Add `frequency`, `difficulty`, `register`, `defining_level`, `first_needed_by`, `manual_refs` | schema + backfill |
| P1 | Merge overlapping theme files (`food*`, `health*`, `leisure*`, `noun/common_nouns`) | EN ≈ 40 files |
| P2 | Aspect pairs (RU), derivational families (EL), gender (FR/IT) as linked entries | per language |
| P2 | Mark EL B1–C2 and IT B2–C2 as out-of-scope in `index.json` so statistics do not count them | metadata |

### 9.2 COSYmanuals

| priority | work | size |
|---|---|---|
| P0 | Vocabulary generator emits `data-vocab-id` + sidecar JSON; regenerate all 414 vocabulary pages | 414 pages |
| P0 | Regenerate FR/RU/IT vocabulary pages after the COSYdata re-theming (page count will grow from 106/67/29 to ~120/80/60) | – |
| P1 | Add `thread`, `level_role`, `prereq`, `next` to the grammar registry and pages | 1 878 pages (metadata only) |
| P1 | Map the 300 orphan pages to threads; wire the 20 English C2 pages or declare C2 grammar-free | 300 |
| P2 | Communication manual: English has 114 pages, FR/RU 60–62, IT/EL 17 — bring IT/EL to parity for A1–A2 only | – |

### 9.3 COSYplatform

| priority | work | size |
|---|---|---|
| P0 | Raise per-lesson vocabulary to 12–16 items + 4–6 chunks, drawn by id from COSYdata | all 65-lesson courses; 2 470 lessons |
| P0 | Dissolve the English legacy units and retire the A0 duplicate course | 5 units, 182 lessons |
| P1 | Add `theme` (t01–t22) to every unit, `focus` to every lesson, `grammarThread` to every grammar id reference | curriculum schema |
| P1 | Normalise FR C-level ids (92-char slugs) and unit titles across languages | FR/EN/RU B2–C2 |
| P1 | Add the recycling quota and validate it | script + CI |
| P2 | Set the standard level size (65 lessons; A1 142) and either trim EN or mark it "extended" | EN A1–C1 |

---

## 10. Implementation order

1. **Freeze the level model.** Write `levels.json` additions: `sublevel` for A0, `band` for
   A0–A1, and the rule that a course is `general-<iso>-<level>` with A0 as `a1-start`.
2. **Use the audit script** `scripts/audit-lexicon.py` (already in this repository) as the
   scoreboard. It reproduces every number in Part 1 from the three checkouts, runs without
   third-party dependencies, and can be added to CI as a report now and as a gate later.
3. **Backfill the metadata** (`frequency`, `difficulty`, `register`, `defining_level`) for the
   ~25 000 existing entries. Frequency and register can be seeded from public lists (Lexique 3,
   SUBTLEX, VdB, NGSL); difficulty is computed.
4. **Re-level by algorithm**, review only the deltas, and publish a review file per language
   (`docs/level-review/<iso>.csv`) the way the grammar-id review was done.
5. **Re-theme B1–C2** for FR/RU/IT/EL with the 22-theme grid, starting with the themes that
   already have units in the curriculum (work, environment, media, society) so the first pass
   closes the biggest course gaps.
6. **Link the vocabulary manual** with the id contract and regenerate.
7. **Wire the curriculum**: replace the 8-item quota with ids selected by theme and level, add
   `theme`/`focus`, enforce the recycling quota.
8. **Add the spiral metadata** to grammar, and rewrite only the repeat pages that need a new
   moment (start with RU cases, FR subjunctive, EN perfect).
9. **Re-run the audit**; the target state is: ≥ 95 % vocabulary resolution, ≥ 90 % grammar page
   utilisation, ≥ 40 % cross-level recycling, 0 legacy units.

Two decisions need sign-off before step 3, because they change the numbers:

- **Standard level size**: 65 lessons everywhere (A1 142), or keep English at ~120 and declare it
  an extended course?
- **Idiom quota**: keep ≈160 per level (current behaviour) or move to 60–80 at B1 / 120 at B2 /
  150 at C1 as proposed here?

---

## Appendix A: measurements reproduced

Every table in Part 1 is produced by `scripts/audit-lexicon.py`:

```bash
git clone --depth 1 https://github.com/cosylanguages/COSYdata.git /tmp/COSYdata
git clone --depth 1 https://github.com/cosylanguages/COSYmanuals.git /tmp/COSYmanuals
python3 scripts/audit-lexicon.py --cosydata /tmp/COSYdata --manuals /tmp/COSYmanuals
python3 scripts/audit-lexicon.py --cosydata /tmp/COSYdata --manuals /tmp/COSYmanuals --json
```

The script is read-only, has no third-party dependencies and exits 0 even when gaps exist, so it
can run in CI as a report before the thresholds are enforced.

## Appendix B: sources

Verified in this session: *Français fondamental* counts (fr.wikipedia, "Français fondamental"),
De Mauro VdB total ≈ 7 000 (it.wikipedia, "Vocabolario di base"), Greek certification portal
reachable at `greek-language.gr`, COSYdata/COSYmanuals/COSYplatform contents.

Consulted as frameworks (not re-verified here): Council of Europe CEFR 2001 + Companion Volume
2020; English Vocabulary Profile; CEFR-J Wordlist; Oxford 3000/5000; Cambridge KET/PET/FCE/CAE/CPE
wordlists; NGSL/NAWL; Milton (2009); Beacco et al. *Niveau A1.1/A1/A2/B1/B2 pour le français*
(Didier); CIEP *Référentiel des contenus d'apprentissage du FLE*; Gougenheim *L'élaboration du
français fondamental*; Lexique 3; ТРКИ state standards and *Лексические минимумы по РКИ*
(Андрюшина и др.); Lo Duca *Profilo della lingua italiana. Livelli A1–B2*; LIF; ΚΕΓ
*Πιστοποίηση Ελληνομάθειας*; the coursebook series listed in Part 2.
