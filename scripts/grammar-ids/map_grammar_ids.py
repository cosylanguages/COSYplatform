#!/usr/bin/env python3
"""
Propose grammarIds for COSYplatform curriculum lessons from the COSYmanuals
grammar-point registry (data/grammar-points.json).

Each grammar string of each lesson is matched on its own, so one lesson can end
up with several ids. Output is a PROPOSAL with confidence tiers for human review;
nothing is written into the repos.

Usage:
  map_grammar_ids.py --manuals ../cosymanuals --platform ../cosyplatform \
      --lang en --track general --levels A1 A2 B1 --out out_dir
"""
import argparse, csv, json, math, re, collections
from pathlib import Path

STOP = set("""a an the of to for and or in on at with by from as is are
vs versus use used using uses form forms basic basics review introduction intro
simple verb verbs rules rule structure structures tense tenses sentence sentences
questions question short answers answer + - / & e.g i.e""".split())
# words that are stop-ish in general but meaningful as grammar terms: keep them out of STOP
KEEP = {"simple", "verb", "question", "questions", "tense", "tenses"}  # handled by weights below
STOP -= KEEP
STOP |= {"lets"}

# lightweight English synonym / normalisation table (query-side and candidate-side)
SYN = {
    "gonna": "going", "pp": "participle", "participles": "participle",
    "gerund": "ing", "gerunds": "ing", "infinitive": "infinitive", "infinitives": "infinitive",
    "continuous": "continuous", "progressive": "continuous",
    "modals": "modal", "modal": "modal",
    "countable": "countable", "uncountable": "countable",
    "plural": "plural", "plurals": "plural", "singular": "plural",
    "comparative": "comparative", "comparatives": "comparative",
    "superlative": "superlative", "superlatives": "superlative",
    "adjective": "adjective", "adjectives": "adjective", "adj": "adjective",
    "adverb": "adverb", "adverbs": "adverb",
    "pronoun": "pronoun", "pronouns": "pronoun", "possessive": "possessive", "possessives": "possessive",
    "preposition": "preposition", "prepositions": "preposition",
    "conditional": "conditional", "conditionals": "conditional",
    "article": "article", "articles": "article", "a/an": "article",
    "imperative": "imperative", "imperatives": "imperative",
    "passive": "passive", "reported": "reported", "indirect": "reported",
    "relative": "relative", "clause": "clause", "clauses": "clause",
    "connectors": "conjunction", "connector": "conjunction", "conjunctions": "conjunction", "conjunction": "conjunction",
    "comparison": "comparative", "comparisons": "comparative", "compare": "comparative",
    "am": "be", "is": "be", "are": "be", "was": "be", "were": "be", "been": "be",
    "ordering": "ordering", "lets": "lets",
}
WEIGHT_LOW = {"simple", "verb", "tense", "question", "form", "use"}


def stem(w):
    if w in SYN: return SYN[w]
    for suf in ("ing", "ed", "es", "s"):
        if len(w) > len(suf) + 3 and w.endswith(suf):
            return w[: -len(suf)]
    return w


def toks(s):
    s = s.lower().replace("'", "").replace("’", "")
    ws = re.findall(r"[a-z0-9]+(?:/[a-z0-9]+)?", s)
    out = []
    for w in ws:
        for part in w.split("/"):
            if part and part not in STOP:
                out.append(stem(part))
    return out


def is_junk(p):
    t, slug = p["title"].lower(), p["slug"]
    if t.startswith("page moved"): return True
    if slug.startswith(("part-", "confusing-")) or slug == p["lang"]: return True
    if "master guide" in t or "around the world" in t: return True
    return False


def load_registry(manuals, lang):
    reg = json.load(open(Path(manuals) / "data/grammar-points.json"))["points"]
    good = [p for p in reg if p["lang"] == lang and not is_junk(p)]
    junk = [p for p in reg if p["lang"] == lang and is_junk(p)]
    return good, junk


def build_index(points):
    df = collections.Counter()
    for p in points:
        p["_t"] = set(toks(p["title"] + " " + p["slug"].replace("-", " ")))
        df.update(p["_t"])
    n = len(points)
    idf = {t: math.log((n + 1) / (c + 0.5)) + 0.3 for t, c in df.items()}
    for t in WEIGHT_LOW: idf[stem(t)] = idf.get(stem(t), 1.0) * 0.4
    return idf


LEVELS = ["a0", "a1", "a2", "b1", "b2", "c1", "c2"]


