"""Normalise the Russian A1 unit titles.

The curriculum mixed three spellings of the same thing: `Раздел 0: Первые шаги (A0)`, `MODULE 1. ПЕРВЫЙ
КОНТАКТ И ЛИЧНЫЙ ПРОФИЛЬ` (Latin, shouted) and `МОДУЛЬ 2. СЕМЬЯ И СОЦИАЛЬНЫЕ СВЯЗИ` (Cyrillic, shouted).
The entry band is A1 — there is no A0 level — so the level marker goes, and every title reads
`Модуль N. Sentence case`, the shape the French shelf uses.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/ru/general/A1.json"

TITLES = {
    0: "Модуль 0. Первые шаги",
    1: "Модуль 1. Первый контакт и личный профиль",
    2: "Модуль 2. Семья и социальные связи",
    3: "Модуль 3. Дом и повседневная жизнь",
    4: "Модуль 4. Распорядок дня и время",
    5: "Модуль 5. Еда и напитки",
    6: "Модуль 6. Покупки и деньги",
    7: "Модуль 7. Одежда и внешность",
    8: "Модуль 8. Здоровье и тело",
    9: "Модуль 9. Работа и образование",
    10: "Модуль 10. Языки и общение",
    11: "Модуль 11. Транспорт и путешествия",
    12: "Модуль 12. Город и места",
    13: "Модуль 13. Погода и природа",
    14: "Модуль 14. Досуг и хобби",
    15: "Модуль 15. Технологии",
    16: "Модуль 16. Праздники, культура и события",
    17: "Модуль 17. Прошлый опыт (переход к A2)",
    18: "Модуль 18. Планы на будущее и мечты",
    19: "Модуль 19. Сравнение окружающего мира",
    20: "Модуль 20. Мнения и социальное взаимодействие",
    21: "Модуль 21. Навыки выживания",
    22: "Модуль 22. Итоговые проекты",
}


def main():
    data = json.loads(CURRICULUM.read_text(encoding="utf-8"))
    renamed = 0
    for unit in data["units"]:
        title = TITLES.get(unit["num"])
        if not title or unit["title"] == title:
            continue
        unit["title"] = title
        if "label" in unit:
            unit["label"] = title
        renamed += 1
    CURRICULUM.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"renamed {renamed} unit titles")


if __name__ == "__main__":
    main()
