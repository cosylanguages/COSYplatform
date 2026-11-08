import json, os

manifest_path = "lessons/science-en/manifest.json"
with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

# Group by CEFR level
levels = {"a2": [], "b1": [], "b2": [], "c1": []}
for item in manifest:
    lvl = item["level"].lower()
    if lvl in levels:
        levels[lvl].append(item)
    else:
        print(f"Unknown level: {lvl}")

print("Level distribution:")
for k, v in levels.items():
    print(f"  {k.upper()}: {len(v)} lessons")

def update_roadmap(course_id, cefr_code):
    roadmap_file = f"roadmaps/{course_id}.json"
    with open(roadmap_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    existing_seq = data.get("sequence", [])

    # Preserve non-science lessons if any exist
    kept_seq = [item for item in existing_seq if not (item.get("lessonFile", "").startswith("lessons/science-en/"))]

    new_science_items = levels[cefr_code]
    # Sort deterministically by slug
    new_science_items.sort(key=lambda x: x["slug"])

    seq = list(kept_seq)
    for sci in new_science_items:
        seq.append({
            "lessonNumber": len(seq) + 1,
            "id": sci["slug"],
            "title": sci["title"],
            "module": "Special: Keeping Up with Science",
            "lessonFile": sci["file"]
        })

    data["totalLessons"] = len(seq)
    data["sequence"] = seq

    with open(roadmap_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated {roadmap_file}: totalLessons={data['totalLessons']}")

update_roadmap("discussion-en-a2", "a2")
update_roadmap("discussion-en-b1", "b1")
update_roadmap("discussion-en-b2", "b2")
update_roadmap("discussion-en-c1", "c1")
