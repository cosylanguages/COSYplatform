"""Normalise the Russian A2 curriculum text that did not match the rest of the course.

`Раздел 1: Прошлое и воспоминания` for the first nine units, three bare titles (`Учёба, образование и
курсы`, `Семья, друзья и отношения`, `Документы, безопасность и экстренные ситуации`), and a thirteenth
unit numbered `Раздел 10`. A2 now reads `Модуль N. Sentence case`, matching `curriculums/ru/general/A1.json`.

One lesson also carried an English `recycled:` line, `Carried over from A1: ...`, which reached slide 2 of
its deck as `Уже известно: Carried over from A1: ...`.

Two more slips: the 381 vocabulary items were written in Title Case (`Вчера`, `Прошлым летом`) while A1
writes them lowercase, and 16 lessons described their can-do in the bare infinitive (`описать свой учебный
путь`) instead of the third person the other 49 use. Acronyms (ТРКИ) and Latin level codes stay as written.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "curriculums/ru/general/A2.json"

TITLES = {
    1: "Модуль 1. Прошлое и воспоминания",
    2: "Модуль 2. Будущее, планы и условия",
    3: "Модуль 3. Жильё, город и ориентирование",
    4: "Модуль 4. Здоровье, самочувствие и медицина",
    5: "Модуль 5. Покупки, услуги и сервис",
    6: "Модуль 6. Путешествия и транспорт",
    7: "Модуль 7. Работа и рабочие процессы",
    8: "Модуль 8. Досуг, культура и развлечения",
    9: "Модуль 9. Природа, экология и погода",
    10: "Модуль 10. Учёба, образование и курсы",
    11: "Модуль 11. Семья, друзья и отношения",
    12: "Модуль 12. Документы, безопасность и экстренные ситуации",
    13: "Модуль 13. Повторение, обобщение и итоговый контроль",
}


ACRONYMS = ("ТРКИ",)
CAN_DO_OVERRIDES = {
    (13, 5): "Может уверенно общаться в стандартных ситуациях уровня A2 (ТРКИ-1)",
}


def lower_item(item):
    words = []
    for word in item.split(" "):
        if word in ACRONYMS or not re.search(r'[А-Яа-яЁё]', word):
            words.append(word)
        elif word.isupper() and len(word) > 1:
            words.append(word.lower())
        else:
            words.append(word[0].lower() + word[1:])
    return " ".join(words)


HW_IMPERATIVES = {
    "Опиши": "Опишите", "Расскажи": "Расскажите", "Объясни": "Объясните",
    "Напиши": "Напишите", "Представь": "Представьте", "Составь": "Составьте",
}


def formalise_hw(notes):
    match = re.search(r'^hw:\s*"(.*?)"\s*$', notes, re.M)
    if not match:
        return notes, False
    text = match.group(1)
    head, _, tail = text.partition(" ")
    if head not in HW_IMPERATIVES:
        return notes, False
    line = f'hw: "{HW_IMPERATIVES[head]} {tail}"'
    return notes[:match.start()] + line + notes[match.end():], True


def fix_can_do(key, notes):
    match = re.search(r'^cando:\s*"?(.*?)"?$', notes, re.M)
    if not match:
        return notes, False
    text = CAN_DO_OVERRIDES.get(key) or match.group(1)
    if not text.startswith("Может "):
        text = "Может " + text[0].lower() + text[1:]
    line = f'cando: "{text}"'
    if line[6:] == match.group(0)[6:]:
        return notes, False
    return notes[:match.start()] + line + notes[match.end():], True


def main():
    data = json.loads(CURRICULUM.read_text(encoding="utf-8"))
    renamed = 0
    for unit in data["units"]:
        title = TITLES.get(unit["unit"])
        if not title or unit["title"] == title:
            continue
        unit["title"] = title
        if "label" in unit:
            unit["label"] = title
        renamed += 1
    recycled = 0
    for unit in data["units"]:
        for lesson in unit["lessons"]:
            value = lesson.get("recycled") or ""
            if value.startswith("Carried over from A1:"):
                lesson["recycled"] = "Перенесено с A1:" + value[len("Carried over from A1:"):]
                recycled += 1

    lowered = can_dos = homeworks = 0
    for unit in data["units"]:
        for lesson in unit["lessons"]:
            fixed = [lower_item(w) for w in lesson.get("vocabulary") or []]
            if len(set(fixed)) != len(fixed):
                raise SystemExit(f"duplicate after lowering: {unit['unit']}.{lesson['lesson']}")
            if fixed != (lesson.get("vocabulary") or []):
                lesson["vocabulary"] = fixed
                lowered += 1
            lesson["teacher_notes"], changed = fix_can_do((unit["unit"], lesson["lesson"]), lesson["teacher_notes"])
            can_dos += changed
            lesson["teacher_notes"], changed = formalise_hw(lesson["teacher_notes"])
            homeworks += changed

    CURRICULUM.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"renamed {renamed} unit titles, translated {recycled} recycled lines, "
          f"lowercased {lowered} vocabulary lists, rewrote {can_dos} can-do lines "
          f"and {homeworks} homework notes")


if __name__ == "__main__":
    main()
