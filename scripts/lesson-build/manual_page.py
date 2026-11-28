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


def parse(page):
    h1 = re.search(r'<h1>(.*?)</h1>', page, re.S)
    subtitle = re.search(r'<p class="subtitle">(.*?)</p>', page, re.S)
    outcome = re.search(r'Objectif de communication :</strong>(.*?)</div>', page, re.S)
    observe = re.search(r"Qu'observez-vous \?.*?</h3>\s*<p>(.*?)</p>", page, re.S)

    examples = _examples(_section(page, 'contexte'))

    table = []
    for tr in re.findall(r'<tr>(.*?)</tr>', page, re.S):
        cells = [text(c) for c in re.findall(r'<td>(.*?)</td>', tr, re.S)]
        if len(cells) == 3:
            table.append({'element': cells[0], 'role': cells[1], 'example': cells[2]})

    rule = re.search(r'<div class="box rule-box"[^>]*>\s*<p>(.*?)</p>', page, re.S)

    bank = re.search(r'<span class="label">Banque d.exemples.*?(<ul>.*?</ul>)', page, re.S)
    extra = _examples(bank.group(1)) if bank else []

    traps = []
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
        'observe': text(observe.group(1)) if observe else '',
        'table': table,
        'rule': text(rule.group(1)).replace('Formule / Règle :', '').strip() if rule else '',
        'why': _box(page, 'why', 'Pourquoi'),
        'native': _box(page, 'native', 'Pensez'),
        'pron': text(re.search(r'<div class="pron-callout"[^>]*>.*?<p>(.*?)</p>', page, re.S).group(1))
        if re.search(r'<div class="pron-callout"[^>]*>.*?<p>(.*?)</p>', page, re.S) else '',
        'extra': extra,
        'traps': traps,
        'connect': connect,
        'checklist': checklist,
        'ccq': _quizzes(_section(page, 'ccq')),
        'practice': _quizzes(_section(page, 'pratique')),
    }
