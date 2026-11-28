#!/usr/bin/env python3
"""Map a course's human-readable vocabulary to COSYdata ids.

Produces two review artifacts without modifying the curriculum or the dictionary:
  docs/vocab-id-map/mapping-<course>.json  every item with status, matched id and candidates
  docs/vocab-id-map/review-<course>.csv    the same as a review sheet with an empty decision column

Statuses:
  exact       the item equals a dictionary headword (case and spacing normalised)
  normalized  equal after dropping a leading article or diacritics
  related     one headword is a short-ended variant of the item (nuancer/nuancé); the
              reviewer decides whether it is the same entry
  missing     nothing close; the item must be authored in COSYdata or replaced

Usage:
  python3 scripts/build-vocab-id-map.py --cosydata /tmp/COSYdata --course general-fr-b1 --write
"""
from __future__ import annotations

import argparse
import csv
import glob
import json
import os
import re
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTICLES = (
    "le ", "la ", "les ", "l'", "un ", "une ", "des ",
    "el ", "la ", "los ", "las ", "il ", "lo ", "gli ", "i ",
    "o ", "a ", "os ", "as ", "to ", "ti ",
)
ID_RE = re.compile(r"^[a-z]{2}:[a-z0-9-]+:[a-z]+$")


def strip_accents(text: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )


def norm(text: str) -> str:
    text = unicodedata.normalize("NFC", text or "").lower().strip()
    text = re.sub(r"\s+", " ", text)
    return text


def headword(text: str) -> str:
    return norm(re.split(r"[/(]", text)[0])


def without_article(text: str) -> str:
    for article in ARTICLES:
        if text.startswith(article):
            return text[len(article) :].strip()
    return text


SUFFIXES = {
    "s", "x", "e", "es", "er", "ee", "ees", "es", "ant", "ent", "ion", "tion", "sion",
    "ation", "ment", "ement", "age", "eur", "euse", "ier", "iere", "al", "ale", "if",
    "ive", "able", "ible", "ite", "isme", "iste", "eux", "ance", "ence", "ure", "r",
}


def is_relative(a: str, b: str) -> bool:
    """True when one form is the other plus an inflectional or derivational ending."""
    short, long = (a, b) if len(a) <= len(b) else (b, a)
    if len(short) < 5 or not long.startswith(short):
        return False
    tail = long[len(short):]
    if tail in {"ion", "tion", "sion", "ation"} and len(short) < 6:
        return False
    return tail in SUFFIXES


def distance(a: str, b: str, limit: int = 2) -> int:
    if abs(len(a) - len(b)) > limit:
        return limit + 1
    previous = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        current = [i]
        best = i
        for j, cb in enumerate(b, 1):
            cost = 0 if ca == cb else 1
            value = min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
            current.append(value)
            best = min(best, value)
        if best > limit:
            return limit + 1
        previous = current
    return previous[-1]


