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
