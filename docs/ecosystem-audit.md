# Ecosystem Architectural Consistency Audit & Structural Recommendations

**Target Repository:** `COSYplatform`
**Ecosystem Context:** `cosylanguages` Interconnected Suite (`COSYplatform`, `COSYmanuals`, `COSYtools`, `COSYdata`, `COSYgames`, `COSYevents`, `COSYlanguages`)
**Audit Date:** May 2026
**Status:** Complete Architectural Report & Structural Recommendations

---

## Executive Summary

This document presents a comprehensive architectural consistency audit of the `COSYplatform` repository within the multi-repository `cosylanguages` ecosystem. `COSYplatform` acts as the primary paid live-classroom, web application portal, course player, and lesson studio repository.

Historically, platform code resided in a legacy repository (`COSYplatform-source`). The active runtime application has been migrated to `COSYplatform`. This audit examines how `COSYplatform` integrates with external data stores and sister repositories, identifies cross-repository redundancies and legacy logic, evaluates security boundaries (API keys, secret handling, RLS enforcement, and WebRTC credentials), and details migration steps to eliminate remaining technical debt.

---

## Section 1: Data Store Communication & Cross-Module Integration

### 1.1 Supabase Integration (Primary Persistence Layer)
`COSYplatform` relies on **Supabase** (PostgreSQL, Auth, Row Level Security, and Storage) for user profile management, role authorization, lesson content resolution, and progress tracking.

#### Communications Architecture & Tables
* **Authentication & Authorization (`shared/js/auth-guard.js`, `shared/js/auth-sso.js`):**
  * Interacts with `auth.users` via `@supabase/supabase-js`.
  * Checks user roles in `public.profiles` (`student`, `teacher`, `founder`).
  * Validates language access through `public.teacher_languages` and course permissions via `public.access_grants`.
* **Lesson Content Resolution (`shared/js/lesson-resolver.js`):**
  * Communicates with decoupled content tables:
    * `public.lessons`: Master metadata store (`id`, `language`, `cefr`, `kind`, `title`, `summary`).
    * `public.lesson_student_content`: RLS-guarded sanitized student slide bodies (`body`).
    * `public.lesson_protected`: Teacher notes, answer keys, paid session bodies (`kind`, `content`).
    * `public.course_preview`: Public-facing database view used for unauthenticated/anonymous catalog browsing (`courses` + `course_lessons` + `lessons`).
  * **Fallback Legacy Layer:** Retains query paths to legacy tables `student_lesson_content` and `lesson_content` for unmigrated lessons.
* **Progress Tracking & Persistence (`shared/js/progress.js`):**
  * Syncs student answer states, exercise completion, and lesson progress to Supabase with offline queue fallback.

### 1.2 Cross-Repository Modules & Resolvers
`COSYplatform` consumes external static data and components hosted across `cosylanguages` GitHub Pages repositories:

| Resolver Client File | External Target & Endpoint | Content Delivered | Coupling & Fallback Mechanism |
| :--- | :--- | :--- | :--- |
| `shared/js/manuals-resolver.js` | `https://cosylanguages.github.io/COSYmanuals` | Grammar, vocabulary, & communication manual HTML | HTTP `fetch` to static GitHub Pages endpoints |
| `shared/js/tools-resolver.js` | `https://cosylanguages.github.io/COSYtools` | Embedded practice exercises & grammar references | Direct link/iframe URLs to `COSYtools` subpaths |
| `shared/js/vocab-resolver.js` | `https://raw.githubusercontent.com/cosylanguages/COSYdata/main` | Dictionary entries, POS tags, word metadata | Memory cache (`window.CosyVocabIndex`) with HTTP fallback |
| `shared/js/vocab-index.js` | COSYdata vocabulary index | In-memory term lookup map (`window.CosyVocabIndex`) | Pre-loaded global object |

### 1.3 Ecosystem Single Sign-On (SSO) & Session Transfer
* `shared/js/auth-sso.js` handles cross-repository SSO:
  1. Captures `access_token` and `refresh_token` from `window.location.hash`.
  2. Calls `supabase.auth.setSession()` to re-establish authenticated context dynamically.
  3. Intercepts ecosystem anchor clicks (`a[href*="COSY"]`) and appends URL fragment tokens (`#access_token=...&refresh_token=...`) to navigate seamlessly across ecosystem web apps without requiring re-login.

