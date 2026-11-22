#!/usr/bin/env python3
"""Add a "Grammar Focus" slide to lesson files that already link a manual grammar topic.

Existing lessons carry `links.grammar: [{"topic_id": "to-be", ...}]` (the slug of a
COSYmanuals grammar page). This resolves each topic_id to a registry id
(`<lang>-<level>-<slug>`) and inserts one slide with a `grammar-focus` element per
resolved id, right after the lesson's input slide.

Resolution: same level first, then the nearest higher level (an A0 lesson uses the
A1 manual page). Topics with no page in the registry are reported and skipped.

Safe to re-run: ids already shown by a grammar-focus element are not added again.
Files are rewritten only if their exact formatting (compact JSON) can be reproduced.

Usage:
  add_grammar_focus.py --manuals ../cosymanuals --lessons lessons [--dry-run]
"""
import argparse, json, sys
from pathlib import Path

LEVELS = ["a0", "a1", "a2", "b1", "b2", "c1", "c2"]


def load_registry(manuals):
    reg = json.load(open(Path(manuals) / "data" / "grammar-points.json", encoding="utf-8"))
    return {p["id"] for p in reg["points"]}


def resolve(reg, lang, level, topic_id):
    level = (level or "a1").lower()
    start = LEVELS.index(level) if level in LEVELS else 1
    for lv in LEVELS[start:] + LEVELS[:start][::-1]:
        cand = f"{lang}-{lv}-{topic_id}"
        if cand in reg:
            return cand
    return None


def detect_format(raw, data):
    for ea in (True, False):
        for nl in ("", "\n"):
            if json.dumps(data, separators=(",", ":"), ensure_ascii=ea) + nl == raw:
                return ea, nl
    return None


def existing_focus_ids(data):
    return {e.get("grammarId") for s in data.get("slides", []) for e in s.get("elements", [])
            if e.get("type") == "grammar-focus"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manuals", required=True)
    ap.add_argument("--lessons", required=True)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    reg = load_registry(a.manuals)
    changed = skipped_format = 0
    dangling = []
    for f in sorted(Path(a.lessons).rglob("*.json")):
        raw = f.read_text(encoding="utf-8")
        try:
            data = json.loads(raw)
        except ValueError:
            continue
        if not isinstance(data, dict) or "slides" not in data:
            continue
        topics = (data.get("links") or {}).get("grammar") or []
        ids = []
        for t in topics:
            tid = t.get("topic_id") if isinstance(t, dict) else t
            if not isinstance(tid, str):
                continue
            gid = resolve(reg, data.get("language", "en"), data.get("level"), tid)
            if gid is None:
                dangling.append((str(f), tid))
            elif gid not in ids and gid not in existing_focus_ids(data):
                ids.append(gid)
        if not ids:
            continue
        fmt = detect_format(raw, data)
        if fmt is None:
            skipped_format += 1
            print(f"SKIP (format not reproducible): {f}", file=sys.stderr)
            continue
        slides = data["slides"]
        pos = max((i for i, s in enumerate(slides) if s.get("stage") == "input"), default=0)
        base = slides[pos] if slides else {}
        slide = {
            "id": f"{data.get('id', f.stem)}-slide-grammar",
            "title": "Grammar Focus",
            "stage": "input",
            "duration": base.get("duration", data.get("defaultDuration", 50)),
            "mode": base.get("mode", data.get("defaultMode", "all")),
            "elements": [{"type": "grammar-focus", "grammarId": g} for g in ids],
        }
        slides.insert(pos + 1, slide)
        changed += 1
        print(f"{'would add' if a.dry_run else 'added'} {ids} -> {f}")
        if not a.dry_run:
            f.write_text(json.dumps(data, separators=(",", ":"), ensure_ascii=fmt[0]) + fmt[1], encoding="utf-8")
    print(f"lessons changed: {changed} | unresolved topics: {len(dangling)} | skipped (format): {skipped_format}")
    for p, t in dangling:
        print(f"  unresolved: {t}  ({p})")


if __name__ == "__main__":
    main()
