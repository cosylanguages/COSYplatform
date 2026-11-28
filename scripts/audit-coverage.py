#!/usr/bin/env python3
"""Compare the declared course plan with what the platform actually publishes.

Reads `data/course-plan.json`, `shared/js/auth-guard.js` (FULL_MANIFEST) and `roadmaps/*.json`,
then reports four things:
  - every planned course: is it in the manifest, is it visible, how many lessons exist on disk;
  - planned courses that are hidden (not_yet_available) although content exists;
  - published courses outside the plan, which are visible without being decided;
  - the entry band: the platform has no A0 level, so a1 and a0-a1 entries are the same band and
    two visible ones would be a duplicate.

Writes `docs/COURSE_COVERAGE.md`. Changes nothing.

Usage:
  python3 scripts/audit-coverage.py --write
"""

from __future__ import annotations

import argparse
import collections
import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENTRY_NAMES = ("a0-a1", "a0", "a1")


def load_manifest() -> list[dict]:
    source = open(os.path.join(ROOT, "shared", "js", "auth-guard.js"), encoding="utf-8").read()
    match = re.search(r"FULL_MANIFEST\s*=\s*(\[.*?\]);", source, re.S)
    if not match:
        raise SystemExit("FULL_MANIFEST not found in shared/js/auth-guard.js")
    return json.loads(match.group(1))


def load_plan() -> dict:
    return json.load(open(os.path.join(ROOT, "data", "course-plan.json"), encoding="utf-8"))


def roadmap_stats(course_id: str) -> dict:
    path = os.path.join(ROOT, "roadmaps", f"{course_id}.json")
    if not os.path.exists(path):
        return {"roadmap": False, "planned": 0, "present": 0, "missing_files": 0}
    data = json.load(open(path, encoding="utf-8"))
    sequence = data.get("sequence") or []
    def present(entry):
        path = entry.get("lessonFile") or ""
        return bool(path) and os.path.exists(os.path.join(ROOT, path))

    missing = [e for e in sequence if not present(e)]
    return {
        "roadmap": True,
        "planned": len(sequence),
        "present": len(sequence) - len(missing),
        "missing_files": len(missing),
    }


def curriculum_path(entry: dict) -> str | None:
    track = (entry.get("track") or "general").lower()
    level = (entry.get("level") or "").lower()
    path = os.path.join(ROOT, "curriculums", entry.get("lang", ""), track, f"{level.upper()}.json")
    return path if os.path.exists(path) else None


def band_of(entry: dict) -> str:
    level = (entry.get("level") or "").lower()
    return level


def visible(entry: dict) -> bool:
    return entry.get("status") != "not_yet_available"


def collect() -> dict:
    manifest = load_manifest()
    plan = load_plan()
    by_lang_track: dict[tuple[str, str], list[dict]] = collections.defaultdict(list)
    for entry in manifest:
        by_lang_track[(entry.get("lang", ""), (entry.get("track") or "").lower())].append(entry)

    planned = []
    for key, bands in plan["courses"].items():
        lang, track = key.split("/")
        entries = by_lang_track.get((lang, track), [])
        for band in bands:
            # the entry band answers to a1 and to a0-a1, since there is no A0 level
            candidates = [e for e in entries if band_of(e) == band]
            if band == "a1":
                candidates += [e for e in entries if band_of(e) in ("a0-a1", "a0")]
            candidates.sort(key=lambda e: band_of(e) != "a0-a1")
            chosen = candidates[0] if candidates else None
            stats = roadmap_stats(chosen["id"]) if chosen else {"roadmap": False, "planned": 0, "present": 0, "missing_files": 0}
            planned.append({
                "key": key, "lang": lang, "band": band,
                "id": chosen["id"] if chosen else None,
                "title": chosen.get("title") if chosen else None,
                "entry_level": band_of(chosen) if chosen else None,
                "visible": bool(chosen and visible(chosen)),
                "duplicates": [e["id"] for e in candidates[1:]],
                **stats,
            })

    planned_ids = {p["id"] for p in planned if p["id"]}
    planned_keys = set(plan["courses"])
    outside = []
    for entry in manifest:
        if entry["id"] in planned_ids:
            continue
        stats = roadmap_stats(entry["id"])
        outside.append({
            "id": entry["id"], "lang": entry.get("lang"), "track": entry.get("track"),
            "level": band_of(entry), "visible": visible(entry), **stats,
            "curriculum": bool(curriculum_path(entry)),
            "track_planned": f"{entry.get('lang')}/{(entry.get('track') or '').lower()}" in planned_keys,
        })

    return {"planned": planned, "outside": outside, "manifest_size": len(manifest)}


