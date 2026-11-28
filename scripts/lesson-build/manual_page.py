"""Read a COSYmanuals topic page into the pieces a lesson deck needs.

The C1/C2 pages are generated from a fixed frame, so the sections are stable: an outcome banner,
three context examples with comments, an observation paragraph, a two-question CCQ, a six-row
form table, a rule box, why/native/pronunciation notes, three extra examples, two traps, three
checklist items and a four-question exercise with its answer key.
"""
import html
import re

TAG = re.compile(r'<[^>]+>')
WS = re.compile(r'\s+')


def text(fragment):
    s = TAG.sub(' ', fragment)
    s = html.unescape(s)
    return WS.sub(' ', s).strip()


def _section(page, name):
    m = re.search(r'<section id="%s"[^>]*>(.*?)</section>' % name, page, re.S)
    if not m:
        m = re.search(r'<section[^>]*class="[^"]*\b%s\b[^"]*"[^>]*>(.*?)</section>' % name, page, re.S)
    return m.group(1) if m else ''


def _box(page, css_class, heading):
    for m in re.finditer(r'<div class="box %s"[^>]*>(.*?)</div>\s*(?=<div|<section|<p|<footer)' % css_class,
                         page, re.S):
        block = m.group(1)
        if heading in text(block):
            paras = [text(p) for p in re.findall(r'<p>(.*?)</p>', block, re.S)]
            paras = [p for p in paras if p]
            return paras[-1] if paras else ''
    return ''


def _examples(block):
    out = []
    for li in re.findall(r'<li>(.*?)</li>', block, re.S):
        label = re.search(r'<span class="key-subject[^"]*">(.*?)</span>', li, re.S)
        bold = re.search(r'<b>(.*?)</b>', li, re.S)
        body = text(bold.group(1)) if bold else text(li)
        rest = text(li)
        comment = rest.split(body, 1)[1].strip(' —–-:') if body and body in rest else ''
        lab = text(label.group(1)).rstrip(' :') if label else ''
        if lab and body.startswith(lab):
            body = body[len(lab):].lstrip(' :') or body
        out.append({'label': lab, 'text': body, 'comment': comment})
    return out


def _plain_lines(block):
    """Examples from a list whose items are plain sentences, as the Russian frame writes them."""
    out = []
    for li in re.findall(r'<li>(.*?)</li>', block, re.S):
        body = text(li)
        if body:
            out.append({'label': '', 'text': body, 'comment': ''})
    return out


def _gv_lines(block):
    """Examples from the guided-discovery opener used by the earlier English frame."""
    out = []
    for li in re.findall(r'<li>(.*?)</li>', block, re.S):
        before = re.search(r'<span class="gv-r1">(.*?)</span>', li, re.S)
        gap = re.search(r'<span class="gv-r2">(.*?)</span>', li, re.S)
        tail = li.split('</details>', 1)[1] if '</details>' in li else ''
        body = ' '.join(text(x.group(1)) if x else '' for x in (before, gap))
        out.append({'label': '', 'text': (body + ' ' + text(tail)).strip(), 'comment': ''})
    return [e for e in out if e['text']]


def _quiz_panels(page):
    starts = [(m.start(), m.group(1)) for m in
              re.finditer(r'<div class="(ccq-panel|quiz-panel)"[^>]*>', page)]
    out = []
    for i, (pos, cls) in enumerate(starts):
        end = starts[i + 1][0] if i + 1 < len(starts) else len(page)
        out.append((cls, page[pos:end]))
    return out


def _quizzes(block):
    out = []
    chunks = block.split('<div class="qitem">')[1:]
    for item in chunks:
        q = re.search(r'<div class="qtext">(.*?)</div>', item, re.S)
        opts = re.findall(r'<button[^>]*class="qopt"[^>]*>(.*?)</button>', item, re.S)
        explain = re.search(r'<div class="qexplain">(.*?)</div>', item, re.S)
        if not q or len(opts) < 2:
            continue
        out.append({'question': text(q.group(1)),
                    'options': [text(o) for o in opts],
                    'explain': text(explain.group(1)) if explain else ''})
    return out


def _clean_rule(rule_text):
    for lbl in RULE_LABELS:
        rule_text = rule_text.replace(lbl, '')
    return rule_text.strip()


def _first(page, patterns):
    for pat in patterns:
        m = re.search(pat, page, re.S)
        if m:
            return m
    return None


OUTCOME_LABELS = ['Objectif de communication :', 'What you can communicate after this page:',
                  'Коммуникативная цель:']
OBSERVE_PATTERNS = [r"Qu'observez-vous \?.*?</h3>\s*<p>(.*?)</p>",
                    r"What do you observe\?.*?</h3>\s*<p>(.*?)</p>"]
RULE_LABELS = ['Formule / Règle :', 'Formula / rule:']
BANK_PATTERNS = [r'<span class="label">Banque d.exemples.*?(<ul>.*?</ul>)',
                 r'<span class="label">Additional example bank.*?(<ul>.*?</ul>)']


