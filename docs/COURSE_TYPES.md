# COSY course types

One list, kept in `curriculums/_schema/course-types.json`. `tests/course-types.test.js` fails if the schema enum, the folders under `curriculums/<lang>/` or any curriculum's `course_type` field disagree with it.

| Type | What it is | COSYlanguages page | COSYmanuals folder |
|---|---|---|---|
| `general` | Real course | `general.html` | `general` |
| `spoken` | Real course | `spoken.html` | `spoken` |
| `professional` | Real course | `professional.html` | `professional` |
| `travelling` | Real course | `travelling.html` | `travelling` |
| `relocation` | Real course | `relocation.html` | `relocation` |
| `exam` | Real course | `exam-preparation.html` (different name) | `exam` |
| `discussion` | Platform only: speaking clubs from COSYevents, converted to lessons | none | none |
| `pronunciation` | Planned as a marathon / course on the platform; curricula exist, not launched | none | none (the manuals README lists it as a content module) |

**Manual only:** `communication` exists as a folder in COSYmanuals (`manuals/<lang>/communication`). It is not a course type and has no curriculum, so it is not in the list.

**Content types are not course types.** Roadmap prefixes such as `grammar`, `vocabulary`, `phrasal-verbs`, `cinema`, `science` and `introductory-english` describe content modules, not courses.

## Differences left in the other repos (not editable from COSYplatform)

- COSYlanguages calls the exam course `exam-preparation`; the platform and manuals call it `exam`. Matching by name needs the mapping above.
- The COSYmanuals README lists six curriculum tracks and does not mention `discussion`; it lists `pronunciation` as a content module only. It should say that `discussion` is platform-only and `pronunciation` is planned.
- COSYmanuals `CANON_SOURCE_OF_TRUTH.md` still names COSYlanguages as the curriculum master; the curriculum files in COSYmanuals are pointers to COSYplatform.
