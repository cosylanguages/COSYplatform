# COSYplatform

Live-lesson platform for students, teachers and the founder. Vite + React 18 + React Router + Supabase.

```bash
npm install
npm run dev
npm test                # unit tests: i18n, access rules, filters, timer, dictionary, lesson parser/renderer
npm run check:i18n      # every UI language must have the same keys as en.json
npm run build
```

Production Supabase values are in `.env.production` (the anon key is public by design; RLS is the real gate).

## Language rule

- **Course content** is monolingual: lessons are taught in the target language, with no translation fields.
- **UI chrome** is localized (`src/shared/i18n`: en, fr, it, ru, el), chosen from: pinned choice, `?ui=`,
  `profiles.ui_lang`, browser language, then English. Course-only languages (hy, ka, tt, ba, br) fall back to English.
- Never call `t()` on lesson content.

## Layout

```
src/app/        router, route guards (RequireAuth, RequireRole)
src/pages/      Login, Hub, student/, teacher/, founder/, classroom/
src/features/   roadmaps, lessons (parser, renderer, answers), classroom (timer, toolbox), dictionary, notes
src/shared/     config, supabase, auth, i18n, ui (AppShell, FilterBar, Tabs, Drawer, Toast), hooks
supabase/       migrations + RLS tests        docs/   PROTECTED_CONTENT_CONTRACT.md, ci.workflow.yml
```

## Lessons

Bodies are XML (`<cosy-lesson><cosy-slide>`) or JSON `{title, slides}`, auto-detected. They render as React elements,
so lesson text can never inject HTML. Answer keys use the legacy scheme (`slide_<n>_<tag>_<index>`), so existing
answers in `lesson_answers` and in the `cosy_ans_<lessonId>` local cache still match. Students get
`lesson_student_content.body`; teachers additionally get `lesson_protected` rows (RLS enforces this).
The old "submit to teacher" feature is not ported (see Open items).

## Hosting (no custom domain needed)

Hash routing (`/#/student/courses`) works on any static host. Build output is `dist/`.

**Recommended: Cloudflare Pages or Netlify**, not GitHub Pages. Every `cosylanguages.github.io/*` site shares one
browser origin, so any script on a sibling site (games, tools, events...) could read the platform's login session
from localStorage. A separate host gives this app its own origin (`*.pages.dev` / `*.netlify.app`, free).
Connect the repo, build command `npm run build`, output directory `dist`.

GitHub Pages also works (the base path is auto-detected on Actions). After deploying, add the site URL under
Supabase → Authentication → URL Configuration.

## Dictionary

`DictionaryPanel` loads `VITE_COSYDATA_INDEX_URL`, a JSON file COSYdata should publish:
`{ "<term>": [{ "id", "pos", "file": "a1/family.json" }] }`.

## Open items

- Mount ONE video provider in `ClassroomPage` (Jitsi or PeerJS) and add a TURN server (`VITE_TURN_*`).
- Tables the old client used but no migration creates: `lesson_notes`, `lesson_progress`, `lesson_submissions`,
  `submissions`, `teacher_students`, `lesson_authors`, `lesson_content`, `cms_page_overrides`, and the RPCs
  `save_lesson_note`, `join_lesson_note`. Write migrations before wiring Notes sync, Students, Submissions
  and "submit essay / audio to teacher".
- `lessons` has no `body` column; the old teacher path read `lessons.body`. The new loader uses
  `lesson_student_content` + `lesson_protected` instead. Confirm the `session-body` format with a real lesson.
