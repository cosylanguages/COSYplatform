#!/usr/bin/env python3
"""Convert legacy cosy-* XML lessons into the JSON deck shape the platform reads.

The XML shelf (455 roadmap entries: spoken-en-b1 226, cinema-en-b1 106, ...) carries real lesson
content but no JSON metadata, so no audit reaches it. This converter is the first half of the
migration: it moves the content faithfully and reports what it cannot carry.

Faithfulness is enforced, not assumed. For every file the converter compares the normalised text
of the XML with the normalised text of the JSON it produced; only emphasis markers may differ.
A file whose text does not match is reported as a failure, never written.

Structure that has no JSON equivalent (the rare quiz tags: 4 to 14 occurrences across 456 files)
is downgraded to an instruction with its text intact, and counted in the report so the loss is
visible rather than silent.

Usage:
  python3 scripts/xml-lesson-to-json.py --dry-run            # report only
  python3 scripts/xml-lesson-to-json.py --dry-run --write    # docs/XML_MIGRATION_DRY_RUN.md
  python3 scripts/xml-lesson-to-json.py --convert lessons/spoken-en/4-day-work-week.xml --out /tmp
"""
from __future__ import annotations

import argparse
import collections
import glob
import html
import json
import os
import re
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BLOCK_TAGS = {"p", "div"}

# The XML shelf names stages its own way; progress tracking expects the platform vocabulary
# (adaptation, warm-up, cool-down, freer-practice, recycling, input, pronunciation, grammar,
# reading-listening, controlled-practice). The three discussion rounds are the judgement call:
# round-1 is the tighter task, round-2 and speak-together are the looser ones.
STAGE_MAP = {
    "warm-up": "warm-up",
    "lead-in": "warm-up",
    "aloha-intro": "warm-up",
    "teacher-guide": "input",
    "round-1": "controlled-practice",
    "round-2": "freer-practice",
    "speak-together": "freer-practice",
    "error-correction": "recycling",
    "cool-down": "cool-down",
    "adaptation": "adaptation",
    "controlled-practice": "controlled-practice",
    "freer-practice": "freer-practice",
    "recycling": "recycling",
    "input": "input",
    "pronunciation": "pronunciation",
    "grammar": "grammar",
    "reading-listening": "reading-listening",
    "grammar-practice": "grammar",
}
DROP_TAGS = {"cosy-lesson", "cosy-slide"}


def _text(node: ET.Element) -> str:
    """Text of a node and its descendants; children separated, tails kept."""
    parts = [node.text or ""]
    for child in node:
        parts.append(_node(child))
        parts.append(child.tail or "")
    return "".join(parts).strip()


def _node(node: ET.Element) -> str:
    tag = node.tag if isinstance(node.tag, str) else ""
    if tag == "br":
        return "\n"
    if tag == "strong":
        return f"**{_text(node)}**"
    if tag == "em":
        return f"*{_text(node)}*"
    if tag == "cosy-text":
        kind = (node.get("type") or "").lower()
        inner = _text(node)
        return f"**{inner}**" if kind == "strong" else f"*{inner}*" if kind else inner
    if tag in ("ol", "ul"):
        lines = []
        ordered = tag == "ol"
        for number, item in enumerate([c for c in node if c.tag == "li"], start=1):
            marker = f"{number}. " if ordered else "- "
            body = _text(item).splitlines() or [""]
            lines.append(marker + body[0])
            lines.extend("   " + extra for extra in body[1:])
        return "\n".join(lines) + "\n" if lines else _text(node)
    if tag in ("p", "div"):
        return "\n" + _text(node) + "\n"
    return _text(node)


def render(element: ET.Element) -> str:
    """Render one XML subtree as the text the JSON `content` field holds."""
    if not len(element):
        return (element.text or "").strip()
    parts = [element.text or ""]
    for child in element:
        parts.append(_node(child))
        parts.append(child.tail or "")
    text = "".join(parts)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def unmarkered(text: str) -> str:
    """Drop the list markers the converter adds, so parity compares the words only."""
    return re.sub(r"(?m)^[ \t]*(?:\d+\.|-)[ \t]+", "", text)


def strip_markup(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("**", "").replace("*", "")).strip()


