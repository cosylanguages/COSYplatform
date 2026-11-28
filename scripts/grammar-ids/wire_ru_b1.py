"""Give all 65 Russian B1 lessons their grammar ids.

The curriculum shipped with ids on 34 of 65 lessons, and most of those cited A1 or A2 pages: the lesson on
cause and concession cited `ru-a1-soyuzy-prichiny-potomu-chto-tak-kak`, and the one on participles in the
news cited `ru-a1-prilagatelnye`. B1 is where the participle and gerund systems, the passive, the oblique
numerals and the complex sentence get their real treatment, so every lesson is pointed at the B1 page that
teaches it, with an A1 or A2 page kept only where the B1 shelf has no equivalent (short adjectives, aspectual
pairs, the aspect of the past, *который*, the imperative with *пусть/давайте*, time conjunctions, negative
pronouns with prepositions, *должен*).

The pair per lesson follows the lesson: the first id is the point taught, the second the point practised.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/ru/general/B1.json"
SHELF = Path("/workspace/COSYmanuals/manuals/ru/grammar")

IDS = {
    # 1 Выражение мнения, аргументация и дискуссия
    (1, 1): ["ru-b1-soyuzy-prichiny-blagodarya-iz-za-vvidu", "ru-b1-soyuzy-ustupki-nesmotrya-na-vopreki"],
    (1, 2): ["ru-b1-vvodnye-slova-stepen-dostovernosti", "ru-b1-datelnyy-padezh-subyekta-otsenki"],
    (1, 3): ["ru-b1-sloznopodchinennye-izyasnitelnye-s-soyuzom-chto-chtoby", "ru-b1-soyuzy-tseli-dlya-togo-chtoby"],
    (1, 4): ["ru-b1-kosvennaya-rech-izmenenie-mestoimeniy-i-glagolov", "ru-b1-kosvennyy-vopros-chastitsa-li"],
    (1, 5): ["ru-b1-vvodnye-slova-poryadok-mysley", "ru-b1-poryadok-slov-emfatiko-b1"],
    # 2 Работа, карьера и деловое общение
    (2, 1): ["ru-b1-otglagolnye-sushchestvitelnye-vvedenie", "ru-a2-kratkie-prilagatelnye"],
    (2, 2): ["ru-b1-passivnyy-zalog-tvoritnyy-subyekt", "ru-a2-vidovye-pary-glagolov"],
    (2, 3): ["ru-b1-soyuzy-usloviya-pri-uslovii-esli-by", "ru-b1-povelitelnoe-naklonenie-vezhlivaya-prosba"],
    (2, 4): ["ru-b1-soyuzy-usloviya-pri-uslovii-esli-by", "ru-b1-soyuzy-ustupki-nesmotrya-na-vopreki"],
    (2, 5): ["ru-b1-passivnyy-zalog-tvoritnyy-subyekt", "ru-b1-glagolnyy-upravlenie-predlogi-v-na-o-k"],
    # 3 Медиа, общество и цифровые технологии
    (3, 1): ["ru-b1-kratkie-stradatelnye-prichastiya", "ru-b1-bezlichnye-predlozheniya-s-kratkimi-stradatelynymi"],
    (3, 2): ["ru-b1-deystvitelnye-prichastiya-nastoyashchego-i-proshedshego", "ru-b1-glagoly-myshleniya-i-rechi"],
    (3, 3): ["ru-b1-deystvitelnye-prichastiya-nastoyashchego-i-proshedshego", "ru-b1-vvodnye-slova-stepen-dostovernosti"],
    (3, 4): ["ru-b1-stradatelnye-prichastiya-nastoyashchego-i-proshedshego",
              "ru-a2-sravnenie-s-soyuzom-chem-i-roditelnym-padezhem"],
    (3, 5): ["ru-b1-stradatelnye-prichastiya-nastoyashchego-i-proshedshego", "ru-b1-prichastnyy-oborot-i-punktuatsiya"],
    # 4 Экология, природа и устойчивое развитие
    (4, 1): ["ru-b1-deeprichastie-nesovershennogo-vida", "ru-b1-soyuzy-prichiny-blagodarya-iz-za-vvidu"],
    (4, 2): ["ru-b1-deeprichastie-sovershennogo-vida", "ru-b1-soyuzy-usloviya-pri-uslovii-esli-by"],
    (4, 3): ["ru-b1-deeprichastnyy-oborot-i-ego-normy", "ru-a2-mestoimenie-kotoryy"],
    (4, 4): ["ru-b1-povelitelnoe-naklonenie-vezhlivaya-prosba", "ru-a2-povelitelnoe-naklonenie-pust-pust-davaite"],
    (4, 5): ["ru-a2-vremenni-soyuzy-kogda-poka-posle-togo-kak", "ru-b1-predlogi-mesta-iz-pod-iz-za",
              "ru-b1-glagoly-dvizheniya-s-pristavkami-obzor"],
    # 5 Общество, культура и традиции
    (5, 1): ["ru-b1-mestoimennie-sebya-i-svoy", "ru-b1-vzaimnye-mestoimeniya-drug-druga"],
    (5, 2): ["ru-b1-bezlichnye-predlozheniya-s-kratkimi-stradatelynymi", "ru-b1-datelnyy-padezh-subyekta-otsenki"],
    (5, 3): ["ru-b1-deeprichastnyy-oborot-i-ego-normy", "ru-b1-deeprichastie-nesovershennogo-vida"],
    (5, 4): ["ru-b1-passivnyy-zalog-tvoritnyy-subyekt", "ru-b1-kratkie-stradatelnye-prichastiya"],
    (5, 5): ["ru-b1-sravnitelnye-oboroty-kak-budto-slovno", "ru-b1-sinonimiya-sintaksicheskikh-konstruktsiy"],
    # 6 Искусство, литература и театр
    (6, 1): ["ru-b1-substantivatsiya-i-perekhod-chastey-rechi", "ru-b1-sinonimiya-sintaksicheskikh-konstruktsiy"],
    (6, 2): ["ru-b1-predlogi-mesta-iz-pod-iz-za", "ru-b1-vvodnye-slova-stepen-dostovernosti"],
    (6, 3): ["ru-b1-prichastnyy-oborot-i-punktuatsiya", "ru-b1-deeprichastnyy-oborot-i-ego-normy"],
    (6, 4): ["ru-b1-sravnitelnye-oboroty-kak-budto-slovno", "ru-a2-sravnenie-i-prevoskhodnaya-stepen"],
    (6, 5): ["ru-b1-passivnyy-zalog-tvoritnyy-subyekt", "ru-b1-deeprichastnyy-oborot-i-ego-normy"],
    # 7 Экономика, финансы и предпринимательство
    (7, 1): ["ru-b1-chislitelnye-sklonenie-kolichestvennykh", "ru-b1-drobnye-i-drobno-kolichestvennye-chislitelnye",
              "ru-b1-chislitelnye-sklonenie-poryadkovykh"],
    (7, 2): ["ru-b1-otglagolnye-sushchestvitelnye-vvedenie", "ru-b1-slozhnosochinennye-predlozheniya-tozhe-takzhe"],
    (7, 3): ["ru-b1-soyuzy-usloviya-pri-uslovii-esli-by", "ru-b1-frazeologizmy-i-ustoychivye-sochetaniya-b1"],
    (7, 4): ["ru-b1-soyuzy-tseli-dlya-togo-chtoby", "ru-b1-prichastnyy-oborot-i-punktuatsiya"],
    (7, 5): ["ru-b1-soyuzy-ustupki-nesmotrya-na-vopreki", "ru-b1-vvodnye-slova-poryadok-mysley"],
    # 8 Наука, инновации и будущие технологии
    (8, 1): ["ru-b1-soyuzy-usloviya-pri-uslovii-esli-by", "ru-b1-passivnyy-zalog-tvoritnyy-subyekt"],
    (8, 2): ["ru-b1-deeprichastnyy-oborot-i-ego-normy", "ru-b1-vvodnye-slova-stepen-dostovernosti"],
    (8, 3): ["ru-b1-prichastnyy-oborot-i-punktuatsiya", "ru-b1-datelnyy-padezh-subyekta-otsenki"],
    (8, 4): ["ru-b1-sravnitelnye-oboroty-kak-budto-slovno", "ru-b1-chislitelnye-sklonenie-kolichestvennykh"],
    (8, 5): ["ru-b1-povelitelnoe-naklonenie-vezhlivaya-prosba", "ru-b1-vidy-glagola-v-infinitive"],
    # 9 Русский язык и разнообразие русскоязычного мира
    (9, 1): ["ru-b1-sinonimiya-sintaksicheskikh-konstruktsiy", "ru-b1-sravnitelnye-oboroty-kak-budto-slovno"],
    (9, 2): ["ru-b1-deeprichastie-nesovershennogo-vida", "ru-b1-otglagolnye-sushchestvitelnye-vvedenie"],
    (9, 3): ["ru-b1-substantivatsiya-i-perekhod-chastey-rechi", "ru-b1-slozhnosokrashchennye-slova-i-abbreviatury"],
    (9, 4): ["ru-b1-frazeologizmy-i-ustoychivye-sochetaniya-b1", "ru-b1-glagoly-dvizheniya-perezatno-perenostnoe-znachenie"],
    (9, 5): ["ru-b1-sinonimiya-sintaksicheskikh-konstruktsiy", "ru-b1-poryadok-slov-emfatiko-b1",
              "ru-b1-poyasnitelnye-konstruktsii-to-est-a-imenno"],
    # 10 Здоровье, спорт и профилактика
    (10, 1): ["ru-b1-bezlichnye-predlozheniya-s-kratkimi-stradatelynymi", "ru-b1-soyuzy-tseli-dlya-togo-chtoby"],
    (10, 2): ["ru-b1-deeprichastnyy-oborot-i-ego-normy", "ru-b1-glagoly-myshleniya-i-rechi"],
    (10, 3): ["ru-b1-sravnitelnye-oboroty-kak-budto-slovno", "ru-a2-sravnenie-i-prevoskhodnaya-stepen",
               "ru-b1-vidy-glagola-povtoryayushchiesya-deystviya"],
    (10, 4): ["ru-b1-chislitelnye-sklonenie-kolichestvennykh", "ru-a2-ot-otritsatelnye-mestoimeniya-s-predlogami",
               "ru-b1-sobiratelnye-chislitelnye-dvoe-troe"],
    (10, 5): ["ru-b1-soyuzy-tseli-dlya-togo-chtoby", "ru-a2-konstruktsii-dolzhen-obyazan-nado"],
    # 11 Права потребителей и повседневные правовые вопросы
    (11, 1): ["ru-b1-sloznopodchinennye-izyasnitelnye-s-soyuzom-chto-chtoby",
              "ru-b1-otnositeilnye-mestoimeniya-chey-kakoy-kakov"],
    (11, 2): ["ru-b1-soyuzy-usloviya-pri-uslovii-esli-by", "ru-b1-passivnyy-zalog-tvoritnyy-subyekt"],
    (11, 3): ["ru-b1-chislitelnye-sklonenie-kolichestvennykh", "ru-b1-drobnye-i-drobno-kolichestvennye-chislitelnye"],
    (11, 4): ["ru-b1-soyuzy-tseli-dlya-togo-chtoby", "ru-b1-poryadok-slov-emfatiko-b1"],
    (11, 5): ["ru-b1-soyuzy-prichiny-blagodarya-iz-za-vvidu", "ru-b1-soyuzy-usloviya-pri-uslovii-esli-by"],
    # 12 Эмиграция, жизнь за рубежом и межкультурный опыт
    (12, 1): ["ru-a2-budushchee-vremya-nsv-sv", "ru-a2-vremenni-soyuzy-kogda-poka-posle-togo-kak",
               "ru-b1-tvoritelnyy-padezh-vremeni-i-mesta"],
    (12, 2): ["ru-b1-glagoly-myshleniya-i-rechi", "ru-b1-sloznopodchinennye-izyasnitelnye-s-soyuzom-chto-chtoby"],
    (12, 3): ["ru-b1-kosvennaya-rech-izmenenie-mestoimeniy-i-glagolov", "ru-b1-soyuzy-ustupki-nesmotrya-na-vopreki"],
    (12, 4): ["ru-b1-otglagolnye-sushchestvitelnye-vvedenie", "ru-b1-sinonimiya-sintaksicheskikh-konstruktsiy"],
    (12, 5): ["ru-b1-soyuzy-usloviya-pri-uslovii-esli-by", "ru-b1-soyuzy-tseli-dlya-togo-chtoby"],
    # 13 Подготовка к сертификации B1 / ТРКИ-1 и обобщение
    (13, 1): ["ru-b1-slozhnosochinennye-predlozheniya-tozhe-takzhe", "ru-b1-vvodnye-slova-poryadok-mysley"],
    (13, 2): ["ru-b1-poryadok-slov-emfatiko-b1", "ru-b1-chastitsy-zhe-ved-daje-li"],
    (13, 3): ["ru-b1-vvodnye-slova-poryadok-mysley", "ru-b1-povelitelnoe-naklonenie-vezhlivaya-prosba"],
    (13, 4): ["ru-b1-prichastnyy-oborot-i-punktuatsiya", "ru-b1-deeprichastnyy-oborot-i-ego-normy"],
    (13, 5): ["ru-b1-sinonimiya-sintaksicheskikh-konstruktsiy", "ru-b1-vidy-glagola-v-infinitive"],
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
