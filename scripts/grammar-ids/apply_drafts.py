#!/usr/bin/env python3
"""Apply high-confidence ids plus drafted decisions for medium rows to the platform curricula.

A lesson's grammarIds = ids of its HIGH items + the draft_ids of its MEDIUM items
(decisions: accept, accept+, replace; a reject adds nothing). Reads
docs/grammar-id-review/review-<lang>-general.csv, rewrites curriculums/<lang>/general/<LV>.json in place,
keeping each file's own JSON formatting, and replaces any existing grammarIds.

Usage: apply_drafts.py --platform . --lang fr [--lang ru ...] [--decisions accept,accept+,replace]
"""
import argparse, csv, json
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("--platform", required=True)
ap.add_argument("--lang", action="append", required=True)
ap.add_argument("--track", default="general")
ap.add_argument("--decisions", default="accept,accept+,replace")
a = ap.parse_args()
use = set(a.decisions.split(","))
root = Path(a.platform)

for lang in a.lang:
    rows = list(csv.DictReader(open(root / f"docs/grammar-id-review/review-{lang}-general.csv", encoding="utf-8-sig")))
    ids = {}
    for r in rows:
        got = []
        if r["confidence"] == "high" and r["proposed_id"]:
            got = [r["proposed_id"]]
        elif r["confidence"] == "medium" and r["draft_decision"] in use:
            got = r["draft_ids"].split()
        cur = ids.setdefault(r["lesson"], [])
        cur.extend(i for i in got if i not in cur)
    levels = sorted({k.split("/")[2] for k in ids})
    total = 0
    for lv in levels:
        src = root / "curriculums" / lang / a.track / f"{lv}.json"
        raw = src.read_text(encoding="utf-8")
        d = json.loads(raw)
        fmt = next(((ea, nl) for ea in (True, False) for nl in ("\n", "")
                    if json.dumps(d, ensure_ascii=ea, indent=2) + nl == raw), None)
        if fmt is None:
            raise SystemExit(f"{src}: cannot reproduce original formatting; refusing to rewrite")
        n = 0
        for ui, u in enumerate(d["units"]):
            for i, l in enumerate(u["lessons"]):
                l.pop("grammarIds", None)
                got = ids.get(f"{lang}/{a.track}/{lv}/u{ui + 1:02d}-l{i + 1:02d}")
                if got: l["grammarIds"] = got; n += 1
        src.write_text(json.dumps(d, ensure_ascii=fmt[0], indent=2) + fmt[1], encoding="utf-8")
        total += n
    print(f"{lang}: lessons with grammarIds: {total}")
