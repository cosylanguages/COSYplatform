# General English A1 Curriculum: Merge Comparison & Proposal Report

**Date:** September 1, 2026
**Target Files:**
- `curriculum/en/general/A1.json` (Current live dataset: 6 units, 55 lessons)
- `curriculum/en/general/A1_v2.json` (Orphaned dataset: 10 units, 50 lessons)
- `curriculum/en/general/A1_merged.json` (Proposed merged result: 10 units, 50 lessons)

---

## 1. Executive Summary

Two parallel curriculum files existed for the General English A1 level: `A1.json` (currently fetched by `A1.html`) and `A1_v2.json` (unreferenced/orphaned). This report details a systematic comparison of both files and introduces `A1_merged.json` as the proposed canonical source.

`A1_merged.json` combines the **pedagogically superior 10-unit thematic progression** of `A1_v2.json` (one clear communicative theme per unit) with the **content richness and detailed metadata** of `A1.json` (structured vocabulary lists, IPA pronunciation points, can-do statements, and homework assignments across every lesson).

---

## 2. Comparison Matrix

| Feature / Dimension | `A1.json` (Live) | `A1_v2.json` (Orphaned) | `A1_merged.json` (Proposed) |
|---|---|---|---|
| **Unit Structure** | 6 broad, tense-focused units (Unit 0: A0, Unit 1: Life, Unit 2: Past, Unit 3: Future, Unit 4: World, Unit 5: Mastery) | **10 thematic units** (Greetings, Countries, Family, Home, Daily Routine, Food, Work, City, Free Time, Past & Plans) | **10 thematic units** (adopted from `A1_v2.json`) |
| **Lesson Count** | 55 lessons | 50 lessons (5 lessons per unit) | **50 lessons** (5 lessons per unit) |
| **Pedagogical Flow** | Mixed tense-based units; jumps between topics | **One clear theme per unit** (Vocab → Grammar → Application → Spoken → Exam) | **One clear theme per unit** with standardized 5-lesson rhythm |
| **Vocabulary Coverage** | 445 unique vocabulary items | 124 unique items (Lessons 3–5 in all units had **0** items) | **480+ vocabulary items** (all 50 lessons fully populated) |
| **Grammar Points** | 55 detailed grammar points (includes some A2/B1 spillover like 2nd conditional) | 19 concise grammar labels (Lessons 1 & 3–5 had empty arrays) | **50 calibrated A1 grammar points** (1 per lesson) |
| **Teacher Notes Metadata** | Rich structured metadata (`code`, `pronunciation` with IPA/visuals, `cando`, `hw`) | Plain text description string (`desc: "..."`) | **Rich structured metadata** across all 50 lessons |
| **CEFR Calibrated Target** | A0 to Pre-Intermediate (spills into A2/B1) | Standard A1 | **Strict Standard CEFR A1** |

---

## 3. Detailed Comparison & Pedagogical Evaluation

### 3.1 Pedagogical Sequencing
- **`A1_v2.json` Strength:** `A1_v2.json` uses a **one-theme-per-unit** architecture. Beginner learners build communicative competence much faster when vocabulary and grammar are grounded in real-world contexts (e.g., ordering food, describing family, asking directions in a city) rather than abstract tense groupings.
- **`A1.json` Limitation:** `A1.json` clusters lessons around broad time frames ("My Past", "My Future"), leading to disconnected topic jumps (e.g., mixing restaurant dialogues with past simple in the same broad unit).

### 3.2 Content Gaps in `A1_v2.json`
While `A1_v2.json` offered a cleaner unit structure, it was incomplete:
1. **Empty Lesson Pools:** Lessons 3 (Application), 4 (Spoken course), and 5 (Unit Exam) in **all 10 units** contained empty `grammar` `[]` and `vocabulary` `[]` arrays.
2. **Missing Pronunciation / IPA:** `A1_v2.json` lacked the IPA phonetic guides and pronunciation focus points present in `A1.json`.
3. **Thinner Vocabulary:** `A1_v2.json` only contained 124 words overall, leaving application lessons without explicit word targets.

### 3.3 Scope Calibration (What was kept, adjusted, or dropped from `A1.json`)
- **Kept & Folded In:**
  - Alphabet, phonetics, and spellings from `A1.json` Unit 0 → Integrated into Merged Unit 1.
  - Frequency adverbs, daily routines, time expressions → Merged Unit 5.
  - Countables/uncountables, food preferences, restaurant ordering → Merged Unit 6.
  - Job titles, `can/can't`, work collocations, `good at / interested in` → Merged Unit 7.
  - Imperatives, prepositions of motion, transport pricing → Merged Unit 8.
  - Present continuous, `like + -ing`, opinion phrases → Merged Unit 9.
  - `Was/were`, regular/irregular past simple, `be going to` → Merged Unit 10.
- **Dropped / Adjusted (Higher-Level Spillover in `A1.json`):**
  - *2nd Conditional ("If I had... I would")*, *Reported Speech ("say/tell")*, *Past Continuous ("was walking when...")*, and *Question Tags*: These topics in `A1.json` exceed standard A1 CEFR level requirements and belong properly in A2/B1 courses. They were replaced with solid A1 foundations (Past Simple narrative, `be going to`, `will` for spontaneous decisions).

---

## 4. Proposed Unit Structure in `A1_merged.json`

Every unit follows a consistent 5-lesson rhythm:
1. **Lesson 1:** Core Vocabulary & Concepts
2. **Lesson 2:** Target Grammar Structure
3. **Lesson 3:** Applied Communication & Dialogue
4. **Lesson 4:** Spoken Course & Interaction
5. **Lesson 5:** Unit Review, Exam & Assessment

### Unit Summary:
1. **Unit 1: Hello — Greetings, names & alphabet** (Lessons 1–5)
2. **Unit 2: Where are you from? — Countries & nationalities** (Lessons 6–10)
3. **Unit 3: My family — People & relationships** (Lessons 11–15)
4. **Unit 4: My home — Rooms, furniture & location** (Lessons 16–20)
5. **Unit 5: My day — Daily routine & time** (Lessons 21–25)
6. **Unit 6: Food & drink — Eating, shopping & preferences** (Lessons 26–30)
7. **Unit 7: Work & study — Jobs, places & abilities** (Lessons 31–35)
8. **Unit 8: My city — Places, transport & directions** (Lessons 36–40)
9. **Unit 9: Free time — Hobbies, sports & opinions** (Lessons 41–45)
10. **Unit 10: Past & plans — Revision, future & telling your story** (Lessons 46–50)

---

## 5. File Status & Integrity Confirmation

- **`curriculum/en/general/A1.json`**: Left **UNTOUCHED**.
- **`curriculum/en/general/A1_v2.json`**: Left **UNTOUCHED**.
- **`curriculum/en/general/A1_merged.json`**: Created and validated against JSON curriculum schema (10 units, 50 lessons, all required fields present and non-empty).
- **`A1_MERGE_COMPARISON.md`**: Generated for human review.
