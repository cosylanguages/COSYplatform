#!/usr/bin/env python3
"""Turn reviewed vocabulary decisions into lesson `vocabularyIds`.

Reads the review sheet produced by build-vocab-id-map.py (one row per item, `decision` column) and
writes the accepted COSYdata ids onto the lesson, right after `vocabulary`. Everything else in the
file is left as it is; the run is idempotent and defaults to a dry run.

Decision syntax in the `decision` column:
  (empty)          not reviewed yet        -> left pending
  accept           use the matched id
  accept <id>      use this id (usually an alternative from the candidates column)
  author           the item must be created in COSYdata  -> backlog
  replace          the item should change in the curriculum -> backlog
  skip             deliberately left without an id

Usage:
  python3 scripts/apply-vocab-ids.py --course general-fr-b1
  python3 scripts/apply-vocab-ids.py --course general-fr-b1 --write
  python3 scripts/apply-vocab-ids.py --course general-fr-b1 --cosydata ../COSYdata --write
"""
from __future__ import annotations

import argparse
import collections
import csv
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ID_RE = re.compile(r"^[a-z]{2}:[a-z0-9-]+:[a-z]+$")
PENDING = {"", "-"}
BACKLOG = {"author", "replace"}
FIELDS = ("item", "status", "matched_id", "matched_word", "matched_level", "candidates", "decision")


def course_path(curricula: str, course: str) -> str:
    for candidate in (course, os.path.join(ROOT, course), os.path.join(curricula, course)):
        if os.path.isfile(candidate):
            return os.path.normpath(candidate)
    parts = course.split("-")
    level, lang, track = parts[-1], parts[-2], "-".join(parts[:-2])
    return os.path.join(curricula, lang, track, level.upper() + ".json")


def course_id(path: str) -> str:
    parts = os.path.normpath(path).split(os.sep)
    return f"{parts[-2]}-{parts[-3]}-{parts[-1][:-5].lower()}"


