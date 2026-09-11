# Professional English — Industry Verticals

The `professional` course (B1–C2) is tagged with a `vertical` field on each unit so
learners and teachers can filter by industry track. Three verticals ship today:

| Vertical | Tag | Levels | Units |
|---|---|---|---|
| Information Technology | `it` | B1, B2 | 1 per level (4 lessons each) |
| Marketing & Content | `marketing` | B1, B2 | 1 per level (4 lessons each) |
| Career, Resumes & Interviews | `career` | B1, B2 | pre-existing unit, now tagged |

Units with no `vertical` field are general professional English (written
communication, meetings, presentations, negotiation, networking) and apply to
every industry.

## Filtering by vertical

Each curriculum file (`curriculum/en/professional/{level}.json`) has a `units`
array. To pull only the IT track at B1:

```python
import json
d = json.load(open("curriculum/en/professional/B1.json"))
it_units = [u for u in d["units"] if u.get("vertical") == "it"]
```

## Lesson structure

Every lesson carries `grammar`, `vocabulary`, `teacher_notes` (with `code:`,
`cando:`, `domain_hints:`), and `recycled` — the same schema as the general
professional course, so the same practice engines and index builders consume
them without changes.

## Adding a vertical

1. Author a unit (4 lessons) under the relevant level file.
2. Set `"vertical": "<id>"` on the unit object.
3. Register the vertical in `data/courses/courses.json` under the
   `professional` course's `verticals` array.
4. Extend `scripts/build_cefr_outcomes.py` if the vertical should appear in the
   outcomes table (it reads `course_type` + `level`, so vertical-tagged units are
   already included in lesson counts).

## Source

Added by gap-analysis item A5 (see
`docs/competitive-analysis/skyeng/gap-analysis.md`). The competitive driver:
Skyeng offers domain-specific tracks (IT, marketing, business); COSY now
matches with vertical-tagged units that share the standard curriculum schema.
