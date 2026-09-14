# Content Migration Mapping Table

This document maps all source directories from `cosylanguages/COSYmanuals` (and legacy content) to their standardized destination paths within this repository.

| Source Repo / Directory (`cosylanguages/COSYmanuals`) | Destination Path | Notes / Scope |
| --- | --- | --- |
| `curriculums/_schema/` | `curriculums/_schema/` | Copied as-is (curriculum validation JSON schema) |
| `curriculums/{iso}/{course_type}/{LEVEL}.json` | `curriculums/{iso}/{course_type}/{LEVEL}.json` | Copied all language and course type curriculum JSON files |
| `curriculums/{english,french,italian,russian,greek}/` | *Skipped* | Skipped legacy folders pending reconciliation decision |
| `curriculums/_archive/` | *Skipped* | Skipped legacy archive materials |
| `marathons/` | *Removed* | Removed from COSYplatform (marathon content lives exclusively in `cosylanguages/COSYmanuals`) |
| `teacher-guides/` | `teacher-guides/` | Copied as-is (teacher manuals and guides) |
| `student-workbooks/data/workbooks/{lang}/{level}.json` | `student-workbooks/data/workbooks/{lang}/{level}.json` | Copied normalized workbook data files |
| `student-workbooks/data/workbook_data.js` | `student-workbooks/data/workbook_data.js` | Copied as-is |
| `shared/` | `shared/` | Copied as-is (shared CSS styles and templates) |
| `templates/` | `templates/` | Copied as-is (HTML and JSON curriculum templates) |
| *COSYlanguages (Separate migration)* | `reference/manuals/` | Placeholder README created |
| *COSYlanguages (Separate migration)* | `reference/grammar/` | Placeholder README created |
| *COSYlanguages (Separate migration)* | `reference/vocabulary/` | Placeholder README created |
| *New platform activities* | `activities/games.json` | Created empty array placeholder |
| *New platform activities* | `activities/tools.json` | Created empty array placeholder |
| *New platform activities* | `activities/print.json` | Created empty array placeholder |
