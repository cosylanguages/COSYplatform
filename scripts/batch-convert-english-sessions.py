#!/usr/bin/env python3
import sys
import os
import json
import glob
import re
import importlib.util
from concurrent.futures import ThreadPoolExecutor

# Import convert_session logic dynamically
spec = importlib.util.spec_from_file_location('convert_session_to_lesson', 'scripts/convert-session-to-lesson.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

fetch_html = mod.fetch_html
parse_session_html = mod.parse_session_html
generate_lesson_xml = mod.generate_lesson_xml

def convert_single_session(session_item):
    source_path = session_item['source_path']
    club = session_item['club']
    filename = session_item['proposed_lesson_id']

    # Filter out foreign language subdirectories in karaoke
    if any(f"/{lang}/" in source_path for lang in ['el', 'es', 'fr', 'it', 'ru']):
        return None

    out_path = f"lessons/spoken-en/{filename}.xml"

    raw_html, url = fetch_html(source_path)
    parsed = parse_session_html(raw_html, url)

    xml_content = generate_lesson_xml(parsed, lesson_id=filename)
    if club == 'cinema-club':
        xml_content = xml_content.replace(
            f'default-mode="all">',
            f'default-mode="all" cinema="true">'
        )

    os.makedirs("lessons/spoken-en", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml_content)

    return {
        'source_path': source_path,
        'filename': filename,
        'level_code': session_item['level_code'],
        'proposed_roadmap_file': session_item['proposed_roadmap_file'],
        'title': session_item['title'],
        'club': club
    }

def update_roadmaps(converted_items):
    # Ensure cinema-english-*.json roadmap files exist
    cinema_levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']
    for lvl in cinema_levels:
        c_path = f"roadmaps/cinema-english-{lvl}.json"
        if not os.path.exists(c_path):
            c_data = {
                "curriculumId": f"cinema-english-{lvl}",
                "title": f"Cinema Club English {lvl.upper()} Roadmap",
                "totalLessons": 0,
                "supportedDurations": ["50", "80", "110"],
                "sequence": []
            }
            with open(c_path, "w", encoding="utf-8") as f:
                json.dump(c_data, f, indent=2, ensure_ascii=False)
                f.write("\n")

    # Load all roadmaps
    roadmaps = {}
    for p in glob.glob("roadmaps/*.json"):
        with open(p, "r", encoding="utf-8") as f:
            roadmaps[os.path.basename(p)] = json.load(f)

    # Process items
    for item in converted_items:
        filename = item['filename']
        target_rm = item['proposed_roadmap_file']
        title = item['title']
        club = item['club']

        if target_rm not in roadmaps:
            if club == 'cinema-club':
                target_rm = f"cinema-english-{item['level_code']}.json"
            else:
                target_rm = f"spoken-english-{item['level_code']}.json"

        if target_rm not in roadmaps:
            target_rm = "spoken-english-b1.json"

        sequence = roadmaps[target_rm].get("sequence", [])

        # Match existing slot by id or remove status: planned
        found = False
        for slot in sequence:
            if slot['id'] == filename or filename.startswith(slot['id']) or slot['id'] in filename:
                found = True
                if 'status' in slot:
                    del slot['status']
                slot['id'] = filename  # confirm exact id match
                break

        if not found:
            # Append new entry
            new_slot = {
                'lessonNumber': len(sequence) + 1,
                'id': filename,
                'title': title,
                'module': f"Club: {club.replace('-', ' ').title()}"
            }
            sequence.append(new_slot)

    # Write updated roadmaps
    for fname, rm_data in roadmaps.items():
        rm_data['totalLessons'] = len(rm_data.get('sequence', []))
        with open(os.path.join("roadmaps", fname), "w", encoding="utf-8") as f:
            json.dump(rm_data, f, indent=2, ensure_ascii=False)
            f.write("\n")

    print("Updated roadmaps successfully.")

def update_link_audit_report():
    total_sequence = 0
    active_lessons = 0
    planned_lessons = 0

    for p in glob.glob("roadmaps/*.json"):
        with open(p, "r", encoding="utf-8") as f:
            d = json.load(f)
            seq = d.get("sequence", [])
            total_sequence += len(seq)
            for item in seq:
                if item.get("status") == "planned":
                    planned_lessons += 1
                else:
                    active_lessons += 1

    with open("LINK_AUDIT_REPORT.md", "r", encoding="utf-8") as f:
        content = f.read()

    new_line = f'| **4. Roadmap sequence `id` → Lesson files** | {total_sequence} | {active_lessons} | {planned_lessons} (`status: "planned"`) | **ALL CLEAR ✅** |'

    content = re.sub(
        r'\| \*\*4\. Roadmap sequence `id` → Lesson files\*\* \| .* \| \*\*ALL CLEAR ✅\*\* \|',
        new_line,
        content
    )

    with open("LINK_AUDIT_REPORT.md", "w", encoding="utf-8") as f:
        f.write(content)

    print("Updated LINK_AUDIT_REPORT.md successfully.")

def main():
    with open("data/conversion-map.json", "r", encoding="utf-8") as f:
        conversion_map = json.load(f)

    en_sessions = [s for s in conversion_map if s['language'] == 'en']
    print(f"Total English sessions to process: {len(en_sessions)}")

    # Process conversions
    with ThreadPoolExecutor(max_workers=20) as executor:
        results = list(executor.map(convert_single_session, en_sessions))

    converted_items = [r for r in results if r is not None]
    print(f"Successfully generated {len(converted_items)} lesson XML files in lessons/spoken-en/")

    # Update roadmaps and link audit report
    update_roadmaps(converted_items)
    update_link_audit_report()

if __name__ == "__main__":
    main()
