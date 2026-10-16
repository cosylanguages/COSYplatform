# COSYplatform Taxonomy Usage & Mapping Audit

This document provides a comprehensive audit of all locations within **COSYplatform** where language codes, CEFR level codes, course/track IDs, topic/theme IDs, filenames, folder names, JS constants, HTML filters, database schemas, and data files are defined or hardcoded.

It evaluates each occurrence against the ecosystem's canonical taxonomy definitions:
- Public registry: `data/taxonomy.json` (COSYplatform)
- Allowed themes schema: `COSYdata/schemas/themes.json` (COSYdata)

---

## Executive Summary & Ecosystem Taxonomy Standard

The COSY ecosystem enforces a unified, hierarchical taxonomy across all repositories:

$$\text{Language (ISO 639-1)} \longrightarrow \text{CEFR Level (a0--c2)} \longrightarrow \text{Course / Track ID} \longrightarrow \text{Unit} \longrightarrow \text{Topic / Theme}$$

### Ecosystem Rules & Ownership
1. **Upstream Owner:** `COSYplatform` is the canonical owner of all course roadmaps, lessons, and curriculum taxonomy.
2. **Core Course Types (COSYplatform):** `general`, `spoken`, `professional`, `travelling`, `relocation`, `exam`.
3. **Extra Event Course Types (COSYevents):** `cinema`, `karaoke`, `discussion`, `pronunciation`.
4. **Canonical Vocabulary & Themes (COSYdata):** Defined in `COSYdata/schemas/themes.json` using structured secondary theme paths (e.g. `work/professions_jobs`, `animals/farm_animals`, `health/illness_symptoms`).
5. **COSYworld Status:** Discontinued across the entire ecosystem. No references allowed.

---

## 1. Inventory of Taxonomy Definitions & Hardcoded Locations

### 1.1 Data Files & Roadmaps (`data/` & `roadmaps/`)

#### `data/taxonomy.json`
- **Path:** `data/taxonomy.json`
- **Values Used:**
  - **Languages Offered:** `en`, `fr`, `ru`, `el`, `it`, `es`, `de`, `pt`, `hy`, `ka`, `tt`, `ba`, `br`
  - **CEFR Levels:** `a0`, `a1`, `a2`, `b1`, `b2`, `c1`, `c2`
  - **Core Course Types:** `general`, `spoken`, `professional`, `travelling`, `relocation`, `exam`
  - **Extra Course Types:** `cinema`, `karaoke`, `discussion`, `pronunciation`
- **Mismatches / Alignment:** Serves as the single public registry for `COSYplatform`. Correctly uses `travelling` (British English standard across COSY) and canonical CEFR level codes.

#### `roadmaps/*.json` (54 Roadmap Files)
- **Path:** `roadmaps/cinema-en-a1.json` through `cinema-en-c2.json`, `discussion-en-a1.json` through `discussion-en-c2.json`, `general-en-a0.json` through `general-en-c1.json`, `grammar-en-a0.json` through `grammar-en-c1.json`, `phrasal-verbs-en-a2.json` through `phrasal-verbs-en-b2.json`, `pronunciation-en-a1.json` through `pronunciation-ru-c2.json`, `spoken-en-a1.json` through `spoken-en-c1.json`, `vocabulary-en-a1.json` through `vocabulary-en-b1.json`, `introductory-english.json`.
- **Values Used:**
  - **Languages:** `en`, `fr`, `ru`
  - **CEFR Levels:** `a0`, `a1`, `a2`, `b1`, `b2`, `c1`, `c2`
  - **Course / Track Types:** `general`, `spoken`, `cinema`, `discussion`, `pronunciation`, `grammar`, `phrasal-verbs`, `vocabulary`, `introductory-english`
  - **Legacy Header `curriculumId` Values:** `curriculum-english-a0`, `curriculum-english-a1`, `curriculum-grammar-english-a0`, `curriculum-phrasal-verbs-english-a2`, `curriculum-vocabulary-english-a1`, `curriculum-introductory-english`, `pronunciation-en-a1`, `cinema-english-b1`, `discussion-english-b1`
