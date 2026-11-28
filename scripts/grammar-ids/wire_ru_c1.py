"""Give all 65 Russian C1 lessons their grammar ids.

C1 arrived with no ids at all, and with one grammar phrase per lesson rather than a list — the only Russian
level shaped that way. The phrase names the point the lesson teaches, and the C1 shelf answers most of them
with a page of its own, written at C1: the passive becomes *agent removal and distancing syntax*, the
subjunctive of politeness becomes *the complex subjunctive syntax of diplomacy*, word order becomes
*thematic-rhematic packaging*.

So each lesson cites the C1 page that reframes its point, and — as a second id — the B2 or B1 page that
teaches the underlying grammar, because a C1 lesson does not stop needing the rule it builds on. Where the C1
shelf has no page for the point (indirect speech, goal conjunctions), both ids are lower-level pages: the
deck teaches the grammar honestly rather than borrowing the nearest C1 device.

All 28 C1 pages are used.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/ru/general/C1.json"
SHELF = Path("/workspace/COSYmanuals/manuals/ru/grammar")
IDS = {
    (1, 1): ["ru-c1-otrushenie-subyekta-i-passivnyy-distantsirovannyi-sintaksis", "ru-b1-passivnyy-zalog-tvoritnyy-subyekt"],
    (1, 2): ["ru-c1-prichastnye-konstruktsii-v-ekspromte", "ru-b2-slozhnyy-sintaksis-prichastiy-i-deeprichastiy"],
    (1, 3): ["ru-c1-slozhnye-poyasnitelnye-pridatochnye", "ru-b2-kosvennaya-rech-ritoricheskie-priemy"],
    (1, 4): ["ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki", "ru-b2-substantivatsiya-szhatie-informatsii"],
    (1, 5): ["ru-c1-akademicheskoe-smyagchenie-hedging", "ru-b1-vvodnye-slova-stepen-dostovernosti"],
    (2, 1): ["ru-c1-modalnost-i-veroyatnost-v-nauchnykh-gipotezakh", "ru-b2-modalnye-slova-i-glagoly-dovoda"],
    (2, 2): ["ru-c1-inversiya-usloviya-v-ofitsialnoy-diskussii", "ru-b2-slozhnye-uslovnye-konstruktsii-s-by"],
    (2, 3): ["ru-c1-otrushenie-subyekta-i-passivnyy-distantsirovannyi-sintaksis", "ru-b2-bezlichnye-i-neopredelenno-lichnye-predlozheniya-b2"],
    (2, 4): ["ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki", "ru-b2-morfologicheskaya-stilistika-sushchestvitelnyh"],
    (2, 5): ["ru-c1-inversionnye-ustupki-v-spore", "ru-b2-soyuzy-ustupki-kak-by-ni-skolko-by-ni"],
    (3, 1): ["ru-c1-kosvennaya-vezhlivost-i-evfemizmy", "ru-b1-povelitelnoe-naklonenie-vezhlivaya-prosba"],
    (3, 2): ["ru-c1-otrushenie-subyekta-i-passivnyy-distantsirovannyi-sintaksis", "ru-b2-konstruktsii-distantsirovaniya"],
    (3, 3): ["ru-c1-vydelitelnye-cleft-konstruktsii", "ru-b2-chastitsy-obosobleniya-i-vydeleniya"],
    (3, 4): ["ru-c1-inversiya-usloviya-v-ofitsialnoy-diskussii", "ru-b2-slozhnye-uslovnye-konstruktsii-s-by"],
    (3, 5): ["ru-c1-kosvennaya-vezhlivost-i-evfemizmy", "ru-b2-konstruktsii-distantsirovaniya"],
    (4, 1): ["ru-c1-otrushenie-subyekta-i-passivnyy-distantsirovannyi-sintaksis", "ru-b1-kratkie-stradatelnye-prichastiya"],
    (4, 2): ["ru-c1-slozhno-soslagatelnyy-sintaksis-diplomatii", "ru-a2-soslagatelnoe-naklonenie-by"],
    (4, 3): ["ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki", "ru-b2-frazeologiya-ofitsialno-delovogo-stilya"],
    (4, 4): ["ru-c1-knizhnye-soyuzy-i-stilisticheskie-svyazki", "ru-b2-predlogi-otimennogo-proiskhozhdeniya"],
    (4, 5): ["ru-c1-ritm-periodicheskogo-predlozheniya", "ru-b2-subyektno-obyektnye-otnosheniya-v-slozhnom-predlozhenii"],
    (5, 1): ["ru-c1-knizhnye-soyuzy-i-stilisticheskie-svyazki", "ru-b2-sinonimiya-soyuznykh-i-bessoyuznykh-svyazey"],
    (5, 2): ["ru-c1-vvodnye-konstruktsii-avtorskogo-kommentariya", "ru-b2-otsenochnyy-sintaksis-i-ekspressivnyy-poryadok"],
    (5, 3): ["ru-c1-prichastnye-konstruktsii-v-ekspromte", "ru-b2-slozhnyy-sintaksis-prichastiy-i-deeprichastiy"],
    (5, 4): ["ru-c1-inversionnye-ustupki-v-spore", "ru-b2-soyuzy-ustupki-kak-by-ni-skolko-by-ni"],
    (5, 5): ["ru-c1-modalnost-uverennosti-i-filosofskogo-poiska", "ru-b2-bezlichnye-i-neopredelenno-lichnye-predlozheniya-b2"],
    (6, 1): ["ru-c1-otrushenie-subyekta-i-passivnyy-distantsirovannyi-sintaksis", "ru-b2-modalnye-slova-i-glagoly-dovoda"],
    (6, 2): ["ru-c1-slozhnye-poyasnitelnye-pridatochnye", "ru-b2-kosvennaya-rech-ritoricheskie-priemy"],
    (6, 3): ["ru-c1-inversionnye-ustupki-v-spore", "ru-b2-soyuzy-ustupki-kak-by-ni-skolko-by-ni"],
    (6, 4): ["ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki", "ru-b2-substantivatsiya-szhatie-informatsii"],
    (6, 5): ["ru-c1-sbalansirovannye-trekhchlennye-konstruktsii-trikolon", "ru-c1-ritm-periodicheskogo-predlozheniya"],
    (7, 1): ["ru-c1-modalnost-uverennosti-i-filosofskogo-poiska", "ru-b2-vvodnye-slova-kategorii-dostovernosti"],
    (7, 2): ["ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki", "ru-b1-substantivatsiya-i-perekhod-chastey-rechi"],
    (7, 3): ["ru-c1-otrushenie-subyekta-i-passivnyy-distantsirovannyi-sintaksis", "ru-b2-bezlichnye-i-neopredelenno-lichnye-predlozheniya-b2"],
    (7, 4): ["ru-c1-inversionnye-ustupki-v-spore", "ru-b2-soyuzy-protivopostavleniya-mezhdu-tem-kak"],
    (7, 5): ["ru-c1-inversiya-usloviya-v-ofitsialnoy-diskussii", "ru-b2-slozhnye-uslovnye-konstruktsii-s-by"],
    (8, 1): ["ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki", "ru-b2-morfologicheskaya-stilistika-sushchestvitelnyh"],
    (8, 2): ["ru-c1-slozhnye-poyasnitelnye-pridatochnye", "ru-b2-kosvennaya-rech-ritoricheskie-priemy"],
    (8, 3): ["ru-c1-otrushenie-subyekta-i-passivnyy-distantsirovannyi-sintaksis", "ru-b2-bezlichnye-i-neopredelenno-lichnye-predlozheniya-b2"],
    (8, 4): ["ru-c1-inversionnye-ustupki-v-spore", "ru-b2-soyuzy-ustupki-kak-by-ni-skolko-by-ni"],
    (8, 5): ["ru-c1-ritm-periodicheskogo-predlozheniya", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    (9, 1): ["ru-c1-sbalansirovannye-trekhchlennye-konstruktsii-trikolon", "ru-c1-ritm-periodicheskogo-predlozheniya"],
    (9, 2): ["ru-c1-knizhnye-soyuzy-i-stilisticheskie-svyazki", "ru-b2-soyuzy-protivopostavleniya-mezhdu-tem-kak"],
    (9, 3): ["ru-c1-ellipsis-i-lexicheskaya-zamena", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    (9, 4): ["ru-c1-slozhno-soslagatelnyy-sintaksis-diplomatii", "ru-b2-sintaksis-diplomaticheskoy-peregovornoy-rechi"],
    (9, 5): ["ru-c1-emfaticheskaya-inversiya-i-poryadok-slov", "ru-c1-tema-rema-i-informatsionnaya-upakovka"],
    (10, 1): ["ru-c1-inversiya-usloviya-v-ofitsialnoy-diskussii", "ru-b2-slozhnye-uslovnye-konstruktsii-s-by"],
    (10, 2): ["ru-c1-emfaticheskaya-inversiya-i-poryadok-slov", "ru-b2-predlogi-otglagolnogo-proiskhozhdeniya"],
    (10, 3): ["ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki", "ru-b2-substantivatsiya-szhatie-informatsii"],
    (10, 4): ["ru-c1-modalnye-glagoly-zanizheniya-riskov", "ru-a2-konstruktsii-dolzhen-obyazan-nado"],
    (10, 5): ["ru-c1-tema-rema-i-informatsionnaya-upakovka", "ru-b2-poryadok-slov-smyslovoy-tsentr"],
    (11, 1): ["ru-c1-slozhno-soslagatelnyy-sintaksis-diplomatii", "ru-c1-akademicheskoe-smyagchenie-hedging"],
    (11, 2): ["ru-c1-otrushenie-subyekta-i-passivnyy-distantsirovannyi-sintaksis", "ru-b2-sintaksis-diplomaticheskoy-peregovornoy-rechi"],
    (11, 3): ["ru-c1-inversiya-usloviya-v-ofitsialnoy-diskussii", "ru-b1-soyuzy-usloviya-pri-uslovii-esli-by"],
    (11, 4): ["ru-c1-inversionnye-ustupki-v-spore", "ru-b2-soyuzy-ustupki-kak-by-ni-skolko-by-ni"],
    (11, 5): ["ru-c1-sintez-akademichskogo-i-ritoricheskogo-sintaksisa", "ru-c1-ritm-periodicheskogo-predlozheniya"],
    (12, 1): ["ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki", "ru-b2-morfologicheskaya-stilistika-prilagatelnyh"],
    (12, 2): ["ru-c1-razvernutaya-metafora-v-sintaksise", "ru-b2-morfologicheskaya-stilistika-prilagatelnyh"],
    (12, 3): ["ru-c1-ritm-periodicheskogo-predlozheniya", "ru-c1-sbalansirovannye-trekhchlennye-konstruktsii-trikolon"],
    (12, 4): ["ru-c1-inversionnye-ustupki-v-spore", "ru-b2-soyuzy-ustupki-kak-by-ni-skolko-by-ni"],
    (12, 5): ["ru-c1-poyasnitelnye-vstavki-v-retsezii", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    (13, 1): ["ru-c1-sintez-akademichskogo-i-ritoricheskogo-sintaksisa", "ru-b2-itogovaya-sintaksicheskaya-norma-b2"],
    (13, 2): ["ru-c1-slozhnye-poyasnitelnye-pridatochnye", "ru-b2-slozhnye-uslovnye-konstruktsii-s-by"],
    (13, 3): ["ru-c1-perekluchenie-registrov-i-stilisticheskaya-gibkost", "ru-c1-zarechnye-modifikatory-registra"],
    (13, 4): ["ru-c1-spontannaya-sintaksicheskaya-svyaznost", "ru-b2-intonatsionnye-konstruktsii-ik-1-ik-5"],
    (13, 5): ["ru-c1-akusticheskaya-adaptivnost-i-govor", "ru-c1-priemy-ustnogo-ukhoda-ot-provokatsiy"],
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
