# Drafts & Skeleton Templates

This directory holds draft lesson files and generated skeleton templates.

## ⚠️ Important Rules

- **Not Published:** Nothing under `drafts/` is published to production databases or deployed on GitHub Pages.
- **Not Shown:** Draft files are hidden from student and teacher portals and catalog browsers.
- **Not in Roadmaps:** Files in this directory are strictly excluded from all course roadmaps (`roadmaps/*.json`).

## 📁 Blueprint Files (`drafts/blueprints/`)

The JSON files under `drafts/blueprints/` are English-language skeleton templates generated for general language course modules. They contain placeholder quiz distractors and English structural text. They serve as authoring starters and must **never** be served or published directly.

## 🚀 Promoting a Draft Lesson

To promote a blueprint or draft lesson to a published, live lesson:

1. **Rewrite Content:** Edit the JSON file to replace skeleton text, placeholder distractors, and English boilerplate with authentic, native target-language content adhering to `schemas/lesson.schema.json`.
2. **Move to Lessons Directory:** Use `git mv` to move the finalized lesson file from `drafts/blueprints/...` into its target folder under `lessons/` (e.g. `lessons/general-english-a1/` or `lessons/general-french-a1/`).
3. **Register in Roadmap:** Add an entry for the lesson in the appropriate course roadmap JSON file (`roadmaps/<course-id>.json`) with `"lessonFile": "lessons/..."` and a status other than `"planned"`.