- **Mismatches against `data/taxonomy.json`:**
  - Standalone roadmap files exist for `grammar-en-*.json` (6 files), `phrasal-verbs-en-*.json` (3 files), `vocabulary-en-*.json` (3 files), and `introductory-english.json`. In `data/taxonomy.json`, these 13 roadmaps are categorized under `nonConformingRoadmaps` and scheduled for integration as sub-modules within core courses (`general` / `spoken`) or reference modules in `COSYtools` / `COSYdata`.

---

### 1.2 JavaScript Client Modules & Constants (`shared/js/`)

#### `shared/js/auth-guard.js`
- **Path:** `shared/js/auth-guard.js`
- **Values Used:**
  - **`window.CosyAuth.FULL_MANIFEST` (132 course objects):**
    - **Track Names:** `"General"`, `"Grammar"`, `"Pronunciation"`, `"Spoken"`, `"Travelling"`, `"Cinema"`, `"Discussion"`, `"Exam"`, `"Professional"`, `"Relocation"`
    - **Language Codes:** `ba`, `br`, `de`, `el`, `en`, `es`, `fr`, `hy`, `it`, `ka`, `pt`, `ru`, `tt`
    - **Level Codes:** `a0`, `a1`, `a2`, `b1`, `b2`, `c1`, `c2`, `introductory-english`
- **Mismatches against `data/taxonomy.json`:**
  - Includes track `"Grammar"` which is not a core course type in `data/taxonomy.json`.
  - Uses `introductory-english` as a pseudo-level code instead of CEFR level `a0`.

#### `shared/js/vocab-index.js`
- **Path:** `shared/js/vocab-index.js`
- **Values Used:**
  - Over 1,000 vocabulary term objects mapping words to vocabulary data files.
  - **Folder / File Paths:** `a0_a1/adjectives.json`, `a0_a1/animals.json`, `a0_a1/school.json`, `a0_a1/jobs.json`, `a0_a1/feelings.json`, `a0_a1/verbs.json`, `a0_a1/colors.json`, `a0_a1/expressions.json`, `a0_a1/time.json`, `a0_a1/body_health.json`, `a0_a1/food_drink.json`, `a0_a1/numbers.json`, `a0_a1/places_transport.json`, `a2/sports_hobbies.json`, `a2/phrasal_verbs.json`, `a2/work.json`, `a2/health.json`, `a2/comparisons.json`, `a2/appearance.json`, `a2/living.json`, `a2/common_nouns.json`, `b1/communication.json`, `b1/politics.json`, `b1/culture.json`, `b1/society.json`, `b1/environment.json`, `b1/urban_housing.json`, `b1/geography.json`, `b2/economy.json`, `b2/lifestyle.json`, `b2/migration.json`, `b2/education.json`, `b2/academic_vocabulary.json`, `b2/crime.json`, `c1/cultural_identity_belonging.json`, `c1/sophisticated_adjectives.json`, `c1/legal_specialization.json`, `c2/synonyms.json`, `c2/idioms.json`, `c2/literary_devices.json`.
- **Mismatches against `COSYdata/schemas/themes.json` & `data/taxonomy.json`:**
  - **Combined Folder Name:** Uses `a0_a1/` for elementary level files instead of canonical separate level folders `a0/` and `a1/`.
  - **Uncategorized Flat Topic File Names:** Uses flat filenames (e.g. `jobs.json`, `animals.json`, `school.json`, `health.json`, `politics.json`, `society.json`, `crime.json`, `living.json`) instead of COSYdata's hierarchical secondary themes (`work/professions_jobs`, `animals/farm_animals`, `education/classroom_objects`, `health/illness_symptoms`, `politics/government`, `society/community`, `crime/offenses`, `housing/rooms_spaces`).

