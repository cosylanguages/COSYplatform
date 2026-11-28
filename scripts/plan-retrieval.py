#!/usr/bin/env python3
"""Plan which earlier blocks each lesson should ask about.

Reads `data/chunks/<course>.json` (from build-chunk-registry.py) and schedules every block's return
at lesson +offset, so stage 2 of each lesson has a concrete retrieval set instead of a sentence
about "the previous unit".

Offsets are the spacing this method proposes: return at +1 and +2, then once across +3..+7, then
twice more spaced (+8, +12). A block that was introduced too late in the course to collect all its
returns is reported rather than silently dropped.

This script writes nothing into the curriculum or the decks. It prints a plan; the author decides
what stage 2 says. `--write` produces `docs/RETRIEVAL_PLAN_<course>.md` and
`data/chunks/<course>-plan.json`.

Usage:
  python3 scripts/plan-retrieval.py --course general-it-b1 --write
"""

from __future__ import annotations

import argparse
import collections
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFSETS = (1, 2, 4, 8, 12)
DEFAULT_CAP = 8

# Variety. Without these, a lesson whose predecessors were all about the past fills stage 2 with
# eight past-tense questions: correct spacing, unusable lesson.
MAX_PER_SOURCE = 3   # no more than three returns from the same earlier lesson
MAX_PER_DOMAIN = 2   # no more than two from the same domain
MIN_RETURNS = 4      # a stage 2 of two questions is not worth the slot; relax the domain cap to reach this

# A domain is what a block is about, for the purpose of not asking the same thing twice.
DOMAINS = (
    # manner before past: "Gerundio presente e passato" is a manner frame, not a past-tense one
    ("manner", ("gerundio", "mentre", "durante", "pur", "visto", "essendo", "avendo", "participio")),
    ("connector", ("tuttavia", "inoltre", "quindi", "infatti", "invece", "comunque", "dunque",
                   "pertanto", "connettivi")),
    ("subjunctive", ("congiuntivo", "penso che", "credo che", "sebbene", "a meno che", "che io sia")),
    ("future", ("futuro", "domani", "progetto")),
    ("past", ("passato", "imperfetto", "trapassato", "già", "prima", "quando", "dopo che",
              "intanto", "frattempo", "ancora non", "ieri")),
)


def domain_of(block: dict) -> str:
    text = block["text"].lower()
    for name, keywords in DOMAINS:
        if any(k in text for k in keywords):
            return name
    return "frame:" + block["id"].split(":", 1)[-1] if block["id"].startswith("grammar:") else "general"


def load(course: str) -> dict:
    path = os.path.join(ROOT, "data", "chunks", f"{course}.json")
    if not os.path.exists(path):
        raise SystemExit(f"no registry at {path}; run build-chunk-registry.py first")
    return json.load(open(path, encoding="utf-8"))


def plan(registry: dict, cap: int = DEFAULT_CAP) -> dict:
    lessons = registry["lessons"]
    by_number = {lesson["number"]: lesson for lesson in lessons}
    introduced: dict[str, int] = {}
    block_of: dict[str, dict] = {}
    roles = collections.Counter()
    for lesson in lessons:
        for block in lesson["introduces"]:
            roles[block.get("role", "hold")] += 1
            if block.get("role", "hold") != "hold":
                continue  # recognise-only: met once, deliberately not returned
            introduced.setdefault(block["id"], lesson["number"])
            block_of.setdefault(block["id"], block)

    # every scheduled return: lesson -> [(block, intro, ordinal, offset)]
    returns: dict[int, list[tuple[dict, int, int, int]]] = collections.defaultdict(list)
    unscheduled: list[str] = []
    for block_id, intro in introduced.items():
        scheduled_any = False
        for ordinal, offset in enumerate(OFFSETS, start=1):
            target = intro + offset
            if target > len(lessons):
                continue
            returns[target].append((block_of[block_id], intro, ordinal, offset))
            scheduled_any = True
        if not scheduled_any:
            unscheduled.append(block_id)

    demand = sum(len(v) for v in returns.values())

    chosen: dict[int, list[dict]] = {}
    for number in range(1, len(lessons) + 1):
        due = returns.get(number, [])
        # resolved blocks first, then the longest-waiting ones: spacing beats freshness
        due.sort(key=lambda item: (item[0]["status"] == "unresolved", -item[1]))
        selected = []
        taken: set[str] = set()
        per_source: collections.Counter[int] = collections.Counter()
        per_domain: collections.Counter[str] = collections.Counter()
        # First pass respects every cap; second pass relaxes only the domain cap, and only far
        # enough to reach a stage 2 worth running.
        for strict in (True, False):
            for block, intro, ordinal, offset in due:
                if len(selected) >= cap:
                    break
                if not strict and len(selected) >= MIN_RETURNS:
                    break
                if block["id"] in taken or per_source[intro] >= MAX_PER_SOURCE:
                    continue
                domain = domain_of(block)
                if strict and per_domain[domain] >= MAX_PER_DOMAIN:
                    continue
                taken.add(block["id"])
                per_source[intro] += 1
                per_domain[domain] += 1
                selected.append({
                    "id": block["id"],
                    "text": block["text"],
                    "kind": block["kind"],
                    "status": block["status"],
                    "introduced_at": intro,
                    "introduced_in": by_number[intro]["code"],
                    "return_number": ordinal,
                    "offset": offset,
                    "domain": domain,
                })
        chosen[number] = selected

    return {
        "course": registry["course"],
        "lang": registry["lang"],
        "level": registry["level"],
        "plan": [
            {
                "number": lesson["number"],
                "unit": lesson["unit"],
                "code": lesson["code"],
                "title": lesson["title"],
                "introduces": [b["id"] for b in lesson["introduces"]],
                "returns": chosen.get(lesson["number"], []),
            }
            for lesson in lessons
        ],
        "summary": {
            "lessons": len(lessons),
            "blocks": len(introduced),
            "returns_planned": sum(len(v) for v in chosen.values()),
            "cap": cap,
            "hold_blocks": len(introduced),
            "recognise_blocks": roles.get("recognise", 0),
            "lessons_at_cap": sum(1 for v in chosen.values() if len(v) >= cap),
            "lessons_empty": sum(1 for n in range(1, len(lessons) + 1) if not chosen.get(n)),
            "blocks_never_returned": len(unscheduled),
            "returns_due": demand,
            "returns_skipped": demand - sum(len(v) for v in chosen.values()),
            "slots": cap * max(len(lessons) - 1, 0),
            "capacity_blocks": (cap * max(len(lessons) - 1, 0)) // len(OFFSETS),
            "blocks_per_lesson": round(len(introduced) / max(len(lessons), 1), 1),
            "unresolved_in_plan": sum(
                1 for items in chosen.values() for item in items if item["status"] == "unresolved"
            ),
        },
    }


