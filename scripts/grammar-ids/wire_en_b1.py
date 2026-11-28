"""Give every English B1 lesson two grammar ids.

Twenty-two lessons in curriculums/en/general/B1.json name their grammar in free text only, so slide 5
of their deck has no manual page to embed. Each pair below points at pages that exist, preferring the
B1 shelf and stepping down to A2 for gerunds and infinitives and up to B2 for participle clauses and
noun prepositions, where the fuller treatment lives. Reading lessons such as Climate Change take the
grammar their unit actually teaches, which is what the lesson recycles in practice.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/en/general/B1.json"

IDS = {
    (1, 11): ["en-b1-passive-simple-and-future-tenses", "en-b1-can-could-be-able-to"],
    (1, 20): ["en-b1-can-could-be-able-to", "en-b1-have-to-must-should-had-better"],
    (3, 6): ["en-b1-reported-speech-statements", "en-b1-reporting-verbs"],
    (3, 10): ["en-b2-suffixes-and-word-formation", "en-b2-compound-nouns"],
    (3, 11): ["en-b2-suffixes-and-word-formation", "en-b2-prefixes-and-negative-forms"],
    (4, 6): ["en-b1-passive-with-modals", "en-b1-third-conditional"],
    (4, 9): ["en-b2-compound-nouns", "en-b1-articles-deeper-rules"],
    (4, 11): ["en-a2-infinitives-and-gerunds", "en-b1-verb-preposition"],
    (4, 12): ["en-a2-infinitives-and-gerunds", "en-b1-verb-preposition"],
    (4, 13): ["en-a2-infinitives-and-gerunds", "en-b2-verb-object-infinitive-gerund"],
    (4, 14): ["en-b2-verb-object-infinitive-gerund", "en-b2-gerunds-and-infinitives-complex-forms"],
    (4, 16): ["en-a2-so-neither", "en-b1-all-both-either-neither-none"],
    (4, 17): ["en-b2-verb-object-infinitive-gerund", "en-b1-verbs-of-the-senses"],
    (4, 18): ["en-b1-modifying-comparatives", "en-a2-as-as"],
    (4, 20): ["en-b2-gerunds-and-infinitives-complex-forms", "en-a2-infinitives-and-gerunds"],
    (4, 23): ["en-b2-dependent-prepositions-noun-preposition", "en-b1-adjective-preposition"],
    (6, 5): ["en-b2-participle-clauses", "en-b1-verbs-of-the-senses"],
    (10, 2): ["en-b1-narrative-tenses", "en-b1-confusing-grammar-guide"],
    (11, 9): ["en-b1-modifying-comparatives", "en-b1-all-both-either-neither-none"],
    (11, 18): ["en-b1-have-to-must-should-had-better", "en-b1-would-rather-would-sooner"],
    (11, 28): ["en-b1-future-forms-review", "en-b1-third-conditional"],
    (11, 38): ["en-b1-wish-if-only", "en-b1-third-conditional"],
}


def main():
    data = json.loads(CURRICULUM.read_text(encoding="utf-8"))
    wired = 0
    for unit in data["units"]:
        for lesson in unit["lessons"]:
            key = (unit["unit"], lesson["lesson"])
            if lesson.get("grammarIds") or key not in IDS:
                continue
            lesson["grammarIds"] = IDS.pop(key)
            wired += 1
    if IDS:
        raise SystemExit(f"no lesson matched: {sorted(IDS)}")
    CURRICULUM.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(l.get("grammarIds") or []) for u in data["units"] for l in u["lessons"])
    print(f"wired {wired} lessons · {total} ids")


if __name__ == "__main__":
    main()
