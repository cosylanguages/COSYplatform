#!/usr/bin/env python3
"""Find content written in the wrong script for the language it belongs to.

The platform is monolingual: a Russian lesson teaches Russian words, a Greek lesson Greek words. This
reads every curriculum, takes the script the language is written in, and reports the vocabulary items
and teacher-note fields that carry no character of that script at all. It then repeats the check on
the built decks, where a stray English sentence in a slide is the same defect one step later.

    python3 scripts/audit-monolingual.py [--write]
"""
from __future__ import annotations

import argparse
import collections
import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SCRIPTS = {
    'latin': re.compile(r'[A-Za-zÀ-ÖØ-öø-ÿĀ-ž]'),
    'cyrillic': re.compile(r'[А-Яа-яЁё]'),
    'greek': re.compile(r'[Α-Ωα-ωΆ-Ώά-ώ]'),
    'armenian': re.compile(r'[\u0530-\u058F]'),
    'georgian': re.compile(r'[\u10A0-\u10FF]'),
}

LANGUAGE_SCRIPT = {
    'en': 'latin', 'fr': 'latin', 'it': 'latin', 'de': 'latin', 'es': 'latin', 'pt': 'latin',
    'br': 'latin', 'el': 'greek', 'ru': 'cyrillic', 'ba': 'cyrillic', 'tt': 'cyrillic',
    'cv': 'cyrillic', 'hy': 'armenian', 'ka': 'georgian',
}

# a phrase shorter than this is often a proper noun, a loanword or a model answer
MIN_CHARS = 2


def foreign(text, script):
    """True when the text has no character at all from the expected script."""
    if not text or not text.strip():
        return False
    if len(text.strip()) < MIN_CHARS:
        return False
    return not SCRIPTS[script].search(text)


def curriculum_rows():
    rows = []
    for path in sorted(glob.glob(os.path.join(ROOT, 'curriculums', '*', '*', '*.json'))):
        lang = path.split(os.sep)[-3]
        script = LANGUAGE_SCRIPT.get(lang)
        if not script:
            continue
        data = json.load(open(path, encoding='utf-8'))
        lessons = [l for u in data.get('units', []) for l in u.get('lessons', [])]
        if not lessons:
            continue
        bad_vocab, bad_cando, samples = 0, 0, []
        for lesson in lessons:
            vocab = lesson.get('vocabulary') or []
            offenders = [w for w in vocab if foreign(w, script)]
            if vocab and len(offenders) == len(vocab):
                bad_vocab += 1
                if len(samples) < 2:
                    samples.append((lesson.get('title', '?')[:40], ', '.join(offenders[:4])))
            notes = lesson.get('teacher_notes') or ''
            match = re.search(r'cando:\s*"([^"]+)"', notes)
            if match and foreign(match.group(1), script):
                bad_cando += 1
        rows.append({'course': f'{lang}/{os.sep.join(path.split(os.sep)[-2:])}',
                     'lang': lang, 'lessons': len(lessons),
                     'all_foreign_vocab': bad_vocab, 'foreign_cando': bad_cando, 'samples': samples})
    return rows


def deck_rows():
    rows = collections.defaultdict(lambda: {'decks': 0, 'leaky': 0, 'examples': []})
    for path in glob.glob(os.path.join(ROOT, 'lessons', '*', '*.json')):
        folder = path.split(os.sep)[-2]
        data = json.load(open(path, encoding='utf-8'))
        if not isinstance(data, dict) or 'slides' not in data:
            continue
        lang = data.get('language') or next(
            (c for c in LANGUAGE_SCRIPT if os.path.basename(path).startswith(f'{c}-')), None)
        if lang not in LANGUAGE_SCRIPT:
            continue
        script = LANGUAGE_SCRIPT[lang]
        decks = rows[lang]
        decks['decks'] += 1
        leak = ''
        for slide in data.get('slides', []):
            for element in slide.get('elements', []):
                content = element.get('content') or ''
                words = re.findall(r'[A-Za-zА-Яа-я]{4,}', content)
                latin = [w for w in words if SCRIPTS['latin'].search(w) and not SCRIPTS['cyrillic'].search(w)]
                if script != 'latin' and len(latin) >= 3 and not leak:
                    leak = f"{slide.get('stage')}: {content[:60]}"
        if leak:
            decks['leaky'] += 1
            if len(decks['examples']) < 2:
                decks['examples'].append((folder, leak))
    return rows


def render(rows, decks):
    lines = ['# Monolingual audit', '',
             'Every language on the platform is taught in itself, so a curriculum field or a slide written in',
             'another script is a defect, not a style choice. A vocabulary list counts as foreign only when',
             '*every* item in it is foreign, which is what a translated shell looks like.', '',
             '## Curricula', '',
             '| course | lessons | lessons whose vocabulary is entirely foreign | lessons with a foreign cando |',
             '|---|---|---|---|']
    for row in sorted(rows, key=lambda r: (-r['all_foreign_vocab'], r['course'])):
        lines.append(f"| {row['course']} | {row['lessons']} | {row['all_foreign_vocab']} | {row['foreign_cando']} |")
    flagged = [r for r in rows if r['all_foreign_vocab'] or r['foreign_cando']]
    lines += ['', '### What the flagged lists actually contain', '']
    if not flagged:
        lines.append('No curriculum pairs a language with vocabulary in another script.')
    for row in flagged:
        lines.append(f"- **{row['course']}**: {row['all_foreign_vocab']}/{row['lessons']} lessons fully foreign")
        for title, sample in row['samples']:
            lines.append(f"  - {title} — {sample}")

    lines += ['', '## Decks', '',
              'A deck leaks when a slide carries three or more Latin-script words in a language that is not',
              'written in Latin script. One leak is enough to flag the deck.', '',
              '| language | decks | decks with a Latin leak |', '|---|---|---|']
    for lang, data in sorted(decks.items()):
        lines.append(f"| {lang} | {data['decks']} | {data['leaky']} |")
    for lang, data in sorted(decks.items()):
        for folder, example in data['examples']:
            lines.append(f"- {lang} `{folder}` — {example}")

    lines += ['', '## What this cannot tell you', '',
              '- A vocabulary list written half in the target language and half in English is not counted;',
              '  only fully foreign lists are, so a partial rewrite still shows as clean.',
              '- Loanwords spelled in the target script (кафе, метро) are correct and pass.',
              '- This measures script, not level: a Russian word can be foreign to A1 and still be Russian.', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    rows = curriculum_rows()
    decks = deck_rows()
    total = sum(r['all_foreign_vocab'] for r in rows)
    lessons = sum(r['lessons'] for r in rows)
    print(f"curricula {len(rows)} · {total}/{lessons} lessons with fully foreign vocabulary "
          f"· decks flagged {sum(d['leaky'] for d in decks.values())}/{sum(d['decks'] for d in decks.values())}")
    for row in sorted(rows, key=lambda r: -r['all_foreign_vocab'])[:6]:
        if row['all_foreign_vocab'] or row['foreign_cando']:
            print(f"  {row['course']}: vocab {row['all_foreign_vocab']}/{row['lessons']} · cando {row['foreign_cando']}")
    if args.write:
        path = os.path.join(ROOT, 'docs', 'MONOLINGUAL_AUDIT.md')
        with open(path, 'w', encoding='utf-8') as handle:
            handle.write(render(rows, decks) + '\n')
        print(f'wrote {path}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
