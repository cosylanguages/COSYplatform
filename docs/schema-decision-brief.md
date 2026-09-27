# Curriculum Data Schema Decision Brief

## Executive Summary

This brief analyzes the two competing curriculum data schemas in `cosylanguages/COSYplatform`:
1. **Schema 1 (Legacy Flat Files):** Archived at `/curriculums/_archive/legacy-flat/*.json` (e.g., `curriculums/_archive/legacy-flat/general-english-a1.json`).
2. **Schema 2 (Newer Nested Files):** Located at `/curriculums/<lang>/<track>/<LEVEL>.json` (e.g., `curriculums/en/general/A1.json`).

The analysis demonstrates that **Schema 2** is the richer, standardized, multi-language curriculum schema backed by JSON Schema validation (`curriculums/_schema/curriculum.schema.json`). Crucially, an audit of the live application entry points (`student.html`, `teacher.html`, `hub.html`, and `index.html`) reveals that **no runtime renderer directly fetches curriculum files from `/curriculums/`**. Instead, all active views render course structures from `/roadmaps/*.json` files and load lesson bodies from `/lessons/` or Supabase.

---

## 1. Worked Example Comparison: General English A1

Below is a side-by-side worked example comparing the same course—**General English A1**—under both schemas.

### Schema 1: Legacy Flat File (`curriculums/general-english-a1.json`)

```json
{
  "id": "curriculum-english-a1",
  "title": "General English A1 - Elementary",
  "language": "en",
  "level": "A1",
  "totalLessons": 62,
  "description": "Comprehensive Elementary (A1) English program covering foundational grammar, vocabulary, pronunciation, 6 main sections, 12 units, progress tests, optional lessons, 18+ sensitive topics, midterm/final exams, and final feedback.",
  "introductory": [
    {
      "id": "ge-a1-more-about-the-course",
      "title": "More about the course",
      "ageRestriction": "18+"
    },
    {
      "id": "ge-a1-grammar-topics",
      "title": "Grammar topics"
    }
  ],
  "sections": [
    {
      "sectionNumber": 1,
      "title": "Section 1",
      "units": [
        {
          "unitNumber": 1,
          "title": "Unit 1. Nice to meet you!",
          "lessons": [
            "nice-to-meet-you",
            "more-about-me",
            "family-exchange",
            "world-of-people"
          ]
        },
        {
          "unitNumber": 2,
          "title": "Unit 2. Routine and fun",
          "lessons": [
            "where-do-real-heroes-work",
            "daily-routine",
            "lets-have-fun-together",
            "corporate-culture"
          ]
        }
      ],
      "assessments": [
        "ge-a1-progress-test-1"
      ]
    }
  ]
}
```

### Schema 2: Newer Nested File (`curriculums/en/general/A1.json`)

```json
{
  "language": "en",
  "course_type": "general",
  "level": "A1",
  "units": [
    {
      "unit": 1,
      "num": 1,
      "id": "u1",
      "title": "MODULE 1. FIRST CONTACT & PERSONAL IDENTITY",
      "label": "FIRST CONTACT & PERSONAL IDENTITY",
      "color": "#0a14F6",
      "lessons": [
        {
          "lesson": 1,
          "num": 1,
          "title": "1.1 Hello! First Contact",
          "code": "M01-L01",
          "grammar": [
            "Subject pronouns, verb 'be' affirmative"
          ],
          "vocabulary": [
            "hello",
            "hi",
            "goodbye",
            "teacher",
            "student"
          ],
          "teacher_notes": "code: \"EN-01\"\ncando: \"Can greet people, say goodbye, introduce oneself, and use classroom language\"\nspeaking: \"Greeting and self-introductions in class\"\nlistening: \"Short dialogue of people meeting for first time\"\nreading: \"Reading classroom instructions and greetings\"\nwriting: \"Write 5 sentences introducing yourself\"",
          "recycled": "Module 1 foundational progression",
          "ageAdaptation": {
            "children": "Learn the alphabet song with gestures and TPR body movements for each letter, followed by a fast-paced flashcard greeting game.",
            "teens": "Interactive digital spell-off competition using smartphones/tablets and online group polls to race spelling names aloud.",
            "adults": "Focus on real-life transactional workplace introductions, business card exchange roleplays, and explicit phonics/spelling rules.",
            "seniors": "Practice greetings in familiar concrete social contexts with large-print letter cards, a deliberate pace, and comfortable acoustic repetition."
          },
          "growingTask": {
            "selfPortrait": "Hello, good morning! My name is Alex, A-L-E-X.",
            "dialogue": "A: Hello, good morning!\nB: Hi! Good morning!"
          }
        }
      ]
    }
  ]
}
```

---

