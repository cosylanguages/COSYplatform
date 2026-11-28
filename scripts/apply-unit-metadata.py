#!/usr/bin/env python3
"""Apply unit theme / macro-function metadata declared in scripts/data/unit-metadata.json.

The change is additive: existing keys keep their order and value, only `theme`,
`secondaryThemes` and `macroFunction` are inserted after `title`. Files are written back with the
repository's formatting (2-space indent, no ASCII escaping, trailing newline), so the diff shows
insertions only.

Usage:
  python3 scripts/apply-unit-metadata.py                 # report drift, change nothing
  python3 scripts/apply-unit-metadata.py --write         # apply
  python3 scripts/apply-unit-metadata.py --course fr/general/B1.json --write
"""
from __future__ import annotations

import argparse
import collections
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_MAP = os.path.join(ROOT, "scripts", "data", "unit-metadata.json")
THEMES = os.path.join(ROOT, "cefr", "data", "themes.json")
UNIT_KEYS = ["unit", "title", "theme", "secondaryThemes", "macroFunction", "lessons"]


def course_id(path: str) -> str:
    parts = os.path.normpath(path).split(os.sep)
    lang, track, filename = parts[-3], parts[-2], parts[-1]
    return f"{track}-{lang}-{filename[:-5].lower()}"


def course_path(curricula: str, course: str) -> str:
    for candidate in (course, os.path.join(ROOT, course), os.path.join(curricula, course)):
        if os.path.isfile(candidate):
            return os.path.normpath(candidate)
    parts = course.split("-")
    level, lang, track = parts[-1], parts[-2], "-".join(parts[:-2])
    return os.path.join(curricula, lang, track, level.upper() + ".json")


def load_theme_ids() -> set[str]:
    data = json.load(open(THEMES, encoding="utf-8"))
    ids = {t.get("id") for t in data if isinstance(t, dict)}
    ids.discard(None)
    return ids


def ordered(unit: dict, meta: dict) -> collections.OrderedDict:
    merged = collections.OrderedDict()
    for key in UNIT_KEYS:
        if key in ("theme", "secondaryThemes", "macroFunction"):
            if meta.get(key) not in (None, [], ""):
                merged[key] = meta[key]
        elif key == "lessons":
            if "lessons" in unit:
                merged[key] = unit[key]
        elif key in unit:
            merged[key] = unit[key]
    for key, value in unit.items():
        if key not in merged and key not in ("theme", "secondaryThemes", "macroFunction"):
            merged[key] = value
    return merged


def apply_course(path: str, spec: dict, theme_ids: set[str], write: bool) -> list[str]:
    with open(path, encoding="utf-8") as handle:
        data = json.load(handle, object_pairs_hook=collections.OrderedDict)
    units = data.get("units") or []
    by_number = {int(u.get("unit", 0)): u for u in units}
    report = []
    changed = False
    for number, meta in sorted(spec.get("units", {}).items(), key=lambda kv: int(kv[0])):
        unit = by_number.get(int(number))
        if unit is None:
            report.append(f"  unit {number}: not in {os.path.basename(path)}, skipped")
            continue
        theme = meta.get("theme")
        if theme and theme not in theme_ids:
            report.append(f"  unit {number}: unknown theme {theme}, skipped")
            continue
        extras = meta.get("secondaryThemes") or []
        unknown = [t for t in extras if t not in theme_ids]
        if unknown:
            report.append(f"  unit {number}: unknown secondary theme(s) {unknown}, skipped")
            continue
        merged = ordered(unit, meta)
        if merged != unit:
            changed = True
            report.append(f"  unit {number}: +{', '.join(k for k in merged if k not in unit)}")
        units[units.index(unit)] = merged
    if changed and write:
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--map", default=DEFAULT_MAP)
    parser.add_argument("--curricula", default=os.path.join(ROOT, "curriculums"))
    parser.add_argument("--course", action="append", help="course id or path; repeatable")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    spec = json.load(open(args.map, encoding="utf-8"))
    theme_ids = load_theme_ids()
    courses = args.course or sorted(spec)
    drift = 0
    for course in courses:
        path = course_path(args.curricula, course)
        if not os.path.exists(path):
            print(f"missing course: {path}", file=sys.stderr)
            return 2
        key = course_id(path)
        if key not in spec:
            print(f"no metadata for {key} in {args.map}", file=sys.stderr)
            return 2
        report = apply_course(path, spec[key], theme_ids, args.write)
        if report:
            drift += 1
            print(f"{key}{' (written)' if args.write else ' (drift)'}")
            if not args.quiet:
                print("\n".join(report))
        elif not args.quiet:
            print(f"{key}: up to date")
    if drift and not args.write:
        print(f"\n{drift} course(s) need metadata; re-run with --write.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
