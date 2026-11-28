"""Normalise the mechanical slips in a Russian curriculum, level by level.

Every Russian shelf above A1 repeats the same five mistakes, so one script serves B1, B2, C1 and C2:

1. unit titles in a shape the rest of the course does not use — `Раздел 1: X` for the first modules, a
   bare `X` for the middle ones, and a `Раздел 10:` on the thirteenth;
2. vocabulary written in Title Case where the level below writes lowercase;
3. can-do statements in the first person (`Я могу ...`) or the bare infinitive (`описать ...`) where the
   rest of the shelf uses the third person;
4. homework notes addressing the learner as `ты` in an otherwise formal course;
5. the occasional English line in `recycled:`;
6. a final-exam lesson whose "vocabulary" is a description of the exam (`вся лексика уровня A2`).

Run it before building the decks; it prints what it changed and is idempotent.

    python3 scripts/content/normalize_ru_level.py --level B1
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

TITLE_PREFIX = re.compile(r'^(?:Раздел|МОДУЛЬ|MODULE|Модуль)\s*\d+\s*[:.]\s*', re.I)
ACRONYMS = ("ТРКИ",)
CAN_DO_OVERRIDES = {}
HW_IMPERATIVES = {
    "Опиши": "Опишите", "Расскажи": "Расскажите", "Объясни": "Объясните",
    "Напиши": "Напишите", "Представь": "Представьте", "Составь": "Составьте",
    "Прочитай": "Прочитайте", "Переведи": "Переведите", "Сравни": "Сравните",
    "Подготовь": "Подготовьте", "Выбери": "Выберите", "Приведи": "Приведите",
    "Обсуди": "Обсудите", "Опишите": "Опишите",
}
VOCABULARY_OVERRIDES = {
    ("A2", 13, 5): ["экзамен", "тест", "задание", "ответ", "результат", "сертификат"],
    ("B1", 13, 5): ["экзамен", "сертификат", "уровень", "письмо", "аудирование", "говорение"],
    ("B2", 13, 5): ["экзамен", "сертификат", "аргументация", "источник", "монолог", "оценка"],
}
CONJUGATED = re.compile(r'[А-Яа-яЁё]+(?:ет|ит|ат|ят|ут|ют|тся)$')
RECYCLED = {
    "Carried over from A1:": "Перенесено с A1:",
    "Carried over from A2:": "Перенесено с A2:",
    "Carried over from B1:": "Перенесено с B1:",
}


def sentence_case(text):
    text = text.strip()
    if not text or not re.search(r'[А-Яа-яЁё]', text[:1]):
        return text
    return text[0].upper() + text[1:]


def unit_title(number, current):
    return f"Модуль {number}. {sentence_case(TITLE_PREFIX.sub('', current))}"


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


def fix_can_do(key, notes):
    match = re.search(r'^cando:\s*"?(.*?)"?$', notes, re.M)
    if not match:
        return notes, False
    text = CAN_DO_OVERRIDES.get(key) or match.group(1).strip()
    if text.startswith("Я могу "):
        text = "Может " + text[len("Я могу "):]
    elif text.startswith("Может "):
        head = text.split(" ", 2)[1] if len(text.split(" ")) > 2 else ""
        if CONJUGATED.match(head) and not head.endswith("ть"):
            text = text[len("Может "):]
            text = text[0].upper() + text[1:]
    else:
        text = "Может " + text[0].lower() + text[1:]
    line = f'cando: "{text}"'
    if line == match.group(0):
        return notes, False
    return notes[:match.start()] + line + notes[match.end():], True


def formalise_hw(notes):
    match = re.search(r'^hw:\s*"(.*?)"\s*$', notes, re.M)
    if not match:
        return notes, False
    head, _, tail = match.group(1).partition(" ")
    if head not in HW_IMPERATIVES or HW_IMPERATIVES[head] == head:
        return notes, False
    line = f'hw: "{HW_IMPERATIVES[head]} {tail}"'
    return notes[:match.start()] + line + notes[match.end():], True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", required=True)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    path = ROOT / "curriculums/ru/general" / f"{args.level.upper()}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    counts = dict(titles=0, vocabulary=0, duplicates=0, can_do=0, homework=0, recycled=0)

    level = args.level.upper()
    for unit in data["units"]:
        title = unit_title(unit["unit"], unit["title"])
        if title != unit["title"]:
            unit["title"] = title
            if "label" in unit:
                unit["label"] = title
            counts["titles"] += 1
        for lesson in unit["lessons"]:
            current = lesson.get("vocabulary") or []
            wanted = VOCABULARY_OVERRIDES.get((level, unit["unit"], lesson["lesson"])) or current
            lowered = list(dict.fromkeys(lower_item(w) for w in wanted))
            counts["duplicates"] += len(wanted) - len(lowered)
            if lowered != current:
                lesson["vocabulary"] = lowered
                counts["vocabulary"] += 1
            key = (unit["unit"], lesson["lesson"])
            lesson["teacher_notes"], changed = fix_can_do(key, lesson.get("teacher_notes") or "")
            counts["can_do"] += changed
            lesson["teacher_notes"], changed = formalise_hw(lesson["teacher_notes"])
            counts["homework"] += changed
            recycled = lesson.get("recycled") or ""
            for english, russian in RECYCLED.items():
                if recycled.startswith(english):
                    lesson["recycled"] = russian + recycled[len(english):]
                    counts["recycled"] += 1
                    break

    summary = ", ".join(f"{v} {k.replace('_', ' ')}" for k, v in counts.items())
    print(f"{args.level.upper()}: {summary}")
    if not args.dry_run:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
