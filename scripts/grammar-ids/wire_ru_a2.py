"""Give all 65 Russian A2 lessons their grammar ids.

The curriculum shipped with ids on 40 of its 65 lessons, and most of those pointed at the A1 shelf: the
lesson on the past tense and aspect cited `ru-a1-proshedshee-vremya`, although the A2 shelf has its own
`ru-a2-proshedshee-vremya-i-vid`. Since A2 is where aspect, the prefixed verbs of motion, the oblique
cases of который and the conditionals get their real treatment, every lesson is re-pointed at the A2
page that teaches it, and falls back to an A1 page only where the A2 shelf has no equivalent (the
accusative of direction, the numerals-plus-genitive rule, хотеть, demonstratives, possessives).

The pair per lesson follows the order of the lesson: the first id is the point the lesson teaches, the
second the point it practises.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/ru/general/A2.json"
SHELF = Path("/workspace/COSYmanuals/manuals/ru/grammar")

IDS = {
    # 1 Прошлое и воспоминания
    (1, 1): ["ru-a2-proshedshee-vremya-i-vid", "ru-a2-vidy-glagola-osnovy-nsv-sv"],
    (1, 2): ["ru-a2-vidy-glagola-v-proshedshem-vremeni", "ru-a2-proshedshee-vremya-osobennosti"],
    (1, 3): ["ru-a2-vinityelnyy-padezh-prilagatelnykh-i-mestoimeniy", "ru-a1-vinitelnyy-padezh-napravlenie"],
    (1, 4): ["ru-a2-soglasovanie-chislitelnykh-s-prilagatelnymi", "ru-a1-roditelnyy-padezh-chislitelnye"],
    (1, 5): ["ru-a2-vremenni-soyuzy-kogda-poka-posle-togo-kak", "ru-a2-proshedshee-vremya-i-vid"],
    # 2 Будущее, планы и условия
    (2, 1): ["ru-a2-budushchee-vremya-nsv-sv", "ru-a2-vidy-glagola-v-budushchem-vremeni"],
    (2, 2): ["ru-a2-uslovnye-predlozheniya-esli", "ru-a2-uslovnye-predlozheniya-esli-esli-by"],
    (2, 3): ["ru-a2-konstruktsii-dolzhen-obyazan-nado", "ru-a1-glagol-khotet"],
    (2, 4): ["ru-a2-vvodnye-slova-i-frazy-a2", "ru-a2-budushchee-vremya-nsv-sv"],
    (2, 5): ["ru-a2-soslagatelnoe-naklonenie-by", "ru-a2-uslovnye-predlozheniya-esli-esli-by"],
    # 3 Жильё, город и ориентирование
    (3, 1): ["ru-a2-predlozhnyy-padezh-prilagatelnykh-i-mestoimeniy", "ru-a2-predlozhnyy-padezh-vtoroy-predlozhnyy-na-u"],
    (3, 2): ["ru-a2-sravnenie-i-prevoskhodnaya-stepen", "ru-a2-prevochodnaya-stepen-naibolee-samyy"],
    (3, 3): ["ru-a2-glagoly-dvizheniya-bez-pristavok", "ru-a2-vidovye-pary-glagolov"],
    (3, 4): ["ru-a2-povelitelnoe-naklonenie-pust-pust-davaite", "ru-a2-povelitelnaya-mnojestvennaya-forma"],
    (3, 5): ["ru-a2-roditelnyy-padezh-predlogi-iz-ot-do-dlya-bez", "ru-a2-roditelnyy-padezh-prilagatelnykh-i-mestoimeniy"],
    # 4 Здоровье, самочувствие и медицина
    (4, 1): ["ru-a2-bezlichnye-glagoly-mne-ne-seditsya", "ru-a2-datelnyy-padezh-bezlichnye-predlozheniya"],
    (4, 2): ["ru-a2-vidy-glagola-v-povelitelnom-naklonenii", "ru-a2-konstruktsii-dolzhen-obyazan-nado"],
    (4, 3): ["ru-a2-tvoritelnyy-padezh-prilagatelnykh-i-mestoimeniy", "ru-a2-glagolnye-konstruktsii-soit-zanimatsya"],
    (4, 4): ["ru-a2-vyrazhenie-doba-i-chasa-vremeni", "ru-a2-povelitelnoe-naklonenie-pust-pust-davaite"],
    (4, 5): ["ru-a2-glagoly-chuvstv-i-vospriyatiya", "ru-a2-vozvratnye-glagoly-na-sya"],
    # 5 Покупки, услуги и сервис
    (5, 1): ["ru-a2-mestoimeniya-kto-to-chto-to-kto-nibud", "ru-a2-roditelnyy-padezh-prilagatelnykh-i-mestoimeniy"],
    (5, 2): ["ru-a1-ukazatelnye-mestoimeniya-etot-eta-eto-eti", "ru-a2-mestoimeniya-ves-kazhdyy-lyuboy-sam"],
    (5, 3): ["ru-a2-soyuzy-prichiny-i-sledstviya-poetomu-tak-kak", "ru-a2-proshedshee-vremya-i-vid"],
    (5, 4): ["ru-a2-datelnyy-padezh-predlogi-k-i-po", "ru-a2-tvoritelnyy-padezh-predlogi-za-pod-nad-peryed"],
    (5, 5): ["ru-a2-roditelnyy-padezh-mnozhestvennogo-chisla", "ru-a2-glagolnye-konstruktsii-soit-zanimatsya"],
    # 6 Путешествия и транспорт
    (6, 1): ["ru-a2-pristavochnye-glagoly-dvizheniya", "ru-a2-glagoly-dvizheniya-s-pristavkami-v-vy-dop-pere"],
    (6, 2): ["ru-a2-glagoly-dvizheniya-s-pristavkami-po-pri-u", "ru-a2-pristavochnye-glagoly-dvizheniya"],
    (6, 3): ["ru-a2-roditelnyy-padezh-mnozhestvennogo-chisla", "ru-a2-datelnyy-padezh-predlogi-k-i-po"],
    (6, 4): ["ru-a2-soyuzy-prichiny-i-sledstviya-poetomu-tak-kak", "ru-a2-vvodnye-slova-i-frazy-a2"],
    (6, 5): ["ru-a2-mestoimenie-kotoryy", "ru-a2-kotoryi-v-kosvennyh-padezhah"],
    # 7 Работа и рабочие процессы
    (7, 1): ["ru-a2-vozvratnye-glagoly-na-sya", "ru-a2-konstruktsii-dolzhen-obyazan-nado"],
    (7, 2): ["ru-a2-vvodnye-slova-i-frazy-a2", "ru-a2-poryadok-slov-tema-rema-a2"],
    (7, 3): ["ru-a2-povelitelnoe-naklonenie-pust-pust-davaite", "ru-a2-budushchee-vremya-nsv-sv"],
    (7, 4): ["ru-a2-tvoritelnyy-padezh-predlogi-za-pod-nad-peryed", "ru-a2-proshedshee-vremya-i-vid"],
    (7, 5): ["ru-a2-datelnyy-padezh-prilagatelnykh-i-mestoimeniy", "ru-a2-datelnyy-padezh-predlogi-k-i-po"],
    # 8 Досуг, культура и развлечения
    (8, 1): ["ru-a2-povelitelnoe-naklonenie-pust-pust-davaite", "ru-a2-datelnyy-padezh-predlogi-k-i-po"],
    (8, 2): ["ru-a2-datelnyy-padezh-prilagatelnykh-i-mestoimeniy", "ru-a2-mestoimenie-kotoryy"],
    (8, 3): ["ru-a2-tvoritelnyy-padezh-prilagatelnykh-i-mestoimeniy", "ru-a2-roditelnyy-padezh-prilagatelnykh-i-mestoimeniy"],
    (8, 4): ["ru-a2-soyuzy-prichiny-i-sledstviya-poetomu-tak-kak", "ru-a2-kotoryi-v-kosvennyh-padezhah"],
    (8, 5): ["ru-a2-roditelnyy-padezh-predlogi-iz-ot-do-dlya-bez", "ru-a2-glagoly-chuvstv-i-vospriyatiya"],
    # 9 Природа, экология и погода
    (9, 1): ["ru-a2-bezlichnye-glagoly-mne-ne-seditsya", "ru-a2-vyrazhenie-doba-i-chasa-vremeni"],
    (9, 2): ["ru-a2-konstruktsii-dolzhen-obyazan-nado", "ru-a2-ustupitelnye-soyuzy-khotya-nesmotrya-na"],
    (9, 3): ["ru-a2-roditelnyy-padezh-mnozhestvennogo-chisla", "ru-a2-vse-padezhi-mnozhestvennoe-chislo-obzor"],
    (9, 4): ["ru-a2-glagoly-dvizheniya-s-pristavkami-po-pri-u", "ru-a2-pristavochnye-glagoly-dvizheniya"],
    (9, 5): ["ru-a2-bezlichnye-glagoly-mne-ne-seditsya", "ru-a2-kratkie-prilagatelnye"],
    # 10 Учёба, образование и курсы
    (10, 1): ["ru-a2-roditelnyy-padezh-mnozhestvennogo-chisla", "ru-a2-kratkie-prilagatelnye"],
    (10, 2): ["ru-a2-glagolnye-konstruktsii-soit-zanimatsya", "ru-a2-vozvratnye-glagoly-na-sya"],
    (10, 3): ["ru-a2-kosvennaya-rech-vvedenie", "ru-a2-povelitelnaya-mnojestvennaya-forma"],
    (10, 4): ["ru-a2-datelnyy-padezh-predlogi-k-i-po", "ru-a2-budushchee-vremya-nsv-sv"],
    (10, 5): ["ru-a2-kosvennaya-rech-i-mestoimeniya", "ru-a2-sravnenie-s-soyuzom-chem-i-roditelnym-padezhem"],
    # 11 Семья, друзья и отношения
    (11, 1): ["ru-a1-prityazhatelnye-mestoimeniya", "ru-a2-mestoimeniya-ves-kazhdyy-lyuboy-sam"],
    (11, 2): ["ru-a2-povelitelnoe-naklonenie-pust-pust-davaite", "ru-a2-uslovnye-predlozheniya-esli"],
    (11, 3): ["ru-a2-soyuzy-prichiny-i-sledstviya-poetomu-tak-kak", "ru-a2-ustupitelnye-soyuzy-khotya-nesmotrya-na"],
    (11, 4): ["ru-a2-proshedshee-vremya-i-vid", "ru-a2-vremenni-soyuzy-kogda-poka-posle-togo-kak"],
    (11, 5): ["ru-a2-predlozhnyy-padezh-prilagatelnykh-i-mestoimeniy", "ru-a2-mestoimenie-kotoryy"],
    # 12 Документы, безопасность и экстренные ситуации
    (12, 1): ["ru-a2-roditelnyy-padezh-prilagatelnykh-i-mestoimeniy", "ru-a2-datelnyy-padezh-predlogi-k-i-po"],
    (12, 2): ["ru-a2-povelitelnoe-naklonenie-pust-pust-davaite", "ru-a2-bezlichnye-glagoly-mne-ne-seditsya"],
    (12, 3): ["ru-a2-konstruktsii-dolzhen-obyazan-nado", "ru-a2-ustupitelnye-soyuzy-khotya-nesmotrya-na"],
    (12, 4): ["ru-a2-kosvennaya-rech-vvedenie", "ru-a2-soyuzy-prichiny-i-sledstviya-poetomu-tak-kak"],
    (12, 5): ["ru-a2-proshedshee-vremya-i-vid", "ru-a2-ot-otritsatelnye-mestoimeniya-s-predlogami"],
    # 13 Повторение, обобщение и итоговый контроль
    (13, 1): ["ru-a2-vse-padezhi-mnozhestvennoe-chislo-obzor", "ru-a2-roditelnyy-padezh-prilagatelnykh-i-mestoimeniy"],
    (13, 2): ["ru-a2-vidovye-pary-glagolov", "ru-a2-pristavochnye-glagoly-dvizheniya"],
    (13, 3): ["ru-a2-soyuzy-prichiny-i-sledstviya-poetomu-tak-kak", "ru-a2-ustupitelnye-soyuzy-khotya-nesmotrya-na",
              "ru-a2-mestoimenie-kotoryy"],
    (13, 4): ["ru-a2-vvodnye-slova-i-frazy-a2", "ru-a2-povelitelnoe-naklonenie-pust-pust-davaite"],
    (13, 5): ["ru-a2-vse-padezhi-mnozhestvennoe-chislo-obzor", "ru-a2-vidy-glagola-osnovy-nsv-sv"],
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