def load_dictionary_ids(cosydata: str, lang: str) -> set[str] | None:
    pattern = os.path.join(cosydata, "vocabulary", lang, "**", "*.json")
    files = [p for p in glob.glob(pattern, recursive=True) if not p.endswith("index.json")]
    if not files:
        return None
    ids = set()
    for path in files:
        try:
            data = json.load(open(path, encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        entries = data.get("entries", []) if isinstance(data, dict) else data
        for entry in entries:
            if isinstance(entry, dict) and entry.get("id"):
                ids.add(entry["id"])
    return ids


def read_decisions(path: str) -> list[dict]:
    with open(path, encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    missing = [f for f in FIELDS if rows and f not in rows[0]]
    if missing:
        raise SystemExit(f"{path}: missing column(s) {', '.join(missing)}")
    return rows


def resolve(row: dict, valid: set[str] | None, problems: list[str]) -> tuple[str, str | None]:
    """Return (kind, id) where kind is applied|backlog|pending|skipped."""
    decision = (row.get("decision") or "").strip()
    lowered = decision.lower()
    if lowered.startswith("accept"):
        rest = decision[len("accept"):].strip()
        if rest and rest != row.get("matched_id"):
            ident = rest
        else:
            ident = (row.get("matched_id") or "").strip()
        if not ident:
            problems.append(f"{row.get('code')} {row.get('item')!r}: accepted without an id")
            return "pending", None
        if not ID_RE.match(ident):
            problems.append(f"{row.get('code')} {row.get('item')!r}: malformed id {ident!r}")
            return "pending", None
        if valid is not None and ident not in valid:
            problems.append(f"{row.get('code')} {row.get('item')!r}: unknown id {ident!r}")
            return "pending", None
        return "applied", ident
    if lowered in BACKLOG:
        return "backlog", None
    if lowered in ("skip", "x", "none"):
        return "skipped", None
    if decision in PENDING:
        return "pending", None
    problems.append(f"{row.get('code')} {row.get('item')!r}: unrecognised decision {decision!r}")
    return "pending", None


def insert_ids(lesson: dict, ids: list[str]) -> dict:
    if not ids:
        return lesson
    merged = collections.OrderedDict()
    existing = list(lesson.get("vocabularyIds") or [])
    for ident in ids:
        if ident not in existing:
            existing.append(ident)
    for key, value in lesson.items():
        if key == "vocabularyIds":
            continue
        merged[key] = value
        if key == "vocabulary":
            merged["vocabularyIds"] = existing
    if "vocabularyIds" not in merged:
        merged["vocabularyIds"] = existing
    return merged


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--course", required=True)
    parser.add_argument("--curricula", default=os.path.join(ROOT, "curriculums"))
    parser.add_argument("--csv", help="review sheet; defaults to docs/vocab-id-map/review-<course>.csv")
    parser.add_argument("--cosydata", help="dictionary checkout used to reject unknown ids")
    parser.add_argument("--backlog-out", help="write unresolved author/replace rows as JSON")
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    path = course_path(args.curricula, args.course)
    if not os.path.exists(path):
        print(f"missing course: {path}", file=sys.stderr)
        return 2
    course = course_id(path)
    csv_path = args.csv or os.path.join(ROOT, "docs", "vocab-id-map", f"review-{course}.csv")
    if not os.path.exists(csv_path):
        print(f"missing review sheet: {csv_path}", file=sys.stderr)
        return 2

    data = json.load(open(path, encoding="utf-8"), object_pairs_hook=collections.OrderedDict)
    parts = os.path.normpath(path).split(os.sep)
    lang = data.get("language") or (parts[-3] if len(parts) > 1 else "")
    valid = load_dictionary_ids(args.cosydata, lang) if args.cosydata else None
    if args.cosydata and not valid:
        print(f"no dictionary entries for {lang} under {args.cosydata}", file=sys.stderr)
        return 2
    problems: list[str] = []
    rows = read_decisions(csv_path)

    tallies = collections.Counter()
    by_lesson: dict[tuple[int, int], list[str]] = collections.defaultdict(list)
    backlog: list[dict] = []
    for row in rows:
        kind, ident = resolve(row, valid, problems)
        tallies[kind] += 1
        if kind == "applied":
            by_lesson[(int(row["unit"]), int(row["lesson"]))].append(ident)
        elif kind == "backlog":
            backlog.append(
                {
                    "unit": int(row["unit"]),
                    "lesson": int(row["lesson"]),
                    "code": row.get("code") or "",
                    "item": row.get("item") or "",
                    "action": (row.get("decision") or "").strip().lower(),
                    "suggestion": row.get("candidates") or row.get("matched_word") or "",
                }
            )

    changed = 0
    for unit in data.get("units") or []:
        for index, lesson in enumerate(unit.get("lessons") or []):
            key = (int(unit.get("unit", 0)), int(lesson.get("lesson", 0)))
            ids = by_lesson.get(key)
            if not ids:
                continue
            merged = insert_ids(lesson, ids)
            if merged != lesson:
                changed += 1
                unit["lessons"][index] = merged

    print(f"{course}: {len(rows)} rows — applied {tallies['applied']}, backlog {tallies['backlog']}, "
          f"skipped {tallies['skipped']}, pending {tallies['pending']}; "
          f"{changed} lesson(s) to change")
    if problems:
        print(f"{len(problems)} problem(s):", file=sys.stderr)
        for problem in problems[:20]:
            print(f"  {problem}", file=sys.stderr)
        if len(problems) > 20:
            print(f"  ... {len(problems) - 20} more", file=sys.stderr)
        return 2

    if args.backlog_out and backlog:
        with open(args.backlog_out, "w", encoding="utf-8") as handle:
            handle.write(json.dumps({"course": course, "items": backlog}, ensure_ascii=False, indent=1) + "\n")
        print(f"wrote {os.path.relpath(args.backlog_out, ROOT)}")

    if not args.write:
        if changed:
            print("dry run; re-run with --write to apply")
            return 1
        return 0

    if changed:
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print(f"wrote {os.path.relpath(path, ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
