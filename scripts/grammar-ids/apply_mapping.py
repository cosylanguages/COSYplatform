#!/usr/bin/env python3
"""Write HIGH-confidence grammarIds into COPIES of platform curriculum files (never edits originals).
Usage: apply_mapping.py --platform ../cosyplatform --mapping mapping-en-general.json --lang en --track general --out patched/"""
import argparse, json
from pathlib import Path
ap = argparse.ArgumentParser()
ap.add_argument("--platform", required=True); ap.add_argument("--mapping", required=True)
ap.add_argument("--lang", default="en"); ap.add_argument("--track", default="general"); ap.add_argument("--out", required=True)
a = ap.parse_args()
m = json.load(open(a.mapping)); n = 0
for lv in sorted({k.split("/")[2] for k in m}):
    src = Path(a.platform) / "curriculums" / a.lang / a.track / f"{lv}.json"
    d = json.load(open(src))
    for u in d["units"]:
        for i, l in enumerate(u["lessons"]):
            key = f"{a.lang}/{a.track}/{lv}/{l.get('code') or l.get('slug') or 'L'+str(l.get('lesson', i))}"
            ids = m.get(key, {}).get("grammarIds")
            if ids: l["grammarIds"] = ids; n += 1
    dst = Path(a.out) / a.lang / a.track / f"{lv}.json"; dst.parent.mkdir(parents=True, exist_ok=True)
    json.dump(d, open(dst, "w"), ensure_ascii=False, indent=2)
print("lessons patched:", n)
