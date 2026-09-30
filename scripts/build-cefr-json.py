#!/usr/bin/env python3
"""Build machine-readable CEFR data from cefr/CEFR_Universal_Master.md.

The Markdown file is the human-edited master. Everything in cefr/data/ is derived
from it. Never edit the JSON by hand; edit the master and re-run this script.

Usage (from the repository root):
    python3 scripts/build-cefr-json.py            # write cefr/data/*.json
    python3 scripts/build-cefr-json.py --check    # exit 1 if cefr/data/ is out of date
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "cefr" / "CEFR_Universal_Master.md"
OUT = ROOT / "cefr" / "data"

LEVEL_CODES = ["A1s", "A1", "A2", "B1", "B2", "C1", "C2"]
SCALE_MODES = {
    "3.1": "reception", "3.2": "production", "3.3": "interaction",
    "3.4": "mediation", "3.5": "strategies", "3.6": "competences",
}
PREFIX_SKILL = {
    "LIS": "lis", "AV": "lis", "RD": "rd", "SP": "sp", "WR": "wr",
    "IN": "in", "WI": "wr", "ON": "in", "MED": "med",
}


def split_level(code):
    """A1s -> (A1, start); everything else -> (code, None)."""
    return ("A1", "start") if code == "A1s" else (code, None)


def section(text, start, end=None):
    """Return text from heading line starting with `start` up to heading starting with `end`."""
    a = text.index(start)
    b = text.index(end, a + len(start)) if end else len(text)
    return text[a:b]


def clean(cell):
    return re.sub(r"\*\*|`", "", cell).strip()


def parse_table(block):
    """Return (header, rows) for the first Markdown table in block."""
    lines = [l for l in block.splitlines() if l.strip().startswith("|")]
    rows = []
    for l in lines:
        cells = [c.strip() for c in l.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-{2,}:?", c) for c in cells if c):
            continue
        rows.append(cells)
    return rows[0], rows[1:]


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def build():
    text = MASTER.read_text(encoding="utf8")
    version = re.search(r"\*\*Version:\*\*\s*([0-9.]+)", text).group(1)

    # ---- levels (1.1 table + 1.2 global scale)
    header, rows = parse_table(section(text, "### 1.1 Groups and profiles", "### 1.2"))
    globals_ = {}
    for m in re.finditer(r"^- \*\*(A1s|A1|A2|B1|B2|C1|C2)\*\*[^—\n]*— (.*)$",
                         section(text, "### 1.2 Global scale", "### 1.3"), re.M):
        globals_[m.group(1)] = m.group(2).strip()
    levels = []
    for r in rows:
        code = clean(r[1])
        lvl, sub = split_level(code)
        levels.append({
            "code": code.lower(), "level": lvl, "sublevel": sub,
            "group": clean(r[0]), "nickname": clean(r[2]), "profile": clean(r[3]),
            "global_descriptor": globals_.get(code, ""),
        })

    # ---- scales and descriptors (section 3)
    sec3 = section(text, "## 3. Can-do scales", "## 4. Themes")
    scales, descriptors = [], []
    mode = None
    cur = None
    for line in sec3.splitlines():
        m = re.match(r"^### (3\.\d) ", line)
        if m:
            mode = SCALE_MODES[m.group(1)]
            continue
        m = re.match(r"^#### ([A-Z0-9-]+) — (.+)$", line)
        if m:
            code, name = m.group(1), m.group(2).strip()
            prefix = code.split("-")[0]
            kind = {"strategies": "strategy", "competences": "competence"}.get(mode, "activity")
            cur = {"id": code.lower(), "name": name, "mode": mode, "kind": kind,
                   "skill": PREFIX_SKILL.get(prefix) if kind == "activity" else None,
                   "levels": []}
            scales.append(cur)
            continue
        m = re.match(r"^- \*\*(A1s|A1|A2|B1|B2|C1|C2)\*\* — (.+)$", line)
        if m and cur:
            code, txt = m.group(1), m.group(2).strip()
            lvl, sub = split_level(code)
            did = f"{cur['id']}-{code.lower()}"
            cur["levels"].append(code.lower())
            descriptors.append({
                "id": did, "scale": cur["id"], "level": lvl, "sublevel": sub,
                "text": txt, "source_tag": "CoE-aligned", "source_version": "2001/2020",
                "verified_date": None,
            })
    ids = [d["id"] for d in descriptors]
    assert len(ids) == len(set(ids)), "duplicate descriptor ids"

    # ---- themes (section 4)
    header, rows = parse_table(section(text, "## 4. Themes", "## 5. Functions"))
    themes = []
    for r in rows:
        m = re.match(r"^(\d+)\.\s*(.+)$", clean(r[0]))
        if not m:
            continue
        n = int(m.group(1))
        themes.append({"id": f"t{n:02d}", "name": m.group(2).strip(),
                       "by_level": {lv.lower(): clean(c) for lv, c in zip(["A1", "A2", "B1", "B2", "C1", "C2"], r[1:7])}})

    # ---- functions (section 5)
    header, rows = parse_table(section(text, "## 5. Functions", "## 6. Conversational"))
    functions = []
    for r in rows:
        code = clean(r[0])
        lvl, sub = split_level(code)
        items = [i.strip().rstrip(".") for i in clean(r[1]).split(";") if i.strip()]
        items = [i[0].upper() + i[1:] for i in items]
        functions.append({"level_code": code.lower(), "level": lvl, "sublevel": sub,
                          "functions": [{"id": "f-" + slug(i)[:40], "text": i} for i in items]})

    # ---- abilities (section 6)
    def level_table(block, keys):
        _, rows = parse_table(block)
        out = []
        for r in rows:
            code = clean(r[0])
            lvl, sub = split_level(code)
            d = {"level_code": code.lower(), "level": lvl, "sublevel": sub}
            d.update({k: clean(v) for k, v in zip(keys, r[1:])})
            out.append(d)
        return out

    abilities = {
        "conversation": level_table(section(text, "### 6.1", "### 6.2"),
                                    ["can_do", "support_needed", "typical_turn"]),
        "monologue": level_table(section(text, "### 6.2", "\n---\n"),
                                 ["can_do", "typical_length", "structure"]),
    }

    # ---- toolkit (section 7)
    sec7 = section(text, "## 7. Teacher toolkit", "## 8. Language-specific layer")
    indicators = level_table(section(sec7, "### 7.2", "### 7.3"),
                             ["pauses", "sentence_complexity", "errors", "vocabulary", "typical_failure"])
    task_bank = level_table(section(sec7, "### 7.5", "### 7.6"),
                            ["spoken_interaction", "monologue", "listening", "reading", "writing"])

    def criteria(block):
        _, rows = parse_table(block)
        out = []
        for r in rows:
            sc = [s.lower() for s in re.findall(r"`([A-Z0-9-]+)`", r[1])]
            out.append({"criterion": clean(r[0]), "scales": sc})
        return out

    scale_ids = {s["id"] for s in scales}
    oral = criteria(section(sec7, "### 7.3", "### 7.4"))
    written = criteria(section(sec7, "### 7.4", "### 7.5"))
    for c in oral + written:
        for s in c["scales"]:
            assert s in scale_ids, f"unknown scale in criteria: {s}"

    def numbered(block):
        return [clean(re.sub(r"^\d+\.\s*", "", l)) for l in block.splitlines() if re.match(r"^\d+\. ", l)]

    def bullets(block):
        return [clean(l[2:]) for l in block.splitlines() if l.startswith("- ")]

    header, rows = parse_table(section(sec7, "### 7.8", "### 7.9"))
    selfcheck = []
    for r in rows:
        skill = clean(r[0])
        selfcheck.append({"skill": skill.lower().replace(" ", "_"),
                          "by_level": {lv.lower(): clean(c) for lv, c in zip(["A1", "A2", "B1", "B2", "C1", "C2"], r[1:7])}})

    toolkit = {
        "principles": numbered(section(sec7, "### 7.1", "### 7.2")),
        "speaking_level_indicators": indicators,
        "oral_assessment_criteria": oral,
        "written_assessment_criteria": written,
        "diagnostic_task_bank": task_bank,
        "decision_rules": numbered(section(sec7, "### 7.6", "### 7.7")),
        "misjudgement_traps": bullets(section(sec7, "### 7.7", "### 7.8")),
        "learner_self_check": selfcheck,
    }

    meta = {
        "master_file": "cefr/CEFR_Universal_Master.md",
        "master_version": version,
        "generated_by": "scripts/build-cefr-json.py",
        "do_not_edit": "Derived file. Edit the master Markdown and re-run the script.",
        "level_storage_rule": "level is one of A1..C2; the A0-A1 band is stored as level A1; starter content has sublevel 'start'; plus levels use sublevel 'p'. There is no A0 level.",
        "descriptor_text_convention": "Each descriptor text completes the sentence 'Can ...' (learner-facing: 'I can ...').",
        "counts": {"levels": len(levels), "scales": len(scales), "descriptors": len(descriptors),
                   "themes": len(themes)},
    }

    return {
        "meta.json": meta, "levels.json": levels, "scales.json": scales,
        "descriptors.json": descriptors, "themes.json": themes, "functions.json": functions,
        "abilities.json": abilities, "toolkit.json": toolkit,
    }


def render(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2) + "\n"


def main():
    files = build()
    check = "--check" in sys.argv
    stale = []
    OUT.mkdir(parents=True, exist_ok=True)
    for name, obj in files.items():
        path = OUT / name
        new = render(obj)
        if check:
            if not path.exists() or path.read_text(encoding="utf8") != new:
                stale.append(name)
        else:
            path.write_text(new, encoding="utf8")
    if check:
        if stale:
            print("cefr/data is out of date. Re-run: python3 scripts/build-cefr-json.py  ->", ", ".join(stale))
            sys.exit(1)
        print("cefr/data is up to date.")
    else:
        c = files["meta.json"]["counts"]
        print(f"Wrote {len(files)} files to {OUT}: {c}")


if __name__ == "__main__":
    main()
