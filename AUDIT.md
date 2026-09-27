# COSYplatform System Audit Report

## Executive Summary
This report presents a comprehensive audit of the **COSYplatform** repository across structural/logic integrity, visual/CSS design, UX/accessibility standards, and roadmap lesson resolution. All roadmap resolution metrics in this report are derived directly from `/docs/roadmap-lesson-resolution.json` as the single canonical source of truth.

---

## 1. STRUCTURAL / LOGIC AUDIT

### Renderer Presence & Implementation
- **Status:** Functional static renderers exist as `student.html`, `teacher.html`, and `hub.html`.
- **Student View (`student.html`):** Renders a distraction-free 3-column workspace. `<cosy-teacher-notes>` are filtered out. Interactive controls (`cosy-input`, `cosy-select`, `cosy-test`, `cosy-dnd-text`, `cosy-vocabulary`, `cosy-record`, `cosy-essay`) render cleanly and persist state locally in browser `localStorage` (`cosy_ans_<lessonPath>`).
- **Teacher View (`teacher.html`):** Renders classroom view with yellow stage aims (`type="instruction"`), green speech scripts (`type="speech"`), hints (`type="additional"`), audio tapescripts (`type="tapescript"`), and visible answer key overlays (`.answer-key-box`). Includes classroom timer, dictionary lookup, irregular verbs, and slide navigation.

### Interactive Input Functional Validation vs. Visual Presence
- **Input Types:** Text gaps, choice selects, test radios, essay textareas, and drag-and-drop word bank dropdowns are interactive and save responses locally.
- **Validation Gap:** Inputs lack automated client-side validation / instant self-grading feedback in Student View. Correct answers are visible to teachers in Teacher View, but students do not receive inline score indicators or instant right/wrong feedback.

### Curriculum → Roadmap → Lesson Chain Resolution
- **Resolution Audit Result:** Across all 30 canonical roadmaps (1,418 sequence entries), **494 entries (34.8%)** resolve directly to lesson content files in `lessons/` (via explicit `lessonFile` properties generated in `/docs/roadmap-lesson-resolution.json`), while **924 entries (65.2%)** are explicitly marked with `"status": "planned"`.

#### Track Resolution Summary
| Track | Total Roadmaps | Resolved Lessons | Planned Entries | Total Entries | Resolution % |
| --- | --- | --- | --- | --- | --- |
| **Cinema** | 6 | 113 | 0 | 113 | 100.0% |
| **General** | 6 | 41 | 357 | 398 | 10.3% |
| **Grammar** | 6 | 0 | 248 | 248 | 0.0% |
| **Introductory** | 1 | 1 | 5 | 6 | 16.7% |
| **Phrasal-Verbs** | 3 | 0 | 41 | 41 | 0.0% |
| **Spoken** | 5 | 339 | 235 | 574 | 59.1% |
| **Vocabulary** | 3 | 0 | 38 | 38 | 0.0% |
| **Total** | **30** | **494** | **924** | **1418** | **34.8%** |

---

## 2. VISUAL / CSS AUDIT

### Multi-Duration Design (15/30/60m and 50/80/110m)
- **Slide Filtering:** `teacher.html` supports active slide duration filtering (`duration="50"`, `"80"`, `"110"`), hiding optional deep-dive or extension slides in core 60-minute flows.
- **Layout Pacing:** The 3-column `.edvibe-workspace` layout uses a flexible central canvas (`1fr`) with sticky utility rails (56px left, 280px right). Content scales smoothly without awkward squeezing or horizontal stretching across short 15-minute spoken cards and 110-minute workshop slides.

### Visual Distinctness: Student vs. Teacher Views
- **Student View:** Clean light blue palette (`#0284c7`, `--student-primary`), "Student Workspace" badge, minimal distraction, no answer keys or teacher dialogue notes.
- **Teacher View:** Indigo/purple header theme (`#4f46e5`, `--teacher-primary`), "Teacher Catalog & Guide" badge, yellow stage aim boxes, green speech scripts, gray answer key boxes.
- **Screen-Share Safety:** Highly distinct visual headers and color palettes ensure a screen-share mixup is immediately noticeable.

