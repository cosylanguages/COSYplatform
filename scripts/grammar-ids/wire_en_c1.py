"""Give the English C1 lessons that had no grammar ids their two pages.

The curriculum shipped with ids on 65 of its 94 lessons: the seven vocabulary openers, all seven
"Advanced Grammar" and all seven "Seminar & Debate" lessons had a `grammar` phrase but no id, and unit 8 —
the legacy topics kept when the course was rewritten — had seven lessons citing nothing.

Most of the C1 phrases are the shelf page's own title in other words, so the mapping is nearly literal:
"Advanced Hedging & Academic Stance Devices (It is widely acknowledged that..., would appear to indicate)"
is `advanced-hedging-and-academic-stance-devices`. Two are not: nominalisation has no C1 page (it lives on
the B2 shelf), and the seven legacy lessons teach aspect, the future and the infinitive/gerund systems, which
are B2 and A2 topics. Those cite the page that really teaches them rather than the nearest C1 device.

Every vocabulary opener cites its unit's two devices, because the words in that lesson are the words those
devices need.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/en/general/C1.json"
SHELF = Path("/workspace/COSYmanuals/manuals/en/grammar")
IDS = {
    (1, 1): ["en-c1-advanced-hedging-and-academic-stance-devices", "en-c1-theme-rheme-and-information-packaging"],
    (1, 2): ["en-c1-advanced-hedging-and-academic-stance-devices", "en-c1-theme-rheme-and-information-packaging"],
    (1, 3): ["en-c1-inversion-after-negative-and-limiting-adverbials", "en-c1-mixed-conditionals-for-past-present-hypothesizing"],
    (2, 1): ["en-c1-distancing-passives-and-reporting-structures", "en-c1-mandative-subjunctive-in-formal-legislation-and-mandates"],
    (2, 2): ["en-c1-distancing-passives-and-reporting-structures", "en-c1-mandative-subjunctive-in-formal-legislation-and-mandates"],
    (2, 3): ["en-c1-cleft-sentences-for-emphasis", "en-c1-inverted-conditionals-for-formal-argumentation"],
    (3, 1): ["en-c1-cohesion-ellipsis-and-lexical-substitution", "en-c1-participle-clauses-for-background-information"],
    (3, 2): ["en-c1-cohesion-ellipsis-and-lexical-substitution", "en-c1-participle-clauses-for-background-information"],
    (3, 3): ["en-c1-conditionals-of-concession-and-hypothesis", "en-c1-adverbial-clauses-of-concession-and-proportion"],
    (4, 1): ["en-c1-modality-for-speculation-deduction-and-certainty", "en-c1-advanced-punctuation-mechanics"],
    (4, 2): ["en-c1-modality-for-speculation-deduction-and-certainty", "en-c1-advanced-punctuation-mechanics"],
    (4, 3): ["en-c1-counter-argumentation-and-concessive-rebuttal-clauses", "en-c1-inverted-conditionals-with-should-were-had"],
    (4, 6): ["en-b2-present-tenses-review", "en-b2-past-tenses-review"],
    (5, 1): ["en-c1-advanced-discourse-connectors-and-subordinators", "en-c1-sentence-variety-periodic-loose-and-balanced"],
    (5, 2): ["en-c1-sentence-variety-periodic-loose-and-balanced", "en-c1-advanced-discourse-connectors-and-subordinators"],
    (5, 3): ["en-c1-formulaic-subjunctive-and-formal-hedging-structures", "en-c1-advanced-passive-and-causative-constructions"],
    (6, 1): ["en-c1-conditional-inversion-in-economic-forecasting", "en-c1-fronting-and-end-weight-principle-in-market-analysis"],
    (6, 2): ["en-c1-conditional-inversion-in-economic-forecasting", "en-c1-fronting-and-end-weight-principle-in-market-analysis"],
    (6, 3): ["en-c1-syntactic-fronting-and-passive-reporting", "en-c1-concessive-conditional-clauses"],
    (7, 1): ["en-c1-adverbial-modifier-placement", "en-c1-cleft-sentences-for-emphasis"],
    (7, 2): ["en-b2-nominalisation-and-register", "en-c1-adverbial-modifier-placement"],
    (7, 3): ["en-c1-confusing-grammar-guide", "en-c1-sentence-variety-periodic-loose-and-balanced"],
    (8, 22): ["en-b2-present-tenses-review", "en-a2-review-of-verb-tenses"],
    (8, 25): ["en-b2-present-tenses-review", "en-b1-narrative-tenses"],
    (8, 34): ["en-b2-present-tenses-review", "en-a2-review-of-verb-tenses"],
    (8, 35): ["en-b2-present-tenses-review", "en-b1-narrative-tenses"],
    (8, 37): ["en-b2-other-ways-to-express-future", "en-b2-future-forms-expressing-future-time"],
    (8, 38): ["en-b2-gerunds-and-infinitives-complex-forms", "en-a2-infinitives-and-gerunds"],
    (8, 39): ["en-b2-gerunds-and-infinitives-complex-forms", "en-b2-verb-object-infinitive-gerund"],
}



def main():
    for key, pair in IDS.items():
        for grammar_id in pair:
            level, slug = grammar_id.split("-")[1], grammar_id.split("-", 2)[2]
            if not (SHELF / level / "topics" / f"{slug}.html").exists():
                raise SystemExit(f"no page for {grammar_id} (lesson {key})")

    data = json.loads(CURRICULUM.read_text(encoding="utf-8"))
    wired = 0
    for unit in data["units"]:
        for lesson in unit["lessons"]:
            key = (unit["unit"], lesson["lesson"])
            if key in IDS:
                new = IDS.pop(key)
                if lesson.get("grammarIds") != new:
                    wired += 1
                lesson["grammarIds"] = new
    if IDS:
        raise SystemExit(f"mapping left over: {sorted(IDS)}")

    CURRICULUM.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(l["grammarIds"]) for u in data["units"] for l in u["lessons"])
    missing = sum(1 for u in data["units"] for l in u["lessons"] if not l.get("grammarIds"))
    print(f"{wired} lessons written, {total} ids, {missing} lessons still without ids")


if __name__ == "__main__":
    main()
