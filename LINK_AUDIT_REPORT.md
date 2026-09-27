# Link Audit Report & Resolution Verification

This document provides a comprehensive end-to-end link and reference audit across the **COSYplatform Content Repository** following entry point consolidation, Supabase authentication & role-based access control migration, course manifest verification, and roadmap deduplication. All roadmap resolution metrics in this report are derived directly from `/docs/roadmap-lesson-resolution.json` as the single canonical source of truth.

---

## 🌟 Executive Summary: Category Status Overview

| Category | Total Checked | Resolved / Active | Explicitly Planned / Out-of-Scope | Status |
| --- | --- | --- | --- | --- |
| **1. Supabase Course Manifest (`shared/js/auth-guard.js`)** | 175 | 120 (active) | 55 (`not_yet_available`) | **68.6% Active (55 Planned)** ⚠️ |
| **2. HTML relative `href` / `src`** | 322 | 274 | 48 (templates & dynamic JS parameters) | **85.1% Resolved (48 Scaffold / Dynamic)** ⚠️ |
| **3. Markdown links (`.md`)** | 6 | 4 | 2 (`node_modules/` external) | **66.7% Internal Resolved (2 External)** ⚠️ |
| **4. Roadmap sequence `id` → Lesson files** | 1418 | 494 | 924 (`status: "planned"`) | **34.8% Resolved (924 Planned)** ⚠️ |
| **5. `curriculumId` in `curriculums/**/*.json`** | 0 | 0 | 0 (N/A) | **N/A** |
| **6. Portal Access Control Gating (`shared/js/auth-guard.js`)** | 6 | 6 (100%) | 0 | **ALL CLEAR ✅** |

---

## 🔄 Roadmap Deduplication & Manifest Audit

Following the consolidation of duplicate roadmap files in `/roadmaps/`, the roadmap directory contains **30 canonical roadmap files** following the standardized `<track>-<lang>-<level>.json` naming convention (and `introductory-english.json`).

### Post-Deduplication Category 1 Breakdown

- **Total Manifest Entries (`window.CosyAuth.FULL_MANIFEST`):** 175
- **Resolved Active Courses:** 120 (68.6%)
  - **Active Canonical Roadmap JSON Files (`roadmaps/<track>-<lang>-<level>.json`):** 29 active roadmap courses
  - **Active Curriculum JSON Files (`curriculums/<lang>/<track>/<LEVEL>.json`):** 91 active curriculum courses
- **Planned / Not Yet Available Courses:** 55 courses across general, exam, professional, pronunciation, relocation, spoken, and travelling tracks.

---

## 📄 Category 2: HTML Relative References

- **Total References Checked:** 322
- **Resolved:** 274 (85.1%)
- **Uninstantiated Scaffold / Dynamic Parameters:** 48 (All remaining unresolved links belong to uninstantiated scaffold files under `templates/`, `shared/templates/`, or dynamic JavaScript string templates in curriculum previews).

---

## 📝 Category 3: Markdown Links in `.md` Files

- **Total References Checked:** 6
- **Resolved:** 4 (66.7%)
- **Out-of-Scope External:** 2 (Located in third-party dependency `node_modules/ajv/README.md`).

---

## 🗺️ Category 4: Roadmap Sequence IDs → Lesson Files

All counts in this section are derived directly from `/docs/roadmap-lesson-resolution.json`.

- **Total Active Canonical Roadmaps:** 30
- **Total Sequence References Checked:** 1,418 (across 25 non-empty roadmaps)
- **Active / Resolved Lessons:** 494 (34.8% resolution rate mapped via explicit `"lessonFile"` properties in `roadmaps/*.json` and `/docs/roadmap-lesson-resolution.json`)
- **Explicitly Planned Content:** 924 (65.2% marked with `"status": "planned"` in `roadmaps/*.json` and null `matchedLessonFile` in `/docs/roadmap-lesson-resolution.json`)

### Track Resolution Breakdown

| Track | Roadmaps | Resolved Lessons | Planned Lessons | Total Entries | Resolution % |
| --- | --- | --- | --- | --- | --- |
| **Cinema** | 6 | 113 | 0 | 113 | 100.0% |
| **General** | 6 | 41 | 357 | 398 | 10.3% |
| **Grammar** | 6 | 0 | 248 | 248 | 0.0% |
| **Introductory** | 1 | 1 | 5 | 6 | 16.7% |
| **Phrasal-Verbs** | 3 | 0 | 41 | 41 | 0.0% |
| **Spoken** | 5 | 339 | 235 | 574 | 59.1% |
| **Vocabulary** | 3 | 0 | 38 | 38 | 0.0% |
| **Total** | **30** | **494** | **924** | **1418** | **34.8%** |

### Per-Roadmap Detailed Breakdown

