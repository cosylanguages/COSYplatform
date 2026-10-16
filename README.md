# COSYplatform

Live-lesson platform for students, teachers and the founder. Vite + React 18 + React Router + Supabase.

```bash
cp .env.example .env.local   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
npm test                     # unit tests (pure logic: i18n, access rules, filters, timer, dictionary search)
npm run check:i18n           # all UI languages must have the same keys as en.json
npm run build
```

## Language rule

- **Course content** is monolingual: lessons are taught in the target language, with no translation fields.
- **UI chrome** is localized (`src/shared/i18n`: en, fr, it, ru, el) and chosen from: pinned choice, `?ui=`,
  `profiles.ui_lang`, browser language, then English. Course-only languages (hy, ka, tt, ba, br) fall back to English.
- Never call `t()` on lesson content.

## Layout

```
src/app/        router, route guards (RequireAuth, RequireRole)
src/pages/      Login, Hub, student/, teacher/, founder/, classroom/
src/features/   roadmaps (catalog, course detail), classroom (timer, toolbox), dictionary, notes
src/shared/     config, supabase, auth, i18n, ui (AppShell, FilterBar, Tabs, Drawer, Toast), hooks
src/styles/     tokens.css (ecosystem tokens) and app.css
supabase/       copy migrations here from the old repo
```

Roles set the accent colour through `data-role` on the shell (student sapphire, teacher purple, founder sage).

## Hosting

- GitHub Pages project site: set `VITE_BASE=/<repo>/` and, in `public/404.html`, keep `segments = 1`.
  On a custom domain set `VITE_BASE=/` and `segments = 0`. Or set `VITE_ROUTER=hash` and ignore both.
- The Supabase anon key is public by design. Real protection is RLS; the UI only hides things.

## Dictionary

The old 951 KB `vocab-index.js` is gone. `DictionaryPanel` loads `VITE_COSYDATA_INDEX_URL`, a JSON file
COSYdata should publish: `{ "<term>": [{ "id", "pos", "file": "a1/family.json" }] }`.

## Open items

- Mount ONE video provider in `ClassroomPage` (Jitsi or PeerJS) and add a TURN server (`VITE_TURN_*`).
- Port the lesson renderer (slides, answer persistence via `lesson_answers`) into `features/lessons`.
- Tables the old client used but no migration creates: `lesson_notes`, `lesson_progress`, `lesson_submissions`,
  `submissions`, `teacher_students`, `lesson_authors`, `lesson_content`, `cms_page_overrides`, and the RPCs
  `save_lesson_note`, `join_lesson_note`. Write migrations before wiring Notes sync, Students and Submissions.
