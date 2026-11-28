"""Give every Russian A1 lesson two grammar ids.

Nine lessons name their grammar in free text only, so slide 5 of their deck would have no manual page
to embed. Each pair below points at pages that exist on the A1 shelf. Where a lesson teaches a topic
the shelf splits in two (numbers, politeness, verb conjugation), the pair takes both halves.

    python3 scripts/grammar-ids/wire_ru_a1.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/ru/general/A1.json"
TOPICS = Path("/workspace/COSYmanuals/manuals/ru/grammar/a1/topics")

IDS = {
    (0, 4): ["ru-a1-tverdye-i-myagkie-soglasnye", "ru-a1-poryadok-slov-v-predlozhenii"],
    (1, 5): ["ru-a1-glagoly-moch-i-umet", "ru-a1-nastoyashchee-vremya-spryazhenie-1"],
    (1, 9): ["ru-a1-kolichestvennye-chislitelnye-1-100", "ru-a1-mnogo-malo-skolko"],
    (2, 5): ["ru-a1-ty-i-vy", "ru-a1-nastoyashchee-vremya-spryazhenie-2"],
    (2, 7): ["ru-a1-glagol-khotet", "ru-a1-vezhlivye-prosby-i-poveleniya"],
    (3, 2): ["ru-a1-konstruktsiya-u-menya-est", "ru-a1-predlogi-mesta"],
    (4, 3): ["ru-a1-predlogi-vremeni", "ru-a1-vremya-i-chasy"],
    (5, 4): ["ru-a1-vezhlivye-prosby-i-poveleniya", "ru-a1-konstruktsii-mozhno-nelzya-nuzhno"],
    (5, 6): ["ru-a1-mnogo-malo-skolko", "ru-a1-kolichestvennye-chislitelnye-1-100"],
}


def main():
    for ids in IDS.values():
        for grammar_id in ids:
            slug = grammar_id.split("-", 2)[2]
            if not (TOPICS / f"{slug}.html").exists():
                raise SystemExit(f"no page for {grammar_id}")
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