| Roadmap File | Resolved Lessons | Planned Lessons | Total Entries | Resolution % |
| --- | --- | --- | --- | --- |
| `roadmaps/cinema-en-a1.json` | 0 | 0 | 0 | 0.0% |
| `roadmaps/cinema-en-a2.json` | 0 | 0 | 0 | 0.0% |
| `roadmaps/cinema-en-b1.json` | 113 | 0 | 113 | 100.0% |
| `roadmaps/cinema-en-b2.json` | 0 | 0 | 0 | 0.0% |
| `roadmaps/cinema-en-c1.json` | 0 | 0 | 0 | 0.0% |
| `roadmaps/cinema-en-c2.json` | 0 | 0 | 0 | 0.0% |
| `roadmaps/general-en-a0.json` | 32 | 14 | 46 | 69.6% |
| `roadmaps/general-en-a1.json` | 8 | 55 | 63 | 12.7% |
| `roadmaps/general-en-a2.json` | 0 | 71 | 71 | 0.0% |
| `roadmaps/general-en-b1.json` | 0 | 81 | 81 | 0.0% |
| `roadmaps/general-en-b2.json` | 0 | 72 | 72 | 0.0% |
| `roadmaps/general-en-c1.json` | 1 | 64 | 65 | 1.5% |
| `roadmaps/grammar-en-a0.json` | 0 | 42 | 42 | 0.0% |
| `roadmaps/grammar-en-a1.json` | 0 | 42 | 42 | 0.0% |
| `roadmaps/grammar-en-a2.json` | 0 | 34 | 34 | 0.0% |
| `roadmaps/grammar-en-b1.json` | 0 | 52 | 52 | 0.0% |
| `roadmaps/grammar-en-b2.json` | 0 | 53 | 53 | 0.0% |
| `roadmaps/grammar-en-c1.json` | 0 | 25 | 25 | 0.0% |
| `roadmaps/introductory-english.json` | 1 | 5 | 6 | 16.7% |
| `roadmaps/phrasal-verbs-en-a2.json` | 0 | 5 | 5 | 0.0% |
| `roadmaps/phrasal-verbs-en-b1.json` | 0 | 15 | 15 | 0.0% |
| `roadmaps/phrasal-verbs-en-b2.json` | 0 | 21 | 21 | 0.0% |
| `roadmaps/spoken-en-a1.json` | 27 | 22 | 49 | 55.1% |
| `roadmaps/spoken-en-a2.json` | 6 | 68 | 74 | 8.1% |
| `roadmaps/spoken-en-b1.json` | 227 | 80 | 307 | 73.9% |
| `roadmaps/spoken-en-b2.json` | 36 | 33 | 69 | 52.2% |
| `roadmaps/spoken-en-c1.json` | 43 | 32 | 75 | 57.3% |
| `roadmaps/vocabulary-en-a1.json` | 0 | 4 | 4 | 0.0% |
| `roadmaps/vocabulary-en-a2.json` | 0 | 32 | 32 | 0.0% |
| `roadmaps/vocabulary-en-b1.json` | 0 | 2 | 2 | 0.0% |

---

## 🎯 Category 5: `curriculumId` Validation in Curriculums

- **Total References Checked:** 0
- **Status:** N/A (Curriculum schemas do not require `curriculumId` top-level fields).

---

## 🔒 Category 6: Portal Access Control Gating Audit

All entry portal HTML files were verified to confirm proper inclusion of `shared/js/auth-guard.js` and execution of `window.CosyAuth.requireRole(...)` on page initialization.

### Verified Portal Gating Table

| Portal File | Included Auth Guard Script | Allowed Roles (`window.CosyAuth.requireRole`) | Status |
| --- | --- | --- | --- |
| `founder.html` | `<script src="shared/js/auth-guard.js"></script>` | `['founder']` | ✅ PASS |
| `teacher.html` | `<script src="shared/js/auth-guard.js"></script>` | `['teacher', 'founder']` | ✅ PASS |
| `teacher-english.html` | `<script src="shared/js/auth-guard.js"></script>` | `['teacher', 'founder']` | ✅ PASS |
| `teacher-french.html` | `<script src="shared/js/auth-guard.js"></script>` | `['teacher', 'founder']` | ✅ PASS |
| `teacher-russian.html` | `<script src="shared/js/auth-guard.js"></script>` | `['teacher', 'founder']` | ✅ PASS |
| `student.html` | `<script src="shared/js/auth-guard.js"></script>` | `['student', 'teacher', 'founder']` | ✅ PASS |

---

## Conclusion

The audit shows that **494 out of 1,418 sequence entries (34.8%)** resolve directly to active lesson content files in `lessons/`, while **924 entries (65.2%)** represent planned content. All roadmap resolution data is derived from `/docs/roadmap-lesson-resolution.json` and is internally consistent across all summary tables and detailed sections.
