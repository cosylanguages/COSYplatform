"""Build the Italian A2 lesson decks from the curriculum plus the COSYmanuals Italian topic pages.

The English builder hard-codes its scaffolding in English. This one keeps the same ten-stage shape and
takes the scaffolding from L10N, so the deck is written in the language being taught. Lessons whose
curriculum carries no grammarIds are reported and skipped: their manual page does not exist yet, and a
deck without the page would be a word list with no rule behind it.

    python3 scripts/lesson-build/build_it_a2_decks.py [--write]
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

LANG = 'it'
LEVEL = 'a2'
COURSE = f'general-it-{LEVEL}'
TRACK_TITLE = f'Italiano Generale {LEVEL.upper()}'
FOLDER = f'general-italian-{LEVEL}'
PREVIOUS = 'il livello A1 e il modulo precedente'


def slug(text):
    s = unicodedata.normalize('NFD', text.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('&', ' e ').replace("'", '-').replace('’', '-')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def page_for(grammar_id):
    parts = grammar_id.split('-')
    level, topic = parts[1], '-'.join(parts[2:])
    path = os.path.join(MANUALS, 'manuals', LANG, 'grammar', level, 'topics', topic + '.html')
    return level, topic, manual_page.parse(open(path, encoding='utf-8').read())


def teacher_note(notes, key):
    m = re.search(key + r':\s*\\?"(.*?)\\?"\s*(?:\\n|\n)', (notes or '') + '\n')
    return m.group(1).strip() if m else ''


def ex_line(e):
    head = '' if re.match(r'^(Esempio|Example) \d+$', e['label'] or '') else (e['label'] + ' — ' if e['label'] else '')
    return head + e['text'] + (f" ({e['comment']})" if e['comment'] else '')


def build_deck(lesson, unit, next_title, code):
    ids = lesson['grammarIds']
    pages = [page_for(i) for i in ids]
    page = pages[0][2]
    second = pages[1] if len(pages) > 1 else None
    vocab = lesson.get('vocabulary') or [r['element'] for r in page['table'][:8]]
    notes = lesson.get('teacher_notes') or ''
    cando = teacher_note(notes, 'cando') or page['outcome'] or page['subtitle']
    homework_note = teacher_note(notes, 'hw')
    recycled = lesson.get('recycled') or f'Ripasso di {PREVIOUS}.'
    deck_id = f'it-{LEVEL}-{slug(lesson["title"])}'
    duration = lesson.get('duration_minutes', 60)

    ex = page['examples']
    ex_lines = [ex_line(e) for e in ex]
    table_lines = [f"{r['element']} — {r['role']}: {r['example']}" for r in page['table'][:6]]
    trap_lines = [f"❌ {t['wrong']} → ✅ {t['right']}" for t in page['traps'][:2]]
    check = page['checklist'][:3]
    practice = page['practice'][:3]
    ccq = page['ccq'][:2]
    rule = page['rule'] or page['observe']
    second_title = second[2]['title'] if second else page['title']

    slides = [
        {'id': f'{deck_id}-slide-1', 'title': '1. Obiettivo e panoramica', 'stage': 'warm-up',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': f'Obiettivo comunicativo: {cando}'},
             {'type': 'blockquote', 'content': (f'Panoramica del corso:\n- Livello: Italiano Generale {LEVEL.upper()}\n'
                                               f'- Unità: {unit}\n- Durata: {duration} minuti\n- Codice: {code}')},
             {'type': 'instruction', 'content': (f'In coppia, tre minuti: che cosa ti dice già questa frase? '
                                                f'{ex[0]["text"]}') if ex else
                                                 'In coppia, tre minuti: ripeti l\'obiettivo con parole tue.'},
             {'type': 'input', 'placeholder': 'La tua versione dell\'obiettivo…'}]},
        {'id': f'{deck_id}-slide-2', 'title': '2. Ripasso e collegamento', 'stage': 'recycling',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': f'Già in possesso: {recycled}'},
             {'type': 'blockquote', 'content': 'Lessico da riattivare: ' + ', '.join(vocab[:3])},
             {'type': 'instruction', 'content': 'A memoria: che cosa significa questa parola e dove l\'hai incontrata?'},
             {'type': 'input', 'placeholder': f'{vocab[0]} — significato e contesto' if vocab else 'La tua risposta…'}]},
        {'id': f'{deck_id}-slide-3', 'title': '3. Lessico e espressioni chiave', 'stage': 'input',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': f'Lessico attivo della lezione ({len(vocab)} elementi):'},
             {'type': 'blockquote', 'content': '\n'.join(vocab)},
             {'type': 'instruction', 'content': 'Dividi le parole in due colonne: azioni e cose, contro idee e posizioni.'},
             {'type': 'input', 'placeholder': 'Azioni e cose: … / Idee e posizioni: …'},
             {'type': 'instruction', 'content': f'Usa tre parole in una frase che potrebbe comparire in un testo su {page["title"].lower()}.'}]},
        {'id': f'{deck_id}-slide-4', 'title': '4. Pronuncia e ritmo', 'stage': 'pronunciation',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': 'Nota di pronuncia per questo punto:'},
             {'type': 'blockquote', 'content': page['pron'] or (f'Pronuncia con chiarezza: {ex[0]["text"]}' if ex else 'Pronuncia con chiarezza.')},
             {'type': 'instruction', 'content': 'Leggi ad alta voce, poi registrati: l\'accento cade sulla parola piena, non sull\'appoggio.'},
             {'type': 'input', 'placeholder': 'La frase che hai letto (trascrizione o IPA)…'}]},
        {'id': f'{deck_id}-slide-5', 'title': '5. Focus grammaticale e pratica guidata', 'stage': 'grammar',
         'duration': duration, 'mode': 'all', 'elements': (
             [{'type': 'instruction', 'content': f'Focus: {page["title"]}.'},
              {'type': 'blockquote', 'content': rule + ('\n\n' + '\n'.join(table_lines) if table_lines else '')}]
             + [{'type': 'grammar-focus', 'grammarId': i} for i in ids]
             + [{'type': 'instruction', 'content': 'Pratica guidata: scegli l\'opzione corretta.'}]
             + [{'type': 'test', 'content': q['question'], 'options': q['options']} for q in practice])},
        {'id': f'{deck_id}-slide-6', 'title': '6. Lettura, ascolto e comprensione', 'stage': 'reading-listening',
         'duration': duration, 'mode': 'all', 'elements': (
             [{'type': 'instruction', 'content': 'Leggi e ascolta: tre esempi in contesto.'},
              {'type': 'blockquote', 'content': '\n'.join(ex_lines)}]
             + ([{'type': 'instruction', 'content': 'Che cosa osservi?'},
                 {'type': 'blockquote', 'content': page['observe']}] if page['observe'] else [])
             + [{'type': 'test', 'content': q['question'], 'options': q['options']} for q in ccq]
             + [{'type': 'instruction', 'content': 'Enuncia la regola in una frase, senza guardare la tabella.'},
                {'type': 'input', 'placeholder': 'La regola in una frase…'}])},
        {'id': f'{deck_id}-slide-7', 'title': '7. Produzione libera', 'stage': 'freer-practice',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': f'Produzione libera: {cando}'},
             {'type': 'blockquote', 'content': 'Criteri di riuscita:\n' + '\n'.join(f'- {c}' for c in check)},
             {'type': 'instruction', 'content': 'Gioco di ruolo: esponi la tua posizione in novanta secondi; il compagno annota ogni uso della struttura.'},
             {'type': 'input', 'placeholder': 'La tua produzione (dieci righe)…'}]},
        {'id': f'{deck_id}-slide-8', 'title': '8. Errori frequenti e correzione', 'stage': 'adaptation',
         'duration': duration, 'mode': 'all', 'elements': (
             [{'type': 'instruction', 'content': 'Errori frequenti e correzione:'},
              {'type': 'blockquote', 'content': '\n'.join(trap_lines) or 'Nessun errore registrato per questo punto.'},
              {'type': 'instruction', 'content': 'Correggi queste frasi: di\' che cosa non va, poi dai la versione giusta.'},
              {'type': 'input', 'placeholder': 'Correzione e spiegazione…'}]
             + ([{'type': 'instruction', 'content': 'Varianti accettabili:'},
                 {'type': 'blockquote', 'content': '\n'.join(e['text'] for e in page['extra'][:3])}]
                if len(page['extra']) >= 2 else []))},
        {'id': f'{deck_id}-slide-9', 'title': '9. Adattare il compito', 'stage': 'adaptation',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': 'Adatta lo stesso compito al gruppo:'},
             {'type': 'blockquote', 'content': ('- Individuale: cinque frasi con la struttura, sul tema della lezione.\n'
                                                f'- In coppia: un dialogo di dieci battute in cui {second_title.lower()} regge l\'argomentazione.\n'
                                                '- In gruppo: un dibattito di sei minuti, due squadre, la struttura obbligatoria in ogni turno.\n'
                                                '- Pubblico professionale: trasponi la struttura in una comunicazione interna.\n'
                                                '- Pubblico accademico: trasponila in un paragrafo di analisi.')},
             {'type': 'instruction', 'content': f'Secondo punto della lezione: {second_title}.'},
             {'type': 'input', 'placeholder': 'Il tuo adattamento…'}]},
        {'id': f'{deck_id}-slide-10', 'title': '10. Ripasso e compiti', 'stage': 'cool-down',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': 'Sai già usare questa struttura?'},
             {'type': 'blockquote', 'content': '\n'.join(f'- {c}' for c in check)},
             {'type': 'instruction', 'content': 'Compiti: ' + (homework_note or f'Scrivi dieci righe usando {page["title"].lower()}, con almeno due frasi controllate sulla pagina del manuale.')},
             {'type': 'instruction', 'content': f'Prossima lezione: {next_title}.'}]},
    ]

    return {
        'id': deck_id,
        'title': lesson['title'],
        'level': LEVEL.upper(),
        'language': LANG,
        'unit': unit,
        'canDo': cando,
        'defaultDuration': duration,
        'defaultMode': 'all',
        'objectives': [f'usare la struttura: {page["title"].lower()}',
                       f'usare {len(vocab)} parole nuove: ' + ', '.join(vocab)],
        'materials': (f'Pagine di grammatica COSYmanuals su {page["title"].lower()}'
                      + (f' e {second_title.lower()}' if second else '')
                      + '; carte lessicali, audio, scheda di lettura.'),
        'assessment': f'Verifica l\'uso corretto di {page["title"].lower()} e la chiarezza dell\'esposizione orale.',
        'homework': homework_note or f'Scrivi dieci righe usando {page["title"].lower()}.',
        'recycling': {'prior': recycled, 'next': f'La lezione successiva tratta {next_title.lower()}.'},
        'differentiation': {
            'individual': 'Una scheda: cinque frasi sul tema della lezione.',
            'group': 'Un compito in coppia o in piccolo gruppo con la struttura.',
            'children': 'Una frase da completare, poi letta ad alta voce.',
            'teens': 'Un breve dibattito sul tema della lezione.',
            'adults': 'Cinque frasi trasposte in un contesto professionale.',
            'seniors': 'Una scheda di riuso costruita sugli esempi del manuale.',
        },
        'links': {
            'vocabulary': vocab,
            'grammar': [{'topic_id': topic, 'manual_url': f'{MANUALS_URL}manuals/{LANG}/grammar/{lvl}/topics/{topic}.html'}
                        for lvl, topic, _ in pages],
            'phonetics': page['pron'] or '',
        },
        'slides': slides,
    }


def lessons_of():
    data = json.load(open(os.path.join(REPO, 'curriculums', LANG, 'general', LEVEL.upper() + '.json'), encoding='utf-8'))
    flat = []
    for section, unit in enumerate(data['units'], 1):
        for lesson in unit['lessons']:
            flat.append((unit['title'], lesson, section))
    return flat


def main(write=False):
    flat = lessons_of()
    folder = os.path.join(REPO, 'lessons', FOLDER)
    sequence, seen, skipped = [], {}, []
    for i, (unit, lesson, section) in enumerate(flat):
        if not lesson.get('grammarIds'):
            skipped.append(lesson['title'])
            continue
        next_title = flat[i + 1][1]['title'] if i + 1 < len(flat) else 'il ripasso di fine corso'
        deck = build_deck(lesson, unit, next_title, f'IT-{LEVEL.upper()}-{i + 1:03d}')
        base = deck['id']
        if base in seen:
            seen[base] += 1
            deck = dict(deck, id=f'{base}-{seen[base]}')
            for s in deck['slides']:
                s['id'] = s['id'].replace(base, deck['id'])
        else:
            seen[base] = 1
        if write:
            os.makedirs(folder, exist_ok=True)
            with open(os.path.join(folder, deck['id'] + '.json'), 'w', encoding='utf-8') as fh:
                fh.write(json.dumps(deck, ensure_ascii=False, indent=2) + '\n')
        sequence.append({'lessonNumber': i + 1, 'id': deck['id'], 'title': deck['title'],
                         'section': section, 'unit': unit, 'isOptional': False, 'status': 'drafted',
                         'lessonFile': f'lessons/{FOLDER}/{deck["id"]}.json'})
    roadmap = {'curriculumId': COURSE, 'title': TRACK_TITLE, 'totalLessons': len(flat), 'sequence': sequence}
    if write:
        with open(os.path.join(REPO, 'roadmaps', COURSE + '.json'), 'w', encoding='utf-8') as fh:
            fh.write(json.dumps(roadmap, ensure_ascii=False, indent=2) + '\n')
    print(f'{LANG}-{LEVEL}: {len(sequence)} decks, {len(skipped)} lessons without a manual page')
    for t in skipped:
        print('  no page:', t)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true')
    main(write=ap.parse_args().write)
