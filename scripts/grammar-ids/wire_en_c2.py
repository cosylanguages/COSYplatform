"""Give all 65 English C2 lessons their grammar ids.

C2 had none: the curriculum is complete — thirteen modules of five lessons, the same shape as the Russian C2
course — but no lesson cited a page, so nothing could be built. The shelf holds 20 pages, each of them narrow:
litotes and double negatives, end-weight and heavy-NP shift, exact scope control, extraposition of clausal
subjects, redundant infinitive and gerund clauses, register switching, parenthetical qualification.

Every lesson cites the C2 page that carries its device and a C1 page for the grammar underneath, so a C2 deck
never floats free of a rule. All 20 C2 pages are used, and the third one — the confusing-grammar guide, an
index page rather than a topic — carries the three consolidation lessons of module 13.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/en/general/C2.json"
SHELF = Path("/workspace/COSYmanuals/manuals/en/grammar")
IDS = {
    (1, 1): ["en-c2-litotes-double-negatives-and-philosophical-stance", "en-c2-literary-and-formal-sentence-patterns"],
    (1, 2): ["en-c2-rhetorical-fronting-and-inversion-for-effect", "en-c2-polyphonic-sentence-rhythm-and-stylistic-cadence"],
    (1, 3): ["en-c2-polyphonic-sentence-rhythm-and-stylistic-cadence", "en-c2-rhetorical-fronting-and-inversion-for-effect"],
    (1, 4): ["en-c2-literary-and-formal-sentence-patterns", "en-c1-cohesion-ellipsis-and-lexical-substitution"],
    (1, 5): ["en-c2-literary-and-formal-sentence-patterns", "en-c2-parenthetical-qualification-mechanics"],
    (2, 1): ["en-c2-stylistic-register-switching-and-tonal-control", "en-c1-advanced-hedging-and-academic-stance-devices"],
    (2, 2): ["en-c2-stylistic-register-switching-and-tonal-control", "en-c2-near-native-information-packaging-and-focal-adjustments"],
    (2, 3): ["en-c2-rhetorical-fronting-and-inversion-for-effect", "en-c1-cleft-sentences-for-emphasis"],
    (2, 4): ["en-c2-near-native-information-packaging-and-focal-adjustments", "en-c1-counter-argumentation-and-concessive-rebuttal-clauses"],
    (2, 5): ["en-c2-polyphonic-sentence-rhythm-and-stylistic-cadence", "en-c2-stylistic-register-switching-and-tonal-control"],
    (3, 1): ["en-c2-litotes-double-negatives-and-philosophical-stance", "en-c1-modality-for-speculation-deduction-and-certainty"],
    (3, 2): ["en-c2-litotes-double-negatives-and-philosophical-stance", "en-c1-modality-for-speculation-deduction-and-certainty"],
    (3, 3): ["en-c2-nominalisation-for-academic-and-executive-density", "en-c2-parenthetical-qualification-mechanics"],
    (3, 4): ["en-c2-complex-conditionality-in-statutory-drafting", "en-c1-inverted-conditionals-with-should-were-had"],
    (3, 5): ["en-c2-parenthetical-qualification-mechanics", "en-c1-advanced-punctuation-mechanics"],
    (4, 1): ["en-c2-advanced-hedging-modality-in-high-stakes-negotiations", "en-c1-distancing-passives-and-reporting-structures"],
    (4, 2): ["en-c2-advanced-hedging-modality-in-high-stakes-negotiations", "en-c2-infinitive-and-gerund-reduced-clauses"],
    (4, 3): ["en-c2-inverted-third-conditionals-and-mixed-hypotheticals", "en-c1-conditional-inversion-in-economic-forecasting"],
    (4, 4): ["en-c2-advanced-hedging-modality-in-high-stakes-negotiations", "en-c2-self-correction-and-real-time-hedging-structures"],
    (4, 5): ["en-c2-self-correction-and-real-time-hedging-structures", "en-c1-formulaic-subjunctive-and-formal-hedging-structures"],
    (5, 1): ["en-c2-legal-syntax-mechanics-and-archaic-adverbs", "en-c1-mandative-subjunctive-in-formal-legislation-and-mandates"],
    (5, 2): ["en-c2-legal-syntax-mechanics-and-archaic-adverbs", "en-c2-complex-conditionality-in-statutory-drafting"],
    (5, 3): ["en-c2-complex-conditionality-in-statutory-drafting", "en-c2-legal-syntax-mechanics-and-archaic-adverbs"],
    (5, 4): ["en-c2-legal-syntax-mechanics-and-archaic-adverbs", "en-c2-nominalisation-for-academic-and-executive-density"],
    (5, 5): ["en-c2-legal-syntax-mechanics-and-archaic-adverbs", "en-c2-parenthetical-qualification-mechanics"],
    (6, 1): ["en-c2-literary-and-formal-sentence-patterns", "en-c2-litotes-double-negatives-and-philosophical-stance"],
    (6, 2): ["en-c2-stylistic-register-switching-and-tonal-control", "en-c2-polyphonic-sentence-rhythm-and-stylistic-cadence"],
    (6, 3): ["en-c2-literary-and-formal-sentence-patterns", "en-c2-polyphonic-sentence-rhythm-and-stylistic-cadence"],
    (6, 4): ["en-c2-litotes-double-negatives-and-philosophical-stance", "en-c2-parenthetical-qualification-mechanics"],
    (6, 5): ["en-c2-stylistic-register-switching-and-tonal-control", "en-c2-nominalisation-for-academic-and-executive-density"],
    (7, 1): ["en-c2-exact-scope-control-with-focus-adverbs", "en-c2-subtle-scope-shifts-in-modifier-placement"],
    (7, 2): ["en-c2-exact-scope-control-with-focus-adverbs", "en-c2-subtle-scope-shifts-in-modifier-placement"],
    (7, 3): ["en-c2-exact-scope-control-with-focus-adverbs", "en-c2-ellipsis-and-substitution-for-native-like-economy"],
    (7, 4): ["en-c2-exact-scope-control-with-focus-adverbs", "en-c2-subtle-scope-shifts-in-modifier-placement"],
    (7, 5): ["en-c2-stylistic-register-switching-and-tonal-control", "en-c2-self-correction-and-real-time-hedging-structures"],
    (8, 1): ["en-c2-inverted-third-conditionals-and-mixed-hypotheticals", "en-c2-nominalisation-for-academic-and-executive-density"],
    (8, 2): ["en-c2-inverted-third-conditionals-and-mixed-hypotheticals", "en-c2-complex-conditionality-in-statutory-drafting"],
    (8, 3): ["en-c2-inverted-third-conditionals-and-mixed-hypotheticals", "en-c1-conditional-inversion-in-economic-forecasting"],
    (8, 4): ["en-c2-nominalisation-for-academic-and-executive-density", "en-c2-advanced-hedging-modality-in-high-stakes-negotiations"],
    (8, 5): ["en-c2-near-native-information-packaging-and-focal-adjustments", "en-c1-fronting-and-end-weight-principle-in-market-analysis"],
    (9, 1): ["en-c2-end-weight-principle-and-heavy-np-shift", "en-c2-extraposition-of-clausal-subjects"],
    (9, 2): ["en-c2-end-weight-principle-and-heavy-np-shift", "en-c2-extraposition-of-clausal-subjects"],
    (9, 3): ["en-c2-extraposition-of-clausal-subjects", "en-c2-near-native-information-packaging-and-focal-adjustments"],
    (9, 4): ["en-c2-complex-conditionality-in-statutory-drafting", "en-c1-mandative-subjunctive-in-formal-legislation-and-mandates"],
    (9, 5): ["en-c2-complex-conditionality-in-statutory-drafting", "en-c1-mandative-subjunctive-in-formal-legislation-and-mandates"],
    (10, 1): ["en-c2-stylistic-register-switching-and-tonal-control", "en-c2-ellipsis-and-substitution-for-native-like-economy"],
    (10, 2): ["en-c2-ellipsis-and-substitution-for-native-like-economy", "en-c2-near-native-information-packaging-and-focal-adjustments"],
    (10, 3): ["en-c2-self-correction-and-real-time-hedging-structures", "en-c2-stylistic-register-switching-and-tonal-control"],
    (10, 4): ["en-c2-stylistic-register-switching-and-tonal-control", "en-c2-parenthetical-qualification-mechanics"],
    (10, 5): ["en-c2-near-native-information-packaging-and-focal-adjustments", "en-c2-ellipsis-and-substitution-for-native-like-economy"],
    (11, 1): ["en-c2-nominalisation-for-academic-and-executive-density", "en-c1-advanced-hedging-and-academic-stance-devices"],
    (11, 2): ["en-c2-polyphonic-sentence-rhythm-and-stylistic-cadence", "en-c2-literary-and-formal-sentence-patterns"],
    (11, 3): ["en-c2-self-correction-and-real-time-hedging-structures", "en-c2-ellipsis-and-substitution-for-native-like-economy"],
    (11, 4): ["en-c2-polyphonic-sentence-rhythm-and-stylistic-cadence", "en-c2-stylistic-register-switching-and-tonal-control"],
    (11, 5): ["en-c2-literary-and-formal-sentence-patterns", "en-c2-litotes-double-negatives-and-philosophical-stance"],
    (12, 1): ["en-c2-nominalisation-for-academic-and-executive-density", "en-c2-advanced-hedging-modality-in-high-stakes-negotiations"],
    (12, 2): ["en-c2-nominalisation-for-academic-and-executive-density", "en-c1-advanced-passive-and-causative-constructions"],
    (12, 3): ["en-c2-parenthetical-qualification-mechanics", "en-c2-self-correction-and-real-time-hedging-structures"],
    (12, 4): ["en-c2-stylistic-register-switching-and-tonal-control", "en-c2-nominalisation-for-academic-and-executive-density"],
    (12, 5): ["en-c2-legal-syntax-mechanics-and-archaic-adverbs", "en-c2-nominalisation-for-academic-and-executive-density"],
    (13, 1): ["en-c2-litotes-double-negatives-and-philosophical-stance", "en-c2-literary-and-formal-sentence-patterns"],
    (13, 2): ["en-c2-confusing-grammar-guide", "en-c2-polyphonic-sentence-rhythm-and-stylistic-cadence"],
    (13, 3): ["en-c2-confusing-grammar-guide", "en-c2-near-native-information-packaging-and-focal-adjustments"],
    (13, 4): ["en-c2-self-correction-and-real-time-hedging-structures", "en-c2-advanced-hedging-modality-in-high-stakes-negotiations"],
    (13, 5): ["en-c2-confusing-grammar-guide", "en-c1-sentence-variety-periodic-loose-and-balanced"],
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
            if key not in IDS:
                raise SystemExit(f"lesson {key} has no mapping")
            new = IDS.pop(key)
            if lesson.get("grammarIds") != new:
                wired += 1
            lesson["grammarIds"] = new

    CURRICULUM.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(l["grammarIds"]) for u in data["units"] for l in u["lessons"])
    unique = {i for u in data["units"] for l in u["lessons"] for i in l["grammarIds"]}
    print(f"{wired} lessons written, {total} ids, {len(unique)} unique points")


if __name__ == "__main__":
    main()
