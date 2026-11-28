#!/usr/bin/env python3
"""Count decks whose can-do names a grammar form instead of a communicative task.

CEFR is action-oriented: a lesson's can-do should say what the learner can *do* with the language.
`Formare il congiuntivo presente` is a syllabus item, not a can-do, and a course built from such
can-dos is a grammar syllabus wearing a course's clothes.

This audit does not judge quality - it only flags the shape of the can-do string, using a
language-specific list of grammar terms. The output is meant to be read, not trusted blindly: every
flagged deck is listed with its can-do so the classification can be checked by eye.

Usage:
  python3 scripts/audit-can-do.py
  python3 scripts/audit-can-do.py --write      # docs/CAN_DO_AUDIT.md
  python3 scripts/audit-can-do.py --course general-italian-b1 --show 20
"""
from __future__ import annotations

import argparse
import collections
import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS = os.path.join(ROOT, "lessons")

# Grammar terms as they actually appear in the can-do strings of this platform.
TERMS = (
    # Italian
    "congiuntivo", "indicativo", "condizionale", "imperativo", "imperfetto", "trapassato",
    "passato prossimo", "passato remoto", "futuro anteriore", "gerundio", "participio",
    "pronomi", "pronominale", "preposizioni", "articoli", "aggettivi", "avverbi",
    "concordanza", "periodo ipotetico", "discorso indiretto", "forma passiva", "dislocazione",
    "frase scissa", "verbi", "coniugazione", "tempi del passato", "connettivi",
    # English
    "subjunctive", "conditional", "participle", "gerund", "infinitive", "reported speech",
    "passive voice", "relative clause", "phrasal verb", "preposition", "article",
    "tense", "tenses", "modal", "clause", "cleft", "inversion", "determiners",
    "quantifiers", "comparatives", "superlatives", "punctuation",
    # Russian
    "сослагательное", "условное", "причастия", "деепричастия", "падеж", "падежи",
    "спряжение", "вид глагола", "совершенный вид", "несовершенный вид", "местоимения",
    "предлоги", "артикли", "наклонение", "залог", "времена", "глаголы", "существительные",
    "прилагательные", "наречия", "словообразование",
    # Greek
    "υποτακτική", "προστακτική", "παρακείμενος", "αόριστος", "παρατατικός", "μέλλοντας",
    "κλιτικά", "αναφορικές", "επιρρήματα", "μετοχή", "άρθρα", "πτώσεις",
    # French
    "subjonctif", "conditionnel", "participe", "gérondif", "discours indirect", "voix passive",
    "pronoms", "prépositions", "articles", "temps du passé", "concordance des temps",
)

# Can-dos open with a wrapper ("I can", "Je peux", "Могу"); the verb that matters comes after it.
PREFIXES = (
    "i can ", "can ", "je peux ", "peut ", "peuvent ", "je sais ", "je suis capable de ", "j'arrive à ",
    "могу ", "я могу ", "μπορώ ", "posso ", "sono in grado di ", "ich kann ", "puedo ",
)

# The form is the object of these: "use articles", "choose between tenses".
FORM_HEADS = (
    "formare", "coniugare", "riconoscere", "distinguere", "applicare", "scegliere", "evitare",
    "usare", "utilizzare", "saper", "form", "conjugate", "recognise", "recognize",
    "distinguish", "apply", "choose", "avoid", "use", "employ",
    "образовывать", "спрягать", "различать", "употреблять", "использовать",
    "σχηματίζω", "κλίνω", "διακρίνω", "χρησιμοποιώ",
    # German and Spanish, so those courses are read at all
    "schreiben", "beschreiben", "erzählen", "sprechen", "fragen", "erklären",
    "vergleichen", "berichten", "sagen",
    "dar", "hablar", "describir", "contar", "explicar", "pedir", "comparar", "recomendar",
    "former", "conjuguer", "reconnaître", "distinguer",
)

# A communicative verb makes the grammar a tool inside a real task, not the target.
TASK_HEADS = (
    "parler", "décrire", "raconter", "analyser", "participer", "inciter", "signaler",
    "demander", "expliquer", "exprimer", "négocier", "argumenter", "rédiger", "présenter",
    "talk", "describe", "tell", "explain", "discuss", "argue", "analyse", "analyze",
    "evaluate", "negotiate", "critique", "lead", "present", "recommend", "compare",
    "persuade", "narrate", "complain", "review", "pitch", "summarise", "summarize",
    "report", "draft", "deliver", "demand", "propose", "edit", "translate", "judge",
    "say", "state", "outline", "name", "ask", "list", "identify", "spell",
    "compter", "nommer", "imaginer", "préparer", "évaluer", "rédiger", "composer",
    "modéliser", "rapporter", "nuancer", "mobiliser", "résumer", "traduire", "reformuler",
    "citer", "situer", "illustrer", "formuler", "prononcer", "acheter", "commander", "mettre",
    "parlare", "descrivere", "raccontare", "spiegare", "discutere", "sostenere",
    "argomentare", "presentare", "chiedere", "rispondere", "evidenziare",
    "esprimere", "formulare", "motivare", "commentare", "suggerire", "riferire",
    "dire", "esporre", "riassumere", "citare", "indicare", "dare", "confrontare",
    "рассказывать", "описывать", "говорить", "объяснять", "обсуждать", "анализировать",
    "сравнивать", "убеждать", "представлять", "жаловаться", "выражать", "формулировать",
    "μιλάω", "περιγράφω", "διηγούμαι", "εξηγώ", "συζητώ", "συγκρίνω", "εκφράζω", "διατυπώνω",
    "schreiben", "beschreiben", "erzählen", "sprechen", "fragen", "erklären",
    "vergleichen", "berichten", "sagen",
    "hablar", "describir", "contar", "explicar", "pedir", "comparar", "recomendar", "dar",
)


