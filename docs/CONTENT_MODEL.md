# Content Model Specification

This document describes the adopted content model architecture for curriculum structure across the platform.

## Architecture Hierarchy

The content structure follows a hierarchical progression:

$$\text{Levels} \longrightarrow \text{Course Types} \longrightarrow \text{Units} \longrightarrow \text{Lessons}$$

1. **Language & Level (`iso` / `level`)**:
   - Represents the target language code (e.g. `en`, `fr`, `ru`, `de`, `es`, `it`, `el`, `pt`, `br`, `ba`, `ka`, `hy`, `tt`) and the proficiency level according to CEFR framework (`A0`, `A1`, `A2`, `B1`, `B2`, `C1`, `C2`).

2. **Course Types (`course_type`)**:
   - Categorizes curriculum track focus such as `general`, `spoken`, `grammar`, `travelling`, `professional`, `relocation`, `exam`, `phrasal-verbs`, `vocabulary`, or `introductory`.

3. **Units & Sections**:
   - Groups related topic modules or themes into sequential units, containing section numbers, unit numbers, titles, and lesson items.

4. **Lessons & Assessments**:
   - Individual interactive learning modules, diagnostic exercises, practice cards, and progress assessments (e.g. progress tests, midterm exams, final exams).

## Schema Validation

Curriculum definitions are validated directly against JSON Schema defined at:
[`curriculums/_schema/curriculum.schema.json`](../curriculums/_schema/curriculum.schema.json)

Refer directly to `curriculums/_schema/curriculum.schema.json` for validation rules, required fields, and structural definitions.

---

## Activity Resources Specification (`activities/`)

Supplemental activity files (`activities/games.json`, `activities/tools.json`, `activities/print.json`) connect specific curriculum lessons to COSYgames, COSYtools, and printable learning assets.

### Entry Schema

Each activity item in these JSON arrays must conform to the following schema:

```json
{
  "lessonId": "string (required, e.g. 'nice-to-meet-you')",
  "curriculumId": "string (required, e.g. 'general-english-a1')",
  "activityUrl": "string (required URL to resource)",
  "activityType": "enum: 'game' | 'tool' | 'print' (required)",
  "label": "string (required, descriptive title of activity)",
  "category": "string (optional, e.g. 'vocabulary', 'grammar', 'speaking', 'worksheet')"
}
```

### Properties Description

- **`lessonId`**: The unique identifier of the target lesson as declared in the course roadmap/curriculum.
- **`curriculumId`**: The unique course identifier (e.g., `general-english-a1`, `spoken-english-b1`).
- **`activityUrl`**: Absolute or relative HTTP(S) URL pointing to the external or hosted interactive resource.
- **`activityType`**: High-level classification of the resource. Must be `game` for COSYgames, `tool` for COSYtools reference engines, or `print` for printable assets/worksheets.
- **`label`**: Human-readable label displayed on lesson view cards or teacher guides.
- **`category`**: Optional tag for filtering activities by skill area (e.g. `grammar`, `vocabulary`, `speaking`, `roleplay-cards`).
