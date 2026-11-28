"""Build lesson decks for a language and level from its curriculum plus the COSYmanuals topic pages.

The English builder hard-codes its scaffolding in English; this one keeps the same ten-stage shape and takes
every sentence of scaffolding from SCAFFOLD, so a deck is written in the language being taught. Lessons whose
curriculum carries no grammarIds are reported and skipped: their manual page does not exist yet, and a deck
without the page would be a word list with no rule behind it.

    python3 scripts/lesson-build/build_decks.py --lang it --level a2 [--write]
    python3 scripts/lesson-build/build_decks.py --lang el --level a2 [--write]
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

LANGS = ('it', 'el')

SETTINGS = {
    'it': dict(code='IT', folder='general-italian-{level}', track='Italiano Generale',
               previous={'a1': 'il livello A0 e il modulo precedente',
                         'a2': 'il livello A1 e il modulo precedente',
                         'b1': 'il livello A2 e il modulo precedente'},
               last='il ripasso di fine corso'),
    'el': dict(code='EL', folder='general-greek-{level}', track='Ελληνικά Γενικά',
               previous={'a1': 'το επίπεδο Α0 και η προηγούμενη ενότητα',
                         'a2': 'το επίπεδο Α1 και η προηγούμενη ενότητα',
                         'b1': 'το επίπεδο Α2 και η προηγούμενη ενότητα'},
               last='η επανάληψη στο τέλος του μαθήματος'),
}

SCAFFOLD = {
    'it': dict(
        recycled_default='Ripasso di {previous}.',
        s1='1. Obiettivo e panoramica', s2='2. Ripasso e collegamento',
        s3='3. Lessico e espressioni chiave', s4='4. Pronuncia e ritmo',
        s5='5. Focus grammaticale e pratica guidata', s6='6. Lettura, ascolto e comprensione',
        s7='7. Produzione libera', s8='8. Errori frequenti e correzione',
        s9='9. Adattare il compito', s10='10. Ripasso e compiti',
        objective='Obiettivo comunicativo: {cando}',
        overview='Panoramica del corso:\n- Livello: {track} {level}\n- Unità: {unit}\n- Durata: {duration} minuti\n- Codice: {code}',
        pair_prompt='In coppia, tre minuti: che cosa ti dice già questa frase? {example}',
        pair_plain="In coppia, tre minuti: ripeti l'obiettivo con parole tue.",
        own_words="La tua versione dell'obiettivo…",
        prior='Già in possesso: {recycled}', recycle_label='Lessico da riattivare: ',
        recall="A memoria: che cosa significa questa parola e dove l'hai incontrata?",
        vocab_context='{word} — significato e contesto', your_answer='La tua risposta…',
        vocab_head='Lessico attivo della lezione ({n} elementi):',
        vocab_sort='Dividi le parole in due colonne: azioni e cose, contro idee e posizioni.',
        vocab_columns='Azioni e cose: … / Idee e posizioni: …',
        vocab_use='Usa tre parole in una frase che potrebbe comparire in un testo su «{title}».',
        pron_note='Nota di pronuncia per questo punto:',
        pron_clear='Pronuncia con chiarezza: {example}', pron_plain='Pronuncia con chiarezza.',
        pron_read="Leggi ad alta voce, poi registrati: l'accento cade sulla parola piena, non sull'appoggio.",
        pron_transcript='La frase che hai letto (trascrizione o IPA)…',
        focus='Focus: {title}.', guided="Pratica guidata: scegli l'opzione corretta.",
        read='Leggi e ascolta: tre esempi in contesto.', observe='Che cosa osservi?',
        state_rule='Enuncia la regola in una frase, senza guardare la tabella.',
        rule_own='La regola in una frase…', free='Produzione libera: {cando}',
        criteria='Criteri di riuscita:\n{items}',
        roleplay='Gioco di ruolo: esponi la tua posizione in novanta secondi; il compagno annota ogni uso della struttura.',
        production='La tua produzione (dieci righe)…',
        mistakes_head='Errori frequenti e correzione:',
        no_mistakes='Nessun errore registrato per questo punto.',
        correct_these="Correggi queste frasi: di' che cosa non va, poi dai la versione giusta.",
        correction='Correzione e spiegazione…', variants='Varianti accettabili:',
        adapt='Adatta lo stesso compito al gruppo:',
        adapt_body=('- Individuale: cinque frasi con la struttura, sul tema della lezione.\n'
                    '- In coppia: un dialogo di dieci battute in cui {second} regge l\'argomentazione.\n'
                    '- In gruppo: un dibattito di sei minuti, due squadre, la struttura obbligatoria in ogni turno.\n'
                    '- Pubblico professionale: trasponi la struttura in una comunicazione interna.\n'
                    '- Pubblico accademico: trasponila in un paragrafo di analisi.'),
        second_point='Secondo punto della lezione: {second}.', your_adaptation='Il tuo adattamento…',
        do_you='Sai già usare questa struttura?', homework='Compiti: ',
        homework_default='Scrivi dieci righe usando «{title}», con almeno due frasi controllate sulla pagina del manuale.',
        next_lesson='Prossima lezione: {next}.',
        obj_structure='usare la struttura: {title}', obj_words='usare {n} parole nuove: {words}',
        materials='Pagine di grammatica COSYmanuals su «{title}»',
        materials_second=' e {second}', materials_tail='; carte lessicali, audio, scheda di lettura.',
        assessment="Verifica l'uso corretto di «{title}» e la chiarezza dell'esposizione orale.",
        homework_short='Scrivi dieci righe usando «{title}».',
        upcoming='La lezione successiva tratta {next}.',
        diff_individual='Una scheda: cinque frasi sul tema della lezione.',
        diff_group='Un compito in coppia o in piccolo gruppo con la struttura.',
        diff_children='Una frase da completare, poi letta ad alta voce.',
        diff_teens='Un breve dibattito sul tema della lezione.',
        diff_adults='Cinque frasi trasposte in un contesto professionale.',
        diff_seniors='Una scheda di riuso costruita sugli esempi del manuale.',
    ),
    'el': dict(
        recycled_default='Επανάληψη του {previous}.',
        s1='1. Στόχος και επισκόπηση', s2='2. Επανάληψη και σύνδεση',
        s3='3. Λεξιλόγιο και εκφράσεις-κλειδιά', s4='4. Προφορά και ρυθμός',
        s5='5. Γραμματική εστίαση και καθοδηγούμενη πρακτική', s6='6. Ανάγνωση, ακρόαση και κατανόηση',
        s7='7. Ελεύθερη παραγωγή', s8='8. Συχνά λάθη και διόρθωση',
        s9='9. Προσαρμογή της εργασίας', s10='10. Επανάληψη και εργασίες',
        objective='Επικοινωνιακός στόχος: {cando}',
        overview='Επισκόπηση του μαθήματος:\n- Επίπεδο: {track} {level}\n- Ενότητα: {unit}\n- Διάρκεια: {duration} λεπτά\n- Κωδικός: {code}',
        pair_prompt='Σε ζευγάρια, τρία λεπτά: τι σου λέει ήδη αυτή η φράση; {example}',
        pair_plain='Σε ζευγάρια, τρία λεπτά: πες τον στόχο με δικά σου λόγια.',
        own_words='Η δική σου διατύπωση του στόχου…',
        prior='Ήδη γνωστά: {recycled}', recycle_label='Λεξιλόγιο προς ενεργοποίηση: ',
        recall='Από μνήμης: τι σημαίνει αυτή η λέξη και πού τη συνάντησες;',
        vocab_context='{word} — σημασία και πλαίσιο', your_answer='Η απάντησή σου…',
        vocab_head='Ενεργό λεξιλόγιο του μαθήματος ({n} στοιχεία):',
        vocab_sort='Χώρισε τις λέξεις σε δύο στήλες: πράξεις και πράγματα, έναντι ιδεών και θέσεων.',
        vocab_columns='Πράξεις και πράγματα: … / Ιδέες και θέσεις: …',
        vocab_use='Χρησιμοποίησε τρεις λέξεις σε μια φράση που θα μπορούσε να εμφανιστεί σε κείμενο για «{title}».',
        pron_note='Σημείωση προφοράς για αυτό το σημείο:',
        pron_clear='Πρόφερε καθαρά: {example}', pron_plain='Πρόφερε καθαρά.',
        pron_read='Διάβασε δυνατά και μετά ηχογράφησε: ο τόνος πέφτει στη λέξη με περιεχόμενο, όχι στο άρθρο.',
        pron_transcript='Η φράση που διάβασες (μεταγραφή ή IPA)…',
        focus='Εστίαση: {title}.', guided='Καθοδηγούμενη πρακτική: διάλεξε τη σωστή επιλογή.',
        read='Διάβασε και άκουσε: τρία παραδείγματα σε πλαίσιο.', observe='Τι παρατηρείς;',
        state_rule='Διατύπωσε τον κανόνα σε μία φράση, χωρίς να κοιτάξεις τον πίνακα.',
        rule_own='Ο κανόνας σε μία φράση…', free='Ελεύθερη παραγωγή: {cando}',
        criteria='Κριτήρια επιτυχίας:\n{items}',
        roleplay='Παιχνίδι ρόλου: εκφράσε τη θέση σου σε ενενήντα δευτερόλεπτα· ο συμμαθητής σημειώνει κάθε χρήση της δομής.',
        production='Η παραγωγή σου (δέκα γραμμές)…',
        mistakes_head='Συχνά λάθη και διόρθωση:',
        no_mistakes='Δεν υπάρχουν καταγεγραμμένα λάθη για αυτό το σημείο.',
        correct_these='Διόρθωσε αυτές τις φράσεις: πες τι δεν πάει καλά και μετά τη σωστή εκδοχή.',
        correction='Διόρθωση και εξήγηση…', variants='Αποδεκτές παραλλαγές:',
        adapt='Προσάρμοσε την ίδια εργασία στην ομάδα:',
        adapt_body=('- Ατομικά: πέντε φράσεις με τη δομή, στο θέμα του μαθήματος.\n'
                    '- Σε ζευγάρι: ένας διάλογος δέκα σειρών όπου {second} στηρίζει την επιχειρηματολογία.\n'
                    '- Σε ομάδα: μια συζήτηση έξι λεπτών, δύο ομάδες, η δομή υποχρεωτική σε κάθε σειρά.\n'
                    '- Επαγγελματικό κοινό: μεταφέρε τη δομή σε εσωτερική ανακοίνωση.\n'
                    '- Ακαδημαϊκό κοινό: μεταφέρε τη σε παράγραφο ανάλυσης.'),
        second_point='Δεύτερο σημείο του μαθήματος: {second}.', your_adaptation='Η προσαρμογή σου…',
        do_you='Ξέρεις ήδη να χρησιμοποιείς αυτή τη δομή;', homework='Εργασίες: ',
        homework_default='Γράψε δέκα γραμμές χρησιμοποιώντας «{title}», με τουλάχιστον δύο φράσεις ελεγμένες στη σελίδα του εγχειριδίου.',
        next_lesson='Επόμενο μάθημα: {next}.',
        obj_structure='χρήση της δομής: {title}', obj_words='χρήση {n} νέων λέξεων: {words}',
        materials='Σελίδες γραμματικής COSYmanuals για «{title}»',
        materials_second=' και {second}', materials_tail='; κάρτες λεξιλογίου, ήχος, φύλλο ανάγνωσης.',
        assessment='Έλεγχος της σωστής χρήσης «{title}» και της σαφήνειας της προφορικής έκφρασης.',
        homework_short='Γράψε δέκα γραμμές χρησιμοποιώντας «{title}».',
        upcoming='Το επόμενο μάθημα ασχολείται με {next}.',
        diff_individual='Ένα φύλλο: πέντε φράσεις στο θέμα του μαθήματος.',
        diff_group='Μια εργασία σε ζευγάρι ή μικρή ομάδα με τη δομή.',
        diff_children='Μια φράση για συμπλήρωση, μετά διαβασμένη δυνατά.',
        diff_teens='Μια σύντομη συζήτηση στο θέμα του μαθήματος.',
        diff_adults='Πέντε φράσεις μεταφερμένες σε επαγγελματικό πλαίσιο.',
        diff_seniors='Ένα φύλλο επανάχρησης χτισμένο στα παραδείγματα του εγχειριδίου.',
    ),
}

EXAMPLE_LABEL = {'it': r'^(Esempio|Example) \d+$', 'el': r'^(Παράδειγμα|Esempio|Example) \d+$'}


GREEK = {'α': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th', 'ι': 'i',
         'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's',
         'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o'}


def slug(text):
    s = unicodedata.normalize('NFD', text.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = ''.join(GREEK.get(c, c) for c in s)
    s = s.replace('&', ' e ').replace("'", '-').replace('’', '-')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def page_for(lang, grammar_id):
    parts = grammar_id.split('-')
    level, topic = parts[1], '-'.join(parts[2:])
    path = os.path.join(MANUALS, 'manuals', lang, 'grammar', level, 'topics', topic + '.html')
    return level, topic, manual_page.parse(open(path, encoding='utf-8').read())


def teacher_note(notes, key):
    m = re.search(key + r':\s*\\?"(.*?)\\?"\s*(?:\\n|\n)', (notes or '') + '\n')
    return m.group(1).strip() if m else ''


def ex_line(e, lang):
    head = '' if re.match(EXAMPLE_LABEL[lang], e['label'] or '') else (e['label'] + ' — ' if e['label'] else '')
    return head + e['text'] + (f" ({e['comment']})" if e['comment'] else '')


def build_deck(lang, level, t, lesson, unit, next_title, code):
    ids = lesson['grammarIds']
    pages = [page_for(lang, i) for i in ids]
    page = pages[0][2]
    second = pages[1] if len(pages) > 1 else None
    vocab = lesson.get('vocabulary') or [r['element'] for r in page['table'][:8]]
    notes = lesson.get('teacher_notes') or ''
    cando = teacher_note(notes, 'cando') or page['outcome'] or page['subtitle']
    homework_note = teacher_note(notes, 'hw')
    settings = SETTINGS[lang]
    track = settings['track'].format(level=level.upper())
    recycled = lesson.get('recycled') or t['recycled_default'].format(previous=settings['previous'][level])
    deck_id = f'{lang}-{level}-{slug(lesson["title"])}'
    duration = lesson.get('duration_minutes', 60)

    ex = page['examples']
    ex_lines = [ex_line(e, lang) for e in ex]
    table_lines = [f"{r['element']} — {r['role']}: {r['example']}" for r in page['table'][:6]]
    trap_lines = [f"❌ {x['wrong']} → ✅ {x['right']}" for x in page['traps'][:2]]
    check = page['checklist'][:3]
    practice = page['practice'][:3]
    ccq = page['ccq'][:2]
    rule = page['rule'] or page['observe']
    second_title = second[2]['title'] if second else page['title']

    slides = [
        {'id': f'{deck_id}-slide-1', 'title': t['s1'], 'stage': 'warm-up',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': t['objective'].format(cando=cando)},
             {'type': 'blockquote', 'content': t['overview'].format(track=track, level=level.upper(), unit=unit,
                                                                  duration=duration, code=code)},
             {'type': 'instruction', 'content': (t['pair_prompt'].format(example=ex[0]['text']) if ex else t['pair_plain'])},
             {'type': 'input', 'placeholder': t['own_words']}]},
        {'id': f'{deck_id}-slide-2', 'title': t['s2'], 'stage': 'recycling',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': t['prior'].format(recycled=recycled)},
             {'type': 'blockquote', 'content': t['recycle_label'] + ', '.join(vocab[:3])},
             {'type': 'instruction', 'content': t['recall']},
             {'type': 'input', 'placeholder': t['vocab_context'].format(word=vocab[0]) if vocab else t['your_answer']}]},
        {'id': f'{deck_id}-slide-3', 'title': t['s3'], 'stage': 'input',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': t['vocab_head'].format(n=len(vocab))},
             {'type': 'blockquote', 'content': '\n'.join(vocab)},
             {'type': 'instruction', 'content': t['vocab_sort']},
             {'type': 'input', 'placeholder': t['vocab_columns']},
             {'type': 'instruction', 'content': t['vocab_use'].format(title=page['title'].lower())}]},
        {'id': f'{deck_id}-slide-4', 'title': t['s4'], 'stage': 'pronunciation',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': t['pron_note']},
             {'type': 'blockquote', 'content': page['pron'] or (t['pron_clear'].format(example=ex[0]['text']) if ex else t['pron_plain'])},
             {'type': 'instruction', 'content': t['pron_read']},
             {'type': 'input', 'placeholder': t['pron_transcript']}]},
        {'id': f'{deck_id}-slide-5', 'title': t['s5'], 'stage': 'grammar',
         'duration': duration, 'mode': 'all', 'elements': (
             [{'type': 'instruction', 'content': t['focus'].format(title=page['title'])},
              {'type': 'blockquote', 'content': rule + ('\n\n' + '\n'.join(table_lines) if table_lines else '')}]
             + [{'type': 'grammar-focus', 'grammarId': i} for i in ids]
             + [{'type': 'instruction', 'content': t['guided']}]
             + [{'type': 'test', 'content': q['question'], 'options': q['options']} for q in practice])},
        {'id': f'{deck_id}-slide-6', 'title': t['s6'], 'stage': 'reading-listening',
         'duration': duration, 'mode': 'all', 'elements': (
             [{'type': 'instruction', 'content': t['read']},
              {'type': 'blockquote', 'content': '\n'.join(ex_lines)}]
             + ([{'type': 'instruction', 'content': t['observe']},
                 {'type': 'blockquote', 'content': page['observe']}] if page['observe'] else [])
             + [{'type': 'test', 'content': q['question'], 'options': q['options']} for q in ccq]
             + [{'type': 'instruction', 'content': t['state_rule']},
                {'type': 'input', 'placeholder': t['rule_own']}])},
        {'id': f'{deck_id}-slide-7', 'title': t['s7'], 'stage': 'freer-practice',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': t['free'].format(cando=cando)},
             {'type': 'blockquote', 'content': t['criteria'].format(items='\n'.join(f'- {c}' for c in check))},
             {'type': 'instruction', 'content': t['roleplay']},
             {'type': 'input', 'placeholder': t['production']}]},
        {'id': f'{deck_id}-slide-8', 'title': t['s8'], 'stage': 'adaptation',
         'duration': duration, 'mode': 'all', 'elements': (
             [{'type': 'instruction', 'content': t['mistakes_head']},
              {'type': 'blockquote', 'content': '\n'.join(trap_lines) or t['no_mistakes']},
              {'type': 'instruction', 'content': t['correct_these']},
              {'type': 'input', 'placeholder': t['correction']}]
             + ([{'type': 'instruction', 'content': t['variants']},
                 {'type': 'blockquote', 'content': '\n'.join(e['text'] for e in page['extra'][:3])}]
                if len(page['extra']) >= 2 else []))},
        {'id': f'{deck_id}-slide-9', 'title': t['s9'], 'stage': 'adaptation',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': t['adapt']},
             {'type': 'blockquote', 'content': t['adapt_body'].format(second=second_title.lower())},
             {'type': 'instruction', 'content': t['second_point'].format(second=second_title)},
             {'type': 'input', 'placeholder': t['your_adaptation']}]},
        {'id': f'{deck_id}-slide-10', 'title': t['s10'], 'stage': 'cool-down',
         'duration': duration, 'mode': 'all', 'elements': [
             {'type': 'instruction', 'content': t['do_you']},
             {'type': 'blockquote', 'content': '\n'.join(f'- {c}' for c in check)},
             {'type': 'instruction', 'content': t['homework'] + (homework_note or t['homework_default'].format(title=page['title'].lower()))},
             {'type': 'instruction', 'content': t['next_lesson'].format(next=next_title)}]},
    ]

    return {
        'id': deck_id,
        'title': lesson['title'],
        'level': level.upper(),
        'language': lang,
        'unit': unit,
        'canDo': cando,
        'defaultDuration': duration,
        'defaultMode': 'all',
        'objectives': [t['obj_structure'].format(title=page['title'].lower()),
                       t['obj_words'].format(n=len(vocab), words=', '.join(vocab))],
        'materials': (t['materials'].format(title=page['title'].lower())
                      + (t['materials_second'].format(second=second_title.lower()) if second else '')
                      + t['materials_tail']),
        'assessment': t['assessment'].format(title=page['title'].lower()),
        'homework': homework_note or t['homework_short'].format(title=page['title'].lower()),
        'recycling': {'prior': recycled, 'next': t['upcoming'].format(next=next_title.lower())},
        'differentiation': {
            'individual': t['diff_individual'],
            'group': t['diff_group'],
            'children': t['diff_children'],
            'teens': t['diff_teens'],
            'adults': t['diff_adults'],
            'seniors': t['diff_seniors'],
        },
        'links': {
            'vocabulary': vocab,
            'grammar': [{'topic_id': topic, 'manual_url': f'{MANUALS_URL}manuals/{lang}/grammar/{lvl}/topics/{topic}.html'}
                        for lvl, topic, _ in pages],
            'phonetics': page['pron'] or '',
        },
        'slides': slides,
    }


def lessons_of(lang, level):
    path = os.path.join(REPO, 'curriculums', lang, 'general', level.upper() + '.json')
    data = json.load(open(path, encoding='utf-8'))
    flat = []
    for section, unit in enumerate(data['units'], 1):
        for lesson in unit['lessons']:
            flat.append((unit['title'], lesson, section))
    return flat


def main(lang, level, write=False, only=None, keep_roadmap=False):
    t = SCAFFOLD[lang]
    settings = SETTINGS[lang]
    course = f'general-{lang}-{level}'
    folder_name = settings['folder'].format(level=level)
    track = settings['track'].format(level=level.upper())
    flat = lessons_of(lang, level)
    folder = os.path.join(REPO, 'lessons', folder_name)
    sequence, seen, skipped = [], {}, []
    for i, (unit, lesson, section) in enumerate(flat):
        if not lesson.get('grammarIds'):
            skipped.append(lesson['title'])
            continue
        if only and slug(lesson['title']) not in only:
            continue
        next_title = flat[i + 1][1]['title'] if i + 1 < len(flat) else settings['last']
        deck = build_deck(lang, level, t, lesson, unit, next_title, f"{settings['code']}-{level.upper()}-{i + 1:03d}")
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
                         'lessonFile': f'lessons/{folder_name}/{deck["id"]}.json'})
    roadmap = {'curriculumId': course, 'title': track, 'totalLessons': len(flat), 'sequence': sequence}
    if write and not keep_roadmap:
        with open(os.path.join(REPO, 'roadmaps', course + '.json'), 'w', encoding='utf-8') as fh:
            fh.write(json.dumps(roadmap, ensure_ascii=False, indent=2) + '\n')
    print(f'{lang}-{level}: {len(sequence)} decks, {len(skipped)} lessons without a manual page')
    for s in skipped:
        print('  no page:', s)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--lang', default='it', choices=LANGS)
    ap.add_argument('--level', default='a2', choices=('a1', 'a2', 'b1'))
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--only', nargs='+', help='regenerate only these lesson slugs')
    ap.add_argument('--keep-roadmap', action='store_true',
                    help='leave the roadmap untouched (statuses are otherwise reset to drafted)')
    a = ap.parse_args()
    main(a.lang, a.level, write=a.write, only=set(a.only or []), keep_roadmap=a.keep_roadmap)
