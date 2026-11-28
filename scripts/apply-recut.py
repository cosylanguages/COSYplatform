#!/usr/bin/env python3
"""Apply a declared unit re-cut to the curriculum, the roadmap and the decks it touches.

A unit title lives in three committed places: the curriculum unit, the roadmap `unit` string of
every lesson in it, and the `unit` field of each deck. This script updates the three together, in
place, and keeps the file formatting. Renames no file and changes no lesson id, title or slide.

Dry run by default; `--write` applies. Idempotent.

Usage:
  python3 scripts/apply-recut.py --course general-fr-b1
  python3 scripts/apply-recut.py --course general-fr-b1 --write
"""
from __future__ import annotations

import argparse
import collections
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC_DIR = os.path.join(ROOT, "scripts", "data")


def course_paths(curricula: str, root: str, course: str) -> tuple[str, str]:
    parts = course.split("-")
    level, lang, track = parts[-1], parts[-2], "-".join(parts[:-2])
    curriculum = os.path.join(curricula, lang, track, level.upper() + ".json")
    roadmap = os.path.join(root, "roadmaps", f"{course}.json")
    return curriculum, roadmap


def load(path: str):
    return json.load(open(path, encoding="utf-8"), object_pairs_hook=collections.OrderedDict)


def dump(path: str, data) -> None:
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def retitle(unit: dict, spec: dict) -> dict:
    """Set the declared fields, keeping every other key where it is."""
    out = collections.OrderedDict()
    for key, value in unit.items():
        if key == "secondaryThemes":
            if "secondaryThemes" in spec:
                out[key] = spec["secondaryThemes"]
            continue
        out[key] = spec.get(key, value) if key in ("title", "theme", "macroFunction") else value
        if key == "theme" and "secondaryThemes" in spec and "secondaryThemes" not in unit:
            out["secondaryThemes"] = spec["secondaryThemes"]
    for key in ("title", "theme", "macroFunction"):
        if key in spec and key not in out:
            out[key] = spec[key]
    if "secondaryThemes" in spec and "secondaryThemes" not in out:
        out["secondaryThemes"] = spec["secondaryThemes"]
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--course", required=True)
    parser.add_argument("--curricula", default=os.path.join(ROOT, "curriculums"))
    parser.add_argument("--root", default=ROOT, help="repository root holding roadmaps/ and lessons/")
    parser.add_argument("--spec", help="defaults to scripts/data/recut-<course>.json")
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    spec_path = args.spec or os.path.join(SPEC_DIR, f"recut-{args.course}.json")
    if not os.path.exists(spec_path):
        print(f"missing spec: {spec_path}", file=sys.stderr)
        return 2
    spec = load(spec_path)
    curriculum_path, roadmap_path = course_paths(args.curricula, args.root, args.course)
    for path in (curriculum_path, roadmap_path):
        if not os.path.exists(path):
            print(f"missing file: {path}", file=sys.stderr)
            return 2

    curriculum = load(curriculum_path)
    roadmap = load(roadmap_path)
    by_number = {str(u.get("unit")): u for u in curriculum.get("units") or []}

    changes = []
    renames = {}
    for number, unit_spec in spec["units"].items():
        unit = by_number.get(number)
        if unit is None:
            print(f"unit {number} not in {os.path.basename(curriculum_path)}", file=sys.stderr)
            return 2
        old_title = unit.get("title")
        merged = retitle(unit, unit_spec)
        if merged == unit:
            continue
        renames[old_title] = merged.get("title")
        changes.append(f"  unit {number}: {old_title!r} -> {merged.get('title')!r}, "
                       f"theme {unit.get('theme')} -> {merged.get('theme')}")
        curriculum["units"][curriculum["units"].index(unit)] = merged

    roadmap_hits = 0
    for entry in roadmap.get("sequence") or []:
        if entry.get("unit") in renames:
            entry["unit"] = renames[entry["unit"]]
            roadmap_hits += 1

    decks = []
    for entry in roadmap.get("sequence") or []:
        path = os.path.join(args.root, entry.get("lessonFile") or "")
        if not entry.get("lessonFile") or not os.path.exists(path):
            continue
        deck = load(path)
        new_unit = entry.get("unit")
        if deck.get("unit") != new_unit:
            deck["unit"] = new_unit
            decks.append((path, deck))

    print(f"{args.course}: {len(changes)} unit(s), {roadmap_hits} roadmap entr(ies), "
          f"{len(decks)} deck(s) to update")
    for line in changes:
        print(line)

    if not args.write:
        if changes or roadmap_hits or decks:
            print("dry run; re-run with --write to apply")
            return 1
        return 0

    if changes:
        dump(curriculum_path, curriculum)
    if roadmap_hits:
        dump(roadmap_path, roadmap)
    for path, deck in decks:
        dump(path, deck)
    if changes or roadmap_hits or decks:
        print("written")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
