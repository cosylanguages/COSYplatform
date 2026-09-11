# COSYplatform Content Repository

Welcome to the **COSYplatform Content Repository**! This repository hosts all interactive curriculums, roadmaps, teacher manuals, and lesson markup files used by the **CosyLanguages** teaching and learning ecosystem.

---

## 📁 Repository Structure

```
.
├── docs/                        # Platform architecture & markup specifications
│   ├── architecture.md          # Ecosystem & platform integration overview
│   ├── lesson-format-spec.md    # CosyLanguages (<cosy-*>) markup specification
│   └── teacher-catalog-guide.md # Teacher catalog structure & lesson timing guide
├── schemas/                     # Formal validation schemas
│   └── lesson.schema.json       # JSON Schema for validating lesson structures
├── curriculums/                 # High-level curriculum definitions
│   ├── general-english-b2.json  # General English B2 curriculum
│   └── general-english-c1.json  # General English C1 Advanced curriculum (66 lessons)
├── roadmaps/                    # Course maps and lesson sequences
│   ├── general-english-b2.json  # B2 course map
│   └── general-english-c1.json  # C1 Advanced course map (6 sections, 12 units, exams)
├── manuals/                     # Teacher guides & onboarding instructions
│   └── teacher-guide-first-lesson.md # First lesson ("Aloha") teacher checklist
└── lessons/                     # Lesson interactive slides content
    ├── english-b2/
    │   ├── relaxation-and-hygge.xml  # XML interactive slide markup
    │   └── relaxation-and-hygge.json # JSON representation
    └── english-c1/
        └── opposites-attract.xml     # C1 Advanced sample lesson markup
```

---

## 🎯 Key Features & Capabilities

1. **Dual Student/Teacher View**:
   - **Student View**: Interactive exercises (gap fills, drag & drop, choice options, audio recorder, essay box, vocabulary lists, grammar hint cards).
   - **Teacher View**: Dedicated stage aims (`<cosy-teacher-notes type="instruction">`), teacher speech scripts (`type="speech"`), extra hints (`type="additional"`), and listening transcripts (`type="tapescript"`).

2. **Standard 50-Minute Lesson Architecture**:
   - Warm-up & Goal Alignment (3–5 min)
   - Lead-in & Vocabulary Input (7–10 min)
   - Grammar Discovery & Practice (10–12 min)
   - Controlled Interactive Practice (10–12 min)
   - Freer Practice & Speaking (10–12 min)
   - Cool-down, Feedback & Homework (5 min)

3. **Ecosystem Integrations**:
   - **Vocabulary Trainer**: Added words dynamically sync with the student's mobile app wordlists.
   - **Self-Study & AI Practice**: Built-in links to AI teacher speaking practice, video practice, and weekly Speaking Clubs.

---

## 🛠 Adding New Lessons

1. Read the markup specification in [`docs/lesson-format-spec.md`](docs/lesson-format-spec.md).
2. Create a new `.xml` or `.json` file in `lessons/<level>/<lesson-id>`.
3. Add the lesson entry to the corresponding roadmap in `roadmaps/<level>.json`.
4. Validate the lesson syntax against `schemas/lesson.schema.json`.
