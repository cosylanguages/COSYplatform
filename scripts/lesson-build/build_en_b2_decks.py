"""Build the English B2 lesson decks from the curriculum plus the COSYmanuals topic pages.

Every lesson names its grammar points, and each page supplies the rule, the table, the examples, the
traps and the exercise, so the deck presents authored material. Only the scaffolding sentences are
templated.

    python3 scripts/lesson-build/build_en_b2_decks.py [--write]

Without --write it prints a summary and the first deck it would emit.
"""
import argparse
import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import manual_page

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MANUALS = os.environ.get('COSY_MANUALS', '/workspace/COSYmanuals')
MANUALS_URL = 'https://cosylanguages.github.io/COSYManuals/'

LEVEL = 'b2'
COURSE = 'general-en-b2'
TRACK_TITLE = 'General English B2'
FOLDER = 'general-english-b2'
PREVIOUS = 'the general B1 course'


def slug(text):
    s = unicodedata.normalize('NFD', text.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('&', ' and ').replace("'", '-').replace('’', '-')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def page_for(grammar_id):
    level, topic = grammar_id.split('-')[1], grammar_id.split('-', 2)[2]
    path = os.path.join(MANUALS, 'manuals', 'en', 'grammar', level, 'topics', topic + '.html')
    return level, topic, manual_page.parse(open(path, encoding='utf-8').read())


def teacher_note(notes, key):
    m = re.search(key + r':\s*\\?"(.*?)\\?"\s*(?:\\n|\n)', (notes or '') + '\n')
    return m.group(1).strip() if m else ''


def build_deck(lesson, unit, next_title, code, unit_vocab=None):
    ids = lesson['grammarIds']
    pages = [page_for(i) for i in ids]
    level0, topic0, page = pages[0]
    second = pages[1] if len(pages) > 1 else None
    vocab = lesson.get('vocabulary') or unit_vocab or [r['element'] for r in page['table'][:8]]
    notes = lesson.get('teacher_notes') or ''
    cando = teacher_note(notes, 'cando') or page['outcome'] or page['subtitle']
    homework_note = teacher_note(notes, 'hw')
    recycled = lesson.get('recycled') or f'Revision of {PREVIOUS}.'

    deck_id = f'en-{LEVEL}-{slug(lesson["title"])}'
    duration = lesson.get('duration_minutes', 60)

    ex = page['examples']
    def ex_line(e):
        head = '' if re.match(r'^(Example|Exemple) \d+$', e['label'] or '') else (e['label'] + ' — ' if e['label'] else '')
        return head + e['text'] + (f" ({e['comment']})" if e['comment'] else '')

    ex_lines = [ex_line(e) for e in ex]
    table_lines = [f"{r['element']} — {r['role']}: {r['example']}" for r in page['table'][:6]]
    trap_lines = [f"❌ {t['wrong']} → ✅ {t['right']}" for t in page['traps'][:2]]
    check = page['checklist'][:3]
    practice = page['practice'][:3]
    ccq = page['ccq'][:2]
    grammar_rule = page['rule'] or page['observe']

    slides = []

    slides.append({
        'id': f'{deck_id}-slide-1',
        'title': '1. Objective and overview',
        'stage': 'warm-up',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': f'Can-do objective: {cando}'},
            {'type': 'blockquote', 'content':
                f"Course overview:\n- Level: B2 General English\n- Unit: {unit}\n"
                f"- Duration: {duration} minutes\n- Code: {code}"},
            {'type': 'instruction', 'content': (f'In pairs, three minutes: what does this sentence already tell you? '
                                                f'{ex[0]["text"]}') if ex else
                'In pairs, three minutes: say the objective again in your own words.'},
            {'type': 'input', 'placeholder': 'Your version of the objective…'},
        ],
    })

    slides.append({
        'id': f'{deck_id}-slide-2',
        'title': '2. Recycling and link to what you know',
        'stage': 'recycling',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': f'Already in place: {recycled}'},
            {'type': 'blockquote', 'content': 'Vocabulary to recycle: ' + ', '.join(vocab[:3])},
            {'type': 'instruction', 'content': 'From memory: what does this word mean, and where did you meet it?'},
            {'type': 'input', 'placeholder': f'{vocab[0]} — meaning and context' if vocab else 'Your answer…'},
        ],
    })

    slides.append({
        'id': f'{deck_id}-slide-3',
        'title': '3. Core vocabulary and expressions',
        'stage': 'input',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': f'Active vocabulary for this lesson ({len(vocab)} items):'},
            {'type': 'blockquote', 'content': '\n'.join(vocab)},
            {'type': 'instruction', 'content': 'Sort these words in two columns: actions and things, versus ideas and positions.'},
            {'type': 'input', 'placeholder': 'Actions and things: … / Ideas and positions: …'},
            {'type': 'instruction', 'content': f'Use three of them in a sentence that could appear in a text about {page["title"].lower()}.'},
        ],
    })

    slides.append({
        'id': f'{deck_id}-slide-4',
        'title': '4. Pronunciation and rhythm',
        'stage': 'pronunciation',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': 'Pronunciation note for this grammar point:'},
            {'type': 'blockquote', 'content': page['pron'] or (f'Say this clearly: {ex[0]["text"]}' if ex else 'Say this clearly.')},
            {'type': 'instruction', 'content': 'Read it aloud, then record yourself: the main stress falls on the content word, not on the hedge.'},
            {'type': 'input', 'placeholder': 'The sentence you read (transcription or IPA)…'},
        ],
    })

    practice_elements = [
        {'type': 'instruction', 'content': f'Grammar focus: {page["title"]}.'},
        {'type': 'blockquote', 'content': grammar_rule + ('\n\n' + '\n'.join(table_lines) if table_lines else '')},
    ]
    for i in ids:
        practice_elements.append({'type': 'grammar-focus', 'grammarId': i})
    practice_elements.append({'type': 'instruction', 'content': 'Guided practice: choose the correct option.'})
    for q in practice:
        practice_elements.append({'type': 'test', 'content': q['question'], 'options': q['options']})
    slides.append({
        'id': f'{deck_id}-slide-5',
        'title': '5. Grammar focus and guided practice',
        'stage': 'grammar',
        'duration': duration,
        'mode': 'all',
        'elements': practice_elements,
    })

    reading_elements = [
        {'type': 'instruction', 'content': 'Read and listen: three examples in context.'},
        {'type': 'blockquote', 'content': '\n'.join(ex_lines)},
    ]
    if page['observe']:
        reading_elements.append({'type': 'instruction', 'content': 'What do you observe?'})
        reading_elements.append({'type': 'blockquote', 'content': page['observe']})
    for q in ccq:
        reading_elements.append({'type': 'test', 'content': q['question'], 'options': q['options']})
    reading_elements.append({'type': 'instruction', 'content': 'State the rule in one sentence, without looking at the table.'})
    reading_elements.append({'type': 'input', 'placeholder': 'The rule in one sentence…'})
    slides.append({
        'id': f'{deck_id}-slide-6',
        'title': '6. Reading, listening and comprehension',
        'stage': 'reading-listening',
        'duration': duration,
        'mode': 'all',
        'elements': reading_elements,
    })

    slides.append({
        'id': f'{deck_id}-slide-7',
        'title': '7. Freer practice',
        'stage': 'freer-practice',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': f'Freer production: {cando}'},
            {'type': 'blockquote', 'content': 'Success criteria:\n' + '\n'.join(f'- {c}' for c in check)},
            {'type': 'instruction', 'content': 'Role play: put your position in ninety seconds; your partner notes every use of the target structure.'},
            {'type': 'input', 'placeholder': 'Your production (ten lines)…'},
        ],
    })

    trap_elements = [
        {'type': 'instruction', 'content': 'Frequent errors and correction:'},
        {'type': 'blockquote', 'content': '\n'.join(trap_lines) or 'No recorded error for this point.'},
        {'type': 'instruction', 'content': 'Correct these sentences: say what is wrong, then give the right version.'},
        {'type': 'input', 'placeholder': 'Correction and explanation…'},
    ]
    if len(page['extra']) >= 2:
        trap_elements.append({'type': 'instruction', 'content': 'Acceptable variants:'})
        trap_elements.append({'type': 'blockquote', 'content':
            '\n'.join(f"{e['text']}" for e in page['extra'][:3])})
    slides.append({
        'id': f'{deck_id}-slide-8',
        'title': '8. Frequent errors and correction',
        'stage': 'adaptation',
        'duration': duration,
        'mode': 'all',
        'elements': trap_elements,
    })

    second_title = second[2]['title'] if second else page['title']
    second_rule = second[2]['rule'][:180] if second else page['rule'][:180]
    slides.append({
        'id': f'{deck_id}-slide-9',
        'title': '9. Adapting the task',
        'stage': 'adaptation',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': 'Adapt the same task to the group:'},
            {'type': 'blockquote', 'content':
                '- Individual: five sentences with the structure, on the topic of the lesson.\n'
                f'- Pair: a ten-line dialogue where {second_title.lower()} carries the argument.\n'
                '- Group: a six-minute debate, two sides, the structure required in every turn.\n'
                '- Professional audience: transpose the structure into a memo.\n'
                '- Academic audience: transpose it into a paragraph of analysis.'},
            {'type': 'instruction', 'content': f'Second grammar point of the lesson: {second_title}. {second_rule}'},
            {'type': 'input', 'placeholder': 'Your adaptation…'},
        ],
    })

    hw = homework_note or (f'Write ten lines using {page["title"].lower()}, with at least two sentences '
                           f'you have checked against the manual page.')
    slides.append({
        'id': f'{deck_id}-slide-10',
        'title': '10. Review and homework',
        'stage': 'cool-down',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': 'Can you already use this?'},
            {'type': 'blockquote', 'content': '\n'.join(f'- {c}' for c in check)},
            {'type': 'instruction', 'content': f'Homework: {hw}'},
            {'type': 'instruction', 'content': f'Next lesson: {next_title}.'},
        ],
    })

    return {
        'id': deck_id,
        'title': lesson['title'],
        'level': LEVEL.upper(),
        'language': 'en',
        'unit': unit,
        'canDo': cando,
        'defaultDuration': duration,
        'defaultMode': 'all',
        'objectives': [
            f'use the target structure: {page["title"].lower()}',
            f'use {len(vocab)} new words: ' + ', '.join(vocab),
        ],
        'materials': (f'COSYmanuals B2 grammar pages on {page["title"].lower()}'
                      + (f' and {second_title.lower()}' if second else '')
                      + '; vocabulary cards, audio extracts, reading handout.'),
        'assessment': f'Check accurate use of {page["title"].lower()} and clear delivery in the spoken task.',
        'homework': hw,
        'recycling': {'prior': recycled, 'next': f'The next lesson deals with {next_title.lower()}.'},
        'differentiation': {
            'individual': 'One handout: five sentences on the topic of the lesson.',
            'group': 'One pair or small-group task using the structure.',
            'children': 'One sentence to complete, then read aloud.',
            'teens': 'A short debate on the lesson topic.',
            'adults': 'Five sentences transposed to a professional context.',
            'seniors': 'A reuse sheet built from the examples on the manual page.',
        },
        'links': {
            'vocabulary': vocab,
            'grammar': [
                {'topic_id': topic, 'manual_url': f'{MANUALS_URL}manuals/en/grammar/{lvl}/topics/{topic}.html'}
                for lvl, topic, _ in pages
            ],
            'phonetics': page['pron'] or '',
        },
        'slides': slides,
    }


