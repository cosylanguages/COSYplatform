# CosyLanguages Platform Architecture

## Overview

CosyLanguages is an interactive language learning platform designed for live teacher-led 1-on-1 and group lessons, self-study practice, and structured curriculum progression.

This repository serves as the central content repository for all curriculums, roadmaps, teacher manuals, and lesson materials across the platform.

## Key Architectural Components

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CosyLanguages Platform                          │
├────────────────────────────────┬───────────────────────────────────────┤
│         Teacher Portal         │            Student Portal             │
│  - Teacher Notes & Speech      │  - Interactive Slide Workspace        │
│  - Stage Aims & Checklists     │  - Real-time Answers & Practice       │
│  - Course Map & Tools          │  - Vocabulary & AI Practice           │
└───────────────┬────────────────┴───────────────────┬───────────────────┘
                │                                    │
                └─────────────────┬──────────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │      Content Repository       │
                  │  (Curriculums, Roadmaps,      │
                  │   Manuals & Lesson XMLs)      │
                  └───────────────────────────────┘
```

### 1. Curriculums & Roadmaps (`curriculums/`, `roadmaps/`)
- **Curriculums**: Define the overall framework for a language level (e.g. General English B2, Business English C1, Conversational Italian A2).
- **Roadmaps**: Sequence of lessons, milestone progress tests, final exams, and self-study modules. Serves as the course map for both teacher and student.

### 2. Teacher Manuals & Catalog (`manuals/`, `docs/teacher-catalog-guide.md`)
- **Teacher Catalog**: Interface where teachers browse and preview available courses and lessons.
- **Teacher Checklists**: Initial lesson instructions, timing recommendations (e.g. 50-minute structure), introductory warm-ups, and student goal alignment.
- **Teacher Notes**: Embedded guidance within each slide:
  - `instruction`: Stage aims and teacher actions.
  - `speech`: Recommended teacher dialogue / prompt scripts.
  - `additional`: Extra extension questions or hint cards.
  - `tapescript`: Listening/video transcripts with timestamps.

### 3. Lessons (`lessons/`)
- Structured interactive slides using the **CosyLanguages Markup Format (`.xml` / `.json`)**.
- Each lesson slide contains content for both student rendering and teacher controls.
- Integrated interactive elements: gap fills, multiple choice tests, drag-and-drop, vocabulary lists, grammar cards, writing essay boxes, and voice recording tools.

### 4. Interactive Tools & Practice Extensions
- **Vocabulary Trainer**: Words tagged in `<cosy-vocabulary>` can be added directly to student wordlists.
- **Grammar Engine**: Embedded grammar hints (`<cosy-grammar-material>`).
- **AI Practice & Speaking Clubs**: Links to self-study AI speaking tools, video practice, and speaking club topics.