---

## 3. UX / UI & ACCESSIBILITY AUDIT

### Access Control UX
- **Gating Mechanism:** Token/role checked via Supabase session and `shared/js/auth-guard.js` (`window.CosyAuth.requireRole(...)`).
- **User Feedback:** Unauthenticated users or users with invalid roles are redirected to `login.html` with explanatory context, protecting gated content.

### Keyboard Accessibility
- **Form Controls:** Text inputs, select menus, radio buttons, essay textareas, and drag-and-drop gap dropdowns are native HTML elements, fully focusable and operable via `Tab`, `Space`, and `Arrow` keys.
- **Slide Controls:** Keyboard arrow keys (`ArrowLeft` / `ArrowRight`) navigate slides when focus is outside text inputs.
- **Choice Cards:** Custom option cards (`cosy-choice-option` / `choice-card` `<div>`s) rely on `onclick` events without `tabindex="0"` or `onkeydown` handlers, making them mouse-friendly but requiring keyboard focus enhancements.

---

## Top 5 Priority Fixes

1. **Roadmap ID to Module Filename Alias Resolution:** Update roadmap JSON IDs or add resolution alias mapping in `student.html` / `teacher.html` so roadmap entries (e.g. `ge-a1-unit-1`) seamlessly map to `m01-l01-*.json` files.
2. **Instant Student Self-Check Validation:** Add optional immediate answer validation / self-grading feedback indicators on student input fields (`cosy-input`, `cosy-test`, `cosy-dnd-text`).
3. **Keyboard Focusability on Custom Choice Cards:** Add `tabindex="0"` and `onkeydown` (Enter/Space) handlers to `<div class="choice-card">` elements for full WCAG keyboard accessibility.
4. **Complete Roadmap File Coverage for Spoken & Grammar Tracks:** Batch convert remaining planned roadmap lessons or stub future lesson files so every roadmap entry resolves without fallback warnings.
5. **Student Duration Filter Control:** Expose duration mode toggles (50m / 80m / 110m) on `student.html` so self-study learners can select core vs. extended lesson flows.

---

## Known Gaps

The following open items consolidated from the legacy `CONVERSION_PLAN.md` represent active content gaps awaiting future authoring, roadmap creation, or track conversion:

1. **Spoken French & Russian Roadmaps & Lessons:**
   - No `spoken-fr-*` or `spoken-ru-*` roadmap files currently exist in `roadmaps/`.
   - Approximately 50 French and 35 Russian session HTML files from `cosylanguages/COSYevents` require dedicated roadmap JSON creation (`spoken-fr-<level>.json` and `spoken-ru-<level>.json`) and XML conversion into `lessons/spoken-fr/` and `lessons/spoken-ru/`.

2. **Core General English & Grammar Tracks Content Gap:**
   - 357 General English sequence entries (A0–C1) and 248 Grammar English sequence entries (A0–C1) are explicitly marked with `"status": "planned"`.
   - These slots require authoring and JSON/XML content conversion to reach 100% resolution.

3. **Phrasal Verbs & Vocabulary Practice Tracks:**
   - 41 Phrasal Verbs sequence entries across `phrasal-verbs-en-a2`, `b1`, `b2` and 38 Vocabulary Practice entries across `vocabulary-en-a1`, `a2`, `b1` are currently marked as `"status": "planned"`.

4. **Empty Cinema Club Track Stubs:**
   - 5 Cinema Club roadmap stubs (`cinema-en-a1.json`, `cinema-en-a2.json`, `cinema-en-b2.json`, `cinema-en-c1.json`, `cinema-en-c2.json`) exist in `roadmaps/` with 0 sequence items.
   - While `cinema-en-b1.json` is 100% complete (113 resolved lessons), the remaining levels require session curation and sequence populating.

5. **Multilingual Karaoke & Cultural Challenge Sessions:**
   - Multi-lingual Karaoke Club sessions (Greek, Italian, French, Russian) require track assignment and XML conversion into respective target-language spoken/cultural tracks.
