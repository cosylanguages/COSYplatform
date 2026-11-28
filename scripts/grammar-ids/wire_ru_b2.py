"""Give all 65 Russian B2 lessons their grammar ids.

The curriculum shipped with ids on 31 of 65 lessons, and those pointed mostly at B1 or A1 pages: the lesson
on participles in journalistic prose cited `ru-b1-stradatelnye-prichastiya-nastoyashchego-i-proshedshego`,
and the one on investment forecasts cited `ru-a1-budushchee-vremya`. B2 is where nominalisation, the
stylistic word order, the conditional with *бы*, the distancing constructions, the comparative syntax and
the written-register phraseology get their treatment, and 34 lessons had no ids at all.

Every lesson now cites the B2 page that teaches it, with a B1 or A2 page where the B2 shelf has no
equivalent (the passive with an instrumental agent, short participles, the gerund phrase, purpose
conjunctions, time conjunctions, the conditional with *если*).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/ru/general/B2.json"
SHELF = Path("/workspace/COSYmanuals/manuals/ru/grammar")

IDS = {
    # Модуль 1
    (1, 1): ["ru-b2-slozhnyy-sintaksis-prichastiy-i-deeprichastiy", "ru-b1-prichastnyy-oborot-i-punktuatsiya"],
    (1, 2): ["ru-b2-stilisticheskaya-inversiya-i-ritm-frazy", "ru-b2-poryadok-slov-smyslovoy-tsentr"],
    (1, 3): ["ru-b2-slozhnye-uslovnye-konstruktsii-s-by", "ru-a2-soslagatelnoe-naklonenie-by"],
    (1, 4): ["ru-b2-konstruktsii-distantsirovaniya", "ru-b2-vvodnye-slova-kategorii-dostovernosti"],
    (1, 5): ["ru-b2-substantivatsiya-szhatie-informatsii", "ru-b1-otglagolnye-sushchestvitelnye-vvedenie"],
    # Модуль 2
    (2, 1): ["ru-b2-sintaksis-diplomaticheskoy-peregovornoy-rechi", "ru-b1-passivnyy-zalog-tvoritnyy-subyekt"],
    (2, 2): ["ru-b2-subyektno-obyektnye-otnosheniya-v-slozhnom-predlozhenii", "ru-b1-otnositeilnye-mestoimeniya-chey-kakoy-kakov"],
    (2, 3): ["ru-b2-predlogi-otimennogo-proiskhozhdeniya", "ru-b1-deeprichastnyy-oborot-i-ego-normy"],
    (2, 4): ["ru-b2-substantivnye-konstruktsii-s-roditelnym-padezhem", "ru-b1-stradatelnye-prichastiya-nastoyashchego-i-proshedshego"],
    (2, 5): ["ru-b1-soyuzy-tseli-dlya-togo-chtoby", "ru-b2-sintaksicheskaya-svyaznost-abzatsa"],
    # Модуль 3
    (3, 1): ["ru-b2-substantivatsiya-szhatie-informatsii", "ru-b1-otglagolnye-sushchestvitelnye-vvedenie"],
    (3, 2): ["ru-b2-poryadkovye-i-kolichestvennye-chislitelnye-v-delovoy-rechi", "ru-a2-budushchee-vremya-nsv-sv"],
    (3, 3): ["ru-b2-modalnye-slova-i-glagoly-dovoda", "ru-b1-povelitelnoe-naklonenie-vezhlivaya-prosba"],
    (3, 4): ["ru-b1-passivnyy-zalog-tvoritnyy-subyekt", "ru-b2-morfologicheskaya-stilistika-sushchestvitelnyh"],
    (3, 5): ["ru-b1-soyuzy-usloviya-pri-uslovii-esli-by", "ru-b2-konstruktsii-distantsirovaniya"],
    # Модуль 4
    (4, 1): ["ru-b1-soyuzy-usloviya-pri-uslovii-esli-by", "ru-b2-slozhnyy-sintaksis-prichastiy-i-deeprichastiy"],
    (4, 2): ["ru-b2-metaforicheskiy-perenos-v-grammatike", "ru-b2-slozhnye-uslovnye-konstruktsii-s-by"],
    (4, 3): ["ru-b2-soyuzy-ustupki-kak-by-ni-skolko-by-ni", "ru-b2-glagolnoe-upravlenie-divergentsiya"],
    (4, 4): ["ru-b2-slozhnyy-sintaksis-prichastiy-i-deeprichastiy", "ru-b2-sintaksis-nauchnogo-doklada"],
    (4, 5): ["ru-b2-sintaksis-nauchnogo-doklada", "ru-b2-modalnye-slova-i-glagoly-dovoda"],
    # Модуль 5
    (5, 1): ["ru-b2-metaforicheskiy-perenos-v-grammatike", "ru-b2-morfologicheskaya-stilistika-prilagatelnyh"],
    (5, 2): ["ru-b2-soyuzy-protivopostavleniya-mezhdu-tem-kak", "ru-b2-sintaksis-sravnitelynykh-stipeney"],
    (5, 3): ["ru-b2-metaforicheskiy-perenos-v-grammatike", "ru-b1-soyuzy-tseli-dlya-togo-chtoby"],
    (5, 4): ["ru-b1-passivnyy-zalog-tvoritnyy-subyekt", "ru-b2-morfologicheskaya-stilistika-prilagatelnyh"],
    (5, 5): ["ru-b1-sravnitelnye-oboroty-kak-budto-slovno", "ru-b2-sintaksis-sravnitelynykh-stipeney"],
    # Модуль 6
    (6, 1): ["ru-b1-kratkie-stradatelnye-prichastiya", "ru-b2-frazeologiya-ofitsialno-delovogo-stilya"],
    (6, 2): ["ru-b2-soyuzy-protivopostavleniya-mezhdu-tem-kak", "ru-a2-uslovnye-predlozheniya-esli"],
    (6, 3): ["ru-b2-frazeologiya-ofitsialno-delovogo-stilya", "ru-b1-deeprichastnyy-oborot-i-ego-normy"],
    (6, 4): ["ru-b2-bezlichnye-i-neopredelenno-lichnye-predlozheniya-b2", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    (6, 5): ["ru-b2-predlogi-otglagolnogo-proiskhozhdeniya", "ru-b2-chastitsy-obosobleniya-i-vydeleniya"],
    # Модуль 7
    (7, 1): ["ru-b2-soyuzy-protivopostavleniya-mezhdu-tem-kak", "ru-b2-slozhnyy-sintaksis-prichastiy-i-deeprichastiy"],
    (7, 2): ["ru-b1-deeprichastie-nesovershennogo-vida", "ru-b1-deeprichastie-sovershennogo-vida"],
    (7, 3): ["ru-b2-substantivnye-konstruktsii-s-roditelnym-padezhem", "ru-b2-morfologicheskaya-stilistika-prilagatelnyh"],
    (7, 4): ["ru-b1-passivnyy-zalog-tvoritnyy-subyekt", "ru-b2-predlogi-otglagolnogo-proiskhozhdeniya"],
    (7, 5): ["ru-b2-sintaksis-sravnitelynykh-stipeney", "ru-b2-otsenochnyy-sintaksis-i-ekspressivnyy-poryadok"],
    # Модуль 8
    (8, 1): ["ru-b2-itogovaya-sintaksicheskaya-norma-b2", "ru-b2-intonatsionnye-konstruktsii-ik-1-ik-5", "ru-b2-morfologicheskaya-stilistika-glagola"],
    (8, 2): ["ru-b2-morfologicheskaya-stilistika-sushchestvitelnyh", "ru-b2-lexicheskaya-i-sintaksicheskaya-izbytochnost"],
    (8, 3): ["ru-b1-sinonimiya-sintaksicheskikh-konstruktsiy", "ru-b2-sinonimiya-soyuznykh-i-bessoyuznykh-svyazey"],
    (8, 4): ["ru-b2-otsenochnyy-sintaksis-i-ekspressivnyy-poryadok", "ru-b2-metaforicheskiy-perenos-v-grammatike"],
    (8, 5): ["ru-b2-chastitsy-obosobleniya-i-vydeleniya", "ru-b2-lexicheskaya-i-sintaksicheskaya-izbytochnost"],
    # Модуль 9
    (9, 1): ["ru-b2-soyuzy-protivopostavleniya-mezhdu-tem-kak", "ru-b2-subyektno-obyektnye-otnosheniya-v-slozhnom-predlozhenii"],
    (9, 2): ["ru-b2-bezlichnye-i-neopredelenno-lichnye-predlozheniya-b2", "ru-b1-glagoly-myshleniya-i-rechi"],
    (9, 3): ["ru-b1-deeprichastnyy-oborot-i-ego-normy", "ru-b2-substantivatsiya-szhatie-informatsii"],
    (9, 4): ["ru-b1-povelitelnoe-naklonenie-vezhlivaya-prosba", "ru-a2-uslovnye-predlozheniya-esli"],
    (9, 5): ["ru-b2-deeprichastiya-ot-glagolov-dvizheniya", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    # Модуль 10
    (10, 1): ["ru-b2-bezlichnye-i-neopredelenno-lichnye-predlozheniya-b2", "ru-b1-soyuzy-tseli-dlya-togo-chtoby"],
    (10, 2): ["ru-b1-soyuzy-ustupki-nesmotrya-na-vopreki", "ru-b2-modalnye-slova-i-glagoly-dovoda"],
    (10, 3): ["ru-b2-konstruktsii-distantsirovaniya", "ru-b2-substantivatsiya-szhatie-informatsii"],
    (10, 4): ["ru-b1-soyuzy-usloviya-pri-uslovii-esli-by", "ru-b2-subyektno-obyektnye-otnosheniya-v-slozhnom-predlozhenii"],
    (10, 5): ["ru-b2-slozhnye-uslovnye-konstruktsii-s-by", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    # Модуль 11
    (11, 1): ["ru-b2-bezlichnye-i-neopredelenno-lichnye-predlozheniya-b2", "ru-b2-sinonimiya-soyuznykh-i-bessoyuznykh-svyazey"],
    (11, 2): ["ru-b2-kosvennaya-rech-ritoricheskie-priemy", "ru-b2-modalnye-slova-i-glagoly-dovoda"],
    (11, 3): ["ru-b2-substantivatsiya-szhatie-informatsii", "ru-b2-sinonimiya-soyuznykh-i-bessoyuznykh-svyazey"],
    (11, 4): ["ru-b2-bezlichnye-i-neopredelenno-lichnye-predlozheniya-b2", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    (11, 5): ["ru-b2-vvodnye-slova-kategorii-dostovernosti", "ru-b2-modalnye-slova-i-glagoly-dovoda"],
    # Модуль 12
    (12, 1): ["ru-a2-vremenni-soyuzy-kogda-poka-posle-togo-kak", "ru-b2-vyrazhenie-vremennoy-soshedshosti"],
    (12, 2): ["ru-b2-slozhnye-uslovnye-konstruktsii-s-by", "ru-b2-chastitsy-obosobleniya-i-vydeleniya"],
    (12, 3): ["ru-b1-passivnyy-zalog-tvoritnyy-subyekt", "ru-b2-substantivatsiya-szhatie-informatsii"],
    (12, 4): ["ru-b2-slozhnye-uslovnye-konstruktsii-s-by", "ru-b1-soyuzy-usloviya-pri-uslovii-esli-by"],
    (12, 5): ["ru-b1-sloznopodchinennye-izyasnitelnye-s-soyuzom-chto-chtoby", "ru-b2-sintaksicheskaya-svyaznost-abzatsa"],
    # Модуль 13
    (13, 1): ["ru-b2-sintaksicheskaya-svyaznost-abzatsa", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    (13, 2): ["ru-b2-intonatsionnye-konstruktsii-ik-1-ik-5", "ru-b2-vvodnye-slova-kategorii-dostovernosti"],
    (13, 3): ["ru-b2-sintaksis-diplomaticheskoy-peregovornoy-rechi", "ru-b2-kosvennaya-rech-ritoricheskie-priemy"],
    (13, 4): ["ru-b2-itogovaya-sintaksicheskaya-norma-b2", "ru-b2-glagolnoe-upravlenie-divergentsiya"],
    (13, 5): ["ru-b2-itogovaya-sintaksicheskaya-norma-b2", "ru-b1-sinonimiya-sintaksicheskikh-konstruktsiy"],
}


def main():
    for key, ids in IDS.items():
        for grammar_id in ids:
            level, slug = grammar_id.split("-")[1], grammar_id.split("-", 2)[2]
            if not (SHELF / level / "topics" / f"{slug}.html").exists():
                raise SystemExit(f"no page for {grammar_id} (lesson {key})")

    data = json.loads(CURRICULUM.read_text(encoding="utf-8"))
    wired, changed = 0, 0
    for unit in data["units"]:
        for lesson in unit["lessons"]:
            key = (unit["unit"], lesson["lesson"])
            if key not in IDS:
                raise SystemExit(f"lesson {key} has no mapping")
            new = IDS.pop(key)
            if lesson.get("grammarIds") != new:
                changed += lesson.get("grammarIds") is not None
                wired += 1
            lesson["grammarIds"] = new

    CURRICULUM.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(l["grammarIds"]) for u in data["units"] for l in u["lessons"])
    unique = {i for u in data["units"] for l in u["lessons"] for i in l["grammarIds"]}
    print(f"{wired} lessons written ({changed} re-pointed), {total} ids, {len(unique)} unique points")


if __name__ == "__main__":
    main()