def convert(path: str, unit: str | None = None) -> dict:
    tree = ET.parse(path)
    root = tree.getroot()
    slides = []
    for index, slide in enumerate(root.findall("cosy-slide"), start=1):
        elements = []
        for child in slide:
            tag = child.tag if isinstance(child.tag, str) else ""
            content = render(child)
            if not content:
                continue
            if tag == "cosy-blockquote":
                elements.append({"type": "blockquote", "content": content})
            else:
                elements.append({"type": "instruction", "content": content})
        slides.append({
            "id": f"{root.get('id')}-slide-{index}",
            "title": slide.get("title") or f"{index}. {slide.get('stage', 'stage').title()}",
            "stage": STAGE_MAP.get(slide.get("stage") or "", slide.get("stage") or "input"),
            "duration": int(slide.get("duration") or 0) or 10,
            "mode": slide.get("mode") or root.get("default-mode") or "all",
            "elements": elements,
        })
    deck = {
        "id": root.get("id"),
        "title": root.get("title"),
        "level": (root.get("level") or "").upper(),
        "language": root.get("language"),
        "defaultDuration": int(root.get("default-duration") or 0) or 50,
        "defaultMode": root.get("default-mode") or "all",
        "slides": slides,
    }
    if unit:
        deck["unit"] = unit
    return deck


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="convert in memory and report")
    parser.add_argument("--write", nargs="?", const=os.path.join(ROOT, "docs", "XML_MIGRATION_DRY_RUN.md"))
    parser.add_argument("--convert", nargs="+", help="specific XML files to convert")
    parser.add_argument("--out", help="directory to write converted JSON into")
    args = parser.parse_args()

    paths = args.convert or sorted(glob.glob(os.path.join(ROOT, "lessons", "**", "*.xml"), recursive=True))
    ok = failed = 0
    element_types: collections.Counter = collections.Counter()
    stage_counts: collections.Counter = collections.Counter()
    downgraded: collections.Counter = collections.Counter()
    text_mismatch: list[tuple[str, str, str]] = []
    parse_errors: list[tuple[str, str]] = []
    converted: list[tuple[str, dict]] = []

    for path in paths:
        try:
            deck = convert(path)
        except ET.ParseError as error:
            parse_errors.append((os.path.relpath(path, ROOT), str(error)))
            failed += 1
            continue
        source = open(path, encoding="utf-8", errors="ignore").read()
        source_text = strip_markup(unmarkered(html.unescape(re.sub(r"<[^>]+>", " ", source))))
        target_text = strip_markup(unmarkered("\n".join(
            el.get("content", "") for slide in deck["slides"] for el in slide["elements"])))
        if source_text.replace(" ", "") != target_text.replace(" ", ""):
            text_mismatch.append((os.path.relpath(path, ROOT), source_text[:80], target_text[:80]))
            failed += 1
            continue
        for slide in deck["slides"]:
            stage_counts[slide["stage"]] += 1
            for element in slide["elements"]:
                element_types[element["type"]] += 1
        for tag in set(re.findall(r"<(cosy-(?:select|test|choice|vocabulary|dnd)[a-z-]*)", source)):
            downgraded[tag] += 1
        ok += 1
        converted.append((path, deck))

    if args.out:
        os.makedirs(args.out, exist_ok=True)
        for path, deck in converted:
            name = os.path.splitext(os.path.basename(path))[0] + ".json"
            with open(os.path.join(args.out, name), "w", encoding="utf-8") as handle:
                json.dump(deck, handle, ensure_ascii=False, indent=2)
        print(f"wrote {len(converted)} decks to {args.out}")

    lines = [
        "# XML to JSON migration, dry run",
        "",
        "Generated by `scripts/xml-lesson-to-json.py`; regenerate, do not edit.",
        "",
        f"- files attempted: {len(paths)}",
        f"- converted with identical text: {ok}",
        f"- failed (parse error or text mismatch): {failed}",
        "",
        "Text parity means the normalised text of the XML and of the produced JSON are equal character",
        "for character once emphasis markers and list markers are removed. A file that fails this test",
        "is not written.",
        "",
        "## What the JSON still does not carry",
        "",
        "The XML holds `id`, `title`, `level`, `language`, `default-duration` and `default-mode`, and the",
        "converter carries all six, and it maps the XML stage names onto the platform vocabulary",
        "(`round-1` to controlled-practice, `error-correction` to recycling, and so on). It does not",
        "hold a can-do, a unit name, a unit theme or grammar ids,",
        "so a converted deck is content-complete and metadata-poor: it cannot pass the can-do audit and",
        "contributes nothing to the slot grid until those four are authored. Conversion is the floor,",
        "not the finish line.",
        "",
        "## Elements produced",
        "",
        "| element type | count |",
        "|---|---|",
    ]
    for kind, count in element_types.most_common():
        lines.append(f"| {kind} | {count} |")
    lines += ["", "## Slides by stage", "", "| stage | count |", "|---|---|"]
    for stage, count in stage_counts.most_common():
        lines.append(f"| {stage} | {count} |")
    lines += ["", "## Structure downgraded to an instruction", "",
              "These XML tags are quizzes or vocabulary widgets. They keep their text but lose their",
              "interactivity unless mapped by hand afterwards.", "",
              "| tag | occurrences |", "|---|---|"]
    if downgraded:
        for tag, count in downgraded.most_common():
            lines.append(f"| {tag} | {count} |")
    else:
        lines.append("| none | 0 |")
    if parse_errors:
        lines += ["", "## Parse errors", ""]
        for name, error in parse_errors[:20]:
            lines.append(f"- `{name}` - {error}")
    if text_mismatch:
        lines += ["", "## Text mismatches", ""]
        for name, got, exp in text_mismatch[:20]:
            lines.append(f"- `{name}` - xml starts `{got}` / json starts `{exp}`")

    text = "\n".join(lines) + "\n"
    if args.write:
        with open(args.write, "w", encoding="utf-8") as handle:
            handle.write(text)
        print(f"wrote {os.path.relpath(args.write, ROOT)}")
    elif not args.out:
        print(text)
    print(f"attempted {len(paths)} | converted {ok} | failed {failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