def lessons_of():
    path = os.path.join(REPO, 'curriculums', 'en', 'general', 'B2.json')
    data = json.load(open(path, encoding='utf-8'))
    flat = []
    for section, unit in enumerate(data['units'], 1):
        for lesson in unit['lessons']:
            flat.append((f"Unit {unit['unit']}. {unit['title']}", lesson, section))
    return flat


def main(write=False):
    flat = lessons_of()
    folder = os.path.join(REPO, 'lessons', FOLDER)
    os.makedirs(folder, exist_ok=True)
    unit_vocab = {}
    for u_title, u_lesson, _ in flat:
        if u_lesson.get('vocabulary') and u_title not in unit_vocab:
            unit_vocab[u_title] = u_lesson['vocabulary']
    sequence = []
    seen = {}
    for i, (unit, lesson, section) in enumerate(flat):
        code = f'EN-B2-{i + 1:03d}'
        next_title = flat[i + 1][1]['title'] if i + 1 < len(flat) else 'the end-of-course review'
        deck = build_deck(lesson, unit, next_title, code, unit_vocab.get(unit))
        base = deck['id']
        if base in seen:
            seen[base] += 1
            deck = dict(deck, id=f'{base}-{seen[base]}')
            for s in deck['slides']:
                s['id'] = s['id'].replace(base, deck['id'])
        else:
            seen[base] = 1
        if write:
            with open(os.path.join(folder, deck['id'] + '.json'), 'w', encoding='utf-8') as fh:
                fh.write(json.dumps(deck, ensure_ascii=False, indent=2) + '\n')
        sequence.append({
            'lessonNumber': i + 1,
            'id': deck['id'],
            'title': deck['title'],
            'section': section,
            'unit': unit,
            'isOptional': False,
            'status': 'drafted',
            'lessonFile': f'lessons/{FOLDER}/{deck["id"]}.json',
        })
    roadmap = {'curriculumId': COURSE, 'title': TRACK_TITLE,
               'totalLessons': len(sequence), 'sequence': sequence}
    if write:
        with open(os.path.join(REPO, 'roadmaps', COURSE + '.json'), 'w', encoding='utf-8') as fh:
            fh.write(json.dumps(roadmap, ensure_ascii=False, indent=2) + '\n')
    print(f'b2: {len(sequence)} decks')
    if write:
        print('wrote roadmaps/' + COURSE + '.json')
    else:
        print(json.dumps(sequence[0], indent=1))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true')
    a = ap.parse_args()
    main(write=a.write)
