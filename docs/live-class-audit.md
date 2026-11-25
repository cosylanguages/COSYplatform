# COSYplatform Live Class Audit

This document provides a comprehensive audit of the live classroom functionality in the `cosylanguages/COSYplatform` repository, detailing page structure, video streaming options, database schema & auth integration, lesson rendering engines, repository conventions, and potential risks/conflicts with planned live class enhancements.

---

## 1. Classroom Rendering Pages & Portal Entry Points

### Primary Page
* **`classroom.html`**: The single monolithic page responsible for rendering the entire live interactive classroom experience.
  * Size: ~123 KB containing markup, layout CSS, utility drawers, modals, and an embedded inline JavaScript application (~85 KB script).
  * Purpose: Combines WebRTC video call management, interactive slide/stage viewing, real-time drawing whiteboard, breakout room orchestration, class chat, timer, dictionary search, and lesson catalog switching.

### Entry Points across Portals
* **`student.html`**: Header action button (`Live Classroom 🎥` leading to `classroom.html`).
* **`teacher.html`**: Header action button (`Live Classroom 🎥` leading to `classroom.html`).
* **`hub.html`**: Main navigation bar button (`data-i18n="common.liveClassroom"` leading to `classroom.html`).
* **`index.html`**: Navigation header link (`data-i18n="common.liveClassroom"` leading to `classroom.html`).

### References in Documentation & Automated Tests
* **`docs/architecture.md`**: References interactive live classroom concepts, dual-view rendering, and group/breakout room mechanics.
* **`scripts/test_live_feedback.js`**: Checks the inline classroom feedback code and normalisation helpers.
* **`scripts/test_whiteboard.js`**: Checks the shared whiteboard rules in `shared/js/whiteboard-core.js`.
* **`scripts/test_auth_security.js`**: Checks auth and redirect guards used by the classroom and portal pages.
* **`scripts/test_studio_teacher_view.js`**: Checks answer-key hiding in the studio teacher preview.

---

## 2. Video Calling Architecture & Provider Implementations

The live classroom in `classroom.html` supports four multi-provider video modes managed via `changeVideoProvider(provider)` and `startVideoCall()`.

### Supported Video Providers & Implementations

#### 1. PeerJS Direct WebRTC P2P Calling (`peerjs-video`)
* **Libraries Loaded**: `https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js`.
* **Functions**:
  * `changeVideoProvider('peerjs-video')`: Configures the UI for PeerJS, hides external link fields, and shows the launch button.
  * `startPeerJsVideoCall()`: Requests local camera/microphone media via `navigator.mediaDevices.getUserMedia()`, renders local video elements inside `#jitsi-container`, initializes/joins PeerJS peers, and exchanges streams.
  * `updatePeerJsMediaStream()`: Dynamically updates active media tracks when switching camera (`changeCameraDevice`) or microphone (`changeMicDevice`).
* **Peer Sync & Connection**: Utilizes PeerJS DataConnections (`c.send()`, `handleIncomingData()`) for real-time synchronization of slides, whiteboard strokes, chat, exercise inputs, and lesson switches.

#### 2. Embedded Jitsi Meet WebRTC (`jitsi`)
* **Libraries Loaded**: `https://meet.jit.si/external_api.js`.
* **Functions**:
  * `changeJitsiServer(domain)`: Allows switching public Jitsi domain servers (e.g., `meet.jit.si`, `meet.ffmuc.net`, `jitsi.riot.im`).
  * `startVideoCall()`: Instantiates `new JitsiMeetExternalAPI(domain, options)` targeting `#jitsi-container` with custom parameters (`roomName`, `userInfo.displayName`, `configOverwrite`).

#### 3. Google Meet Link Fallback (`google`)
* **Functions**:
  * `broadcastAndOpenVideoLink()`: Validates host-entered meeting link using `isValidVideoUrl(url)` (`/^https:\/\/(meet\.google\.com|telemost\.yandex\.(ru|com)|[a-z0-9-]+\.zoom\.us)\//i`), broadcasts the link to connected participants via PeerJS data packet (`type: 'video-link'`), and opens the link in a new tab with `rel="noopener,noreferrer"`.
  * `renderExternalVideoBanner(provider, url)`: Replaces video container placeholder with a clickable banner directing users to the external Google Meet meeting.

#### 4. Yandex Telemost Link Fallback (`yandex`)
* **Functions**:
  * Uses the same `broadcastAndOpenVideoLink()` and `renderExternalVideoBanner(provider, url)` mechanisms as Google Meet, formatted specifically for `telemost.yandex.ru` / `telemost.yandex.com`.

---

## 3. Supabase Client, Schema Tables, and Auth / Role Logic

### Supabase Client Initialization
* **Configuration**: Credentials stored in `shared/js/config.js` (`window.COSY_CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY }`).
* **Initialization Script**: `shared/js/auth-guard.js` reads `window.COSY_CONFIG` and instantiates `window.CosyAuth.client = supabase.createClient(...)`.
* **SSO Handler**: `shared/js/auth-sso.js` restores user sessions automatically from `#access_token=...&refresh_token=...` URL hash fragments and transfers tokens across ecosystem domains.

