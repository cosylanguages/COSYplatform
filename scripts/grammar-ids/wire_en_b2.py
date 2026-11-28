"""Give every English B2 lesson two grammar ids.

The curriculum for units 1 to 10 arrived with ids for 98 of its 121 lessons. The rest name their
grammar in free text only, which means slide 5 of their deck has no manual page to embed. The ids
below are chosen from the pages that exist: where the manual had no page for the structure, one was
written first (hedging, agreement, word formation, fronting, ellipsis, nominalisation, reporting verbs,
rhetoric, master review). The second id of each pair is the nearest sibling page, so both slots of the
slide carry a real explanation.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/en/general/B2.json"

IDS = {
    (1, 1): ["en-b2-mandative-subjunctive", "en-b2-hedging-and-diplomatic-stance"],
    (1, 2): ["en-b2-distancing-passive-reporting", "en-b2-passive-verbs-with-two-objects"],
    (1, 18): ["en-b2-subject-predicate-agreement", "en-b2-relative-clauses-review-and-deepening"],
    (1, 24): ["en-b2-suffixes-and-word-formation", "en-b2-nominalisation-and-register"],
    (1, 27): ["en-b2-prefixes-and-negative-forms", "en-b2-compound-nouns"],
    (2, 1): ["en-b2-inversion-after-negative-adverbials", "en-b2-conditional-inversion"],
    (2, 2): ["en-b2-fronting-for-focus", "en-b2-cleft-sentences-and-emphasis"],
    (3, 1): ["en-b2-alternatives-to-if", "en-b2-mixed-conditionals"],
    (3, 2): ["en-b2-participle-clauses", "en-b2-relative-clauses-review-and-deepening"],
    (4, 1): ["en-b2-ellipsis-and-substitution", "en-b2-discourse-markers"],
    (4, 2): ["en-b2-nominalisation-and-register", "en-b2-compound-nouns"],
    (5, 1): ["en-b2-permission-obligation-and-prohibition", "en-b2-formal-vs-informal-register"],
    (5, 2): ["en-b2-whatever-whenever-wherever-whoever-however",
             "en-b2-clauses-of-contrast-purpose-reason-and-result"],
    (6, 1): ["en-b2-gradable-vs-extreme-adjectives", "en-b2-order-of-adjectives"],
    (6, 2): ["en-b2-order-of-adjectives", "en-b2-gradable-vs-extreme-adjectives"],
    (7, 1): ["en-b2-dependent-prepositions-noun-preposition", "en-b2-formal-vs-informal-register"],
    (7, 2): ["en-b2-discourse-markers", "en-b2-formal-vs-informal-register"],
    (8, 1): ["en-b2-verb-object-infinitive-gerund", "en-b2-gerunds-and-infinitives-complex-forms"],
    (8, 2): ["en-b2-mixed-conditionals", "en-b2-mandative-subjunctive"],
    (9, 1): ["en-b2-reporting-verbs-with-prepositions", "en-b2-distancing-passive-reporting"],
    (9, 2): ["en-b2-rhetorical-questioning-and-parallelism", "en-b2-cleft-sentences-and-emphasis"],
    (10, 1): ["en-b2-hedging-and-diplomatic-stance", "en-b2-distancing-passive-reporting"],
    (10, 2): ["en-b2-master-review-and-examination", "en-b2-confusing-grammar-guide"],
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
