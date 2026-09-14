# COSYplatform Content Repository

Welcome to the **COSYplatform Content Repository**! This repository hosts all interactive curriculums, roadmaps, teacher manuals, and lesson markup files used by the **CosyLanguages** teaching and learning ecosystem.

---

## 📁 Repository Structure

```
.
├── docs/                        # Platform architecture & markup specifications
│   ├── architecture.md          # Dual-page view, monolingual policy, group modes & timing models
│   ├── lesson-format-spec.md    # CosyLanguages (<cosy-*>) markup specification
│   └── teacher-catalog-guide.md # Teacher catalog structure, CCQ guide & multi-duration guide
├── schemas/                     # Formal validation schemas
│   └── lesson.schema.json       # JSON Schema supporting duration & classroom modes
├── curriculums/                 # High-level curriculum definitions
│   ├── general-english-a0.json  # General English A0 Beginner curriculum (8 units)
│   ├── general-english-a1.json  # General English A1 Elementary curriculum (12 units)
│   ├── general-english-a2.json  # General English A2 Pre-Intermediate curriculum (15 units)
│   ├── general-english-b1.json  # General English B1 Intermediate curriculum (15 units)
│   ├── general-english-b2.json  # General English B2 Upper-Intermediate curriculum (13 units)
│   ├── general-english-c1.json  # General English C1 Advanced curriculum (12 units)
│   ├── spoken-english-a1.json   # Spoken English A1 Elementary curriculum (22 modules)
│   ├── spoken-english-a2.json   # Spoken English A2 Pre-Intermediate curriculum (68 modules)
│   ├── spoken-english-b1.json   # Spoken English B1 Intermediate curriculum (79 modules)
│   ├── spoken-english-b2.json   # Spoken English B2 Upper-Intermediate curriculum (33 modules)
│   ├── spoken-english-c1.json   # Spoken English C1 Advanced curriculum (31 modules)
│   ├── grammar-english-a0.json  # Grammar English A0 Beginner curriculum (41 modules)
│   ├── grammar-english-a1.json  # Grammar English A1 Elementary curriculum (41 modules)
│   ├── grammar-english-a2.json  # Grammar English A2 Pre-Intermediate curriculum (33 modules)
│   ├── grammar-english-b1.json  # Grammar English B1 Intermediate curriculum (51 modules)
│   ├── grammar-english-b2.json  # Grammar English B2 Upper-Intermediate curriculum (52 modules)
│   ├── grammar-english-c1.json  # Grammar English C1 Advanced curriculum (25 modules)
│   ├── phrasal-verbs-english-a2.json # Phrasal Verbs A2 Pre-Intermediate curriculum (5 modules)
│   ├── phrasal-verbs-english-b1.json # Phrasal Verbs B1 Intermediate curriculum (15 modules)
│   ├── phrasal-verbs-english-b2.json # Phrasal Verbs B2 Upper-Intermediate curriculum (21 modules)
│   ├── vocabulary-english-a1.json    # Vocabulary Practice A1 Elementary curriculum (4 modules)
│   ├── vocabulary-english-a2.json    # Vocabulary Practice A2 Pre-Intermediate curriculum (30 modules)
│   ├── vocabulary-english-b1.json    # Vocabulary Practice B1 Intermediate curriculum (2 modules)
│   └── introductory-english.json# Introductory Diagnostic curriculum (A0-C2)
├── roadmaps/                    # Course maps and lesson sequences
│   ├── general-english-a0.json  # A0 Beginner course map (4 sections, 45 lessons)
│   ├── general-english-a1.json  # A1 Elementary course map (6 sections, 62 lessons)
│   ├── general-english-a2.json  # A2 Pre-Intermediate course map (8 sections, 71 lessons)
│   ├── general-english-b1.json  # B1 Intermediate course map (8 sections, 74 lessons)
│   ├── general-english-b2.json  # B2 Upper-Intermediate course map (7 sections, 58 lessons)
│   ├── general-english-c1.json  # C1 Advanced course map (6 sections, 67 lessons)
│   ├── spoken-english-a1.json   # Spoken English A1 Elementary course map (22 lessons)
│   ├── spoken-english-a2.json   # Spoken English A2 Pre-Intermediate course map (68 lessons)
│   ├── spoken-english-b1.json   # Spoken English B1 Intermediate course map (79 lessons)
│   ├── spoken-english-b2.json   # Spoken English B2 Upper-Intermediate course map (33 lessons)
│   ├── spoken-english-c1.json   # Spoken English C1 Advanced course map (31 lessons)
│   ├── grammar-english-a0.json  # Grammar English A0 Beginner course map (41 lessons)
│   ├── grammar-english-a1.json  # Grammar English A1 Elementary course map (41 lessons)
│   ├── grammar-english-a2.json  # Grammar English A2 Pre-Intermediate course map (33 lessons)
│   ├── grammar-english-b1.json  # Grammar English B1 Intermediate course map (51 lessons)
│   ├── grammar-english-b2.json  # Grammar English B2 Upper-Intermediate course map (52 lessons)
│   ├── grammar-english-c1.json  # Grammar English C1 Advanced course map (25 lessons)
│   ├── phrasal-verbs-english-a2.json # Phrasal Verbs A2 Pre-Intermediate course map (5 lessons)
│   ├── phrasal-verbs-english-b1.json # Phrasal Verbs B1 Intermediate course map (15 lessons)
│   ├── phrasal-verbs-english-b2.json # Phrasal Verbs B2 Upper-Intermediate course map (21 lessons)
│   ├── vocabulary-english-a1.json    # Vocabulary Practice A1 Elementary course map (4 lessons)
│   ├── vocabulary-english-a2.json    # Vocabulary Practice A2 Pre-Intermediate course map (30 lessons)
│   ├── vocabulary-english-b1.json    # Vocabulary Practice B1 Intermediate course map (2 lessons)
│   └── introductory-english.json# Introductory Diagnostic course map (6 level diagnostic modules)
├── manuals/                     # Teacher guides & onboarding instructions
│   └── teacher-guide-first-lesson.md # First lesson ("Aloha") setup & multi-duration guide
└── lessons/                     # Lesson interactive slides content
    ├── english-b2/
    │   ├── relaxation-and-hygge.xml  # XML interactive slide markup
    │   └── relaxation-and-hygge.json # JSON representation
    ├── english-c1/
    │   └── opposites-attract.xml     # C1 Advanced sample lesson markup
    └── introductory/
        └── introductory-b1.xml       # Introductory diagnostic B1 sample lesson markup
```