### 1.4 Real-time Peer-to-Peer Communication (Classroom Live Sessions)
* Live video/audio in `classroom.html` utilizes **PeerJS / WebRTC**.
* `shared/js/config.js` configures STUN/TURN ICE servers:
  ```javascript
  ICE_SERVERS: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
  ```

---

## Section 2: Redundant Utilities & Cross-Repository Duplication

### 2.1 Cross-Repository Component Duplication across `cosylanguages/*`

1. **Vocabulary Resolution Logic (`vocab-resolver.js` & `vocab-index.js`):**
   * **Issue:** `vocab-resolver.js` and `vocab-index.js` are duplicated across `COSYplatform`, `COSYtools`, and `COSYgames`.
   * **Impact:** Any schema change or index optimization in `COSYdata` requires manual sync across multiple client repositories.
2. **Internationalization (`i18n.js` & `shared/i18n/*.json`):**
   * **Issue:** Five JSON locale files (`en.json`, `fr.json`, `ru.json`, `it.json`, `el.json`) reside in `COSYplatform/shared/i18n/`.
   * **Impact:** `COSYtools` and `COSYmanuals` maintain separate, partially divergent translation dictionaries, leading to UI terminology mismatches.
3. **Authentication & Supabase Initialization (`auth-guard.js` / `config.js`):**
   * **Issue:** Auth initialization logic is replicated in individual front-end practice apps with inline fallback checks.
4. **Design Tokens & Global Styles (`shared/css/tokens.css` & `shared/styles/style.css`):**
   * **Issue:** Shared CSS design tokens are copied across repositories rather than imported from a canonical CDN host or shared design package.

### 2.2 Intra-Repository Redundancy in `COSYplatform`

1. **Legacy Table Query Fallbacks in `lesson-resolver.js`:**
   * `loadLessonContent()` queries `lesson_student_content` / `lessons`, and falls back to `student_lesson_content` / `lesson_content`.
   * **Impact:** Maintenance overhead and redundant network roundtrips for unmigrated lessons.
2. **Manifest Duplication in `auth-guard.js`:**
   * `window.CosyAuth.FULL_MANIFEST` hardcodes course list metadata in JS alongside `roadmaps/*.json` files and the `courses` Supabase table.

### 2.3 Legacy Repository Status (`COSYplatform-source` Migration)

`COSYplatform-source` represents the historical repository prior to separating static host application files from backend assets and database migrations:
* **Active Status:** `COSYplatform` is the sole active source of truth for runtime web applications, database migrations (`supabase/migrations/`), and CI verification scripts.
* **Migration Audit:**
  * All active application pages (`index.html`, `login.html`, `hub.html`, `student.html`, `teacher.html`, `founder.html`, `classroom.html`, `lesson-studio.html`) are housed in `COSYplatform`.
  * Database schema definitions and RLS policies are version-controlled in `supabase/migrations/`.
  * `COSYplatform-source` can be archived as legacy, as all core scripts, schemas, and assets have been successfully transferred and verified in `COSYplatform`.

---

## Section 3: Security, API Key Exposure, and Client/Server Logic Separation

### 3.1 Environment Variables & Secret Key Handling Audit

