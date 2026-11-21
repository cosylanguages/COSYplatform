#!/usr/bin/env python3
"""CI check: every grammarIds entry in platform curricula must exist in the COSYmanuals registry.
Usage: check_grammar_ids.py --manuals ../cosymanuals --curricula ../cosyplatform/curriculums   (exit 1 on unknown ids)"""
import argparse, glob, json, sys
ap = argparse.ArgumentParser(); ap.add_argument("--manuals", required=True); ap.add_argument("--curricula", required=True)
a = ap.parse_args()
valid = {p["id"] for p in json.load(open(f"{a.manuals}/data/grammar-points.json"))["points"]}
bad = []
for f in glob.glob(f"{a.curricula}/**/*.json", recursive=True):
    if "_archive" in f or "_schema" in f: continue
    try: d = json.load(open(f))
    except Exception: continue
    for u in d.get("units", []) if isinstance(d, dict) else []:
        for l in u.get("lessons", []):
            for g in l.get("grammarIds", []) or []:
                if g not in valid: bad.append((f, l.get("code") or l.get("title"), g))
for b in bad: print("UNKNOWN", *b)
print("unknown ids:", len(bad)); sys.exit(1 if bad else 0)