### Database Tables (`supabase/migrations/`)
1. **`profiles`**:
   * Columns: `id` (UUID, FK auth.users), `role` (`founder`, `teacher`, `student`), `language_access` (`TEXT[]`), `course_level` (`TEXT`), `created_at`, `updated_at`.
2. **`lesson_content`**:
   * Stores complete gated XML/JSON lesson source content.
   * Columns: `lesson_id` (PRIMARY KEY), `level`, `language`, `xml_content`, `updated_at`.
3. **`student_lesson_content`**:
   * Projection table containing sanitized student-safe lesson markup (teacher notes, answers, and solution keys stripped out).
   * Columns: `lesson_id` (PRIMARY KEY), `level`, `language`, `content`, `updated_at`.
4. **`cms_page_overrides`**:
   * Stores on-demand Founder visual CMS live page overrides.
   * Columns: `page_path` (PRIMARY KEY), `overrides` (`JSONB`), `updated_at`, `updated_by`.

### Auth & Role Logic in Classroom (`classroom.html`)
* **Session Enforcement**: `classroom.html` checks `window.CosyAuth.requireRole(['founder', 'teacher', 'student'])` on load. If no active session exists, it renders a fail-closed auth error banner and halts script execution (`renderAuthErrorPage()`).
* **Role Permissions (`enforceRolePermissions()`)**:
  * **Founder & Teacher**: Full host controls. Allowed to generate room keys (`initHost`), change lesson modes (1-on-1 vs Group Mode), launch breakout room manager, quick-switch active lesson materials via toolbar/modal, dispatch breakout tasks, and broadcast video provider/link changes.
  * **Student**: Locked to participant mode. Room host creation button hidden (`#host-btn`), lesson switcher disabled, breakout room management blocked. Incoming packets attempting host commands from students are filtered out (`handleIncomingData`).
* **Row-Level Security (RLS)**:
  * Founders read/manage all tables.
  * Teachers read `lesson_content` filtered by `language_access` and `course_level`.
  * Students read `student_lesson_content` filtered by `language_access` and `course_level`.
  * To prevent policy recursion on `profiles`, founder checks use `public.is_founder()` (`SECURITY DEFINER`).

---

## 4. Lesson Content Loading & Dual-View Rendering

### Content Loading Strategy (`loadDynamicLesson(lessonPath)`)
1. **Security Path Guard**: Path passed to `loadDynamicLesson` is sanitized via `isSafeLessonPath(p)` (`/^lessons\/[A-Za-z0-9_\-.\/]+\.(json|xml)$/`).
2. **Supabase Fetch**: Attempts to fetch lesson markup from Supabase `lesson_content` (for teachers/founders) or `student_lesson_content` (for students).
3. **Fallback Fetch**: If Supabase fetch yields no rows (or client unconfigured), falls back to fetching static lesson file directly from `lessons/` path via browser `fetch(lessonPath)`.
4. **Parsing**:
   * XML lessons: Parsed via DOMParser in `parseXmlLessonToSlides(xmlText)` into slide structure (`<cosy-slide>`, `<cosy-section>`).
   * JSON lessons: Parsed via `parseJsonLessonToSlides(jsonData)`.

### Dual-View Rendering
* **`teacher.html` vs `student.html`**:
  * `teacher.html` renders full teacher guides, speech scripts (`<cosy-teacher-notes>`, `type="speech"`), stage aims, CCQs, and answer keys.
  * `student.html` runs `sanitizeStudentLessonContent` (or reads `student_lesson_content`), removing all `<cosy-teacher-notes>`, hidden answers, and teacher-only UI blocks.
* **`classroom.html` Rendering**:
  * Dynamically converts XML nodes / JSON slide objects into interactive HTML slides (`renderXmlNodeToClassroomHtml`, `renderJsonSlideToClassroomHtml`).
  * Teachers can toggle role view (`switchRole('teacher' | 'student')`) directly in the classroom toolbar to preview what students see.

---

## 5. Repository Conventions & Validation Pipeline

### Repository Structure & Naming Conventions
* **`curriculums/`**: Master JSON curriculum structures organized as `curriculums/<lang>/<track>/<LEVEL>.json`.
* **`roadmaps/`**: Sequence definitions for course tracks (e.g., `roadmaps/spoken-en-a1.json`).
* **`lessons/`**: Individual lesson markup files in XML or JSON.
* **`shared/js/`**: Centralized JavaScript modules (`config.js`, `auth-guard.js`, `auth-sso.js`, `cms-editor.js`, `lesson-resolver.js`, `i18n.js`, `ui-toast.js`).
* **`shared/css/`**: Styling tokens and skins (`tokens.css`, `editorial.css`, `lesson-studio.css`).