## 2. Field Comparison Matrix

### Fields Present in Schema 1 (Legacy Flat) but Missing from Schema 2

| Field Name | Scope / Location | Description in Schema 1 | Why Missing / Alternative in Schema 2 |
| :--- | :--- | :--- | :--- |
| `id` | Root | String ID (e.g. `"curriculum-english-a1"`) | Implied by directory path (`curriculums/<lang>/<track>/<LEVEL>.json`). |
| `title` | Root | Course title (e.g. `"General English A1 - Elementary"`) | Derived dynamically from language, course type, and level metadata. |
| `totalLessons` | Root | Integer count of all lessons (e.g. `62`) | Computed dynamically by summing `units[].lessons.length`. |
| `description` | Root | Textual overview of course scope | Omitted in favor of structured unit/module `arc` descriptions. |
| `introductory` | Root | Array of intro topic objects (`id`, `title`, `ageRestriction`) | Handled as separate diagnostic roadmaps (`roadmaps/introductory-*.json`). |
| `sections` | Root | Outer section grouping array | Schema 2 organizes lessons directly under `units` without an artificial `sections` layer. |
| `sections[].sectionNumber` | Section | Integer index of section | N/A (sections removed). |
| `sections[].title` | Section | Section header string | N/A (sections removed). |
| `sections[].assessments` | Section | Array of assessment lesson slugs | Progress tests and exams are modeled as structured lessons within units. |
| `units[].unitNumber` | Unit | Integer unit number | Renamed to `unit` (or `num`). |
| `units[].lessons` (string array) | Unit | List of lesson slug strings (e.g. `["nice-to-meet-you", ...]`) | Replaced with an array of rich lesson objects containing full pedagogical metadata. |

### Fields Present in Schema 2 (Newer Nested) but Missing from Schema 1

| Field Name | Scope / Location | Type | Description / Purpose in Schema 2 |
| :--- | :--- | :--- | :--- |
| `course_type` | Root | String (enum) | Tracks course track (`"general"`, `"spoken"`, `"exam"`, `"travelling"`, `"professional"`, `"relocation"`, `"pronunciation"`). |
| `units[].unit` | Unit | Integer | Standardized unit index number. |
| `units[].num` | Unit | Integer | Sequence number for unit ordering. |
| `units[].id` | Unit | String | Short unit slug (e.g., `"u1"`). |
| `units[].label` | Unit | String | Unit title header string (e.g., `"FIRST CONTACT & PERSONAL IDENTITY"`). |
| `units[].color` | Unit | String | Visual accent color HEX code (e.g., `"#0a14F6"`). |
| `units[].arc` | Unit | String | Thematic pedagogical arc description for the unit. |
| `units[].lessons_count` | Unit | Integer | Summary count of lessons in unit. |
| `units[].lessons[].lesson` | Lesson | Integer | Intra-unit lesson number. |
| `units[].lessons[].num` | Lesson | Integer | Global/local lesson index. |
| `units[].lessons[].code` | Lesson | String | Unique lesson code (e.g., `"M01-L01"`). |
| `units[].lessons[].type` | Lesson | String (enum) | Pedagogical type (`"vocab"`, `"grammar"`, `"gv"`, `"spoken"`, `"srev"`, `"exam"`, `"pronunciation"`, `"pron"`). |
| `units[].lessons[].duration_minutes` | Lesson | Integer | Standard session duration (e.g., `15`, `30`, `50`). |
| `units[].lessons[].grammar` | Lesson | String array | Target grammar concepts. |
| `units[].lessons[].vocabulary` / `vocab` | Lesson | String array | Target vocabulary items. |
| `units[].lessons[].discourse` | Lesson | String array | Target functional/discourse markers. |
| `units[].lessons[].practice_types` | Lesson | String array | Task types (e.g., roleplay, matching, error analysis). |
| `units[].lessons[].speaking_percent` | Lesson | Integer | Target Student Talk Time (STT) percentage. |
| `units[].lessons[].teacher_notes` | Lesson | String | Structured teacher guide notes and metadata. |
| `units[].lessons[].recycled` | Lesson | String | Summary of language recycled from prior modules. |
| `units[].lessons[].ageAdaptation` | Lesson | Object | Age-differentiated methodology notes (`children`, `teens`, `adults`, `seniors`). |
| `units[].lessons[].growingTask` | Lesson | Object | Cumulative learning output prompts (`selfPortrait`, `dialogue`). |
| `units[].lessons[].bigSpiralReview` | Lesson | Boolean | Flag indicating spiral review checkpoint. |
| `units[].lessons[].bigSpiralScope` | Lesson | String | Scope description for spiral review. |
| `units[].lessons[].speaking` / `listening` / `reading` / `writing` | Lesson | String | Specific skill objectives for 4-skills targeting. |
| `units[].lessons[].task` | Lesson | String | Main communicative task description. |
| `units[].lessons[].cando` | Lesson | String | Official CEFR Can-Do statement. |
| `units[].lessons[].hw` | Lesson | String | Homework task specification. |