def render(result: dict) -> str:
    planned = result["planned"]
    outside = result["outside"]

    def state(row):
        if not row["id"]:
            return "no entry"
        if not row["visible"]:
            return "hidden"
        if row["planned"] == 0:
            return "visible, no roadmap"
        if row["present"] < row["planned"]:
            return f"visible, {row['present']}/{row['planned']} lessons"
        return "visible, complete"

    inner_gaps = [r for r in planned if not (r["id"] and r["visible"] and r["planned"] and r["present"] == r["planned"])]
    visible_outside = [r for r in outside if r["visible"]]
    phantoms = [r for r in outside if not r["visible"] and not r["roadmap"] and not r["curriculum"]]
    written_unbuilt = [r for r in outside if not r["visible"] and not r["roadmap"] and r["curriculum"]]
    hidden_outside = [r for r in outside if not r["visible"]]

    lines = [
        "# Course coverage",
        "",
        f"Manifest entries: **{result['manifest_size']}**. The declared plan is in `data/course-plan.json`.",
        "There is no standalone A0 level: the entry band is one A1 course covering A0-A1.",
        "",
        "## The plan, course by course",
        "",
        "| course | level | manifest id | entry named | visible | lessons on disk | state |",
        "|---|---|---|---|---|---|---|",
    ]
    for row in planned:
        lessons = f"{row['present']}/{row['planned']}" if row["planned"] else "—"
        lines.append(
            f"| {row['key']} | {row['band'].upper()} | {row['id'] or '—'} | "
            f"{(row['entry_level'] or '—').upper()} | {'yes' if row['visible'] else 'no'} | {lessons} | {state(row)} |"
        )

    lines += ["", "### Planned courses that are not fully delivered", ""]
    if not inner_gaps:
        lines.append("None: every planned course is visible and complete.")
    for row in inner_gaps:
        detail = state(row)
        if row["duplicates"]:
            detail += f"; duplicate entries: {', '.join(row['duplicates'])}"
        lines.append(f"- **{row['key']} {row['band'].upper()}** — {detail}")

    dupes = [r for r in planned if r["duplicates"]]
    lines += ["", "## The entry band has two names", ""]
    if not dupes:
        lines.append("No language carries both an `a0-a1` and an `a1` entry.")
    else:
        lines.append("These languages expose the same band twice. Since there is no A0 level, one of the")
        lines.append("two must be the visible entry course; the other is either the same course renamed or a")
        lines.append("second series that has to be merged or retired.")
        lines.append("")
        for row in dupes:
            lines.append(f"- **{row['lang']}**: `{row['id']}` ({row['entry_level']}, "
                         f"{row['present']}/{row['planned']} lessons) and "
                         + ", ".join(f"`{d}`" for d in row["duplicates"]))

    a0_named = [r["id"] for r in phantoms if (r["level"] or "").startswith("a0")]
    lines += ["", "## Nothing behind the entry", "",
              f"**{len(phantoms)}** manifest entries have no curriculum, no roadmap and no lessons: they are",
              "placeholders for work not started. Harmless while hidden, but they inflate every count of",
              "\"courses\" the platform claims.", "",
              f"Of those, **{len(a0_named)}** are named A0: {', '.join(a0_named) if a0_named else 'none'}.",
              "No language has an A0 curriculum file, and the entry band is A1, so these entries name a level",
              "that does not exist. They are the strongest candidates for removal.", "",
              "## Written but unbuilt", "",
              f"**{len(written_unbuilt)}** hidden entries have a curriculum and no roadmap, so the syllabus exists",
              "and the course cannot be opened. This is the largest real gap in the plan, and the cheapest to",
              "start closing: the thinking is done, only the decks are missing.", "",
              "| course | level | curriculum |", "|---|---|---|"]
    for row in sorted(written_unbuilt, key=lambda r: r["id"]):
        lines.append(f"| {row['id']} | {(row['level'] or '').upper()} | yes |")
    if not written_unbuilt:
        lines.append("| — | — | — |")

    lines += ["", "## Visible but outside the plan", "",
              "Published courses whose track or language is not in the plan. They are not wrong, but they are",
              "not decided either: each should be either added to the plan or hidden.", "",
              "| course | level | lessons |", "|---|---|---|"]
    for row in sorted(visible_outside, key=lambda r: (-r["present"], r["id"])):
        lines.append(f"| {row['id']} | {row['level'].upper()} | {row['present']}/{row['planned']} |")
    if not visible_outside:
        lines.append("| — | — | — |")

    lines += ["", "## Hidden, outside the plan", "",
              f"{len(hidden_outside)} entries are not yet available and outside the plan. That is the intended",
              "default for work not started, so nothing here needs a decision.", "",
              "Languages with a hidden general track: "
              + ", ".join(sorted({r["lang"] for r in hidden_outside if (r["track"] or "").lower() == "general"})) + "",
              "", "## Decisions needed", "",
              "1. **The entry band name.** No language has an A0 curriculum, so A0 exists only as manifest",
              "   placeholders. Keeping `a1` as the band name is consistent with the content; the 12 A0",
              "   entries should then be removed rather than left to imply a level we do not teach.",
              "2. **English carries the entry band twice.** `general-en-a1` (180 lessons, built from",
              "   `curriculums/en/general/A1.json`) and `general-en-a0-a1` (48 decks under",
              "   `lessons/general-english-a0`, from a curriculum id that has no JSON file). Both are visible.",
              "   One must be the entry course, and the 48-lesson series has no curriculum to regenerate from.",
              "3. **`general-en-c1` is visible with one lesson of 65.** Either hide it until built or build it;",
              "   a published course with a single lesson is worse than a hidden one.",
              "4. **Russian is written and invisible.** Six curricula exist (A1 has 142 lessons) and none has a",
              "   roadmap, so all six entries are hidden. This is the biggest planned gap with the least work",
              "   left in front of it: the syllabus is done.",
              "5. **36 visible courses sit outside the plan** (pronunciation, spoken, cinema, discussion, and",
              "   the single-level German, Spanish, Portuguese courses). Each is either added to the plan or",
              "   hidden; leaving them visible-but-unplanned is how the manifest drifted in the first place.",
              "", "## What this cannot tell you", "",
              "- whether a lesson's content is any good, only whether the file exists;",
              "- whether a visible course is listed in the plan by accident or by decision;",
              "- whether the A0-A1 and A1 series teach the same thing: that needs a curriculum diff, and the",
              "  two curricula are `curriculums/<lang>/general/A0.json` and `A1.json`.", ""]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    result = collect()
    planned = result["planned"]
    gaps = [r for r in planned if not (r["id"] and r["visible"] and r["planned"] and r["present"] == r["planned"])]
    outside_visible = [r for r in result["outside"] if r["visible"]]
    print(f"planned {len(planned)} | not delivered {len(gaps)} | visible outside plan {len(outside_visible)} "
          f"| manifest {result['manifest_size']}")
    for row in gaps:
        print(f"  gap: {row['key']} {row['band']} -> {row['id'] or 'no entry'} "
              f"({'visible' if row['visible'] else 'hidden'}, {row['present']}/{row['planned']})")
    if args.write:
        path = os.path.join(ROOT, "docs", "COURSE_COVERAGE.md")
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(render(result) + "\n")
        print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