def score(query_tokens, p, idf, lvl):
    q = set(query_tokens)
    if not q or not p["_t"]: return 0.0
    inter = q & p["_t"]
    if not inter: return 0.0
    w = lambda ts: sum(idf.get(t, 0.6) for t in ts)
    cover = w(inter) / w(p["_t"])        # how much of the manual title is in the lesson text
    prec = w(inter) / w(q)               # how much of the lesson text is explained by the title
    s = 0.45 * cover + 0.55 * prec
    # time-reference contradiction: page says present/past/future, lesson text names a different one
    TIME = {"present", "past", "future"}
    qt, pt = q & TIME, p["_t"] & TIME
    if qt and pt and not (qt & pt): s *= 0.7
    elif pt and qt and (pt - qt) and not (qt - pt): s *= 0.9
    # level preference: same level best, one below ok (recycled), others penalised
    d = LEVELS.index(lvl) - LEVELS.index(p["level"]) if p["level"] in LEVELS else 9
    s *= {0: 1.0, 1: 0.92, 2: 0.8}.get(d, 0.6 if d > 0 else 0.55)
    return s


def split_items(g):
    if g is None: return []
    return [x for x in (g if isinstance(g, list) else [g]) if isinstance(x, str) and x.strip()]


def lesson_key(l, idx):
    return l.get("code") or l.get("slug") or f"L{l.get('lesson', idx)}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manuals", required=True); ap.add_argument("--platform", required=True)
    ap.add_argument("--lang", default="en"); ap.add_argument("--track", default="general")
    ap.add_argument("--levels", nargs="+", default=["A1", "A2", "B1"])
    ap.add_argument("--out", required=True)
    ap.add_argument("--hi", type=float, default=0.62); ap.add_argument("--lo", type=float, default=0.38)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

    pts, junk = load_registry(a.manuals, a.lang)
    idf = build_index(pts)
    mapping, rows = {}, []
    stats = collections.Counter()
    used = collections.Counter()

    for lv in a.levels:
        f = Path(a.platform) / "curriculums" / a.lang / a.track / f"{lv}.json"
        d = json.load(open(f))
        lvl = lv.lower()
        for u in d.get("units", []):
            for i, l in enumerate(u.get("lessons", [])):
                key = f"{a.lang}/{a.track}/{lv}/{lesson_key(l, i)}"
                items = split_items(l.get("grammar"))
                stats["lessons"] += 1
                if not items:
                    stats["lessons_no_grammar_text"] += 1
                    continue
                entries = []
                for it in items:
                    q = toks(it)
                    # also use lesson title as weak context only when the item itself is very short
                    scored = sorted(((score(q, p, idf, lvl), p) for p in pts), key=lambda x: -x[0])
                    top = [(s, p) for s, p in scored[:3] if s > 0]
                    best = top[0] if top else (0, None)
                    margin = best[0] - (top[1][0] if len(top) > 1 else 0)
                    if best[1] and best[0] >= a.hi and margin >= 0.08: tier = "high"
                    elif best[1] and best[0] >= a.lo: tier = "medium"
                    else: tier = "none"
                    stats["items_" + tier] += 1; stats["items"] += 1
                    if tier != "none": used[best[1]["id"]] += 1
                    e = {"text": it, "confidence": tier,
                         "grammarId": best[1]["id"] if tier != "none" else None,
                         "alternatives": [{"id": p["id"], "title": p["title"], "score": round(s, 2)} for s, p in top]}
                    entries.append(e)
                    rows.append([key, l.get("title", ""), it, tier, e["grammarId"] or "",
                                 best[1]["title"] if best[1] else "", round(best[0], 2),
                                 " | ".join(f"{p['id']} ({s:.2f})" for s, p in top[1:])])
                mapping[key] = {"title": l.get("title"), "items": entries,
                                "grammarIds": sorted({e["grammarId"] for e in entries if e["grammarId"] and e["confidence"] == "high"})}

    json.dump(mapping, open(out / f"mapping-{a.lang}-{a.track}.json", "w"), ensure_ascii=False, indent=1)
    with open(out / f"review-{a.lang}-{a.track}.csv", "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.writer(fh)
        w.writerow(["lesson", "lesson_title", "grammar_text", "confidence", "proposed_id", "manual_title", "score", "other_candidates", "reviewer_decision"])
        for r in rows: w.writerow(r + [""])
    orphans = [p for p in pts if p["level"] in [x.lower() for x in a.levels] and used[p["id"]] == 0]
    json.dump({"stats": dict(stats),
               "registry_junk_excluded": [p["id"] for p in junk],
               "orphan_manual_pages": [{"id": p["id"], "title": p["title"]} for p in orphans]},
              open(out / f"report-{a.lang}-{a.track}.json", "w"), ensure_ascii=False, indent=1)
    print(dict(stats)); print("junk excluded:", len(junk), "| orphans:", len(orphans))


if __name__ == "__main__":
    main()
