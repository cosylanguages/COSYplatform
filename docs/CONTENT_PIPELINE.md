# Lesson content pipeline

| Stage | Where | Notes |
|---|---|---|
| Authoring (full lesson, with teacher notes and answers) | private storage, **not this repo** | Converters: `scripts/convert-session-to-lesson.py`, `scripts/batch-convert-english-sessions.py` |
| Student-safe copy | `lessons/<course>/` in this repo | Always produced by `scripts/sanitize-student-lesson.js`; `scripts/check_protected_keys.js` fails CI if protected content appears |
| Protected workbooks | `student-workbooks/` (local, git-ignored) | `scripts/seed-workbooks.js` writes `lessons` (kind=`workbook`), sanitized `lesson_student_content`, and `lesson_protected` answer keys. `publish_to_supabase.js` skips this folder. |
| Roadmaps | `roadmaps/*.json` | `lessonFile` must resolve to a file under `lessons/` |
| Database | Supabase | `scripts/ingest_roadmaps.js` (see docs/INGESTION.md). Old publisher: `scripts/legacy-source/` (reference only) |

Sanitize a lesson:

```
npm install            # dev dependency: jsdom
node -e "const {sanitizeStudentLessonContent:s}=require('./scripts/sanitize-student-lesson.js');const fs=require('fs');const f=process.argv[1];fs.writeFileSync(f,s(f,fs.readFileSync(f,'utf8')))" lessons/spoken-en/my-lesson.xml
```

Seed protected workbooks:

```
mkdir -p student-workbooks/data
cp -r ../COSYplatform-source/student-workbooks/data/workbooks student-workbooks/data/
node scripts/seed-workbooks.js --dry-run
node scripts/seed-workbooks.js   # requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```