def load_dictionary(cosydata: str, lang: str) -> list[dict]:
    pattern = os.path.join(cosydata, "vocabulary", lang, "**", "*.json")
    entries, seen = [], set()
    for path in sorted(glob.glob(pattern, recursive=True)):
        if path.endswith("index.json"):
            continue
        try:
            data = json.load(open(path, encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if isinstance(data, dict):
            data = data.get("entries", [])
        for entry in data:
            if not isinstance(entry, dict) or not entry.get("id"):
                continue
            if entry["id"] in seen:
                continue
            seen.add(entry["id"])
            word = entry.get("word") or ""
            entries.append(
                {
                    "id": entry["id"],
                    "word": word,
                    "key": headword(word),
                    "bare": without_article(headword(word)),
                    "plain": strip_accents(headword(word)),
                    "level": entry.get("level") or "",
                    "form": entry.get("form") or "",
                    "theme": entry.get("theme") or "",
                }
            )
    return entries


def course_path(curricula: str, course: str) -> str:
    for candidate in (course, os.path.join(ROOT, course), os.path.join(curricula, course)):
        if os.path.isfile(candidate):
            return os.path.normpath(candidate)
    parts = course.split("-")
    level, lang, track = parts[-1], parts[-2], "-".join(parts[:-2])
    return os.path.join(curricula, lang, track, level.upper() + ".json")


def lesson_code(lesson: dict) -> str:
    match = re.search(r'code:\s*"([^"]+)"', lesson.get("teacher_notes") or "")
    return match.group(1) if match else ""


def match_item(item: str, exact: dict, bare: dict, plain: dict, entries: list[dict],
               level_rank: dict[str, int], course_level: str, max_candidates: int) -> dict:
    key = headword(item)
    if key in exact:
        return {"status": "exact", "entry": exact[key], "candidates": []}
    stripped = without_article(key)
    if stripped in bare:
        return {"status": "normalized", "entry": bare[stripped], "candidates": []}
    plain_key = strip_accents(key)
    if plain_key in plain:
        return {"status": "normalized", "entry": plain[plain_key], "candidates": []}

    scored = []
    first = plain_key[:1]
    for entry in entries:
        candidate = entry["plain"]
        if candidate[:1] != first or len(candidate) < 3:
            continue
        if is_relative(plain_key, candidate):
            level_gap = abs(level_rank.get(entry["level"], 9) - level_rank.get(course_level, 9))
            scored.append((abs(len(candidate) - len(plain_key)), level_gap, entry))
    scored.sort(key=lambda row: (row[0], row[1], row[2]["word"]))
    candidates = [
        {"id": e["id"], "word": e["word"], "level": e["level"]} for _, _, e in scored[:max_candidates]
    ]
    return {"status": "related" if candidates else "missing", "entry": None, "candidates": candidates}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cosydata", required=True)
    parser.add_argument("--curricula", default=os.path.join(ROOT, "curriculums"))
    parser.add_argument("--course", required=True, help="course id (general-fr-b1) or path")
    parser.add_argument("--lang", help="language code; derived from the course id when omitted")
    parser.add_argument("--out-dir", default=os.path.join(ROOT, "docs", "vocab-id-map"))
    parser.add_argument("--max-candidates", type=int, default=3)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    path = course_path(args.curricula, args.course)
    if not os.path.exists(path):
        print(f"missing course: {path}", file=sys.stderr)
        return 2
    parts = os.path.normpath(path).split(os.sep)
    lang = args.lang or parts[-3]
    track, level = parts[-2], parts[-1][:-5].upper()
    course = f"{track}-{lang}-{level.lower()}"

    entries = load_dictionary(args.cosydata, lang)
    if not entries:
        print(f"no dictionary entries for {lang} under {args.cosydata}", file=sys.stderr)
        return 2
    exact = {e["key"]: e for e in entries}
    bare: dict = {}
    plain: dict = {}
    for entry in entries:
        bare.setdefault(entry["bare"], entry)
        plain.setdefault(entry["plain"], entry)
    level_rank = {name: i for i, name in enumerate(["A1", "A2", "B1", "B2", "C1", "C2"])}

    data = json.load(open(path, encoding="utf-8"))
    lessons_out, csv_rows = {}, []
    counts = {"exact": 0, "normalized": 0, "related": 0, "missing": 0}
    level_shift = 0
    for unit in data.get("units", []):
        for lesson in unit.get("lessons") or []:
            key = f"{lang}/{track}/{level}/u{int(unit.get('unit', 0)):02d}-l{int(lesson.get('lesson', 0)):02d}"
            items = []
            for item in lesson.get("vocabulary") or []:
                result = match_item(item, exact, bare, plain, entries, level_rank, level, args.max_candidates)
                counts[result["status"]] += 1
                entry = result["entry"]
                if entry and entry.get("level") and entry["level"] != level:
                    level_shift += 1
                items.append(
                    {
                        "text": item,
                        "status": result["status"],
                        "id": result["entry"]["id"] if result["entry"] else None,
                        "level": result["entry"]["level"] if result["entry"] else None,
                        "alternatives": result["candidates"],
                    }
                )
                csv_rows.append(
                    [
                        unit.get("unit"),
                        lesson.get("lesson"),
                        lesson_code(lesson),
                        item,
                        result["status"],
                        items[-1]["id"] or "",
                        entry["word"] if entry else "",
                        entry["level"] if entry else "",
                        "; ".join(f'{c["id"]} ({c["level"]})' for c in result["candidates"]),
                        "",
                    ]
                )
            lessons_out[key] = {"code": lesson_code(lesson), "items": items}

    total = sum(counts.values())
    summary = {
        "items": total,
        "exact": counts["exact"],
        "normalized": counts["normalized"],
        "related": counts["related"],
        "missing": counts["missing"],
        "resolved_pct": round(100 * (counts["exact"] + counts["normalized"]) / total) if total else 0,
        "different_level": level_shift,
    }
    payload = {
        "course": course,
        "lang": lang,
        "level": level,
        "source": {"cosydata_entries": len(entries), "curriculum": os.path.relpath(path, ROOT)},
        "summary": summary,
        "lessons": lessons_out,
    }

    print(f"{course}: {total} items — exact {counts['exact']}, normalized {counts['normalized']}, "
          f"related {counts['related']}, missing {counts['missing']} "
          f"({summary['resolved_pct']}% resolved)")
    if not args.write:
        print("dry run; re-run with --write to create the artifacts")
        return 0

    os.makedirs(args.out_dir, exist_ok=True)
    json_path = os.path.join(args.out_dir, f"mapping-{course}.json")
    csv_path = os.path.join(args.out_dir, f"review-{course}.csv")
    with open(json_path, "w", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, ensure_ascii=False, indent=1) + "\n")
    with open(csv_path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(
            ["unit", "lesson", "code", "item", "status", "matched_id", "matched_word",
             "matched_level", "candidates", "decision"]
        )
        writer.writerows(csv_rows)
    print(f"wrote {os.path.relpath(json_path, ROOT)} and {os.path.relpath(csv_path, ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