### CSS & Design System
* **Tailwind CSS**: CDN loaded (`https://cdn.tailwindcss.com`) across `classroom.html` and portal pages.
* **Tokens (`shared/css/tokens.css`)**: Primary role colors `--cosy-platform-student` / `--student-primary` (`#0369a1` / `bg-cosy-600`) and `--cosy-platform-teacher` / `--teacher-primary` (`#6d28d9` / `bg-teacher-primary`).
* **Editorial skin (`shared/css/editorial.css`)**: Warm paper, forest ink and magazine typography layered over the role styles.
* **Studio styles (`shared/css/lesson-studio.css`)**: Only loaded by `lesson-studio.html`.

### Testing & Validation Pipeline

`npm run validate` is the authoritative local gate. It runs:

1. `node scripts/check-content-integrity.js`: duplicate curriculums/roadmaps, roadmap entries, manifest files, orphan curriculums and active catalog roadmaps.
2. `node scripts/check-lesson-languages.js`: lesson language metadata.
3. `node scripts/check_protected_keys.js`: prohibited answer/teacher-note keys, with an advisory list for legacy `teacher_notes`.
4. `node scripts/build-platform-stats.js --check`: keeps `data/platform-stats.json` in sync with the manifest, roadmaps and lesson files.
5. `npm test`: the jsdom/unit test suite.

Additional checks: `npm run check:legacy-tables` (blocked by documented debt), `node scripts/check-external-refs.js` (pinned raw GitHub URLs), and `node scripts/test_whiteboard.js`.

---

## 6. Risks & Architectural Conflicts with Proposed Live Class Plan

### Proposed Live Class Plan Summary
* **Top Bar**: Logo, room ID/info, mode toggles, tool buttons, leave class button.
* **Left Video Column**: Teacher video on top, student video below (50/50 split or full-screen focus).
* **Centre Lesson Area**: Interactive stage with page navigation.
* **Tools Opening as Panels**: Slide-out/overlay panels over the lesson area.
* **Video Providers**: PeerJS WebRTC as primary, with Google Meet and Yandex Telemost as external fallback options.
* **Backend**: Supabase (Auth, Postgres with RLS, Realtime).

### Identified Risks & Conflicts

1. **Layout & Video Sidebar Position Conflict**:
   * *Current*: Video is embedded inside a collapsible right sidebar (`#video-sidebar`) alongside a tabbed drawer below the video frame (Chat, Timer, Verbs, Dict, Activities).
   * *Proposed Plan*: Left video column with vertical video stack (Teacher top, Student bottom).
   * *Risk/Conflict*: Relocating video from right sidebar to left column will require restructuring the grid layout in `classroom.html`. Care must be taken not to break responsive mobile breakpoints or obscure whiteboard canvas coordinate calculations (`getCanvasPos`), which depend on exact DOM bounding rects.

2. **Tool Drawers vs. Panels Over Lesson Area**:
   * *Current*: Tools (Chat, Timer, Verbs, Dict, Activities) are embedded in tabbed panels directly below the video window inside the sidebar.
   * *Proposed Plan*: Tools open as overlay panels over the lesson area.
   * *Risk/Conflict*: Overlaying panels over the centre lesson canvas may obscure active exercise inputs or whiteboard interactions during live instruction. Transitioning tools to overlays requires managing Z-index layering, keyboard focus trapping, and modal escape handlers.

3. **Supabase Realtime vs. PeerJS Synchronization**:
   * *Current*: Real-time slide navigation, drawing strokes, exercise input sync, chat, and lesson switches rely exclusively on PeerJS WebRTC data channels (`DataConnection`).
   * *Proposed Plan*: Mentions Supabase Realtime alongside Auth and Postgres.
   * *Risk/Conflict*: Introducing Supabase Realtime Broadcast/Presence channels while PeerJS WebRTC data channels are active could lead to duplicate state events, race conditions on slide navigation, or conflicting canvas stroke rendering if both channels push state updates simultaneously. A clear single source of truth for live interaction events must be maintained.

4. **PeerJS Mesh Scalability in Group Mode**:
   * *Current*: Group mode and breakout rooms attempt direct P2P mesh WebRTC video via PeerJS.
   * *Proposed Plan*: PeerJS WebRTC video for live class.
   * *Risk/Conflict*: PeerJS is an unsfubbed P2P WebRTC mesh. While 1-on-1 calls (2 peers = 1 stream each direction) perform well, group classes with 4+ students require $N \times (N-1)$ connections, quickly causing CPU throttling and bandwidth degradation. Embedded Jitsi Meet is currently used as the scalable fallback for group lessons.

5. **Partial classroom test coverage**:
   * *Current*: `scripts/test_live_feedback.js`, `scripts/test_whiteboard.js` and `scripts/test_auth_security.js` cover feedback helpers, whiteboard rules and auth guards. There is no full DOM smoke test for the classroom layout.
   * *Risk*: A top-bar or sidebar refactor can break element IDs such as `#quick-lesson-select`, `#chat-messages`, `#jitsi-container`, `#host-btn` or `#connection-status` without a failing test. Add a focused DOM regression test before changing that markup.
