"""Give all 65 Russian C2 lessons their grammar ids.

C2 arrived with ids on 10 of 65 lessons, ten lessons with no grammar at all (the opening lesson of each
module) and the rest carrying two phrases. The C2 shelf holds 20 pages, each of them narrow: deontic modality
in statutes, epistemic modality in philosophy, extrapolation, scope of particles, the prosody of IK-6 and
IK-7, dense legal nominalisation.

Every lesson cites the C2 page that carries its device, and a C1 or B2 page for the grammar underneath, so a
C2 deck never floats free of a rule. All 20 C2 pages are used.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/ru/general/C2.json"
SHELF = Path("/workspace/COSYmanuals/manuals/ru/grammar")
IDS = {
    (1, 1): ["ru-c2-litota-dvoynoe-otritsanie-i-knizhnye-soyuzy", "ru-c1-knizhnye-soyuzy-i-stilisticheskie-svyazki"],
    (1, 2): ["ru-c2-stilisticheskaya-inversiya-hudozhestvennoy-prozy", "ru-c2-parallelizm-hiasm-i-ritm-mnogosostavnogo-predlozheniya"],
    (1, 3): ["ru-c2-parallelizm-hiasm-i-ritm-mnogosostavnogo-predlozheniya", "ru-c2-stilisticheskaya-inversiya-hudozhestvennoy-prozy"],
    (1, 4): ["ru-c2-literaturnye-allyuzii-i-podtekstovaya-podrazumevaemost", "ru-b2-kosvennaya-rech-ritoricheskie-priemy"],
    (1, 5): ["ru-c2-litota-dvoynoe-otritsanie-i-knizhnye-soyuzy", "ru-c1-vvodnye-konstruktsii-avtorskogo-kommentariya"],
    (2, 1): ["ru-c2-morfosintaksicheskie-varianty-vysshego-registra", "ru-c1-akusticheskaya-adaptivnost-i-govor"],
    (2, 2): ["ru-c2-transformatsiya-stilisticheskikh-registrov", "ru-c2-smyslovye-sdvigi-poryadka-slov"],
    (2, 3): ["ru-c2-subversivnaya-inversiya-i-ironicheskiy-freming", "ru-c1-priemy-ustnogo-ukhoda-ot-provokatsiy"],
    (2, 4): ["ru-c2-sintaksis-sokraticheskogo-dialoga-i-dekonstruktsii", "ru-b2-soyuzy-protivopostavleniya-mezhdu-tem-kak"],
    (2, 5): ["ru-c2-morfosintaksicheskie-varianty-vysshego-registra", "ru-c1-emfaticheskaya-inversiya-i-poryadok-slov"],
    (3, 1): ["ru-c2-epistemicheskaya-modalnost-filosofskogo-diskursa", "ru-c1-modalnost-uverennosti-i-filosofskogo-poiska"],
    (3, 2): ["ru-c2-epistemicheskaya-modalnost-filosofskogo-diskursa", "ru-c2-litota-dvoynoe-otritsanie-i-knizhnye-soyuzy"],
    (3, 3): ["ru-c2-plotnaya-administrativno-pravovaya-nominalizatsiya", "ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki"],
    (3, 4): ["ru-c2-sintaksis-sokraticheskogo-dialoga-i-dekonstruktsii", "ru-c1-inversionnye-ustupki-v-spore"],
    (3, 5): ["ru-c2-epistemicheskaya-modalnost-filosofskogo-diskursa", "ru-c1-ritm-periodicheskogo-predlozheniya"],
    (4, 1): ["ru-c2-sintaksis-takticheskogo-rychaga-v-peregovorakh", "ru-c1-slozhno-soslagatelnyy-sintaksis-diplomatii"],
    (4, 2): ["ru-c2-sintaksis-takticheskogo-rychaga-v-peregovorakh", "ru-c1-slozhno-soslagatelnyy-sintaksis-diplomatii"],
    (4, 3): ["ru-c2-slozhnye-gipoteticheskie-sintaksicheskie-seti", "ru-c1-inversiya-usloviya-v-ofitsialnoy-diskussii"],
    (4, 4): ["ru-c2-sintaksis-takticheskogo-rychaga-v-peregovorakh", "ru-c1-slozhno-soslagatelnyy-sintaksis-diplomatii"],
    (4, 5): ["ru-c2-plotnaya-administrativno-pravovaya-nominalizatsiya", "ru-c1-kosvennaya-vezhlivost-i-evfemizmy"],
    (5, 1): ["ru-c2-sintaksis-ofitsialno-delovogo-i-yuridicheskogo-stilya", "ru-b2-frazeologiya-ofitsialno-delovogo-stilya"],
    (5, 2): ["ru-c2-sintaksis-ofitsialno-delovogo-i-yuridicheskogo-stilya", "ru-b2-predlogi-otimennogo-proiskhozhdeniya"],
    (5, 3): ["ru-c2-deonticheskaya-modalnost-ustavnykh-dokumentov", "ru-c2-sintaksis-ofitsialno-delovogo-i-yuridicheskogo-stilya"],
    (5, 4): ["ru-c2-plotnaya-administrativno-pravovaya-nominalizatsiya", "ru-b2-subyektno-obyektnye-otnosheniya-v-slozhnom-predlozhenii"],
    (5, 5): ["ru-c2-sintaksis-ofitsialno-delovogo-i-yuridicheskogo-stilya", "ru-c1-poyasnitelnye-vstavki-v-retsezii"],
    (6, 1): ["ru-c2-literaturnye-allyuzii-i-podtekstovaya-podrazumevaemost", "ru-b2-metaforicheskiy-perenos-v-grammatike"],
    (6, 2): ["ru-c2-transformatsiya-stilisticheskikh-registrov", "ru-c2-parallelizm-hiasm-i-ritm-mnogosostavnogo-predlozheniya"],
    (6, 3): ["ru-c2-literaturnye-allyuzii-i-podtekstovaya-podrazumevaemost", "ru-c1-razvernutaya-metafora-v-sintaksise"],
    (6, 4): ["ru-c2-litota-dvoynoe-otritsanie-i-knizhnye-soyuzy", "ru-b2-frazeologiya-ofitsialno-delovogo-stilya"],
    (6, 5): ["ru-c2-transformatsiya-stilisticheskikh-registrov", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    (7, 1): ["ru-c2-tochnyy-kontrol-sfery-deystviya-chastits", "ru-b2-lexicheskaya-i-sintaksicheskaya-izbytochnost"],
    (7, 2): ["ru-c2-tochnyy-kontrol-sfery-deystviya-chastits", "ru-c2-smyslovye-sdvigi-poryadka-slov"],
    (7, 3): ["ru-c2-tochnyy-kontrol-sfery-deystviya-chastits", "ru-b2-lexicheskaya-i-sintaksicheskaya-izbytochnost"],
    (7, 4): ["ru-c2-tochnyy-kontrol-sfery-deystviya-chastits", "ru-b2-glagolnoe-upravlenie-divergentsiya"],
    (7, 5): ["ru-c2-transformatsiya-stilisticheskikh-registrov", "ru-c1-kosvennaya-vezhlivost-i-evfemizmy"],
    (8, 1): ["ru-c2-inversiya-soslagatelnogo-nakloneniya-v-makroekonomike", "ru-c1-otglagolnye-sushchestvitelnye-v-ritme-publitsistiki"],
    (8, 2): ["ru-c2-inversiya-soslagatelnogo-nakloneniya-v-makroekonomike", "ru-c2-slozhnye-gipoteticheskie-sintaksicheskie-seti"],
    (8, 3): ["ru-c2-slozhnye-gipoteticheskie-sintaksicheskie-seti", "ru-c1-inversiya-usloviya-v-ofitsialnoy-diskussii"],
    (8, 4): ["ru-c2-plotnaya-administrativno-pravovaya-nominalizatsiya", "ru-b2-substantivatsiya-szhatie-informatsii"],
    (8, 5): ["ru-c2-sintaksis-takticheskogo-rychaga-v-peregovorakh", "ru-b2-sintaksis-sravnitelynykh-stipeney"],
    (9, 1): ["ru-c2-absolutnyy-c2-sintez-vsekh-sintaksicheskikh-struktur", "ru-b2-sintaksis-nauchnogo-doklada"],
    (9, 2): ["ru-c2-extrapozitsiya-pridatochnykh-izyasnitelnykh", "ru-c2-smyslovye-sdvigi-poryadka-slov"],
    (9, 3): ["ru-c2-extrapozitsiya-pridatochnykh-izyasnitelnykh", "ru-b2-sintaksis-nauchnogo-doklada"],
    (9, 4): ["ru-c2-deonticheskaya-modalnost-ustavnykh-dokumentov", "ru-b1-soyuzy-usloviya-pri-uslovii-esli-by"],
    (9, 5): ["ru-c2-deonticheskaya-modalnost-ustavnykh-dokumentov", "ru-b2-frazeologiya-ofitsialno-delovogo-stilya"],
    (10, 1): ["ru-c2-transformatsiya-stilisticheskikh-registrov", "ru-b2-lexicheskaya-i-sintaksicheskaya-izbytochnost"],
    (10, 2): ["ru-c2-transformatsiya-stilisticheskikh-registrov", "ru-c1-ellipsis-i-lexicheskaya-zamena"],
    (10, 3): ["ru-c2-prosodicheskie-intonatsionnye-konstruktsii-ik-6-ik-7", "ru-c1-spontannaya-sintaksicheskaya-svyaznost"],
    (10, 4): ["ru-c2-transformatsiya-stilisticheskikh-registrov", "ru-b2-poyasnitelnye-i-vstavnye-konstruktsii"],
    (10, 5): ["ru-c2-tochnyy-kontrol-sfery-deystviya-chastits", "ru-b2-lexicheskaya-i-sintaksicheskaya-izbytochnost"],
    (11, 1): ["ru-c2-sintaksis-ofitsialno-delovogo-i-yuridicheskogo-stilya", "ru-b2-frazeologiya-ofitsialno-delovogo-stilya"],
    (11, 2): ["ru-c2-stilisticheskaya-inversiya-hudozhestvennoy-prozy", "ru-c2-parallelizm-hiasm-i-ritm-mnogosostavnogo-predlozheniya"],
    (11, 3): ["ru-c2-transformatsiya-stilisticheskikh-registrov", "ru-c1-ellipsis-i-lexicheskaya-zamena"],
    (11, 4): ["ru-c2-parallelizm-hiasm-i-ritm-mnogosostavnogo-predlozheniya", "ru-c1-ritm-periodicheskogo-predlozheniya"],
    (11, 5): ["ru-c2-subversivnaya-inversiya-i-ironicheskiy-freming", "ru-c1-vvodnye-konstruktsii-avtorskogo-kommentariya"],
    (12, 1): ["ru-c2-absolutnyy-c2-sintez-vsekh-sintaksicheskikh-struktur", "ru-b2-sintaksis-nauchnogo-doklada"],
    (12, 2): ["ru-c2-absolutnyy-c2-sintez-vsekh-sintaksicheskikh-struktur", "ru-b2-substantivatsiya-szhatie-informatsii"],
    (12, 3): ["ru-c2-sintaksis-sokraticheskogo-dialoga-i-dekonstruktsii", "ru-c1-poyasnitelnye-vstavki-v-retsezii"],
    (12, 4): ["ru-c2-transformatsiya-stilisticheskikh-registrov", "ru-b2-lexicheskaya-i-sintaksicheskaya-izbytochnost"],
    (12, 5): ["ru-c2-sintaksis-ofitsialno-delovogo-i-yuridicheskogo-stilya", "ru-b2-frazeologiya-ofitsialno-delovogo-stilya"],
    (13, 1): ["ru-c2-litota-dvoynoe-otritsanie-i-knizhnye-soyuzy", "ru-c2-literaturnye-allyuzii-i-podtekstovaya-podrazumevaemost"],
    (13, 2): ["ru-c2-absolutnyy-c2-sintez-vsekh-sintaksicheskikh-struktur", "ru-c2-morfosintaksicheskie-varianty-vysshego-registra"],
    (13, 3): ["ru-c2-absolutnyy-c2-sintez-vsekh-sintaksicheskikh-struktur", "ru-c1-sintez-akademichskogo-i-ritoricheskogo-sintaksisa"],
    (13, 4): ["ru-c2-sintaksis-sokraticheskogo-dialoga-i-dekonstruktsii", "ru-c2-sintaksis-takticheskogo-rychaga-v-peregovorakh"],
    (13, 5): ["ru-c2-absolutnyy-c2-sintez-vsekh-sintaksicheskikh-struktur", "ru-b2-itogovaya-sintaksicheskaya-norma-b2"],
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
