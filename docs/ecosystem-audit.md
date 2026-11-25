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

### 2.3 Content Repository Status (`COSYplatform-source` Migration)

`COSYplatform-source` was the original repository before application files were separated from backend assets. Its status was re-audited on 2026-11-19 (the earlier text of this section claimed everything had been transferred; that was incorrect).

* **Application and runtime:** `COSYplatform` is the source of truth for the web application pages, current migrations (`supabase/migrations/`) and CI checks.
* **Lessons:** the 448 spoken-English/French/Russian lessons referenced by the roadmaps were missing here and were migrated as **sanitized student copies** (`lessons/spoken-*`), produced with `scripts/sanitize-student-lesson.js`. Every roadmap `lessonFile` now resolves. `scripts/check_protected_keys.js` blocks `answers`, `teacherNotes` and `answer-key`, but it treats legacy `teacher_notes` as an advisory. Some committed lessons still contain teacher scripts under that key; see `docs/known-limitations.md`.
* **Tooling:** the sanitizer and the two session-to-lesson converters now live in `scripts/`. The legacy publisher is in `scripts/legacy-source/` (reference only, see its README).
* **Database definitions:** the old migrations `0001`-`0009` define tables and functions the live app still uses and that no migration here creates (`lesson_content`, `student_lesson_content`, `session_content`, `manual_content`, `lesson_notes`, `cms_page_overrides`, `handle_new_user`, `join_lesson_note`, `save_lesson_note`). They are kept as reference in `supabase/legacy-source/` and must not be run.
* **Not migrated:** the unsanitized lesson masters, the 685 lesson blueprints in `drafts/` (they contain answer keys), the old lesson schema and validator, and the old `publish-content.yml` workflow (it needs service-role secrets).

---

## Section 3: Security, API Key Exposure, and Client/Server Logic Separation

### 3.1 Environment Variables & Secret Key Handling Audit

* **`shared/js/config.js` Review:**
  * Exposes `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
  * **Risk Assessment:** **LOW / ACCEPTABLE BY DESIGN**. The Supabase Anon key is intended for public browser exposure, provided strict Row Level Security (RLS) is active on every table.
  * **Verification:** No `service_role` or administrative secret keys exist in client code.

* **Automated CI Security Shield (`scripts/check_protected_keys.js`):**
  * `check_protected_keys.js` scans all repository XML and JSON files for prohibited keys (`answers`, `teacherNotes`, `answer-key`) and prohibited tags (`<cosy-teacher-notes>`, `<teacher-notes>`).
  * Blocks prohibited answer and teacher-note keys. Legacy `teacher_notes` is advisory, so this is not a guarantee that no teacher notes remain in public source.

* **WebRTC Credentials Security:**
  * `shared/js/config.js` includes STUN configuration and guidelines for TURN deployment:
    ```javascript
    // TURN credential placeholder guidance:
    // Never hardcode production TURN credentials in client JS.
    // Use dynamic credential fetching via Edge Functions.
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

## Section 4: Actionable Structural Recommendations & Manual Execution Guide

### 4.1 Automated Enhancements Applied in `COSYplatform`
* Configured STUN/TURN security best-practice guidelines in `shared/js/config.js`.
* Created comprehensive ecosystem architecture and security audit report (`docs/ecosystem-audit.md`).
* Verified client/server boundary enforcement via CI script `scripts/check_protected_keys.js`.

### 4.2 Step-by-Step Manual Guide for Ecosystem Maintainers

To complete the ecosystem synchronization across sister repositories and cloud services, follow these manual steps:

#### Step 1: Archive Legacy `COSYplatform-source` Repository
1. Navigate to GitHub repository settings for `cosylanguages/COSYplatform-source`.
2. Scroll to the "Danger Zone" and click **Archive this repository**.
3. Set a deprecation banner pointing maintainers to `cosylanguages/COSYplatform` as the primary active repository.

#### Step 2: Synchronize Shared Resolvers across `COSYtools` and `COSYgames`
1. Copy `shared/js/vocab-resolver.js` and `shared/js/vocab-index.js` from `COSYplatform` into `COSYtools` and `COSYgames`.
2. Verify that term searches in practice apps invoke `window.CosyVocabResolver.resolveWord()`.

#### Step 3: Align i18n Translation Dictionaries
1. Each product owns its own dictionary format; there is no shared JSON file to copy between them.
2. Current status (2026-11-22):
   - `COSYplatform`: `shared/i18n/{en,fr,ru,it,el}.json` — 481 keys each, identical key sets.
   - `COSYtools`: `shared/js/hub-i18n.js` — 66 keys in each of 5 locales; `shared/js/supplemental_lexicon.js` — 8 strings in each of 14 languages. `npm run test:supplemental-i18n` passes.
   - `COSYgames`: `shared/js/i18n.js` and `i18n/games/*.js` — 7 locales; the key-parity and `T()` coverage tests pass.
   - `COSYmanuals`: `shared/i18n/ui-strings.json` — 7 ready locales (fr, de, es, it, pt, ru, el); ba, br, cv, hy, ka and tt still need native-speaker strings.
3. Do not copy `COSYplatform` keys into the other repositories: the key namespaces and page sets differ. When adding a shared chrome string, add it to each product's own table and run that product's i18n check.

#### Step 4: Deploy WebRTC Ephemeral TURN Credentials (Optional for Live Production)
1. The client helper and Edge Function are in place:
   - `shared/js/turn.js` fetches, caches and merges ephemeral ICE servers, with a STUN fallback.
   - `supabase/functions/get-turn-credentials/index.ts` issues Coturn REST credentials after verifying the Supabase user JWT.
2. Deploy and configure the function:
   ```bash
   supabase functions deploy get-turn-credentials
   supabase secrets set TURN_URL="turn:turn.example.com:3478?transport=udp" TURN_SECRET="<coturn-static-auth-secret>" TURN_TTL=3600
   ```
3. Set `TURN_ENABLED: true` in `shared/js/config.js`. `classroom.html` awaits `CosyTurn.getIceServers()` before creating the PeerJS peer.
4. Credentials are never hardcoded; the function returns an `exp`-based username and HMAC credential with a configurable TTL.

#### Step 5: Final Database Ingestion & Legacy Table Cleanup
1. In `COSYplatform`, run `node scripts/ingest_roadmaps.js` to ensure all 60 roadmap sequences are ingested into `courses`, `lessons`, `course_lessons`, `lesson_student_content`, and `lesson_protected`.
2. **Do not drop the legacy tables yet.** `shared/js/lesson-resolver.js`, `teacher.html` and `index.html` still read or write `lesson_content` / `student_lesson_content`. Run `npm run check:legacy-tables`; it must exit 0 before any drop. See `docs/legacy-table-cleanup.md` for the migration path and the guarded drop procedure.

---

## Conclusion

The `COSYplatform` architecture maintains a strong security boundary, leveraging Supabase Row Level Security and automated CI checks to prevent content leaks. By enacting the recommendations and manual guide steps above, the `cosylanguages` ecosystem will achieve optimal code reusability, reduced latency, and simplified cross-repository maintenance.
