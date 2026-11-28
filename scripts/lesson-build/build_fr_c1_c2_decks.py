"""Build French C1/C2 lesson decks from the curriculum plus the COSYmanuals topic pages.

Each lesson already names two grammar points; those pages supply the rule, the examples, the traps
and the exercise, so the deck presents authored material rather than placeholders. Only the
scaffolding sentences around them are templated.

    python3 scripts/lesson-build/build_fr_c1_c2_decks.py [--levels c1,c2] [--write]

Without --write it prints a summary and the first deck it would emit.
"""
import argparse
import glob
import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import manual_page

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MANUALS = os.environ.get('COSY_MANUALS', '/workspace/COSYmanuals')
MANUALS_URL = 'https://cosylanguages.github.io/COSYmanuals/'

TRACK_TITLE = {'c1': 'General French C1', 'c2': 'General French C2'}
FOLDER = {'c1': 'general-french-c1', 'c2': 'general-french-c2'}
PREVIOUS = {'c1': 'le niveau B2 du parcours général', 'c2': 'le niveau C1 du parcours général'}


def slug(text):
    s = unicodedata.normalize('NFD', text.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('œ', 'oe').replace('æ', 'ae').replace("'", '-').replace('’', '-')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def page_for(lvl, grammar_id):
    topic = grammar_id.split('-', 2)[2]
    path = os.path.join(MANUALS, 'manuals', 'fr', 'grammar', lvl, 'topics', topic + '.html')
    return topic, manual_page.parse(open(path, encoding='utf-8').read())


def teacher_note(notes, key):
    m = re.search(key + r':\s*\\?"(.*?)\\?"\s*(?:\\n|\n)', (notes or '') + '\n')
    return m.group(1).strip() if m else ''


def build_deck(lesson, unit, lvl, next_title, code, unit_vocab=None):
    ids = lesson['grammarIds']
    primary_topic, page = page_for(lvl, ids[0])
    second_topic, page2 = page_for(lvl, ids[1])
    vocab = lesson.get('vocabulary') or unit_vocab or [r['element'] for r in page['table'][:8]]
    notes = lesson.get('teacher_notes') or ''
    cando = teacher_note(notes, 'cando') or page['outcome'] or page['subtitle']
    homework_note = teacher_note(notes, 'hw')
    recycled = lesson.get('recycled') or f'Reprise de {PREVIOUS[lvl]}.'

    deck_id = f'fr-{lvl}-{slug(lesson["title"])}'
    duration = lesson.get('duration_minutes', 60)

    ex = page['examples']
    def ex_line(e):
        head = '' if re.match(r'^Exemple \d+$', e['label'] or '') else (e['label'] + ' — ' if e['label'] else '')
        return head + e['text'] + (f" ({e['comment']})" if e['comment'] else '')

    ex_lines = [ex_line(e) for e in ex]
    table_lines = [f"{r['element']} — {r['role']} : {r['example']}" for r in page['table'][:6]]
    trap_lines = [f"❌ {t['wrong']} → ✅ {t['right']}" for t in page['traps'][:2]]
    check = page['checklist'][:3]
    practice = page['practice'][:3]
    ccq = page['ccq'][:2]

    grammar_rule = page['rule'] or page['observe']

    slides = []

    slides.append({
        'id': f'{deck_id}-slide-1',
        'title': '1. Objectif communicatif et vue d’ensemble',
        'stage': 'warm-up',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': f'Objectif communicatif : {cando}'},
            {'type': 'blockquote', 'content':
                f"Vue d’ensemble du cours :\n- Niveau : {lvl.upper()} Français général\n"
                f"- Unité : {unit}\n- Durée : {duration} minutes\n- Code : {code}"},
            {'type': 'instruction', 'content': f'À deux, en trois minutes : que dit déjà cette phrase ? {ex[0]["text"]}' if ex else
                f'À deux, en trois minutes : reformulez l’objectif avec vos mots.'},
            {'type': 'input', 'placeholder': 'Votre reformulation de l’objectif…'},
        ],
    })

    slides.append({
        'id': f'{deck_id}-slide-2',
        'title': '2. Révision et lien',
        'stage': 'recycling',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': f'Ce qui est déjà acquis : {recycled}'},
            {'type': 'blockquote', 'content': 'Vocabulaire révisé : ' + ', '.join(vocab[:3])},
            {'type': 'instruction', 'content': 'Réponds de mémoire : que signifie ce mot, et dans quel contexte l’avez-vous rencontré ?'},
            {'type': 'input', 'placeholder': f'{vocab[0]} — définition et contexte' if vocab else 'Votre réponse…'},
        ],
    })

    slides.append({
        'id': f'{deck_id}-slide-3',
        'title': '3. Vocabulaire et expressions essentielles',
        'stage': 'input',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': f'Vocabulaire actif de base ({len(vocab)} éléments) :'},
            {'type': 'blockquote', 'content': '\n'.join(vocab)},
            {'type': 'instruction', 'content': 'Classez ces mots en deux familles : ceux qui désignent une action, ceux qui désignent un objet de discours.'},
            {'type': 'input', 'placeholder': 'Actions : … / Objets de discours : …'},
            {'type': 'instruction', 'content': f'Employez trois de ces mots dans une phrase qui pourrait figurer dans le cours : {page["title"].lower()}.'},
        ],
    })

    slides.append({
        'id': f'{deck_id}-slide-4',
        'title': '4. Prononciation et rythme',
        'stage': 'pronunciation',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': 'Note de prononciation du point de grammaire :'},
            {'type': 'blockquote', 'content': page['pron'] or (f"Articulez nettement : {ex[0]['text']}" if ex else 'Articulez nettement.')},
            {'type': 'instruction', 'content': 'Lisez à voix haute, puis enregistrez-vous : l’accent tombe sur le dernier élément du groupe.'},
            {'type': 'input', 'placeholder': 'La phrase lue (transcription ou IPA)…'},
        ],
    })

    practice_elements = [
        {'type': 'instruction', 'content': f'Point de grammaire : {page["title"]}.'},
        {'type': 'blockquote', 'content': grammar_rule + ('\n\n' + '\n'.join(table_lines) if table_lines else '')},
        {'type': 'grammar-focus', 'grammarId': ids[0]},
        {'type': 'grammar-focus', 'grammarId': ids[1]},
        {'type': 'instruction', 'content': 'Pratique guidée : choisissez la bonne option.'},
    ]
    for q in practice:
        practice_elements.append({'type': 'test', 'content': q['question'], 'options': q['options']})
    slides.append({
        'id': f'{deck_id}-slide-5',
        'title': '5. Point de grammaire et pratique guidée',
        'stage': 'grammar',
        'duration': duration,
        'mode': 'all',
        'elements': practice_elements,
    })

    reading_elements = [
        {'type': 'instruction', 'content': 'Lisez et écoutez : trois exemples en contexte.'},
        {'type': 'blockquote', 'content': '\n'.join(ex_lines)},
    ]
    if page['observe']:
        reading_elements.append({'type': 'instruction', 'content': 'Qu’observez-vous ?'})
        reading_elements.append({'type': 'blockquote', 'content': page['observe']})
    for q in ccq:
        reading_elements.append({'type': 'test', 'content': q['question'], 'options': q['options']})
    reading_elements.append({'type': 'instruction', 'content': 'Reformulez la règle en une phrase, sans regarder le tableau.'})
    reading_elements.append({'type': 'input', 'placeholder': 'La règle en une phrase…'})
    slides.append({
        'id': f'{deck_id}-slide-6',
        'title': '6. Lecture, écoute et compréhension',
        'stage': 'reading-listening',
        'duration': duration,
        'mode': 'all',
        'elements': reading_elements,
    })

    freer_elements = [
        {'type': 'instruction', 'content': f'Production libre : {cando}'},
        {'type': 'blockquote', 'content': 'Critères de réussite :\n' + '\n'.join(f'- {c}' for c in check)},
        {'type': 'instruction', 'content': 'Jeu de rôle : exposez votre point de vue en quatre-vingt-dix secondes, votre partenaire note les emplois de la structure.'},
        {'type': 'input', 'placeholder': 'Votre production (dix lignes)…'},
    ]
    slides.append({
        'id': f'{deck_id}-slide-7',
        'title': '7. Production libre',
        'stage': 'freer-practice',
        'duration': duration,
        'mode': 'all',
        'elements': freer_elements,
    })

    trap_elements = [
        {'type': 'instruction', 'content': 'Erreurs fréquentes et correction :'},
        {'type': 'blockquote', 'content': '\n'.join(trap_lines) or 'Pas d’erreur répertoriée pour ce point.'},
        {'type': 'instruction', 'content': 'Corrigez ces phrases : dites ce qui ne va pas, puis la version juste.'},
        {'type': 'input', 'placeholder': 'Correction et justification…'},
    ]
    if len(page['extra']) >= 2:
        trap_elements.append({'type': 'instruction', 'content': 'Variantes acceptables :'})
        trap_elements.append({'type': 'blockquote', 'content':
            '\n'.join(f"{e['text']}" for e in page['extra'][:3])})
    slides.append({
        'id': f'{deck_id}-slide-8',
        'title': '8. Erreurs fréquentes et correction',
        'stage': 'adaptation',
        'duration': duration,
        'mode': 'all',
        'elements': trap_elements,
    })

    slides.append({
        'id': f'{deck_id}-slide-9',
        'title': '9. Variantes selon le public',
        'stage': 'adaptation',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': 'Adapter la même tâche au groupe :'},
            {'type': 'blockquote', 'content':
                '- Individuel : cinq phrases avec la structure, sur le thème du cours.\n'
                f'- Binôme : un dialogue de dix répliques où {page2["title"].lower()} sert d’argument.\n'
                '- Groupe : un débat de six minutes, deux camps, la structure imposée à chaque prise de parole.\n'
                '- Public professionnel : transposer la structure dans une note de service.\n'
                '- Public académique : transposer dans un paragraphe d’analyse.'},
            {'type': 'instruction', 'content': f'Deuxième point de grammaire du cours : {page2["title"]}. {page2["rule"][:180]}'},
            {'type': 'input', 'placeholder': 'Votre transposition…'},
        ],
    })

    hw = homework_note or f'Rédigez dix lignes qui emploient {page["title"].lower()}, avec au moins deux corrections vérifiées.'
    slides.append({
        'id': f'{deck_id}-slide-10',
        'title': '10. Bilan et travail personnel',
        'stage': 'cool-down',
        'duration': duration,
        'mode': 'all',
        'elements': [
            {'type': 'instruction', 'content': 'Pouvez-vous déjà l’utiliser ?'},
            {'type': 'blockquote', 'content': '\n'.join(f'- {c}' for c in check)},
            {'type': 'instruction', 'content': f'Travail personnel : {hw}'},
            {'type': 'instruction', 'content': f'Prochain cours : {next_title}.'},
        ],
    })

    return {
        'id': deck_id,
        'title': lesson['title'],
        'level': lvl.upper(),
        'language': 'fr',
        'unit': unit,
        'canDo': cando,
        'defaultDuration': duration,
        'defaultMode': 'all',
        'objectives': [
            f'utiliser la structure cible : {page["title"].lower()}',
            f'utiliser {len(vocab)} mots : ' + ', '.join(vocab),
        ],
        'materials': (f'Pages de grammaire {lvl.upper()} de COSYmanuals sur {page["title"].lower()} '
                      f'et {page2["title"].lower()}; cartes de vocabulaire, extraits audio, fiche de lecture.'),
        'assessment': f'Vérifie l’usage correct de {page["title"].lower()} et la clarté de la production orale.',
        'homework': hw,
        'recycling': {'prior': recycled, 'next': f'Le cours suivant traite de {next_title.lower()}.'},
        'differentiation': {
            'individual': 'Une fiche : cinq phrases sur le thème du cours.',
            'group': 'Une tâche en binôme ou en petits groupes.',
            'children': 'Une phrase à compléter, puis à lire à voix haute.',
            'teens': 'Un débat court sur le thème du cours.',
            'adults': 'Cinq phrases de transposition professionnelle.',
            'seniors': 'Une fiche de réemploi à partir des exemples du manuel.',
        },
        'links': {
            'vocabulary': vocab,
            'grammar': [
                {'topic_id': primary_topic, 'manual_url': f'{MANUALS_URL}manuals/fr/grammar/{lvl}/topics/{primary_topic}.html'},
                {'topic_id': second_topic, 'manual_url': f'{MANUALS_URL}manuals/fr/grammar/{lvl}/topics/{second_topic}.html'},
            ],
            'phonetics': page['pron'] or '',
        },
        'slides': slides,
    }


