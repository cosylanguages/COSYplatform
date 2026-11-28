#!/usr/bin/env python3
"""Measure how much of the taught vocabulary ever leaves its own lesson.

A word that appears in one deck only was met once and never asked about again: that is the
passive-knowledge case. This audit counts, per language, how many curriculum vocabulary items show
up in exactly one deck, and how much of the `recycling` prose is boilerplate.

It is a proxy, not proof: presence in a deck's text does not mean a learner produced it. It is
useful because it is cheap, it runs on every deck, and a word absent from every later deck cannot
possibly have been recycled.
"""

from __future__ import annotations

import argparse
import collections
import glob
import json
import re

TOKEN = re.compile(r"[^\W\d_]+(?:['’][^\W\d_]+)?", re.UNICODE)

GENERIC = (
    "lessico del livello",
    "lessico del modulo precedente",
    "il modulo precedente",
    "vocabulary from the previous",
    "the previous unit",
    "le lexique du niveau",
    "le module précédent",
    "лексика предыдущего",
    "το λεξιλόγιο της προηγούμενης",
)


def language_code(value: str) -> str:
    first = (value or "").strip().split()
    return first[0].lower()[:2] if first else ""


def load_vocabulary() -> dict[str, set[str]]:
    vocab: dict[str, set[str]] = collections.defaultdict(set)
    for path in glob.glob("curriculums/*/*/*.json"):
        language = path.split("/")[1]
        try:
            data = json.load(open(path, encoding="utf-8"))
        except (OSError, ValueError):
            continue
        for unit in data.get("units", []):
            for lesson in unit.get("lessons", []):
                for item in lesson.get("vocabulary") or []:
                    if isinstance(item, str) and item.strip():
                        vocab[language].add(item.lower().strip())
    return vocab


def ngrams(words: list[str], size: int) -> set[str]:
    return {" ".join(words[i:i + size]) for i in range(len(words) - size + 1)}


def deck_items(deck: dict, vocabulary: set[str]) -> set[str]:
    words = TOKEN.findall(json.dumps(deck, ensure_ascii=False).lower())
    found: set[str] = set()
    for size in (1, 2, 3, 4, 5):
        found |= ngrams(words, size) & vocabulary
    return found


def collect() -> dict:
    vocab = load_vocabulary()
    appearances: collections.Counter[tuple[str, str]] = collections.Counter()
    decks_per_language: collections.Counter[str] = collections.Counter()
    prior_texts: collections.Counter[str] = collections.Counter()
    decks = 0

    for path in sorted(glob.glob("lessons/**/*.json", recursive=True)):
        try:
            deck = json.load(open(path, encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if not isinstance(deck, dict) or not deck.get("slides"):
            continue
        decks += 1
        code = language_code(deck.get("language") or path.split("/")[1])
        decks_per_language[code] += 1
        for item in deck_items(deck, vocab.get(code, set())):
            appearances[(code, item)] += 1
        recycling = deck.get("recycling")
        prior = recycling.get("prior", "") if isinstance(recycling, dict) else recycling
        prior = (prior or "").strip()
        prior_texts[prior] += 1

    per_language: dict[str, dict[str, int]] = {}
    totals: collections.Counter[str] = collections.Counter()
    orphans: collections.Counter[str] = collections.Counter()
    buckets: collections.Counter[str] = collections.Counter()
    for (code, _item), count in appearances.items():
        totals[code] += 1
        if count == 1:
            orphans[code] += 1
        buckets["1 deck only" if count == 1 else "2" if count == 2 else "3-4" if count < 5 else "5+"] += 1
        per_language.setdefault(code, {"seen": 0, "orphans": 0})
        per_language[code]["seen"] += 1
        per_language[code]["orphans"] += 1 if count == 1 else 0

    generic = sum(c for text, c in prior_texts.items() if any(g in text.lower() for g in GENERIC))
    return {
        "decks": decks,
        "decks_per_language": dict(decks_per_language),
        "per_language": per_language,
        "totals": totals,
        "orphans": orphans,
        "buckets": buckets,
        "appearances": appearances,
        "prior_values": len(prior_texts),
        "prior_generic": generic,
        "vocabulary_size": {k: len(v) for k, v in vocab.items()},
    }


def render(result: dict) -> str:
    lines = ["# Recycling audit", "",
             "How much of the curriculum vocabulary is asked about after the lesson that introduces it.",
             "A word counted here is one present somewhere in a deck's text; that is a floor, not proof of",
             "learner production. A word **absent** from every later deck cannot have been recycled at all.",
             ""]
    total_seen = sum(result["totals"].values())
    total_orph = sum(result["orphans"].values())
    lines += [f"- decks scanned: **{result['decks']}**",
              f"- curriculum vocabulary items: **{sum(result['vocabulary_size'].values())}** across "
              f"{len(result['vocabulary_size'])} languages",
              f"- items seen in at least one deck: **{total_seen}**",
              f"- items seen in exactly one deck: **{total_orph}** "
              f"({total_orph / total_seen * 100:.1f}%)" if total_seen else "",
              ""]
    if total_seen:
        pct = total_orph / total_seen * 100
        lines += [f"**{pct:.0f}% of the vocabulary is met once and never asked about again.**", ""]

    lines += ["## By language", "",
              "| language | decks | items seen | one deck only | rate |",
              "|---|---|---|---|---|"]
    for code, stats in sorted(result["per_language"].items(), key=lambda kv: -kv[1]["seen"]):
        seen, orph = stats["seen"], stats["orphans"]
        lines.append(f"| {code} | {result['decks_per_language'].get(code, 0)} | {seen} | {orph} | "
                     f"{orph / seen * 100:.0f}% |")
    lines += ["", "## Distribution", "",
              "| appearances | items | share |", "|---|---|---|"]
    for bucket in ("1 deck only", "2", "3-4", "5+"):
        count = result["buckets"].get(bucket, 0)
        lines.append(f"| {bucket} | {count} | {count / total_seen * 100:.1f}% |" if total_seen else "")

    lines += ["", "## The recycling field", "",
              f"- distinct `recycling.prior` strings: **{result['prior_values']}**",
              f"- decks whose prior line is a generic phrase rather than named items: "
              f"**{result['prior_generic']}**", ""]
    if result["prior_values"]:
        share = result["prior_generic"] / max(result["decks"], 1) * 100
        lines.append(f"That is {share:.0f}% of decks pointing at a level or a unit instead of at the "
                     f"words and structures to reactivate, so nothing downstream can check it.")
    lines += ["", "## What this cannot see", "",
              "- it cannot tell recognition from production; a word in an instruction may never be used;",
              "- it counts a word anywhere in the deck, including the vocabulary list that introduces it;",
              "- it says nothing about whether the *question* that carries the word is answerable at that level.", ""]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="write docs/RECYCLING_AUDIT.md")
    args = parser.parse_args()
    result = collect()
    report = render(result)
    if args.write:
        with open("docs/RECYCLING_AUDIT.md", "w", encoding="utf-8") as handle:
            handle.write(report + "\n")
    total_seen = sum(result["totals"].values())
    total_orph = sum(result["orphans"].values())
    print(f"decks {result['decks']} | items seen {total_seen} | one deck only {total_orph} "
          f"({total_orph / total_seen * 100:.1f}%) | generic prior lines {result['prior_generic']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
