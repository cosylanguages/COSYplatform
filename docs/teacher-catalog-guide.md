# CosyLanguages Teacher Catalog & Lesson Guide

## Overview
This guide explains how lessons, curriculums, and teaching manuals are structured in the **CosyLanguages** catalog and platform interface for teachers.

---

## 1. Catalog Hierarchy
1. **Course Level**: (e.g., *General English B2*, *Business English C1*, *General Spanish A2*)
2. **Module / Unit**: Specific topical group (e.g., *Unit 1: Lifestyle & Relaxation*, *Unit 2: Work-Life Balance*)
3. **Lesson Types**:
   - **Regular 50-minute Lessons**: Main lesson content (Vocabulary, Grammar, Speaking, Listening, Reading, Writing).
   - **Introductory "Aloha" Lessons**: First lesson designed for goal setting, learning style evaluation, and course map presentation.
   - **Progress Check / Exam**: Assessment slides scheduled after key modules.
   - **Talks / Speaking Clubs**: Short conversational sessions with native speakers or peers.

---

## 2. Standard 50-Minute Lesson Structure

| Stage | Duration | Primary Focus | Platform Elements |
|---|---|---|---|
| **Warm-up & Goal Alignment** | 3–5 min | Review homework, state lesson objectives | `<cosy-instruction>`, Objectives list |
| **Lead-in & Vocabulary** | 7–10 min | Engage student interest, introduce key lexis | `<cosy-vocabulary>`, Image choice |
| **Grammar / Language Input** | 10–12 min | Discover pattern, examine rules | `<cosy-grammar-material>`, Hints |
| **Controlled Practice** | 10–12 min | Gap fills, multiple choice, drag-and-drop | `<cosy-input>`, `<cosy-dnd-text>`, `<cosy-select>` |
| **Freer Practice & Speaking** | 10–12 min | Speech prompts, role-play, discussion | `<cosy-record>`, Essay, Teacher Speech |
| **Cool-down & Feedback** | 5 min | Summary, homework assignment, reflection | Homework slides, Extra tools guide |

---

## 3. Teacher Interface Features during Live Lessons

During a lesson, the teacher interface displays special elements hidden from the student:

1. **Stage Aim Box (`<cosy-teacher-notes type="instruction">`)**:
   - Explains the target outcome of the current slide (e.g. *Stage aim: to introduce target grammar patterns for present habits*).
2. **Teacher Speech Script (`<cosy-teacher-notes type="speech">`)**:
   - Suggested prompts to keep lesson pace natural and effective (e.g. *"Now, let's talk about how people relax in your country."*).
3. **Additional / Extension Tasks (`<cosy-teacher-notes type="additional">`)**:
   - Backup questions and hints if the student finishes the primary activity ahead of time.
4. **Tapescripts & Transcripts (`<cosy-teacher-notes type="tapescript">`)**:
   - Timestamps and text for audio/video materials.

---

## 4. Checklist for First / Introductory Lessons

- [ ] **Check limited lesson balance**: Remind the student about regular attendance and course milestones.
- [ ] **Use introductory slides**: Set goals, discuss interests (e.g. Travelling, Movies, Tech, Business), and connect them directly to the Course Map.
- [ ] **Establish routine**: Introduce the homework tab, Vocabulary trainer, AI teacher practice, and Speaking Clubs.
- [ ] **Respect the timer**: Leave 5–7 minutes for cool-down and homework presentation.