def parse(page):
    h1 = re.search(r'<h1>(.*?)</h1>', page, re.S)
    subtitle = re.search(r'<p class="subtitle">(.*?)</p>', page, re.S)
    outcome = _first(page, [re.escape(lbl) + r'</strong>(.*?)</div>' for lbl in OUTCOME_LABELS])
    observe = _first(page, OBSERVE_PATTERNS)

    examples = _examples(_section(page, 'contexte'))
    if not examples:
        examples = _examples(_section(page, 'examples')) or _plain_lines(_section(page, 'examples'))
    if not examples:
        gv = re.search(r'<(?:ol|ul) class="gv-lines">(.*?)</(?:ol|ul)>', page, re.S)
        if gv:
            examples = _gv_lines(gv.group(1)) or _plain_lines(gv.group(1))
    if not examples:
        m = re.search(r'<ul class="ex-list">(.*?)</ul>', page, re.S)
        if m:
            examples = _examples(m.group(1))

    table = []
    for tr in re.findall(r'<tr>(.*?)</tr>', page, re.S):
        cells = [text(c) for c in re.findall(r'<td>(.*?)</td>', tr, re.S)]
        if len(cells) == 3:
            table.append({'element': cells[0], 'role': cells[1], 'example': cells[2]})
        elif len(cells) == 2 and cells[0] and cells[1]:
            # the Russian reference pages put the example first and the note second
            table.append({'element': cells[0], 'role': '', 'example': cells[0], 'note': cells[1]})

    rule = re.search(r'<p class="gv-formula"[^>]*>(.*?)</p>', page, re.S)
    if not rule:
        rule = re.search(r'<div class="box rule-box"[^>]*>\s*<p>(.*?)</p>', page, re.S)
    if not rule:
        rule = re.search(r'<div class="gv gv-formula"[^>]*>(.*?)</div>', page, re.S)
    if not rule:
        rule = re.search(r'<div class="box rule"[^>]*>\s*<p>(.*?)</p>', page, re.S)

    bank = _first(page, BANK_PATTERNS)
    extra = _examples(bank.group(1)) if bank else []

    traps = []
    for pair in re.finditer(r'<div class="wrong-line">.*?<span class="wrong-text">(.*?)</span>.*?'
                            r'<div class="right-line">.*?<span class="right-text">(.*?)</span>', page, re.S):
        wrong, right = text(pair.group(1)), text(pair.group(2))
        if wrong and right:
            traps.append({'wrong': wrong, 'right': right})
    for m in re.finditer(r'<span class="key-error[^"]*">(.*?)</span>(.*?)</p>.*?<span class="key-verb[^"]*">(.*?)</span>(.*?)</p>',
                         page, re.S):
        wrong = text(m.group(2)).lstrip('❌ ').strip()
        right = text(m.group(4)).lstrip('✅ ').strip()
        if wrong and right:
            traps.append({'wrong': wrong, 'right': right})

    connect_block = re.search(r'<div class="box connect".*?</div>', page, re.S)
    connect = [text(a) for a in re.findall(r'<a [^>]*>(.*?)</a>', connect_block.group(0), re.S)] if connect_block else []

    checklist = [text(s) for s in re.findall(r'<label class="check-item">.*?<span>(.*?)</span>', page, re.S)]

    return {
        'title': text(h1.group(1)) if h1 else '',
        'subtitle': text(subtitle.group(1)) if subtitle else '',
        'outcome': text(outcome.group(1)).lstrip('🎯 ').strip() if outcome else '',
        'examples': examples,
        'observe': (text(observe.group(1)) if observe else
                    _box(page, 'mint', 'Что вы замечаете') or _box(page, 'mint', 'Обрати внимание')),
        'table': table,
        'rule': _clean_rule(text(rule.group(1))) if rule else '',
        'why': _box(page, 'why', 'Pourquoi') or _box(page, 'why', 'Why') or _box(page, 'mint', 'Почему это важно'),
        'native': (_box(page, 'native', 'Pensez') or _box(page, 'native', 'Think')
                   or _box(page, 'mint', 'Думайте как носитель')),
        'pron': (text(re.search(r'<div class="pron-callout"[^>]*>.*?<p>(.*?)</p>', page, re.S).group(1))
                 if re.search(r'<div class="pron-callout"[^>]*>.*?<p>(.*?)</p>', page, re.S)
                 else _box(page, 'mint', 'Замечание о произношении')),
        'extra': extra,
        'traps': traps,
        'connect': connect,
        'checklist': checklist,
        'ccq': _quizzes(_section(page, 'ccq')) or next(
            (q for cls, block in _quiz_panels(page) if cls == 'ccq-panel' for q in [_quizzes(block)] if q), []),
        'practice': _quizzes(_section(page, 'pratique')) or next(
            (q for cls, block in reversed(_quiz_panels(page)) if cls == 'quiz-panel'
             for q in [_quizzes(block)] if q), []),
    }
