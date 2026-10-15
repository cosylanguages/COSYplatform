# COSYplatform Roadmap & Lesson Ingestion Workflow

This document outlines the procedure and tooling for ingesting curriculum roadmaps and lesson content into Supabase database tables (`courses`, `lessons`, `course_lessons`, `lesson_student_content`, `lesson_protected`).

---

## 1. Core Principles & Zero-Merge Policy

1. **Upstream Ownership:** `COSYplatform` owns canonical course metadata and lessons in Supabase.
2. **PR #13 & External Branches Are Never Merged onto Main:**
   - Unmerged branches (such as PR #13 containing science lessons) remain separate.
   - The ingestion script `scripts/ingest_roadmaps.js` reads lesson content directly from local folders or git branch references using `--source <folder_or_git_ref>` without checking out or merging branches onto `main`.
3. **Decoupled Content Separation:**
   - Public preview roadmaps (`roadmaps/*.json`) contain only non-sensitive metadata (titles, levels, summaries, units).
   - Student-visible lesson bodies go into `lesson_student_content`.
   - Answer keys, teacher notes, and paid session scripts go into `lesson_protected`.

---

## 2. Ingestion Commands & Flags

### 2.1 Dry Run Simulation
To parse all 54 roadmaps and inspect deduplicated courses, lessons, and placement junction records without modifying database state:

```bash
node scripts/ingest_roadmaps.js --dry-run
```

### 2.2 Ingesting Local Lesson Content
To ingest roadmaps and read lesson bodies from a local git-ignored folder (e.g. `./seed_data` or `./lessons`):

```bash
SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
node scripts/ingest_roadmaps.js --source ./seed_data
```

### 2.3 Ingesting Lessons Directly From Git Branch Refs (e.g., PR #13)
To ingest lessons from an unmerged branch or pull request branch ref (e.g. `origin/pr/13` or a feature branch ref) without checking out or merging the branch:

```bash
SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
node scripts/ingest_roadmaps.js --source origin/pr/13
```

---

## 3. Database Schema Targets

The ingestion script maps roadmap JSON items to the following Supabase tables:

| Source Object | Target Supabase Table | Purpose |
| :--- | :--- | :--- |
| `roadmaps/*.json` header | `courses` | Course level, title, CEFR, language, description |
| Sequence items | `lessons` | Deduplicated lesson metadata (`id`: `<lang>:<cefr>:<slug>`) |
| Sequence placements | `course_lessons` | Sequence junction with stable `placement_id` |
| Lesson file body | `lesson_student_content` | Sanitized student-facing XML/JSON body |
| Notes / Answer keys | `lesson_protected` | Protected answer keys and teacher notes |