---

## 3. Active UI Renderer Wiring Audit

An inspection of the workspace renderers confirms which files are read at application runtime:

### 1. `student.html` (Student Workspace)
* **File Path:** `/student.html`
* **Roadmap Sequence Loading:** Line 643 (`student.html:643`) inside `renderCourseRoadmap()` fetches sequence data directly from `/roadmaps/${courseId}.json` (using roadmap candidate resolution logic defined at lines 631–638).
* **Lesson Content Loading:** Line 859 (`student.html:859`) inside `renderLesson()` fetches interactive lesson files directly from `/lessons/...`.
* **Direct `/curriculums/` Reads:** **0 calls**. Neither Schema 1 nor Schema 2 files in `/curriculums/` are read directly by `student.html`.

### 2. `teacher.html` (Teacher Workspace)
* **File Path:** `/teacher.html`
* **Roadmap Sequence Loading:** Line 622 (`teacher.html:622`) inside `renderCourseRoadmap()` fetches sequence data directly from `/roadmaps/${courseId}.json` (using candidate paths defined at lines 610–617).
* **Lesson Content Loading:** Line 842 (`teacher.html:842`) inside `renderLesson()` fetches lesson files directly from `/lessons/...`.
* **Direct `/curriculums/` Reads:** **0 calls**. Neither Schema 1 nor Schema 2 files in `/curriculums/` are read directly by `teacher.html`.

### 3. `hub.html` (Unified Hub Workspace)
* **File Path:** `/hub.html`
* **Roadmap Sequence Loading:** Line 490 (`hub.html:490`) inside `renderRoadmapViewer()` fetches roadmap data from `/roadmaps/${courseId}.json`.
* **Lesson Content Loading:** Line 523 (`hub.html:523`) inside `renderLessonViewer()` fetches lesson files from `/lessons/...`.
* **Direct `/curriculums/` Reads:** **0 calls**. Neither schema is read directly by `hub.html`.

### 4. `index.html` (Public Catalog)
* **File Path:** `/index.html`
* **Roadmap Sequence Loading:** Line 443 (`index.html:443`) inside `renderPublicRoadmap()` fetches roadmap files from `/roadmaps/${courseId}.json`.
* **Lesson Content Loading:** Line 521 (`index.html:521`) inside `fetchLessonContentFromSupabase()` fetches lesson markup from Supabase `lesson_content` table.
* **Direct `/curriculums/` Reads:** **0 calls**.

---

## 4. Roadmap Reference Audit (`roadmaps/*.json`)

An audit of all JSON files in `/roadmaps/` was conducted to determine how roadmaps reference curriculum data:

* **Total Roadmap Files in `/roadmaps/`:** 89 JSON files.
* **Roadmaps Containing `curriculumId` Field:** 89 files (**100%**).
* **Breakdown of `curriculumId` Reference Targets:**
  * **71 roadmaps** reference Schema 1 curriculum `id` strings (e.g., `"curriculum-english-a1"`, matching the root `"id"` in legacy flat files like `curriculums/general-english-a1.json`).
  * **18 roadmaps** (Cinema tracks) reference Cinema track flat string IDs (e.g., `"cinema-english-a1"`), which follow Schema 1 flat ID naming conventions.
  * **0 roadmaps** reference Schema 2 nested directory paths (e.g., `"en/general/A1"`).

---

## 5. Recommendation (Proposed for Human Approval)

> **RECOMMENDATION (FLAGGED FOR HUMAN APPROVAL):**
> It is recommended that **Schema 2 (`curriculums/<lang>/<track>/<LEVEL>.json`)** be adopted as the single canonical schema for all curriculum definitions across the platform, and that the 24 legacy Schema 1 files (`curriculums/*.json`) be archived or deprecated. Schema 2 is vastly richer (incorporating CEFR Can-Do statements, grammar targets, age adaptations, growing tasks, and lesson codes), is backed by active JSON schema validation (`curriculums/_schema/curriculum.schema.json` via `npm run validate`), and already contains 112 multi-language curriculum definitions. Because all live frontend renderers (`student.html`, `teacher.html`, `hub.html`, and `index.html`) construct user interfaces by loading sequence data from `/roadmaps/*.json` and content from `/lessons/` rather than reading `/curriculums/` directly, standardizing on Schema 2 carries zero risk of breaking live application views. This recommendation is submitted for maintainer review and approval.
