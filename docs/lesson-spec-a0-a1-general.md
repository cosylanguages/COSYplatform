# Locked A0–A1 General-Course Lesson Architecture

This document defines the locked lesson architecture for A0–A1 general language courses across the platform. All A0–A1 module-authoring tasks reference this specification to ensure complete consistency in design, structure, and delivery.

---

## 1. Communication Goal
Every lesson must state a communication goal as an **"I can..."** can-do outcome (e.g., *"I can introduce myself and ask for someone's name"*).

---

## 2. Vocabulary Section
Each lesson contains two distinct vocabulary tiers:
- **Core Vocabulary:** 10–20 active core vocabulary items.
- **Essential Chunks/Collocations:** 5–10 functional phrases and collocations, not bare words (e.g., instead of bare *"name"*, use *"My name is..."*, *"What is your name?"*, *"How do you spell your name?"*).

---

## 3. Grammar Section
- **Function-First Framing:** One main grammar point per lesson, always framed by communicative function rather than an isolated rule (e.g., *"Use be to introduce yourself and other people"*, not *"Learn verb be"*).
- **Practice Progression:** Grammar practice includes controlled exercises, substitution drills, question-answer practice, and personalised production.

---

## 4. Vocabulary Practice Progression
Vocabulary practice follows a 5-step structured progression:
1. **Recognition**
2. **Pronunciation**
3. **Matching/Classification**
4. **Controlled Production**
5. **Personalised Use**

Students progress systematically from **word -> phrase -> sentence -> conversation**.

---

## 5. Four Skills Distribution
Every lesson distributes the four skills as follows:
- **Speaking (~70%):** Repetition with variation, pair questions, information gaps, role plays, mini conversations, personalised speaking, and a final speaking task.
- **Listening (~10%):** Integrated audio/listening prompts supporting speaking tasks.
- **Reading (~10%):** Short reading texts, dialogue scripts, and recognition exercises.
- **Writing (~10%):** Short guided responses, form filling, and notes.

---

## 6. Multi-Duration Versions
Every lesson ships three duration versions building additively on the previous:
- **60 min:** Essential flow.
- **90 min:** Expanded speaking + skills practice.
- **120 min:** Full workshop.

---

## 7. Delivery Adaptations
Every lesson ships two explicit delivery adaptations:
- **Individual Adaptation:** Personalised speaking, target pronunciation correction, adaptation to learner interests, and faster feedback loops.
- **Group Adaptation:** Pair work, role-plays, information gap tasks, surveys, and interactive communication games.

---

## 8. Recycling
- Every lesson explicitly reuses vocabulary, grammar, and speaking functions from previous lessons. No isolated lessons exist.
- Each lesson specification must explicitly state:
  1. What is recycled from the prior lesson.
  2. What is set up/prepared for the next lesson.

---

## 9. Realistic Lesson Size
Never overload a single lesson with multiple unrelated numeric or functional domains (e.g., never combine numbers + dates + prices + phone numbers in one lesson). Instead, split related content into a sequence of focused lessons, each with its own single can-do goal.

---

## 10. Standard Lesson Template Sections
All lesson specifications must present the following sections in strict order:
1. **Level**
2. **Duration options**
3. **Lesson type** (individual / pair / small group / big group)
4. **Communication Goal**
5. **Recycling from previous lesson**
6. **Vocabulary** (core + chunks, with a function column)
7. **Pronunciation Focus**
8. **Grammar Focus** (rule + system + practice activities)
9. **Lesson Flow for 60/90/120 minutes** with timestamped blocks
10. **Individual Lesson Adaptation**
11. **Group Lesson Adaptation**
12. **Homework**
13. **Recycling into next lesson**

---

## Target Languages & Localization Principles

- **Target Languages:** `en`, `fr`, `it`, `ru`, `el`.
- **Native Authoring:** Every lesson must be authored natively in each language, avoiding word-for-word machine translation. Examples, names, and cultural references should be naturally adapted for a learner of that specific target language.
- **1:1 Course Mapping:** While cultural examples and phrasing are natively adapted, the communication goal, grammar focus, and skills distribution remain equivalent across all five languages so that courses map 1:1 lesson-by-lesson across languages.

---

## Repository File and Data Conventions

All authored materials must strictly follow existing repository conventions:
- **Curriculum Overview Pages:** Located per-language at `curriculums/{lang}/general/A1.html`.
- **Lesson Storage & Validation:** Individual lessons are stored as authored JSON files validated against `schemas/lesson.schema.json`.
- **Link Integrity:** Checked via `npm run check:links` (`scripts/check-links.mjs`) against COSYdata vocabulary/functional-phrase indexes and COSYmanuals grammar topic pages.
- **Storage Format:** Follow these established file structures and schema formats for all generated assets — do not invent custom storage formats.