def classify(cando: str) -> str:
    """form-first, task-with-grammar, task, or empty."""
    text = (cando or "").strip().lower()
    if not text:
        return "empty"
    for prefix in PREFIXES:
        if text.startswith(prefix):
            text = text[len(prefix):]
            break
    head = text.split()[0].strip(",.:;") if text.split() else ""
    has_term = any(re.search(rf"\b{re.escape(term)}\b", text) for term in TERMS)
    # "use the language from Unit 3 in a speaking task" is a task, not a form drill.
    if "use the language" in text or "speaking task" in text or "in a longer" in text:
        return "task"
    # Task heads first: "formulare" starts with "form", and a prefix test for form verbs
    # would swallow it before the task list is consulted.
    if head.startswith(TASK_HEADS):
        return "task-with-grammar" if has_term else "task"
    if head.startswith(FORM_HEADS):
        return "form-first"
    return "form-first" if has_term else "task"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", nargs="?", const=os.path.join(ROOT, "docs", "CAN_DO_AUDIT.md"))
    parser.add_argument("--course", help="only report this course folder")
    parser.add_argument("--show", type=int, default=8, help="sample flagged can-dos per course")
    parser.add_argument("--explain", help="classify one can-do string and exit")
    args = parser.parse_args()

    if args.explain is not None:
        print(classify(args.explain))
        return 0

    per_course: dict[str, collections.Counter] = collections.defaultdict(collections.Counter)
    flagged: dict[str, list[tuple[str, str]]] = collections.defaultdict(list)
    for path in sorted(glob.glob(os.path.join(LESSONS, "*", "*.json"))):
        course = os.path.basename(os.path.dirname(path))
        if args.course and course != args.course:
            continue
        try:
            deck = json.load(open(path, encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if not isinstance(deck, dict):
            continue
        cando = deck.get("canDo") or ""
        kind = classify(cando)
        per_course[course][kind] += 1
        if kind == "form-first":
            flagged[course].append((os.path.basename(path), cando))

    total = collections.Counter()
    for counter in per_course.values():
        total.update(counter)

    lines = [
        "# Can-do audit: grammar form versus communicative task",
        "",
        "Generated by `scripts/audit-can-do.py`; regenerate, do not edit. A can-do that names a",
        "grammar form (`Formare il congiuntivo presente`) is a syllabus item, not a CEFR can-do:",
        "CEFR describes what the learner can do with the language, and the platform's own model puts",
        "the grammar in a thread inside a themed unit.",
        "",
        "`task-with-grammar` means the can-do names a form but the verb is communicative",
        "(`Je peux parler d'alimentation avec les pronoms en et y`) - what a grammar thread inside a",
        "themed unit should look like. The classifier is a triage aid, not a verdict: every flagged",
        "deck is sampled below so the call can be checked by eye.",
        "",
        f"Decks read: {sum(total.values())}.",
        f"form-first: {total['form-first']} | task-with-grammar: {total['task-with-grammar']} | "
        f"task: {total['task']} | empty: {total['empty']}",
        "",
        "| course | decks | task | task+grammar | form-first | form share |",
        "|---|---|---|---|---|---|",
    ]
    for course in sorted(per_course, key=lambda c: -per_course[c]["form-first"]):
        c = per_course[course]
        decks = sum(c.values())
        share = c["form-first"] / decks if decks else 0
        lines.append(f"| {course} | {decks} | {c['task']} | {c['task-with-grammar']} | "
                     f"{c['form-first']} | {share:.0%} |")

    lines += ["", "## Samples of flagged can-dos", ""]
    for course in sorted(flagged, key=lambda c: -len(flagged[c])):
        lines.append(f"### {course} ({len(flagged[course])} flagged)")
        for name, cando in flagged[course][:args.show]:
            lines.append(f"- `{name}` - {cando}")
        lines.append("")

    text = "\n".join(lines)
    if args.write:
        with open(args.write, "w", encoding="utf-8") as handle:
            handle.write(text)
        print(f"wrote {os.path.relpath(args.write, ROOT)}")
    else:
        print(text)
    if args.course:
        for course in per_course:
            c = per_course[course]
            print(f"{course}: {sum(c.values())} decks, form-first {c['form-first']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
