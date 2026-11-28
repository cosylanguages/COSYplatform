#!/usr/bin/env python3
"""Audit the lexicon across COSYdata, COSYmanuals and COSYplatform.

Reports the numbers used in docs/cefr-syllabus-and-vocabulary-architecture.md:
vocabulary supply per level, curriculum-vocabulary resolution against the dictionary,
grammar-page utilisation and cross-level recycling.

Usage:
  python3 scripts/audit-lexicon.py --cosydata ../COSYdata --manuals ../COSYmanuals
  python3 scripts/audit-lexicon.py --cosydata ../COSYdata --manuals ../COSYmanuals --json

Exit code is 0 even when gaps exist: this is a report, not a gate. Wire it into CI as a
report first, then turn the thresholds on once the backlog is closed.
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"]
BANDS = ["a0", "a0_a1", "a1", "a2", "b1", "b2", "c1", "c2"]
DEFAULT_LANGS = ["en", "fr", "ru", "it", "el"]


def norm(text: str) -> str:
    text = unicodedata.normalize("NFC", text or "").lower().strip()
    return re.sub(r"\s+", " ", text)


def headword(text: str) -> str:
    """Curriculum items may carry a gloss: 'licenciement (m.)' -> 'licenciement'."""
    return norm(re.split(r"[/(]", text)[0])


def load_entries(path: str) -> list[dict]:
    try:
        data = json.load(open(path, encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    if isinstance(data, dict):
        data = data.get("entries", [])
    return [e for e in data if isinstance(e, dict)]


def data_files(cosydata: str, lang: str, band: str) -> list[str]:
    pattern = os.path.join(cosydata, "vocabulary", lang, band, "**", "*.json")
    return [f for f in glob.glob(pattern, recursive=True) if not f.endswith("index.json")]


def vocab_supply(cosydata: str, langs: list[str]) -> list[dict]:
    rows = []
    for lang in langs:
        for band in BANDS:
            files = data_files(cosydata, lang, band)
            if not files:
                continue
            forms, themes = Counter(), Counter()
            n = 0
            for f in files:
                for e in load_entries(f):
                    n += 1
                    forms[e.get("form")] += 1
                    themes[e.get("theme")] += 1
            idioms = forms.get("idiom", 0)
            rows.append(
                {
                    "lang": lang,
                    "band": band,
                    "files": len(files),
                    "entries": n,
                    "idioms": idioms,
                    "core": n - idioms,
                    "themes": len(themes),
                }
            )
    return rows


def dictionary_words(cosydata: str, lang: str) -> set[str]:
    words: set[str] = set()
    pattern = os.path.join(cosydata, "vocabulary", lang, "**", "*.json")
    for f in glob.glob(pattern, recursive=True):
        if f.endswith("index.json"):
            continue
        for e in load_entries(f):
            words.add(headword(e.get("word") or ""))
    words.discard("")
    return words


def curriculum_files(curricula: str, lang: str) -> list[tuple[str, str, str]]:
    out = []
    pattern = os.path.join(curricula, lang, "*", "*.json")
    for f in glob.glob(pattern):
        if os.sep + "_" in f:
            continue
        level = os.path.basename(f)[:-5].lower()
        track = os.path.basename(os.path.dirname(f))
        if level in LEVELS:
            out.append((level, track, f))
    return sorted(out)


def curriculum_items(path: str) -> list[str]:
    try:
        data = json.load(open(path, encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    items = []
    for unit in data.get("units", []):
        for lesson in unit.get("lessons") or []:
            if isinstance(lesson.get("vocabulary"), list):
                items.extend(lesson["vocabulary"])
    return items


def curriculum_resolution(cosydata: str, curricula: str, langs: list[str]) -> list[dict]:
    rows = []
    for lang in langs:
        words = dictionary_words(cosydata, lang)
        for level, track, path in curriculum_files(curricula, lang):
            items = curriculum_items(path)
            if not items:
                continue
            found = sum(1 for v in items if headword(v) in words)
            rows.append(
                {
                    "lang": lang,
                    "track": track,
                    "level": level,
                    "items": len(items),
                    "found": found,
                    "pct": round(100 * found / len(items)),
                }
            )
    return rows


def manual_pages(manuals: str, lang: str, section: str) -> set[tuple[str, str]]:
    pattern = os.path.join(manuals, "manuals", lang, section, "*", "topics", "*.html")
    out = set()
    for f in glob.glob(pattern):
        level = f.split(os.sep)[-3]
        out.add((level, os.path.basename(f)[:-5]))
    return out


def grammar_ids(curricula: str, lang: str) -> set[tuple[str, str]]:
    refs = set()
    for _, _, path in curriculum_files(curricula, lang):
        try:
            data = json.load(open(path, encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        for unit in data.get("units", []):
            for lesson in unit.get("lessons") or []:
                ids = lesson.get("grammarIds") or []
                if isinstance(ids, str):
                    ids = [ids]
                for gid in ids:
                    m = re.match(r"([a-z]{2})-([a-z0-9]{2})-(.*)", gid or "")
                    if m and m.group(1) == lang:
                        refs.add((m.group(2), m.group(3)))
    return refs


def grammar_usage(manuals: str, curricula: str, langs: list[str]) -> list[dict]:
    rows = []
    for lang in langs:
        pages = manual_pages(manuals, lang, "grammar")
        refs = grammar_ids(curricula, lang)
        rows.append(
            {
                "lang": lang,
                "pages": len(pages),
                "used": len(pages & refs),
                "orphans": len(pages - refs),
                "unresolved": len(refs - pages),
            }
        )
    return rows


def recycling(curricula: str, langs: list[str]) -> list[dict]:
    rows = []
    for lang in langs:
        previous: set[str] = set()
        for level, track, path in curriculum_files(curricula, lang):
            if track != "general":
                continue
            ids = set()
            try:
                data = json.load(open(path, encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            for unit in data.get("units", []):
                for lesson in unit.get("lessons") or []:
                    found = lesson.get("grammarIds") or []
                    if isinstance(found, str):
                        found = [found]
                    ids.update(g for g in found if g)
            rows.append(
                {
                    "lang": lang,
                    "level": level,
                    "distinct": len(ids),
                    "recycled": len(ids & previous),
                }
            )
            previous = ids
    return rows


def table(rows: list[dict], columns: list[tuple[str, str]]) -> str:
    head = "| " + " | ".join(label for _, label in columns) + " |"
    sep = "|" + "|".join("---" for _ in columns) + "|"
    body = [
        "| " + " | ".join(str(r.get(key, "")) for key, _ in columns) + " |" for r in rows
    ]
    return "\n".join([head, sep] + body)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cosydata", required=True, help="path to the COSYdata checkout")
    parser.add_argument("--manuals", required=True, help="path to the COSYmanuals checkout")
    parser.add_argument(
        "--curricula",
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "curriculums"),
        help="path to curriculums/ (defaults to this repository)",
    )
    parser.add_argument("--langs", default=",".join(DEFAULT_LANGS))
    parser.add_argument("--json", action="store_true", help="emit JSON instead of markdown")
    args = parser.parse_args()

    langs = [x.strip() for x in args.langs.split(",") if x.strip()]
    for path, label in [
        (args.cosydata, "COSYdata"),
        (args.manuals, "COSYmanuals"),
        (args.curricula, "curriculums"),
    ]:
        if not os.path.isdir(path):
            print(f"missing {label} directory: {path}", file=sys.stderr)
            return 2

    supply = vocab_supply(args.cosydata, langs)
    resolution = curriculum_resolution(args.cosydata, args.curricula, langs)
    grammar = grammar_usage(args.manuals, args.curricula, langs)
    recycle = recycling(args.curricula, langs)

    if args.json:
        print(
            json.dumps(
                {
                    "vocabulary_supply": supply,
                    "curriculum_resolution": resolution,
                    "grammar_pages": grammar,
                    "grammar_recycling": recycle,
                },
                ensure_ascii=False,
                indent=1,
            )
        )
        return 0

    print("## Vocabulary supply (COSYdata)\n")
    print(
        table(
            supply,
            [
                ("lang", "lang"),
                ("band", "band"),
                ("files", "files"),
                ("entries", "entries"),
                ("idioms", "idioms"),
                ("core", "non-idiom"),
                ("themes", "themes"),
            ],
        )
    )
    print("\n## Curriculum vocabulary resolved in the dictionary\n")
    print(
        table(
            resolution,
            [
                ("lang", "lang"),
                ("track", "track"),
                ("level", "level"),
                ("items", "items"),
                ("found", "in dictionary"),
                ("pct", "%"),
            ],
        )
    )
    print("\n## Grammar pages vs curriculum references\n")
    print(
        table(
            grammar,
            [
                ("lang", "lang"),
                ("pages", "pages"),
                ("used", "referenced"),
                ("orphans", "orphan"),
                ("unresolved", "missing page"),
            ],
        )
    )
    print("\n## Grammar recycling between consecutive levels\n")
    print(
        table(
            recycle,
            [
                ("lang", "lang"),
                ("level", "level"),
                ("distinct", "distinct ids"),
                ("recycled", "recycled from previous"),
            ],
        )
    )
    total_items = sum(r["items"] for r in resolution)
    total_found = sum(r["found"] for r in resolution)
    if total_items:
        print(
            f"\nOverall: {total_found}/{total_items} curriculum vocabulary items resolve "
            f"({round(100 * total_found / total_items)} %)."
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
