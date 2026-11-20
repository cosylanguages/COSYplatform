# Lesson content pipeline

| Stage | Where | Notes |
|---|---|---|
| Authoring (full lesson, with teacher notes and answers) | private storage, **not this repo** | Converters: `scripts/convert-session-to-lesson.py`, `scripts/batch-convert-english-sessions.py` |
| Student-safe copy | `lessons/<course>/` in this repo | Always produced by `scripts/sanitize-student-lesson.js`; `scripts/check_protected_keys.js` fails CI if protected content appears |
| Roadmaps | `roadmaps/*.json` | `lessonFile` must resolve to a file under `lessons/` |
| Database | Supabase | `scripts/ingest_roadmaps.js` (see docs/INGESTION.md). Old publisher: `scripts/legacy-source/` (reference only) |

Sanitize a lesson:

```
npm install            # dev dependency: jsdom
node -e "const {sanitizeStudentLessonContent:s}=require('./scripts/sanitize-student-lesson.js');const fs=require('fs');const f=process.argv[1];fs.writeFileSync(f,s(f,fs.readFileSync(f,'utf8')))" lessons/spoken-en/my-lesson.xml
```
