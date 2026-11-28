"""Token scoring against the French C1/C2 manual topic pages.

Loads docs/grammar-id-review/manual-fr-c1-c2-index.json (slug + <h1> of every topic page, built from
COSYmanuals) and scores a grammar string against it by IDF-weighted stem overlap.
"""
import json
import math
import os
import re
import unicodedata
from collections import Counter

INDEX_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          '..', '..', 'docs', 'grammar-id-review', 'manual-fr-c1-c2-index.json')

STOP = {'les', 'des', 'une', 'aux', 'avec', 'pour', 'dans', 'sur', 'que', 'qui', 'son', 'ses',
        'par', 'est', 'sont', 'du', 'au', 'la', 'le', 'et', 'ou', 'en', 'il', 'elle', 'on',
        'pas', 'plus', 'comme', 'leur', 'leurs', 'meme', 'aussi', 'tres', 'dun', 'dune'}


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.replace('œ', 'oe').replace('æ', 'ae')


def tokens(s):
    return [w for w in re.findall(r"[a-z0-9']+", norm(s)) if len(w) >= 4 and w not in STOP]


def stem(w):
    for suf in ('iales', 'iale', 'ives', 'ive', 'euse', 'eux', 'es', 's', 'e', 'aux'):
        if len(w) > 6 and w.endswith(suf):
            return w[:-len(suf)]
    return w


def stems(s):
    return [stem(w) for w in tokens(s)]


def load(index_path=INDEX_PATH):
    index = json.load(open(index_path, encoding='utf-8'))
    pages = {}
    for lvl, items in index.items():
        pages[lvl] = [{'slug': p['slug'], 'stems': set(stems(p['slug'] + ' ' + p['title']))}
                      for p in items]
    n = {k: len(v) for k, v in pages.items()}
    df = {k: Counter(st for p in v for st in p['stems']) for k, v in pages.items()}
    return pages, n, df


pages, N, DF = load()


def score(lesson_stems, page, lvl):
    return sum(math.log((N[lvl] + 1) / (DF[lvl][s] + 1)) + 0.5
               for s in set(lesson_stems) if s in page['stems'])


def ranked(lvl, text):
    ls = stems(text)
    return sorted(pages[lvl], key=lambda p: -score(ls, p, lvl))