#### `shared/js/vocab-resolver.js`
- **Path:** `shared/js/vocab-resolver.js`
- **Values Used:**
  - Language: `'en'`
  - Track: `'Vocabulary'`
- **Mismatches:** Hardcodes track `'Vocabulary'` as a top-level course track rather than linking to COSYdata index.

#### `shared/js/tools-resolver.js`
- **Path:** `shared/js/tools-resolver.js`
- **Values Used:**
  - Language: `'en'`
  - Level: `'a1'`
  - Track: `'Grammar'`
- **Mismatches:** Refers to COSYtools reference modules as track `'Grammar'`.

#### `shared/js/manuals-resolver.js`
- **Path:** `shared/js/manuals-resolver.js`
- **Values Used:**
  - Tracks: `'grammar'`, `'vocabulary'`
- **Mismatches:** Maps manuals to non-conforming track names.

#### `shared/js/lang-switcher.js` & `shared/js/i18n.js`
- **Path:** `shared/js/lang-switcher.js`, `shared/js/i18n.js`
- **Values Used:**
  - Supported UI Languages: `en`, `fr`, `ru`, `it`, `el`
- **Mismatches / Alignment:** Aligned with COSY platform core UI languages.

---

### 1.3 HTML Client Pages & UI Filters

#### `student.html`
- **Path:** `student.html`
- **Values Used:**
  - **Track Filter Buttons / Catalog Categories:** `general`, `spoken`, `grammar`, `pronunciation`, `travel`, `vocabulary`
  - **Language Filter Values:** `en`, `fr`, `ru`, `es`, `el`, `de`, `it`, `pt`, `ba`, `br`
  - **CEFR Level Filters:** `a0`, `a1`, `a2`, `b1`, `b2`, `c1`, `c2`
- **Mismatches against `data/taxonomy.json`:**
  - Uses `travel` as a filter ID instead of canonical `travelling`.
  - Exposes `grammar` and `vocabulary` as separate top-level track filter buttons in UI.

#### `teacher.html`
- **Path:** `teacher.html`
- **Values Used:**
  - **Assigned Languages Dropdown:** `en`, `fr`, `ru`, `es`, `de`, `it`, `pt`, `el`, `ba`, `br`
  - **CEFR Levels:** `a1`, `a2`, `b1`, `b2`, `c1`, `c2`
  - **Descriptive Level Labels:** `"Elementary"`, `"Pre-Intermediate"`, `"Intermediate"`, `"Upper-Intermediate"`, `"Advanced"`, `"Proficiency"`, `"Starter"`
  - **Track Filters:** `General`, `Grammar`, `Vocabulary`, `Discussion`, `Travel`
