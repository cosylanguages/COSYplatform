#!/usr/bin/env python3
"""Build the block registry for a course: every vocabulary item and grammar frame it teaches.

A block is one thing a learner can say - a word, a collocation, a set phrase, or a grammar frame.
The registry gives each block a stable id so that "was this asked about again?" becomes a query
rather than an opinion, and so the retrieval planner can schedule returns.

Ids come from COSYdata where the vocabulary mapping resolved them (`docs/vocab-id-map/`). Where it
did not - Italian B1 resolves 26% - the block gets a provisional `pending:` id, is marked
`unresolved`, and still takes part in planning. A provisional id is replaced, never reused.

Writes `data/chunks/<course>.json`. Nothing else is touched.

Usage:
  python3 scripts/build-chunk-registry.py --course general-it-b1 --write
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import unicodedata
import collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODE_RE = re.compile(r'code:\s*"([^"]+)"')

KIND_BY_WORDS = {1: "word", 2: "collocation"}


def slug(text: str) -> str:
    norm = unicodedata.normalize("NFKD", text.lower())
    norm = "".join(c for c in norm if not unicodedata.combining(c))
    norm = norm.replace("'", "").replace("’", "")
    return re.sub(r"[^a-z0-9]+", "-", norm).strip("-")


def word_count(text: str) -> int:
    return len(re.findall(r"[^\W\d_]+", text, re.UNICODE))


def kind_of(text: str) -> str:
    words = word_count(text)
    return KIND_BY_WORDS.get(words, "set-phrase")


def load_course(course: str) -> tuple[dict, str, str]:
    lang, level = course.split("-")[1], course.split("-")[-1]
    path = os.path.join(ROOT, "curriculums", lang, "general", f"{level.upper()}.json")
    if not os.path.exists(path):
        candidates = glob.glob(os.path.join(ROOT, "curriculums", lang, "*", f"{level.upper()}.json"))
        if not candidates:
            raise SystemExit(f"no curriculum for {course}")
        path = candidates[0]
    return json.load(open(path, encoding="utf-8")), lang, level


def load_mapping(course: str) -> dict[str, dict[str, dict]]:
    """lesson code -> {lowercased text -> mapping entry}"""
    path = os.path.join(ROOT, "docs", "vocab-id-map", f"mapping-{course}.json")
    if not os.path.exists(path):
        return {}
    data = json.load(open(path, encoding="utf-8"))
    out: dict[str, dict[str, dict]] = {}
    for entry in data.get("lessons", {}).values():
        by_text = {}
        for item in entry.get("items", []):
            by_text[item["text"].lower().strip()] = item
        out[entry.get("code", "")] = by_text
    return out


def build(course: str) -> dict:
    curriculum, lang, level = load_course(course)
    mapping = load_mapping(course)
    lessons_out = []
    seen: dict[str, dict] = {}
    number = 0

    for unit in curriculum.get("units", []):
        for lesson in unit.get("lessons", []):
            number += 1
            notes = lesson.get("teacher_notes") or ""
            match = CODE_RE.search(notes)
            code = match.group(1) if match else f"L{number:03d}"
            mapped = mapping.get(code, {})
            introduces = []
            repeats = []

            for text in lesson.get("vocabulary") or []:
                if not isinstance(text, str) or not text.strip():
                    continue
                entry = mapped.get(text.lower().strip(), {})
                if entry.get("id"):
                    block_id = f"cosydata:{entry['id']}"
                    status = entry.get("status", "exact")
                else:
                    block_id = f"pending:{lang}:{slug(text)}"
                    status = "unresolved"
                if block_id in seen:
                    repeats.append(block_id)
                    continue
                block = {
                    "id": block_id,
                    "text": text.strip(),
                    "kind": kind_of(text),
                    "status": status,
                    "source": "vocabulary",
                }
                seen[block_id] = block
                introduces.append(block)

            grammars = lesson.get("grammar") or []
            for index, gid in enumerate(lesson.get("grammarIds") or []):
                label = grammars[index] if index < len(grammars) else gid
                block_id = f"grammar:{gid}"
                block = {
                    "id": block_id,
                    "text": label,
                    "kind": "frame",
                    "status": "grammar-id",
                    "source": "grammarIds",
                }
                if block_id in seen:
                    repeats.append(block_id)
                    continue
                seen[block_id] = block
                introduces.append(block)

            lessons_out.append({
                "number": number,
                "unit": unit.get("unit") or unit.get("number"),
                "code": code,
                "title": lesson.get("title"),
                "introduces": introduces,
                "repeats": repeats,
            })

    blocks = list(seen.values())
    by_kind = collections.Counter(b["kind"] for b in blocks)
    by_status = collections.Counter(b["status"] for b in blocks)
    return {
        "course": course,
        "lang": lang,
        "level": level.upper(),
        "source": {
            "curriculum": f"curriculums/{lang}/general/{level.upper()}.json",
            "vocab_mapping": f"docs/vocab-id-map/mapping-{course}.json" if mapping else None,
        },
        "summary": {
            "lessons": len(lessons_out),
            "blocks": len(blocks),
            "resolved": by_status.get("exact", 0) + by_status.get("normalized", 0),
            "unresolved": by_status.get("unresolved", 0),
            "frames": by_kind.get("frame", 0),
            "repeat_mentions": sum(len(l["repeats"]) for l in lessons_out),
            "by_kind": dict(sorted(by_kind.items())),
            "by_status": dict(sorted(by_status.items())),
            "resolution_pct": round(
                (by_status.get("exact", 0) + by_status.get("normalized", 0)) / len(blocks) * 100
            ) if blocks else 0,
        },
        "lessons": lessons_out,
    }


def render_report(registry: dict) -> str:
    s = registry["summary"]
    lines = [
        f"# Block registry: {registry['course']}",
        "",
        "Every vocabulary item and grammar frame this course teaches, with the id used to schedule",
        "its return. Generated by `scripts/build-chunk-registry.py`; the JSON next to this report is",
        "what the retrieval planner reads.",
        "",
        f"- lessons: **{s['lessons']}**",
        f"- blocks: **{s['blocks']}** ({s['frames']} grammar frames)",
        f"- resolved against COSYdata: **{s['resolved']}** ({s['resolution_pct']}%)",
        f"- unresolved: **{s['unresolved']}**, carrying a provisional `pending:` id",
        f"- blocks the curriculum already repeats in a later lesson: **{s['repeat_mentions']}** "
        f"(accidental recycling, not scheduled)",
        f"- by kind: {', '.join(f'{k} {v}' for k, v in s['by_kind'].items())}",
        "",
        "## Unresolved blocks by lesson",
        "",
        "These exist in the curriculum but not in COSYdata, so they cannot be linked to the vocabulary",
        "manual yet. They are still planned and can still be taught; what they cannot do is be",
        "counted across languages.",
        "",
        "| lesson | code | unresolved blocks |",
        "|---|---|---|",
    ]
    for lesson in registry["lessons"]:
        missing = [b["text"] for b in lesson["introduces"] if b["status"] == "unresolved"]
        if missing:
            lines.append(f"| {lesson['number']} | {lesson['code']} | {', '.join(missing)} |")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--course", required=True, help="e.g. general-it-b1")
    parser.add_argument("--write", action="store_true", help="write data/chunks and the report")
    args = parser.parse_args()

    registry = build(args.course)
    s = registry["summary"]
    print(f"{args.course}: {s['blocks']} blocks, {s['resolved']} resolved ({s['resolution_pct']}%), "
          f"{s['unresolved']} pending, {s['frames']} frames, {s['lessons']} lessons")
    if args.write:
        os.makedirs(os.path.join(ROOT, "data", "chunks"), exist_ok=True)
        out = os.path.join(ROOT, "data", "chunks", f"{args.course}.json")
        with open(out, "w", encoding="utf-8") as handle:
            json.dump(registry, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        report = os.path.join(ROOT, "docs", f"CHUNK_REGISTRY_{args.course}.md")
        with open(report, "w", encoding="utf-8") as handle:
            handle.write(render_report(registry))
        print(f"wrote {out} and {report}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
