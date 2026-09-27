# COSYplatform Content Repository

Welcome to the **COSYplatform Content Repository**! This repository hosts all interactive curriculums, course roadmaps, teacher manuals, reference guides, student workbooks, and interactive lesson markup files used by the **CosyLanguages** teaching and learning platform.

> ⚠️ **IMPORTANT CONTENT SECURITY WARNING:**
> All files under `lessons/**/*.xml` and `lessons/**/*.json` committed to this public repository act as pre-publish content sources.
> Production interactive lesson materials (including teacher notes, speech scripts, and answer key overlays) are gated and served live from Supabase. Final lesson materials must be published to Supabase using the local founder script:
> ```bash
> node scripts/publish_to_supabase.js
> ```

---

## 📁 Repository Structure

```
.
├── activities/                  # Supplementary classroom activity files
├── curriculums/                 # Canonical nested JSON curriculum definitions ({iso}/{track}/{LEVEL}.json)
│   ├── _archive/                # Legacy flat curriculum files and migration logs
│   ├── _schema/                 # Curriculum JSON Schema validation
│   └── {iso}/                   # Language folders (en, fr, ru, es, de, it, el, pt, hy, ka, ba, br, tt)
├── data/                        # Core static data indexes
├── docs/                        # Architecture, specs, audit, and coverage reports
│   ├── architecture.md          # Dual-page view, monolingual policy & mode specifications
│   ├── lesson-format-spec.md    # CosyLanguages (<cosy-*>) markup specification
│   ├── level-coverage-report.md # Level coverage audit across all languages
│   └── roadmap-lesson-resolution.json # Master roadmap entry to lesson file resolution table
├── lessons/                     # Interactive lesson slides (XML / JSON format)
│   ├── general-{lang}-{level}/  # General English / French / Russian / Italian / Greek lesson JSONs
│   ├── spoken-{lang}/           # Spoken language XML cards (English, French, Russian)
│   └── pronunciation/           # Pronunciation modules
├── manuals/                     # Teacher manuals & onboarding guides
├── reference/                   # Grammar CELTA unit plans & reference schemas
├── reports/                     # Automated audit and validation outputs
├── roadmaps/                    # 30 canonical course sequence manifests (<track>-<lang>-<level>.json)
├── schemas/                     # Validation JSON Schemas (lesson.schema.json, ccq.schema.json)
├── scripts/                     # Build, conversion, link check, and Supabase publishing scripts
├── shared/                      # Shared CSS design tokens and authentication guard
│   ├── css/tokens.css           # CosyLanguages Sapphire design tokens
│   ├── styles/style.css         # Print & layout stylesheets
│   └── js/auth-guard.js         # Supabase Auth & RLS Role Guard Module
├── student-workbooks/           # Student workbook supplementary materials
├── supabase/                    # Supabase database schema and RLS policies (schema.sql)
├── teacher-guides/              # Teacher guidance documentation
├── templates/                   # Lesson & slide markup templates
├── founder.html                 # Founder executive management portal
├── teacher.html                 # Teacher classroom portal & guide
├── student.html                 # Learner interactive workspace portal
├── hub.html                     # Live course hub viewer
├── index.html                   # Unauthenticated public catalog browser
└── login.html                   # Supabase authentication portal
```

---

## ✨ Key Features

- **Supabase Authentication & Role-Based Access Control (RLS):** Private learning platform enforced by `shared/js/auth-guard.js`. Roles (`founder`, `teacher`, `student`) control access to courses and gated lesson content live from Supabase.
- **Dual Teacher & Student View Modes:** `teacher.html` renders yellow stage aim boxes, green speech scripts, hints, and visible answer key overlays; `student.html` filters out teacher notes to present a clean workspace.
- **Multi-Duration Pacing Filters:** `teacher.html` supports active slide duration filtering (`50m`, `80m`, `110m`) to tailor lesson pacing for short vs. extended sessions.
- **Classroom Projector Mode:** One-click full-screen projector view (`.projector-mode`) for classroom presentation.
- **Utility Drawers:** Instant sticky sidebar access to the COSYdata vocabulary dictionary lookup, irregular verb reference tables, and a configurable classroom timer.
- **Local Response Persistence:** Student inputs (`cosy-input`, `cosy-select`, `cosy-test`, `cosy-dnd-text`, `cosy-essay`) automatically persist state locally in browser `localStorage`.
- **Standalone Worksheet Print Styles:** `@media print` rules enable printing or exporting interactive lessons as offline PDF worksheets without loss of content.

---

## 📊 Language & Level Coverage Summary

Below is a summary of General curriculum level coverage across supported languages (pulled from [`docs/level-coverage-report.md`](docs/level-coverage-report.md)). Planned levels missing a curriculum JSON file are enumerated in `shared/js/auth-guard.js`'s `FULL_MANIFEST` with `"status": "not_yet_available"` to display "Coming soon" indicators in the UI.

| Language Code | Language | Available General Levels | Coming Soon Levels |
| --- | --- | --- | --- |
| `en` | English | `A1`, `A2`, `B1`, `B2`, `C1`, `C2` | `A0` |
| `fr` | French | `A1`, `A2`, `B1`, `B2`, `C1`, `C2` | `A0` |
| `ru` | Russian | `A1`, `A2`, `B1`, `B2`, `C1`, `C2` | `A0` |
| `de` | German | `A1`, `C1` | `A0`, `A2`, `B1`, `B2`, `C2` |
| `es` | Spanish | `A1`, `C1` | `A0`, `A2`, `B1`, `B2`, `C2` |
| `it` | Italian | `A1` | `A0`, `A2`, `B1`, `B2`, `C1`, `C2` |
| `el` | Greek | `A1` | `A0`, `A2`, `B1`, `B2`, `C1`, `C2` |
| `pt` | Portuguese | `A1`, `C1` | `A0`, `A2`, `B1`, `B2`, `C2` |
| `hy` | Armenian | `A1`, `C1` | `A0`, `A2`, `B1`, `B2`, `C2` |
| `ka` | Georgian | `A1`, `C1` | `A0`, `A2`, `B1`, `B2`, `C2` |
| `ba` | Bashkir | `A1`, `C1` | `A0`, `A2`, `B1`, `B2`, `C2` |
| `br` | Breton | `A1`, `C1` | `A0`, `A2`, `B1`, `B2`, `C2` |
| `tt` | Tatar | `A1`, `C1` | `A0`, `A2`, `B1`, `B2`, `C2` |

---

## 🛠 For Contributors

- **Single Canonical Curriculum Schema:** All course curriculums must be stored in the nested structure `curriculums/{iso}/{track}/{LEVEL}.json` and conform to `curriculums/_schema/curriculum.schema.json`. Legacy flat curriculum JSON files (`curriculums/_archive/legacy-flat/`) are archived and excluded from schema checks.
- **Roadmap-to-Lesson Linking Mechanism:** Sequence items in `roadmaps/*.json` link to lesson files via an explicit `"lessonFile"` property pointing to the relative file path under `lessons/` (e.g. `"lessonFile": "lessons/general-english-a1/nice-to-meet-you.json"`). Unmapped sequence entries are explicitly marked as `"status": "planned"`. Full resolution mappings are documented in `/docs/roadmap-lesson-resolution.json`.
- **Validation:** Always validate curriculum and lesson schemas before committing changes:
  ```bash
  npm run validate
  ```
- **Publishing:** To push updated lesson materials to the live Supabase backend, run:
  ```bash
  node scripts/publish_to_supabase.js
  ```
