# COSYplatform Read-Only Repository Audit Report

## 1. Branches and Open Pull Requests

| Branch Name | Last Commit Date | PR Status | Summary & Additions Not On `main` |
| :--- | :--- | :--- | :--- |
| `main` | 2026-10-14 | N/A | Base branch for production. |
| `feat/science-speaking-club-lessons-10551286220495834029` | 2026-10-14 | **Open PR #13** | **2 commits ahead of main.** Adds 4 full-scale 10-slide science lesson JSON files under `lessons/science-en/` and 1 science roadmap file `roadmaps/science-en-b2.json`: <br>• `lessons/science-en/artificial-intelligence-everyday-life.json`<br>• `lessons/science-en/gene-editing-and-crispr.json`<br>• `lessons/science-en/renewable-energy-and-climate-tech.json`<br>• `lessons/science-en/space-exploration-mars-colonization.json`<br>• `roadmaps/science-en-b2.json` |
| `cleanup-css-visual-elements-1738293953323557615` | 2026-10-14 | Closed (PR #11, PR #12) | Fully merged into `main` via PR #12. Contains 0 commits ahead and 0 unique additions. |
| `cosy-progress-integration-15910430694545618730` | 2026-10-13 | Closed (PR #1) | Fully merged into `main` via PR #1. Contains 0 commits ahead vs main tree. |
| `feat/essay-audio-submissions-founder-role-4120839023784169037` | 2026-10-13 | Closed (PR #3) | Fully merged into `main` via PR #3. Contains 0 commits ahead vs main tree. |
| `feat/student-capability-controls-1661247228196823793` | 2026-10-14 | Closed (PR #9, PR #10) | Fully merged into `main` via PR #10. Contains 0 commits ahead vs main tree. |
| `feature/lesson-creator-brainstorm-spec-12633621978086025990` | 2026-10-14 | Closed (PR #8) | Fully merged into `main` via PR #8. Contains 0 commits ahead vs main tree. |
| `fix-submission-reviews-and-user-scoped-queue-13783949176821534786` | 2026-10-13 | Closed (PR #6) | Fully merged into `main` via PR #6. Contains 0 commits ahead vs main tree. |
| `jules-169968567289643936-be748862` | 2026-10-13 | Closed (PR #4, PR #5) | Fully merged into `main` via PR #5. Contains 0 commits ahead vs main tree. |
| `jules-17122559359403207662-de671ba0` | 2026-10-13 | Closed (PR #2) | Fully merged into `main` via PR #2. Contains 0 commits ahead vs main tree. |
| `jules-4798503580472808029-5a7da39a` | 2026-10-13 | Closed (PR #7) | Fully merged into `main` via PR #7. Contains 0 commits ahead vs main tree. |

---

## 2. Full Folder Tree to Depth 3

```
./
├── 404.html
├── LICENSE
├── README.md
├── AUDIT.md
├── classroom.html
├── founder.html
├── hub.html
├── index.html
├── login.html
├── student.html
├── teacher-english.html
├── teacher-french.html
├── teacher-russian.html
├── teacher.html
├── roadmaps/ [56 files]
│   ├── LESSON_BUILDER_SPECIFICATION.md
│   ├── LESSON_CREATION_ENGINE_SPECIFICATION.md
│   └── [54 curriculum roadmap JSON files]
└── shared/ [27 files]
    ├── vocab-resolver.js
    ├── css/ [1 file]
    │   └── tokens.css
    ├── i18n/ [5 files]
    │   ├── el.json
    │   ├── en.json
    │   ├── fr.json
    │   ├── it.json
    │   └── ru.json
    ├── img/ [3 files]
    │   ├── favicon.svg
    │   ├── logo.png
    │   └── logo.svg
    ├── js/ [16 files]
    │   ├── auth-guard.js
    │   ├── auth-sso.js
    │   ├── authoring.js
    │   ├── cms-editor.js
    │   ├── config.js
    │   ├── i18n.js
    │   ├── irregular-verbs.js
    │   ├── lang-switcher.js
    │   ├── lazy-script.js
    │   ├── lesson-resolver.js
    │   ├── manuals-resolver.js
    │   ├── progress.js
    │   ├── tools-resolver.js
    │   ├── ui-toast.js
    │   ├── vocab-index.js
    │   └── vocab-resolver.js
    └── styles/ [1 file]
        └── style.css
```

### Folder Purpose & Approximate File Counts

* `./` (Depth 0 — 14 direct root files, 97 total recursive files on `main`): Primary entry point containing main HTML workspace views (`index.html`, `classroom.html`, `teacher.html`, `student.html`, `founder.html`, `hub.html`, `login.html`, `404.html`) and root documentation.
* `./roadmaps/` (Depth 1 — 56 direct files): Contains course curriculum roadmap JSON definitions across levels/topics, plus builder architectural specification Markdown documents.
* `./shared/` (Depth 1 — 1 direct file, 27 total recursive files): Container directory for cross-cutting assets, CSS tokens, internationalization dictionaries, client utilities, images, and resolvers.
  * `./shared/css/` (Depth 2 — 1 direct file): Design system tokens and custom CSS properties (`tokens.css`).
  * `./shared/i18n/` (Depth 2 — 5 direct files): Multilingual translation JSON dictionaries (`en.json`, `fr.json`, `ru.json`, `it.json`, `el.json`).
  * `./shared/img/` (Depth 2 — 3 direct files): Brand assets (logos, favicon).
  * `./shared/js/` (Depth 2 — 16 direct files): Core client-side JavaScript logic (auth guards, Supabase client configuration, i18n engine, resolvers, progress tracking).
  * `./shared/styles/` (Depth 2 — 1 direct file): Shared application stylesheet (`style.css`).
* `./lessons/` (Unmerged Branch `feat/science-speaking-club-lessons-...` — 5 files): Full-scale lesson JSON definitions.
  * `./lessons/science-en/` (Depth 2 — 4 direct files): 10-slide English B2 science speaking club lesson files.

---

## 3. Languages and CEFR Levels Covered per Content Type

### A. Paid Course Roadmaps & Curricula (`roadmaps/*.json`)
* **Language Codes Covered**: `en` (English), `fr` (French), `ru` (Russian).
* **CEFR Levels Covered**: `A0`, `A1`, `A2`, `B1`, `B2`, `C1`, `C2`.
* **Breakdown by Topic**:
  * **General English**: `A0`, `A1`, `A2`, `B1`, `B2`, `C1` (`general-en-a0.json` through `general-en-c1.json`).
  * **English Grammar**: `A0`, `A1`, `A2`, `B1`, `B2`, `C1` (`grammar-en-a0.json` through `grammar-en-c1.json`).
  * **Spoken English**: `A1`, `A2`, `B1`, `B2`, `C1` (`spoken-en-a1.json` through `spoken-en-c1.json`).
  * **Cinema Club (English)**: `A1`, `A2`, `B1`, `B2`, `C1`, `C2` (`cinema-en-a1.json` through `cinema-en-c2.json`).
  * **Special Discussion (English)**: `A1`, `A2`, `B1`, `B2`, `C1`, `C2` (`discussion-en-a1.json` through `discussion-en-c2.json`).
  * **Phrasal Verbs (English)**: `A2`, `B1`, `B2` (`phrasal-verbs-en-a2.json` through `phrasal-verbs-en-b2.json`).
  * **Vocabulary Practice (English)**: `A1`, `A2`, `B1` (`vocabulary-en-a1.json` through `vocabulary-en-b1.json`).
  * **Pronunciation (English)**: `A1`, `A2`, `B1`, `B2`, `C1`, `C2` (`pronunciation-en-a1.json` through `pronunciation-en-c2.json`).
  * **Pronunciation (French)**: `A1`, `A2`, `B1`, `B2`, `C1`, `C2` (`pronunciation-fr-a1.json` through `pronunciation-fr-c2.json`).
  * **Pronunciation (Russian)**: `A1`, `A2`, `B1`, `B2`, `C1`, `C2` (`pronunciation-ru-a1.json` through `pronunciation-ru-c2.json`).
  * **Introductory Diagnostic**: `A1` (`introductory-english.json`).
  * **Science Speaking Club (English)** *(On branch `feat/science-speaking-club-lessons-...`)*: `B2` (`science-en-b2.json`).

### B. Full Interactive Lessons (`lessons/science-en/*.json` on open PR branch)
* **Language Code**: `en` (English).
* **CEFR Level**: `B2`.

### C. UI & Application Internationalization (`shared/i18n/*.json`)
* **Interface Languages**: `en` (English), `fr` (French), `ru` (Russian), `it` (Italian), `el` (Greek).

---

## 4. Publicly Served / Publicly Readable Restricted Content

Because COSYplatform is hosted via static hosting (GitHub Pages) with all code and assets delivered directly to the client browser without backend route authorization filters, **all paid and restricted course materials are fully readable publicly by anyone inspecting network traffic or directly fetching repo paths**.

### Exact Publicly Accessible Paths:

1. **Complete Course Roadmaps and Curricula (54 JSON files)**:
   * `./roadmaps/*.json` (e.g., `./roadmaps/general-en-b1.json`, `./roadmaps/cinema-en-c2.json`, `./roadmaps/phrasal-verbs-en-b2.json`, etc.)
   * *Security issue*: Contains full lesson titles, unit breakdowns, target vocabulary lists, grammar targets, and sequencing for paid courses.

2. **Full Lesson JSONs & Answer Keys / Solutions** *(Branch `feat/science-speaking-club-lessons-...`)*:
   * `./lessons/science-en/artificial-intelligence-everyday-life.json`
   * `./lessons/science-en/gene-editing-and-crispr.json`
   * `./lessons/science-en/renewable-energy-and-climate-tech.json`
   * `./lessons/science-en/space-exploration-mars-colonization.json`
   * *Security issue*: Contains full slide content, teacher notes (`teacherNotes`), exercise answers (`answers`), and model responses.

3. **Teacher Workspaces & Lesson Authoring Interfaces**:
   * `./teacher.html`
   * `./teacher-english.html`, `./teacher-french.html`, `./teacher-russian.html`
   * `./founder.html`
   * *Security issue*: Client-side role gating (`auth-guard.js`) hides UI controls based on Supabase profile role, but the full HTML structure, authoring controls, and teacher tools are served in plain text to any unauthenticated client.

4. **Internal Architecture & Engine Specifications**:
   * `./roadmaps/LESSON_BUILDER_SPECIFICATION.md`
   * `./roadmaps/LESSON_CREATION_ENGINE_SPECIFICATION.md`
   * *Security issue*: Detailed developer specs for lesson builder schema, state management, and CMS creation engine exposed in the public content directory.

---

## 5. Content Duplicating or Overlapping Other COSY Repositories

| Repository / Content Area | Overlapping File / Path in COSYplatform | Fingerprint (File Count, Newest Commit Date) | Description & Recommendation |
| :--- | :--- | :--- | :--- |
| **COSYdata** (Vocabulary Data) | `shared/js/vocab-index.js` | 1 file (951 KB), Commit: `2026-10-11` | Massive 951 KB hardcoded vocabulary dictionary object (`CosyVocabIndex`). Duplicates dictionary data that should be served dynamically from COSYdata (`https://raw.githubusercontent.com/cosylanguages/COSYdata/main/vocabulary/`). |
| **COSYdata** (Vocabulary Resolvers) | `shared/js/vocab-resolver.js`<br>`shared/vocab-resolver.js` | 2 files, Commit: `2026-10-11` | `shared/vocab-resolver.js` is an outdated duplicate copy of `shared/js/vocab-resolver.js`. Both query COSYdata endpoints. |
| **COSYtools** (Verb / Grammar Tools) | `shared/js/irregular-verbs.js` | 1 file (4.1 KB), Commit: `2026-10-11` | Static array of English irregular verbs with forms and translations. Belongs in COSYtools grammar/verb reference tools. |
| **COSYtools** (Grammar Reference Integration) | `shared/js/tools-resolver.js` | 1 file, Commit: `2026-10-11` | Integration resolver linking to COSYtools endpoints (`https://cosylanguages.github.io/COSYtools/grammar/`). |
| **COSYmanuals** (Manuals Reference) | `shared/js/manuals-resolver.js` | 1 file, Commit: `2026-10-11` | Integration resolver fetching manual pages from COSYmanuals (`https://cosylanguages.github.io/COSYmanuals/manuals/`). |
| **COSYlanguages / COSYplatform** (Curriculum) | `roadmaps/*.json` | 56 files, Commit: `2026-10-14` | Shared taxonomy and course roadmaps across language code -> CEFR -> topic -> unit. |

---

## 6. References to COSYworld

* **Audit Search Results**: Checked all files across code, comments, documentation, links, and configuration on `main` and all remote branches.
* **Result**: **0 references found**. There are no references to `COSYworld` anywhere in the codebase.

---

## 7. Dependencies on Other COSY Repositories

### A. External Network Fetch & Script Integration Dependencies

1. **`shared/js/vocab-resolver.js`**:
   * **Line 9**: `const COSYDATA_BASE_URL = 'https://raw.githubusercontent.com/cosylanguages/COSYdata/main';`
   * **Line 26**: Fetches vocabulary data from COSYdata repo (`${COSYDATA_BASE_URL}/vocabulary/${lang}/index.json`).

2. **`shared/vocab-resolver.js`** (Duplicate legacy file):
   * **Line 9**: `const COSYDATA_BASE_URL = 'https://raw.githubusercontent.com/cosylanguages/COSYdata/main';`

3. **`shared/js/tools-resolver.js`**:
   * **Line 9**: `const COSYTOOLS_BASE_URL = 'https://cosylanguages.github.io/COSYtools';`
   * **Line 15**: Constructs URL to COSYtools grammar reference: `${COSYTOOLS_BASE_URL}/grammar/${lang}/${level}/${topicId}.html`.
   * **Line 19**: Constructs URL to COSYtools practice exercise: `${COSYTOOLS_BASE_URL}/practice/${lang}/${practiceRef}`.

4. **`shared/js/manuals-resolver.js`**:
   * **Line 9**: `const COSYMANUALS_BASE_URL = 'https://cosylanguages.github.io/COSYmanuals';`
   * **Line 15**: Constructs URL to COSYmanuals documentation: `${COSYMANUALS_BASE_URL}/manuals/${lang}/${category}/${level}/topics/${topic}.html`.

5. **`index.html`**:
   * **Line 300**: `const loginUrl = 'https://cosylanguages.github.io/COSYlanguages/login.html?redirect='...`
   * **Line 328**: Navigation link to COSYlanguages login portal (`https://cosylanguages.github.io/COSYlanguages/login.html`).

### B. HTML Ecosystem Footer Links (Present in `index.html`, `hub.html`, `student.html`, `teacher.html`, `founder.html`)
* **COSYlanguages**: `https://cosylanguages.github.io/COSYlanguages/`
  * `index.html:250`, `hub.html:307`, `student.html:492`, `teacher.html:511`, `founder.html:244`
* **COSYdata**: `https://cosylanguages.github.io/COSYdata/`
  * `index.html:251`, `hub.html:308`, `student.html:493`, `teacher.html:512`, `founder.html:245`
* **COSYtools**: `https://cosylanguages.github.io/COSYtools/`
  * `index.html:252`, `hub.html:309`, `student.html:494`, `teacher.html:513`, `founder.html:246`
* **COSYgames**: `https://cosylanguages.github.io/COSYgames/`
  * `index.html:253`, `hub.html:310`, `student.html:495`, `teacher.html:514`, `founder.html:247`
* **COSYevents**: `https://cosylanguages.github.io/COSYevents/`
  * `index.html:254`, `hub.html:311`, `student.html:496`, `teacher.html:515`, `founder.html:248`

### C. Repository Submodules
* **Result**: None (`.gitmodules` file does not exist).

---

## 8. Dead Weight

1. **`shared/vocab-resolver.js`** (1.98 KB):
   * Duplicate copy of `shared/js/vocab-resolver.js` placed directly under `shared/` rather than `shared/js/`. Unused by standard HTML entry points.

2. **Legacy Teacher Redirect HTML Files**:
   * `teacher-english.html` (802 bytes)
   * `teacher-french.html` (800 bytes)
   * `teacher-russian.html` (802 bytes)
   * *Status*: Stale language-specific redirect stubs created before unified `teacher.html` with client-side i18n was implemented.

3. **Stale Architectural Spec Docs in Content Directory**:
   * `roadmaps/LESSON_BUILDER_SPECIFICATION.md` (6.58 KB)
   * `roadmaps/LESSON_CREATION_ENGINE_SPECIFICATION.md` (6.94 KB)
   * *Status*: Internal developer specification documents stored inside the production `roadmaps/` content folder.

4. **`shared/js/vocab-index.js`** (951 KB):
   * Massive monolithic vocabulary dump script embedded in repository source instead of loading from COSYdata API.

---

## 9. Site Deployment and Access Control

### Deployment Architecture
* **Hosting Model**: Deployed via **GitHub Pages** (static file hosting) directly from the `main` branch.
* **Frontend Tech Stack**: Vanilla JavaScript (ES6+), Tailwind CSS via CDN, PeerJS (WebRTC audio/video and data channel sync), and Jitsi Meet External API.
* **Backend Services**: Supabase (JS v2 Client via CDN) for authentication, Database (PostgreSQL with Row Level Security), and Private Storage Buckets (`submissions`).

### Access Control & Security Evaluation
1. **Frontend Role Gating**:
   * Role management (`student`, `teacher`, `founder`) is evaluated client-side via `shared/js/auth-guard.js` and `window.COSY_CONFIG`.
   * Views conditionally show/hide DOM elements or switch `currentRole` context based on the user's Supabase auth session and `profiles.role`.
2. **Database & Storage (Supabase)**:
   * Database tables (`lesson_answers`, `lesson_submissions`, `teacher_students`, `profiles`) utilize Row Level Security (RLS).
   * Storage bucket `submissions` is structured as `{student_id}/{filename}` and guarded by Supabase storage policies.
3. **Public Content Exposure**:
   * Because GitHub Pages serves all static assets in the repository publicly, all lesson roadmaps, curriculum definitions, exercise structures, and client JS logic are readable by any HTTP client regardless of Supabase authentication state.
