#!/usr/bin/env python3
"""Write HIGH-confidence grammarIds into COPIES of platform curriculum files (never edits originals).
Usage: apply_mapping.py --platform ../cosyplatform --mapping mapping-en-general.json --lang en --track general --out patched/"""
import argparse, json
from pathlib import Path
ap = argparse.ArgumentParser()
ap.add_argument("--platform", required=True); ap.add_argument("--mapping", required=True)
ap.add_argument("--lang", default="en"); ap.add_argument("--track", default="general"); ap.add_argument("--out", required=True)
a = ap.parse_args()
m = json.load(open(a.mapping, encoding="utf-8")); n = 0
for lv in sorted({k.split("/")[2] for k in m}):
    src = Path(a.platform) / "curriculums" / a.lang / a.track / f"{lv}.json"
    d = json.load(open(src, encoding="utf-8"))
    for ui, u in enumerate(d["units"]):
        for i, l in enumerate(u["lessons"]):
            key = f"{a.lang}/{a.track}/{lv}/u{ui + 1:02d}-l{i + 1:02d}"
            ids = m.get(key, {}).get("grammarIds")
            l.pop("grammarIds", None)  # replace, never keep stale ids
            if ids: l["grammarIds"] = ids; n += 1
    raw = open(src, encoding="utf-8").read()
    fmt = next(((ea, nl) for ea in (True, False) for nl in ("\n", "")
                if json.dumps(json.loads(raw), ensure_ascii=ea, indent=2) + nl == raw), (False, "\n"))
    dst = Path(a.out) / a.lang / a.track / f"{lv}.json"; dst.parent.mkdir(parents=True, exist_ok=True)
    open(dst, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=fmt[0], indent=2) + fmt[1])
print("lessons patched:", n)