- **Mismatches against `data/taxonomy.json`:**
  - Uses `Travel` instead of `Travelling`.
  - Uses descriptive level labels in UI select options instead of pairing with canonical CEFR codes (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`).

#### `founder.html`
- **Path:** `founder.html`
- **Values Used:**
  - **Language Access Selectors:** `en`, `fr`, `ru`, `de`, `es`, `pt`, `it`, `el`, `hy`, `ka`
  - **Role Definitions:** `'founder'`, `'teacher'`, `'student'`

#### `classroom.html`
- **Path:** `classroom.html`
- **Values Used:**
  - **Course / Track URL Parameters:** `general`, `spoken`, `discussion`, `vocabulary`, `travel`, `pronunciation`
  - **Language Codes:** `en`, `pt`, `ru`, `it`, `el`, `es`
  - **CEFR Level:** `A1`
- **Mismatches:** Uses `travel` instead of `travelling`.

#### `index.html`, `login.html`, `hub.html`, `404.html`
- **Path:** `index.html`, `login.html`, `hub.html`, `404.html`
- **Values Used:**
  - **UI Languages:** `en`, `fr`, `ru`, `it`, `el`
  - **Tracks referenced:** `General`

---

### 1.4 Internationalization Dictionary Files (`shared/i18n/*.json`)

- **Paths:** `shared/i18n/en.json`, `shared/i18n/fr.json`, `shared/i18n/ru.json`, `shared/i18n/it.json`, `shared/i18n/el.json`
- **Values Used:**
  - **Course Type Keys:** `General`, `Spoken`, `Grammar`, `Professional`, `Travelling`, `Pronunciation`, `Exam`, `Relocation`, `Cinema`, `Discussion`
  - **Language Names:** English, French, Russian, Italian, Greek, Spanish, German, Portuguese, Bashkir, Belarusian
- **Mismatches / Alignment:** Dictionary files correctly contain keys for `Travelling`.

---

### 1.5 Database Migrations & SQL Schemas (`supabase/`)

#### `supabase/migrations/20261030000000_protected_content_schema.sql`
- **Path:** `supabase/migrations/20261030000000_protected_content_schema.sql`
- **Values Used:**
  - **`profiles.role` CHECK constraint:** `'student'`, `'teacher'`, `'founder'`
  - **`lessons.kind` CHECK constraint:** `'lesson'`, `'roadmap-detail'`, `'answer-key'`, `'teacher-notes'`, `'workbook'`, `'manual'`, `'session-body'`
  - **`lesson_protected.kind` CHECK constraint:** `'answer-key'`, `'teacher-notes'`, `'session-body'`, `'manual'`
  - **`courses.course_type` column:** Stores string IDs (`'general'`, `'spoken'`, `'professional'`, `'travelling'`, `'relocation'`, `'exam'`, `'cinema'`, `'karaoke'`, `'discussion'`, `'pronunciation'`)

#### `supabase/tests/rls_policies.test.sql`
- **Path:** `supabase/tests/rls_policies.test.sql`
- **Values Used:**
  - **Languages:** `'en'`, `'fr'`
  - **CEFR Levels:** `'a1'`, `'b1'`
  - **Course Types:** `'general'`

---

### 1.6 Scripts & Utilities (`scripts/`)

#### `scripts/ingest_roadmaps.js`
- **Path:** `scripts/ingest_roadmaps.js`
- **Values Used:**
  - Parses roadmap JSON files and maps course types (`general`, `spoken`, `cinema`, `discussion`, `pronunciation`, `grammar`, `phrasal-verbs`, `vocabulary`), languages (`en`, `fr`, `ru`), CEFR levels (`a0` through `c2`).
  - Formats canonical lesson IDs (`<lang>:<cefr>:<slug>`) and placement IDs (`<lang>:<cefr>:<course>:<unit>:<slug>`).

#### `scripts/seed_pilot.js`
- **Path:** `scripts/seed_pilot.js`
- **Values Used:**
  - Course ID: `general-en-a1`
  - Language: `'en'`, CEFR: `'a1'`, Course Type: `'general'`

#### `scripts/strip_roadmaps_to_preview.js`
- **Path:** `scripts/strip_roadmaps_to_preview.js`
- **Values Used:**
  - Evaluates root and sequence fields across all 54 roadmaps.

#### `scripts/check_protected_keys.js` & `scripts/analyze_lesson_sources.js`
- **Paths:** `scripts/check_protected_keys.js`, `scripts/analyze_lesson_sources.js`
- **Values Used:**
  - Scans `roadmaps/` and repository files for protected keys (`answers`, `teacherNotes`, `answer-key`, `<cosy-teacher-notes>`).

---

## 2. Summary of Mismatches against Ecosystem Standards

| Item Category | COSYplatform Used Value | COSYdata / Ecosystem Canonical Value | Mismatch Description |
| :--- | :--- | :--- | :--- |
| **Track / Course ID** | `travel` | `travelling` | Used in `student.html`, `teacher.html`, `classroom.html`, `vocab-index.js`. Standard in `taxonomy.json` is `travelling`. |
| **Course Track** | `grammar` (standalone) | Module in `general` / `COSYtools` | 6 grammar roadmaps exist as standalone files; listed under `nonConformingRoadmaps`. |
| **Course Track** | `phrasal-verbs` (standalone) | Module in `spoken` / `COSYdata` | 3 phrasal verb roadmaps exist as standalone files; listed under `nonConformingRoadmaps`. |
| **Course Track** | `vocabulary` (standalone) | Module in `general` / `COSYdata` | 3 vocabulary roadmaps exist as standalone files; listed under `nonConformingRoadmaps`. |
| **Utility Track** | `introductory-english` | `general` (A0 placement test) | Diagnostic roadmap outside standard CEFR course sequence. |
| **CEFR Level Folder** | `a0_a1/` | `a0/` and `a1/` | `shared/js/vocab-index.js` combines A0 and A1 into single folder path `a0_a1/`. |
| **Topic File Paths** | Flat files (e.g., `jobs.json`, `health.json`) | Categorized secondary themes (e.g. `work/professions_jobs`, `health/illness_symptoms`) | Vocabulary index uses flat topic filenames instead of COSYdata's categorized theme paths. |
| **CEFR Levels** | `"Elementary"`, `"Pre-Intermediate"`, `"Starter"` | `a0`, `a1`, `a2`, `b1`, `b2`, `c1`, `c2` | UI dropdowns in `teacher.html` and `student.html` display descriptive labels without mapping to ISO CEFR keys. |
| **Roadmap Header IDs** | `curriculum-english-a1`, `curriculum-grammar-english-a0` | `general-en-a1`, `grammar-en-a0` | Legacy `curriculumId` strings in roadmap JSON files. |

---

## 3. Required Aliases & Renames Matrix

To achieve 100% ecosystem alignment without breaking backwards compatibility or runtime lookups, the following aliases and renames are required:

| Current Value | Canonical Ecosystem Value | Location / Usage | Required Action / Alias Strategy |
| :--- | :--- | :--- | :--- |
| `travel` | `travelling` | `student.html`, `teacher.html`, `classroom.html`, `vocab-index.js` | Add UI alias mapping `travel -> travelling` in filters and update links to `travelling`. |
| `a0_a1` | `a0`, `a1` | `shared/js/vocab-index.js` file paths | Map `a0_a1` entries into separate `a0/` and `a1/` theme paths matching `COSYdata/schemas/themes.json`. |
| `curriculum-english-a1` | `general-en-a1` | `roadmaps/general-en-a1.json` (`curriculumId`) | Update `curriculumId` field in roadmap header to match canonical course ID `general-en-a1`. |
| `curriculum-english-a0` | `general-en-a0` | `roadmaps/general-en-a0.json` | Update `curriculumId` field in roadmap header to match canonical course ID `general-en-a0`. |
| `curriculum-grammar-english-a0` | `grammar-en-a0` | `roadmaps/grammar-en-a0.json` | Alias as sub-module of `general-en-a0` or `COSYtools` reference. |
| `curriculum-phrasal-verbs-english-a2` | `phrasal-verbs-en-a2` | `roadmaps/phrasal-verbs-en-a2.json` | Alias as sub-module of `spoken-en-a2` or `COSYdata` vocabulary list. |
| `curriculum-vocabulary-english-a1` | `vocabulary-en-a1` | `roadmaps/vocabulary-en-a1.json` | Alias as sub-module of `general-en-a1` or `COSYdata` practice. |
| `curriculum-introductory-english` | `introductory-english` | `roadmaps/introductory-english.json` | Map as onboarding diagnostic module inside `general`. |
| `Starter` / `Elementary` | `a0` / `a1` | `teacher.html`, `student.html` UI labels | Pair descriptive UI labels with exact CEFR code attributes (`data-cefr="a1"`). |
| Flat topic filenames (e.g. `jobs.json`) | Categorized theme (`work/professions_jobs`) | `shared/js/vocab-index.js` | Update vocabulary resolver to resolve secondary theme paths defined in `COSYdata/schemas/themes.json`. |