* **`shared/js/config.js` Review:**
  * Exposes `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
  * **Risk Assessment:** **LOW / ACCEPTABLE BY DESIGN**. The Supabase Anon key is intended for public browser exposure, provided strict Row Level Security (RLS) is active on every table.
  * **Verification:** No `service_role` or administrative secret keys exist in client code.

* **Automated CI Security Shield (`scripts/check_protected_keys.js`):**
  * `check_protected_keys.js` scans all repository XML and JSON files for prohibited keys (`answers`, `teacherNotes`, `answer-key`) and prohibited tags (`<cosy-teacher-notes>`, `<teacher-notes>`).
  * Ensures static client assets never contain leakable teacher notes or answer keys.

* **WebRTC Credentials Security:**
  * `shared/js/config.js` includes a commented-out TURN server configuration block:
    ```javascript
    // username: "cosy_user",
    // credential: "cosy_password"
    ```
  * **Risk Assessment:** Hardcoding static TURN credentials in browser JS would expose credentials to public misuse.
  * **Recommendation:** Use dynamic TURN credential generation via a Supabase Edge Function or ephemeral token endpoint when production TURN servers are deployed.

* **Open Redirect Guard in SSO (`shared/js/auth-sso.js`):**
  * `autoRedirectFromLogin()` validates the `redirect` query parameter:
    * Must match `window.location.origin`.
    * Must stay within the current application folder.
    * Must target a valid `.html` page.
  * Prevents arbitrary external redirects during authentication flows.

### 3.2 Client / Server Boundary & RLS Security Matrix

Content separation between public, student, teacher, and founder access is strictly enforced at the database level:

```
                  +-----------------------------------+
                  |        Client Browser App         |
                  +-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
+-------------------+     +--------------------+    +--------------------+
| Anonymous/Public  |     |   Student Role     |    | Teacher/Founder    |
+-------------------+     +--------------------+    +--------------------+
          |                         |                         |
          v                         v                         v
+-------------------+     +--------------------+    +--------------------+
|  course_preview   |     |  lesson_student_   |    |  lesson_protected  |
|    (DB View)      |     |  content (Table)   |    |      (Table)       |
+-------------------+     +--------------------+    +--------------------+
| Non-sensitive     |     | Sanitized student  |    | Answer keys,       |
| metadata & titles |     | slides (No notes)  |    | teacher notes      |
+-------------------+     +--------------------+    +--------------------+
```

#### RLS Enforcements (`supabase/migrations/20261030000000_protected_content_schema.sql`):
1. **`course_preview` View:** Publicly accessible; contains no slide bodies, answer keys, or teacher notes.
2. **`lesson_student_content` Table:** Restricted to students with active `access_grants` where course CEFR level strictly matches lesson CEFR level (`c.cefr = l.cefr`).
3. **`lesson_protected` Table:** **STRICTLY DENIED** to student and anonymous roles. Only accessible to teachers (matching `teacher_languages`) and founders.

---

## Section 4: Actionable Structural Recommendations

### 1. Ecosystem Shared Asset Module (`@cosylanguages/shared` or Ecosystem CDN)
* **Action:** Consolidate `vocab-resolver.js`, `vocab-index.js`, `i18n.js`, `manuals-resolver.js`, `tools-resolver.js`, and `auth-sso.js` into a shared npm package or single host script on `COSYdata` / GitHub Pages.
* **Benefit:** Eliminates copy-paste drift across `COSYplatform`, `COSYtools`, and `COSYgames`.

### 2. Complete Legacy Schema Migration & Fallback Removal
* **Action:** Run final migration scripts (`ingest_roadmaps.js`) to migrate remaining legacy lessons from `student_lesson_content` and `lesson_content` into `lessons`, `lesson_student_content`, and `lesson_protected`.
* **Benefit:** Allows removing legacy fallbacks in `shared/js/lesson-resolver.js`, reducing query overhead and complexity.

### 3. Centralize Course Manifests in Supabase
* **Action:** Deprecate `window.CosyAuth.FULL_MANIFEST` in `auth-guard.js` in favor of dynamic queries to `course_preview`.
* **Benefit:** Avoids dual-maintenance of hardcoded JSON arrays in client JavaScript.

### 4. Implement Ephemeral WebRTC TURN Token Endpoint
* **Action:** Create a Supabase Edge Function (`/functions/v1/get-turn-credentials`) returning time-limited HMAC credentials for WebRTC TURN connections.
* **Benefit:** Secures media streaming infrastructure against unauthorized bandwidth usage.

---

## Conclusion

The `COSYplatform` architecture maintains a strong security boundary, leveraging Supabase Row Level Security and automated CI checks to prevent content leaks. By enacting the recommendations above—specifically shared script resolution and legacy fallback cleanup—the `cosylanguages` ecosystem will achieve optimal code reusability, reduced latency, and simplified cross-repository maintenance.