---

## 🎯 Key Features & Capabilities

1. **Monolingual English Policy & CCQs**:
   - **Zero L1 Translation**: All content, definitions, and speech notes are strictly in English.
   - **Concept Check Questions (CCQs)**: Elicitation and understanding checks integrated into teacher speech scripts to maximize Student Talk Time (STT).

2. **Dual Student/Teacher Views**:
   - **Student Page**: Distraction-free clean workspace showing instructions, interactive inputs (gaps, drag & drop, choice options), vocabulary dictionary add button, audio recorder, and essay submission box.
   - **Teacher Page**: Live classroom view with stage aims (`<cosy-teacher-notes type="instruction">`), teacher speech prompts (`type="speech"`), extra hints (`type="additional"`), audio/video transcripts (`type="tapescript"`), and answer keys.

3. **Multi-Duration Timing Models & Card Structures**:
   - Standardized into **16 Live Lesson Cards** and **10 Homework Cards** for General English, **15m / 30m / 60m** formats for Spoken English, and **30–50m** formats for Introductory Diagnostic Lessons.
   - **60 Minutes (50 Active Min)**: Fast-paced core vocabulary, grammar input, controlled practice, and speaking cool-down.
   - **90 Minutes (80 Active Min)**: Core + Deep Dive (authentic media analysis, extended pair work, case study).
   - **120 Minutes (110 Active Min)**: Core + Extension + Masterclass (live writing workshop, group debate, detailed action plan).

4. **Introductory Diagnostic First Lessons**:
   - Separate level diagnostic onboarding lessons for A0-A1, A2, B1, B2, C1, and C2.
   - Incorporates greeting, icebreakers, goal setting (Travel, Work, Myself, Studying), interest profiling (Movies, Tech, Business, Animals, Art, Food), learning preference quizzes, level diagnostic speaking, course recommendation, and lesson results summary.

5. **Group vs. Individual Class Modes**:
   - Dynamic slide rendering adapting to 1-on-1 tutoring (`mode="individual"`) or group breakout/pair-work sessions (`mode="group"`).

6. **Ecosystem Integrations**:
   - **Vocabulary Trainer**: Synced with mobile app wordlists.
   - **Self-Study & AI Practice**: Integrated links to AI speaking practice, video practice, and weekly Speaking Clubs.

---

## 🚀 Live Deployment & GitHub Pages

This repository is automatically published via GitHub Actions on every push to `main` using `.github/workflows/pages.yml`.

- **Live Platform URL**: [https://cosylanguages.github.io/COSYplatform/hub.html](https://cosylanguages.github.io/COSYplatform/hub.html)

### URL Key Pattern
To view personalized teacher catalogs, student workspaces, or executive dashboards on the live site, append the `?key=` query parameter to the hub URL:

- **Unified Hub Base**: `https://cosylanguages.github.io/COSYplatform/hub.html?key=<KEY>`
- **Executive / Founder Hub**: `https://cosylanguages.github.io/COSYplatform/hub.html?key=founder-key`
- **English Teacher Hub**: `https://cosylanguages.github.io/COSYplatform/hub.html?key=teachers-en`
- **French Teacher Hub**: `https://cosylanguages.github.io/COSYplatform/hub.html?key=teachers-fr`
- **Russian Teacher Hub**: `https://cosylanguages.github.io/COSYplatform/hub.html?key=teachers-ru`
- **Student Cohort Workspace**: `https://cosylanguages.github.io/COSYplatform/hub.html?key=students-en-a1`

---

## 🔑 How to Grant Access

Access to student and teacher workspaces is managed via unique direct links containing a secret token (`key`). No open signup or public buy buttons exist.

### 1. Adding a Grant Entry
To grant a student or teacher access, hand-edit `data/access-grants.json` and add a new entry:

```json
{
  "key": "unique-random-token",
  "role": "student",
  "name": "Student Name",
  "courses": [
    "general-english-a1"
  ]
}
```

- **`role`**: `"student"` or `"teacher"`. Teachers (`role: "teacher"` or `courses: ["*"]`) see all courses and full teacher guidance.
- **`courses`**: List of course IDs the student is entitled to view (e.g. `"general-english-a1"`, `"spoken-english-b2"`). Students will **only** see listed courses.

### 2. Generating Access Links
Provide the user with their personalized link:
- **Student Workspace Link**: `https://<domain>/student.html?key=unique-random-token`
- **Teacher Workspace Link**: `https://<domain>/teacher.html?key=unique-random-token`

---

## 🛠 Adding New Lessons

1. Read the markup specification in [`docs/lesson-format-spec.md`](docs/lesson-format-spec.md).
2. Create a new `.xml` or `.json` file in `lessons/<level>/<lesson-id>`.
3. Add the lesson entry to the corresponding roadmap in `roadmaps/<level>.json`.
4. Validate the lesson syntax against `schemas/lesson.schema.json`.