def render(result: dict) -> str:
    s = result["summary"]
    lines = [
        f"# Retrieval plan: {result['course']}",
        "",
        "What each lesson should ask the learner to reactivate, computed from the block registry.",
        "Spacing: return at +1, +2, then +4, +8, +12 lessons. Eight questions per lesson at most,",
        "Resolved blocks and the longest-waiting ones first, with variety caps: at most three",
        "returns from any one earlier lesson and at most two from any one domain, so stage 2 does",
        "not become eight past-tense questions in a row. This is an input to authoring stage 2, not",
        "a substitute for it: a row here is a block to ask about, the question still has to be written.",
        "",
        f"- lessons: **{s['lessons']}**, blocks: **{s['blocks']}**",
        f"- scheduled returns: **{s['returns_planned']}**",
        f"- hold blocks: **{s['hold_blocks']}**, recognise-only: **{s['recognise_blocks']}**",
        f"- lessons at the cap of {s['cap']}: **{s['lessons_at_cap']}**",
        f"- lessons with nothing due: **{s['lessons_empty']}**",
        f"- blocks introduced too late to return: **{s['blocks_never_returned']}**",
        f"- unresolved blocks appearing in the plan: **{s['unresolved_in_plan']}** "
        f"(teachable, but not yet linked to COSYdata)",
        "",
        f"## Capacity: what {s['cap']} questions a lesson can carry",
        "",
        f"This course introduces **{s['blocks_per_lesson']} blocks per lesson**. The method returns each",
        f"block five times, so it needs **{s['returns_due']}** returns; the schedule has room for",
        f"**{s['slots']}** ({s['cap']} per lesson), which honours **{s['returns_planned']}** and defers",
        f"**{s['returns_skipped']}**. A course of this length can hold roughly",
        f"**{s['capacity_blocks']}** blocks at this budget.",
        "",
        "That gap is not a bug in the planner, it is the arithmetic of the method: the current item load",
        "is more than a retrieval slot of this size can sustain, which is the mechanical reason",
        "a third of the vocabulary is never asked about again. Only hold blocks are scheduled here;",
        "recognise-only blocks are deliberately not returned. The remaining gap has three answers: the",
        "load comes down, the slot grows, or the triage gets stricter.",
        "",
        "### What different budgets would carry",
        "",
        "| questions per lesson | returns per block | blocks this course could hold |",
        "|---|---|---|",
        *[
            f"| {cap} | {rets} | {(cap * max(s['lessons'] - 1, 0)) // rets} |"
            for cap, rets in ((5, 5), (8, 5), (10, 5), (15, 5), (10, 3), (15, 3))
        ],
        "",
        "## Every lesson",
        "",
        "| # | lesson | introduces | returns |",
        "|---|---|---|---|",
    ]
    for row in result["plan"]:
        returns = "; ".join(f"{r['text']} (+{r['offset']})" for r in row["returns"]) or "—"
        lines.append(f"| {row['number']} | {row['title']} | {len(row['introduces'])} | {returns} |")

    lines += ["", "## First unit in detail", ""]
    for row in result["plan"]:
        if row["unit"] != 1:
            continue
        lines += [f"### {row['number']}. {row['title']}", ""]
        if not row["returns"]:
            lines.append("- nothing due: this lesson is an introduction only")
        for r in row["returns"]:
            lines.append(
                f"- **{r['text']}** ({r['kind']}, from {r['introduced_in']}, "
                f"return {r['return_number']}, +{r['offset']}) — {r['status']}"
            )
        lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--course", required=True)
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--cap", type=int, default=DEFAULT_CAP,
                        help=f"retrieval questions per lesson (default {DEFAULT_CAP})")
    args = parser.parse_args()
    result = plan(load(args.course), args.cap)
    s = result["summary"]
    print(f"{result['course']}: {s['returns_planned']} returns across {s['lessons']} lessons | "
          f"at cap {s['lessons_at_cap']} | empty {s['lessons_empty']} | "
          f"never returned {s['blocks_never_returned']} | unresolved in plan {s['unresolved_in_plan']}")
    if args.write:
        with open(os.path.join(ROOT, "data", "chunks", f"{args.course}-plan.json"), "w",
                  encoding="utf-8") as handle:
            json.dump(result, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        with open(os.path.join(ROOT, "docs", f"RETRIEVAL_PLAN_{args.course}.md"), "w",
                  encoding="utf-8") as handle:
            handle.write(render(result) + "\n")
        print(f"wrote data/chunks/{args.course}-plan.json and docs/RETRIEVAL_PLAN_{args.course}.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