def lessons_of(lvl):
    path = os.path.join(REPO, 'curriculums', 'fr', 'general', lvl.upper() + '.json')
    data = json.load(open(path, encoding='utf-8'))
    flat = []
    for section, unit in enumerate(data['units']):
        for lesson in unit['lessons']:
            flat.append((unit['title'], lesson, section))
    return flat


def main(write=False, levels=('c1', 'c2')):
    roadmap_written = []
    for lvl in levels:
        flat = lessons_of(lvl)
        folder = os.path.join(REPO, 'lessons', FOLDER[lvl])
        os.makedirs(folder, exist_ok=True)
        sequence = []
        seen = {}
        unit_vocab = {}
        for u_title, u_lesson, _ in flat:
            if u_lesson.get('vocabulary') and u_title not in unit_vocab:
                unit_vocab[u_title] = u_lesson['vocabulary']
        for i, (unit, lesson, section) in enumerate(flat):
            code = f'FR-{lvl.upper()}-{i + 1:03d}'
            next_title = flat[i + 1][1]['title'] if i + 1 < len(flat) else 'la révision générale du niveau'
            deck = build_deck(lesson, unit, lvl, next_title, code, unit_vocab.get(unit))
            base = deck['id']
            if base in seen:
                seen[base] += 1
                deck = dict(deck, id=f'{base}-{seen[base]}')
                for s in deck['slides']:
                    s['id'] = s['id'].replace(base, deck['id'])
            else:
                seen[base] = 1
            out = os.path.join(folder, deck['id'] + '.json')
            if write:
                with open(out, 'w', encoding='utf-8') as fh:
                    fh.write(json.dumps(deck, ensure_ascii=False, indent=2) + '\n')
            sequence.append({
                'lessonNumber': i + 1,
                'id': deck['id'],
                'title': deck['title'],
                'section': section,
                'unit': unit,
                'isOptional': False,
                'status': 'drafted',
                'lessonFile': f'lessons/{FOLDER[lvl]}/{deck["id"]}.json',
            })
        roadmap = {'curriculumId': f'general-fr-{lvl}', 'title': TRACK_TITLE[lvl],
                   'totalLessons': len(sequence), 'sequence': sequence}
        if write:
            path = os.path.join(REPO, 'roadmaps', f'general-fr-{lvl}.json')
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(json.dumps(roadmap, ensure_ascii=False, indent=2) + '\n')
            roadmap_written.append(path)
        print(f'{lvl}: {len(sequence)} decks')

    if write:
        for p in roadmap_written:
            print('wrote', os.path.relpath(p, REPO))
    else:
        unit, lesson, _ = lessons_of(levels[0])[0]
        deck = build_deck(lesson, unit, levels[0], lessons_of(levels[0])[1][1]['title'], 'FR-C1-001')
        print(json.dumps(deck, ensure_ascii=False, indent=1)[:3000])


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--levels', default='c1,c2')
    a = ap.parse_args()
    main(write=a.write, levels=tuple(x.strip().lower() for x in a.levels.split(',')))
